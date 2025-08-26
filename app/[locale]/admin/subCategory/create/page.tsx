import Link from "next/link";
import SubCategoryForm from "../subCategory-form";
import { getAllMainCategories } from "@/lib/actions/mainCategory.actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Sub Category",
};

const CreateSubCategoryPage = async () => {
  const mainCategories = await getAllMainCategories({ query: "", page: 1 });

  return (
    <main className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="flex mb-4">
        <Link href="/admin/subCategory">Sub Categories</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/subCategory/create">Create</Link>
      </div>

      <div className="my-8">
        <SubCategoryForm
          type="Create"
          mainCategories={mainCategories.mainCategories}
        />
      </div>
    </main>
  );
};

export default CreateSubCategoryPage;
