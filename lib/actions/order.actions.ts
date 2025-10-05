"use server";

import { Cart, IOrderList, OrderItem, ShippingAddress } from "@/types";
import { formatError, round2 } from "../utils";
import { connectToDatabase } from "../db";
import { auth } from "@/auth";
import { OrderInputSchema } from "../validator";
import Order, { IOrder } from "../db/models/order.model";
import { revalidatePath } from "next/cache";
import { sendPurchaseReceipt } from "@/emails";
import { paypal } from "../paypal";
import { DateRange } from "react-day-picker";
import Product from "../db/models/product.model";
import User from "../db/models/user.model";
import mongoose from "mongoose";
import { getSetting } from "./setting.actions";
import "@/lib/db/models/subCategory.model";
import { sendOrderStatusEmail } from "@/emails";

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase();
    const session = await auth();
    if (!session) throw new Error("User not authenticated");

    // Get all products to determine sellers and add seller info to items
    const itemsWithSeller = await Promise.all(
      clientSideCart.items.map(async (item) => {
        const product = await Product.findById(item.product).populate(
          "subCategory",
          "name"
        );
        if (!product) throw new Error(`Product ${item.product} not found`);

        return {
          ...item,
          seller: product.seller.toString(),
          subCategory:
            typeof product.subCategory === "object" &&
            product.subCategory !== null
              ? product.subCategory._id?.toString?.() ||
                product.subCategory.toString()
              : product.subCategory?.toString?.() || "",
          brand: product.brand,
          partNumber: product.partNumber,
          vehicleCompatibility: product.vehicleCompatibility,
          specifications: product.specifications
            ? product.specifications instanceof Map
              ? Object.fromEntries(product.specifications)
              : { ...product.specifications }
            : {},
        };
      })
    );

    // Group items by seller for orders
    const itemsBySeller: Record<string, OrderItem[]> = {};
    for (const item of itemsWithSeller) {
      const sellerId = item.seller;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push(item);
    }

    const overallTaxRate =
      clientSideCart.itemsPrice > 0
        ? clientSideCart.taxPrice / clientSideCart.itemsPrice
        : 0;

    // Create separate orders for each seller
    const sellerOrders = await Promise.all(
      Object.entries(itemsBySeller).map(async ([sellerId, items]) => {
        const itemsPrice = items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        const shippingPrice = clientSideCart.shippingMethod.shippingPrice;
        const taxPrice = itemsPrice * overallTaxRate;
        const totalPrice = itemsPrice + taxPrice + shippingPrice;

        const orderData = OrderInputSchema.parse({
          user: session.user.id!,
          seller: sellerId,
          items: items,
          shippingAddress: clientSideCart.shippingAddress,
          paymentMethod: clientSideCart.paymentMethod,
          itemsPrice,
          shippingMethod: clientSideCart.shippingMethod,
          taxPrice,
          totalPrice,
        });

        const order = await Order.create(orderData);

        // Update product stock and sales
        await Promise.all(
          items.map(async (item) => {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { countInStock: -item.quantity, numSales: item.quantity },
            });
          })
        );

        return order;
      })
    );

    // Use the first seller order for client and admin notifications (assuming at least one order exists)
    const primaryOrder = sellerOrders[0];
    if (!primaryOrder) {
      throw new Error("No orders created for sellers");
    }

    // Send purchase receipt to the client
    const user = await User.findById(session.user.id);
    const userLanguage = user?.language || "fr";

    await sendPurchaseReceipt({
      order: primaryOrder,
      email: session.user.email!,
      language: userLanguage,
      subject: "Nouvelle commande",
      description: "Votre commande a été passée avec succès!",
    });

    // Send purchase receipts to each seller for their specific orders
    await Promise.all(
      sellerOrders.map(async (sellerOrder) => {
        const seller = await User.findById(sellerOrder.seller);
        if (seller && seller.email) {
          await sendPurchaseReceipt({
            order: sellerOrder,
            email: seller.email,
            language: seller?.language || "fr",
            subject: "Nouvelle commande",
            description:
              "Vous avez reçu une nouvelle commande, veuillez vous rendre sur votre tableau de bord pour livrer la commande au client le plus rapidement possible. ",
          });
        }
      })
    );

    // Send to admin
    const { ADMIN_EMAIL } = await import("../constants");
    await sendPurchaseReceipt({
      order: primaryOrder,
      email: ADMIN_EMAIL,
      language: "fr",
      subject: "Nouvelle commande",
      description: "Une nouvelle commande a été passée avec succès",
    });

    return {
      success: true,
      message: "Order placed successfully",
      data: { orderId: primaryOrder._id.toString() },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string,
  sellerId: string
) => {
  console.log(`🔍 [DEBUG] createOrderFromCart called for seller ${sellerId}`);
  console.log(`🔍 [DEBUG] Input cart items:`, clientSideCart.items.length);
  console.log(`🔍 [DEBUG] Input cart itemsPrice:`, clientSideCart.itemsPrice);

  const cart = {
    ...clientSideCart,
    ...(await calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    })),
  };

  console.log(`🔍 [DEBUG] Calculated cart itemsPrice:`, cart.itemsPrice);
  console.log(`🔍 [DEBUG] Calculated cart totalPrice:`, cart.totalPrice);

  const order = OrderInputSchema.parse({
    user: userId,
    seller: sellerId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingMethod: cart.shippingMethod,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
  });

  console.log(`🔍 [DEBUG] Order to be created:`, {
    itemsCount: order.items.length,
    itemsPrice: order.itemsPrice,
    totalPrice: order.totalPrice,
  });

  const createdOrder = await Order.create(order);

  console.log(`🔍 [DEBUG] Created order:`, {
    _id: createdOrder._id,
    itemsCount: createdOrder.items.length,
    itemsPrice: createdOrder.itemsPrice,
    totalPrice: createdOrder.totalPrice,
  });

  // Update product stock and sales
  await Promise.all(
    cart.items.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity, numSales: item.quantity },
      });
    })
  );

  return createdOrder;
};

