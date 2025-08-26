import { notFound } from "next/navigation";
import {
  getSubCategoryById,
  getAllMainCategories,
} from "@/lib/actions/subCategory.actions";
import Link from "next/link";
import SubCategoryForm from "../subCategory-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Sub Category",
};

type UpdateSubCategoryProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateSubCategory = async (props: UpdateSubCategoryProps) => {
  const params = await props.params;
  const { id } = params;

  const subCategory = await getSubCategoryById(id);
  if (!subCategory) notFound();

  const mainCategories = await getAllMainCategories({
    query: "",
    limit: 10000,
  });

  return (
    <main className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="flex mb-4">
        <Link href="/admin/subCategory">Sub Categories</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/subCategory/${subCategory._id}`}>
          {subCategory.name}
        </Link>
      </div>

      <div className="my-8">
        <SubCategoryForm
          type="Update"
          subCategory={subCategory}
          subCategoryId={subCategory._id}
          mainCategories={mainCategories.mainCategories}
        />
      </div>
    </main>
  );
};

export default UpdateSubCategory;
