"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IOrder } from "@/lib/db/models/order.model";
import { cn, formatDateTime } from "@/lib/utils";
import ProductPrice from "../product/product-price";
import ActionButton from "../action-button";
import { deliverOrder, updateOrderToPaid } from "@/lib/actions/order.actions";
import { useTranslations } from "next-intl";
import { generateBillPDF } from "@/lib/pdfGenerator";
import { Button } from "@/components/ui/button";

export default function OrderDetailsForm({
  order,
  isPrivileged,
}: {
  order: IOrder;
  isPrivileged: boolean;
}) {
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingMethod,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    createdAt,
  } = order;
  const t = useTranslations();
  console.log({ isPrivileged });
  const handleDownloadPDF = async () => {
    await generateBillPDF(order);
  };

  return (
    <div className="grid md:grid-cols-3 md:gap-5">
      <div className="overflow-x-auto md:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white text-shadow-md">
            {t("All.Order Details")}
          </h2>
          <Button onClick={handleDownloadPDF} className="rounded-full">
            {t("All.Download Bill")}
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">{t("Order.Shipping Address")} </h2>
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{" "}
              {shippingAddress.province}, {shippingAddress.postalCode},{" "}
              {shippingAddress.country}{" "}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">{t("Order.Delivery Option")} </h2>
            <p>{shippingMethod.name}</p>
            {isDelivered ? (
              <Badge>Livré le {formatDateTime(deliveredAt!).dateTime}</Badge>
            ) : (
              <div>
                {" "}
                <Badge variant="destructive">Non livré</Badge>
                <div>
                  Commande créée le {formatDateTime(createdAt).dateTime}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">{t("Order.Payment Method")} </h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>Payé le {formatDateTime(paidAt!).dateTime}</Badge>
            ) : (
              <Badge variant="destructive">Non Payé</Badge>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 gap-4">
            <h2 className="text-xl pb-4">{t("Order.Order Items")} </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Order.Items")}</TableHead>
                  <TableHead>{t("Order.Quantity")}</TableHead>
                  <TableHead>{t("Order.Price")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className="flex items-center"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        ></Image>
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="px-2">{item.quantity}</span>
                    </TableCell>
                    <TableCell className="text-right">{item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card className="mt-4">
          <CardContent className="p-4 space-y-4 gap-4">
            <h2 className="text-xl pb-4">{t("Order.Order Summary")} </h2>
            <div className="flex justify-between">
              <div>{t("Order.Items")}</div>
              <div>
                {" "}
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className="flex justify-between">
              <div>{t("Order.Tax")}</div>
              <div>
                {" "}
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className="flex justify-between">
              <div>{t("Order.Shipping & Handling")}</div>
              <div>
                {" "}
                <ProductPrice price={shippingMethod.shippingPrice} plain />
              </div>
            </div>
            <div className="flex justify-between">
              <div>{t("Order.Order Total")}</div>
              <div>
                {" "}
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {/* {!isPaid && ["Stripe", "PayPal"].includes(paymentMethod) && (
              <Link
                className={cn(buttonVariants(), "w-full")}
                href={`/checkout/${order._id}`}
              >
                Pay Order
              </Link>
            )} */}

            {isPrivileged &&
              !isPaid &&
              paymentMethod === "COD - Espèces 💵" && (
                <ActionButton
                  caption={t("All.Mark as paid")}
                  action={() => updateOrderToPaid(order._id)}
                />
              )}

            {/* Allow Admin, and Seller to mark delivery */}
            {isPrivileged && isPaid && !isDelivered && (
              <ActionButton
                caption={t("All.Mark as delivered")}
                action={() => deliverOrder(order._id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
