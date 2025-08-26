import { Metadata } from "next";
import ProductList from "./product-list";

export const metadata: Metadata = {
  title: "Seller Products",
};

export default async function SellerProduct() {
  return <ProductList />;
}
