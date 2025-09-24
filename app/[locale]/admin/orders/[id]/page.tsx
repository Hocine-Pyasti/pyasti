import { notFound } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsForm from "@/components/shared/order/order-details-form";
import Link from "next/link";

export const metadata = {
  title: "Admin Order Details",
};

const AdminOrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await auth();
  if (session?.user?.role !== "Admin") {
    throw new Error("Admin permission required");
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4 text-white font-bold text-shadow-md">
        <Link href="/admin/orders">Commande</Link>{" "}
        <span className="mx-1">›</span>
        <Link href={`/admin/orders/${order._id}`}>{order._id}</Link>
      </div>
      <OrderDetailsForm order={order} isPrivileged={true} />
    </main>
  );
};

export default AdminOrderDetailsPage;
