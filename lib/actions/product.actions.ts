"use server";

import { connectToDatabase } from "@/lib/db";
import Product, { IProduct } from "@/lib/db/models/product.model";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { ProductInputSchema, ProductUpdateSchema } from "../validator";
import { IProductInput } from "@/types";
import { z } from "zod";
import { getSetting } from "./setting.actions";
import { auth } from "@/auth";
import subCategory, { ISubCategory } from "../db/models/subCategory.model";

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized: User not logged in");

    const productData = {
      ...data,
      seller: session.user.id,
    };
    const product = ProductInputSchema.parse(productData);
    await connectToDatabase();
    await Product.create(product);
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized: User not logged in");

    const productData = {
      ...data,
      seller: session.user.id,
    };
    const product = ProductUpdateSchema.parse(productData);
    await connectToDatabase();
    await Product.findByIdAndUpdate(product._id, product);
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();
    const res = await Product.findByIdAndDelete(id);
    if (!res) throw new Error("Product not found");
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  await connectToDatabase();
  const product = await Product.findById(productId).populate(
    "subCategory",
    "name"
  );
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high"
        ? { price: 1 }
        : sort === "price-high-to-low"
          ? { price: -1 }
          : sort === "avg-customer-review"
            ? { avgRating: -1 }
            : { _id: -1 };
  const products = await Product.find({
    ...queryFilter,
  })
    .populate("subCategory", "name")
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
  });
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / pageSize),
    totalProducts: countProducts,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + products.length,
  };
}

export async function getAllProductsForSeller({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "Seller") {
    throw new Error("Unauthorized: Only sellers can access this data");
  }
  const sellerId = session.user.id;

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high"
        ? { price: 1 }
        : sort === "price-high-to-low"
          ? { price: -1 }
          : sort === "avg-customer-review"
            ? { avgRating: -1 }
            : { _id: -1 };
  const products = await Product.find({
    ...queryFilter,
    seller: sellerId,
  })
    .populate("subCategory", "name")
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    seller: sellerId,
  });
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / pageSize),
    totalProducts: countProducts,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + products.length,
  };
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string;
  limit?: number;
}) {
  await connectToDatabase();
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ["/product/", "$slug"] },
      image: { $arrayElemAt: ["$images", 0] },
    }
  )
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as {
    name: string;
    href: string;
    image: string;
  }[];
}

// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string;
  limit?: number;
}) {
  await connectToDatabase();
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  const product = await Product.findOne({ slug, isPublished: true }).populate(
    "subCategory",
    "name"
  );
  if (!product) throw new Error("Product not found");
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

// GET RELATED PRODUCTS: PRODUCTS WITH SAME SUBCATEGORY
export async function getRelatedProductsBySubCategory({
  subCategory,
  productId,
  limit = 4,
  page = 1,
}: {
  subCategory: string;
  productId: string;
  limit?: number;
  page: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * limit;
  const conditions = {
    isPublished: true,
    subCategory,
    _id: { $ne: productId },
  };
  const products = await Product.find(conditions)
    .sort({ numSales: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const productsCount = await Product.countDocuments(conditions);
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  };
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  subCategory,
  tag,
  price,
  rating,
  sort,
}: {
  query: string;
  subCategory: string;
  tag: string;
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();

  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};
  const subCategoryFilter =
    subCategory && subCategory !== "all" ? { subCategory } : {};
  const tagFilter = tag && tag !== "all" ? { tags: tag } : {};

  const ratingFilter =
    rating && rating !== "all"
      ? {
          avgRating: {
            $gte: Number(rating),
          },
        }
      : {};
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high"
        ? { price: 1 }
        : sort === "price-high-to-low"
          ? { price: -1 }
          : sort === "avg-customer-review"
            ? { avgRating: -1 }
            : { _id: -1 };
  const isPublished = { isPublished: true };
  const products = await Product.find({
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...subCategoryFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .populate("subCategory", "name")
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...tagFilter,
    ...subCategoryFilter,
    ...priceFilter,
    ...ratingFilter,
  });
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + products.length,
  };
}

export async function getAllTags() {
  const tags = await Product.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: null, uniqueTags: { $addToSet: "$tags" } } },
    { $project: { _id: 0, uniqueTags: 1 } },
  ]);
  return (
    (tags[0]?.uniqueTags
      .sort((a: string, b: string) => a.localeCompare(b))
      .map((x: string) =>
        x
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      ) as string[]) || []
  );
}
