import Link from "next/link";
import ProductForm from "../product-form";
import { Metadata } from "next";
import { getAllSubCategories } from "@/lib/actions/subCategory.actions";

export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  const subCategories = await getAllSubCategories({ query: "", page: 1 });
  return (
    <main className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="flex mb-4">
        <Link href="/admin/products">Products</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/products/create">Create</Link>
      </div>

      <div className="my-8">
        <ProductForm
          type="Create"
          subCategories={subCategories.subCategories}
        />
      </div>
    </main>
  );
};

export default CreateProductPage;
