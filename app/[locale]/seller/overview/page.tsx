import { Metadata } from "next";

import OverviewReport from "./overview-report";
import { auth } from "@/auth";
export const metadata: Metadata = {
  title: "Seller Dashboard",
};
const DashboardPage = async () => {
  const session = await auth();
  if (session?.user.role !== "Seller")
    throw new Error("Seller permission required");

  return <OverviewReport />;
};

export default DashboardPage;