export async function updateOrderToPaid(orderId: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string; language?: string };
    }>("user", "name email language");
    if (!order) throw new Error("Order not found");
    if (order.isPaid) throw new Error("Order is already paid");
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    if (!process.env.MONGODB_URI?.startsWith("mongodb://localhost"))
      await updateProductStock(order._id);
    if (order.user.email)
      await sendPurchaseReceipt({
        order,
        email: order.user.email,
        language: order.user.language || "fr",
        subject: "Confirmation de paiement",
        description: "Paiement confirmé ✅. Merci pour votre achat !",
      });
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

const updateProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession();

  try {
    session.startTransaction();
    const opts = { session };

    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { isPaid: true, paidAt: new Date() },
      opts
    );
    if (!order) throw new Error("Order not found");

    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error("Product not found");

      product.countInStock -= item.quantity;
      await Product.updateOne(
        { _id: product._id },
        { countInStock: product.countInStock },
        opts
      );
    }
    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
export async function deliverOrder(orderId: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).populate(
      "user",
      "email name language"
    );
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = "Completed";
    await order.save();
    // Send delivery notification to client, seller, and admin
    const seller = await User.findById(order.seller);
    const { ADMIN_EMAIL } = await import("../constants");
    await Promise.all([
      sendPurchaseReceipt({
        order,
        email: order.user.email,
        language: "fr",
        subject: "Confirmation de livraison",
        description: "Votre commande a été livrée avec succès 🚚✅",
      }),
      seller && seller.email
        ? sendPurchaseReceipt({
            order,
            email: seller.email,
            language: seller.language || "fr",
            subject: "Confirmation de livraison",
            description: "Votre commande a été livrée avec succès 🚚✅",
          })
        : null,
      sendPurchaseReceipt({
        order,
        email: ADMIN_EMAIL,
        language: "fr",
        subject: "Confirmation de livraison",
        description: "La commande a été livrée avec succès 🚚✅",
      }),
    ]);
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function cancelOrder(orderId: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).populate(
      "user",
      "email name language"
    );
    if (!order) throw new Error("Order not found");
    order.status = "Cancelled";
    await order.save();
    // Send cancellation notification to client, seller, and admin
    const seller = await User.findById(order.seller);
    const { ADMIN_EMAIL } = await import("../constants");
    await Promise.all([
      sendOrderStatusEmail({
        order,
        email: order.user.email,
        status: "cancelled",
        language: order.user.language || "fr",
      }),
      seller && seller.email
        ? sendOrderStatusEmail({
            order,
            email: seller.email,
            status: "cancelled",
            language: seller.language || "fr",
          })
        : null,
      sendOrderStatusEmail({
        order,
        email: ADMIN_EMAIL,
        status: "cancelled",
        language: "fr",
      }),
    ]);
    revalidatePath(`/account/orders/${orderId}`);
    return { success: true, message: "Order cancelled successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// DELETE
export async function deleteOrder(id: string) {
  try {
    await connectToDatabase();
    const res = await Order.findByIdAndDelete(id);
    if (!res) throw new Error("Order not found");
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ALL ORDERS

export async function getAllOrders({
  limit,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * limit;
  const orders = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments();
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
  };
}
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const session = await auth();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  const skipAmount = (Number(page) - 1) * limit;
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments({
    user: session?.user?.id,
  });

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  };
}

export async function getSellerOrders({
  limit,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Seller") {
    throw new Error("Unauthorized: Only sellers can access this data");
  }
  const sellerId = session.user.id;
  const skipAmount = (Number(page) - 1) * limit;
  const orders = await Order.find({
    seller: sellerId,
  })
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments({ seller: sellerId });

  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
  };
}

