import Link from "next/link";
import MainCategoryForm from "../mainCategory-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Main Category",
};

const CreateMainCategoryPage = () => {
  return (
    <main className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="flex mb-4">
        <Link href="/admin/mainCategory">Main Categories</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/mainCategory/create">Create</Link>
      </div>

      <div className="my-8">
        <MainCategoryForm type="Create" />
      </div>
    </main>
  );
};

export default CreateMainCategoryPage;
