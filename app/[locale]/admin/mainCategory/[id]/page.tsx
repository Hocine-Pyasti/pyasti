import { notFound } from "next/navigation";
import { getMainCategoryById } from "@/lib/actions/mainCategory.actions";
import Link from "next/link";
import MainCategoryForm from "../mainCategory-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Main Category",
};

type UpdateMainCategoryProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateMainCategory = async (props: UpdateMainCategoryProps) => {
  const params = await props.params;
  const { id } = params;

  const mainCategory = await getMainCategoryById(id);
  if (!mainCategory) notFound();

  return (
    <main className="max-w-6xl mx-auto p-4 bg-card shadow-md rounded-lg backdrop-blur-md">
      <div className="flex mb-4">
        <Link href="/admin/mainCategory">Main Categories</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/mainCategory/${mainCategory._id}`}>
          {mainCategory.name}
        </Link>
      </div>

      <div className="my-8">
        <MainCategoryForm
          type="Update"
          mainCategory={mainCategory}
          mainCategoryId={mainCategory._id}
        />
      </div>
    </main>
  );
};

export default UpdateMainCategory;
