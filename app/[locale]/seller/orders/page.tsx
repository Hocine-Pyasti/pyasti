import { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import CancelDialog from "@/components/shared/cancel-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cancelOrder, getSellerOrders } from "@/lib/actions/order.actions";
import { formatDateTime, formatId } from "@/lib/utils";
import { IOrderList } from "@/types";
import ProductPrice from "@/components/shared/product/product-price";

export const metadata: Metadata = {
  title: "Seller Orders",
};
export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>;
}) {
  const searchParams = await props.searchParams;

  const { page = "1" } = searchParams;

  const session = await auth();
  if (session?.user.role !== "Seller")
    throw new Error("Seller permission required");

  const orders = await getSellerOrders({
    page: Number(page),
  });
  return (
    <div className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <h1 className="h1-bold">Orders</h1>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order: IOrderList) => {
              let rowClass = "";
              if (order.isPaid && !order.isDelivered) {
                rowClass = "bg-blue-200";
              } else if (order.isPaid && order.isDelivered) {
                rowClass = "bg-green-200";
              }
              return (
                <TableRow key={order._id} className={rowClass}>
                  <TableCell>{formatId(order._id)}</TableCell>
                  <TableCell>
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>
                  <TableCell>
                    {order.user ? order.user.name : "Deleted User"}
                  </TableCell>
                  <TableCell>
                    <ProductPrice price={order.totalPrice} plain />
                  </TableCell>
                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : "No"}
                  </TableCell>
                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : "No"}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/seller/orders/${order._id}`}>Details</Link>
                    </Button>
                    {order.status !== "Cancelled" &&
                      order.status !== "Completed" && (
                        <CancelDialog id={order._id} action={cancelOrder} />
                      )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {orders.totalPages > 1 && (
          <Pagination page={page} totalPages={orders.totalPages!} />
        )}
      </div>
    </div>
  );
}