export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  return JSON.parse(JSON.stringify(order));
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase();
  try {
    const order = await Order.findById(orderId);
    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice);
      order.paymentResult = {
        id: paypalOrder.id,
        email_address: "",
        status: "",
        pricePaid: "0",
      };
      await order.save();
      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id,
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase();
  try {
    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) throw new Error("Order not found");

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== "COMPLETED"
    )
      throw new Error("Error in paypal payment");
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    };
    await order.save();
    await sendPurchaseReceipt({ order });
    revalidatePath(`/account/orders/${orderId}`);
    return {
      success: true,
      message: "Your order has been successfully paid by PayPal",
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export const calcDeliveryDateAndPrice = async ({
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}) => {
  console.log(
    `🔍 [DEBUG] calcDeliveryDateAndPrice called with ${items.length} items`
  );
  console.log(
    `🔍 [DEBUG] Items:`,
    items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }))
  );

  const { availableDeliveryDates } = await getSetting();
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

  console.log(`🔍 [DEBUG] Calculated itemsPrice:`, itemsPrice);

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ];
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice;

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0);
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0)
  );

  console.log(`🔍 [DEBUG] Final calculations:`, {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  await connectToDatabase();

  const ordersCount = await Order.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });

  const totalSalesResult = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

  const today = new Date();
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  );
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$totalSales",
      },
    },
    { $sort: { label: -1 } },
  ]);
  const topSalesSubCategories = await getTopSalesSubCategories(date);
  const topSalesProducts = await getTopSalesProducts(date);

  const {
    common: { pageSize },
  } = await getSetting();
  const limit = pageSize;
  const latestOrders = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .limit(limit);
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesSubCategories: JSON.parse(JSON.stringify(topSalesSubCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrder[],
  };
}

export async function getSellerOrderSummary(date: DateRange) {
  await connectToDatabase();

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Seller") {
    throw new Error("Unauthorized: Only sellers can access this data");
  }
  const sellerId = session.user.id;

  const ordersCount = await Order.countDocuments({
    seller: sellerId,
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });

  const productsCount = await Product.countDocuments({
    seller: sellerId,
  });

  const totalSalesResult = await Order.aggregate([
    {
      $match: {
        seller: sellerId,
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

  const today = new Date();
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1
  );
  const monthlySales = await Order.aggregate([
    {
      $match: {
        seller: sellerId,
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$totalSales",
      },
    },
    { $sort: { label: -1 } },
  ]);

  const topSalesSubCategories = await getTopSalesSubCategories(date, sellerId);
  const topSalesProducts = await getTopSalesProducts(date, sellerId);

  const {
    common: { pageSize },
  } = await getSetting();
  const limit = pageSize;
  const latestOrders = await Order.find({ seller: sellerId })
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .limit(limit);

  return {
    ordersCount,
    productsCount,
    totalSales,
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(
      JSON.stringify(await getSalesChartData(date, sellerId))
    ),
    topSalesSubCategories: JSON.parse(JSON.stringify(topSalesSubCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrder[],
  };
}

async function getSalesChartData(date: DateRange, sellerId?: string) {
  const matchStage: any = {
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  };
  if (sellerId) {
    matchStage.seller = sellerId;
  }

  const result = await Order.aggregate([
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: "$_id.year" },
            "/",
            { $toString: "$_id.month" },
            "/",
            { $toString: "$_id.day" },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return result;
}

async function getTopSalesProducts(date: DateRange, sellerId?: string) {
  const matchStage: any = {
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  };
  if (sellerId) {
    matchStage.seller = sellerId;
  }

  const result = await Order.aggregate([
    {
      $match: matchStage,
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: {
          name: "$items.name",
          image: "$items.image",
          _id: "$items.product",
        },
        totalSales: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
    { $limit: 6 },
    {
      $project: {
        _id: 0,
        id: "$_id._id",
        label: "$_id.name",
        image: "$_id.image",
        value: "$totalSales",
      },
    },
    { $sort: { id: 1 } },
  ]);

  return result;
}

async function getTopSalesSubCategories(
  date: DateRange,
  sellerId?: string,
  limit = 5
) {
  const matchStage: any = {
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  };
  if (sellerId) {
    matchStage.seller = sellerId;
  }

  const result = await Order.aggregate([
    {
      $match: matchStage,
    },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $lookup: {
        from: "subcategories",
        localField: "productInfo.subCategory",
        foreignField: "_id",
        as: "subCategoryInfo",
      },
    },
    { $unwind: "$subCategoryInfo" },
    {
      $group: {
        _id: "$subCategoryInfo.name",
        totalSales: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$totalSales",
      },
    },
  ]);

  return result;
}
