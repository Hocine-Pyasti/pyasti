import { notFound } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import Link from "next/link";

export const metadata = {
  title: "Seller Order Details",
};

const SellerOrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const { id } = params;

  const session = await auth();
  if (session?.user?.role !== "Seller") {
    throw new Error("Seller permission required");
  }

  const order = await getOrderById(id);
  if (!order) notFound();

  // Check if the order belongs to the current seller
  if (order.seller.toString() !== session.user.id) {
    throw new Error("Unauthorized: You can only view your own orders");
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/seller/orders">Orders</Link>{" "}
        <span className="mx-1">›</span>
        <Link href={`/seller/orders/${order._id}`}>{order._id}</Link>
      </div>
      <OrderDetailsForm order={order} isAdmin={false} />
    </main>
  );
};

export default SellerOrderDetailsPage;
