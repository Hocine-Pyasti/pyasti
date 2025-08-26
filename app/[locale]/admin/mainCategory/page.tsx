import { Metadata } from "next";
import MainCategoryList from "./mainCategory-list";

export const metadata: Metadata = {
  title: "Admin Main Categories",
};

export default async function AdminMainCategory() {
  return <MainCategoryList />;
}
