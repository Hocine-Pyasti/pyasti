import { Metadata } from "next";
import SubCategoryList from "./subCategory-list";

export const metadata: Metadata = {
  title: "Admin Sub Categories",
};

export default async function AdminSubCategory() {
  return <SubCategoryList />;
}
