"use server";

import { connectToDatabase } from "@/lib/db";
import SubCategory, { ISubCategory } from "@/lib/db/models/subCategory.model";
import MainCategory, {
  IMainCategory,
} from "@/lib/db/models/mainCategory.model";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { SubCategoryInputSchema } from "../validator";
import { ISubCategoryInput } from "@/types";
import { z } from "zod";
import { getSetting } from "./setting.actions";

// CREATE
export async function createSubCategory(data: ISubCategoryInput) {
  try {
    const subCategory = SubCategoryInputSchema.parse(data);
    await connectToDatabase();
    await SubCategory.create(subCategory);
    revalidatePath("/admin/subCategory");
    return {
      success: true,
      message: "Sub Category created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateSubCategory(
  data: ISubCategoryInput & { _id: string }
) {
  try {
    const subCategory = SubCategoryInputSchema.extend({
      _id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
    }).parse(data);
    await connectToDatabase();
    await SubCategory.findByIdAndUpdate(subCategory._id, subCategory);
    revalidatePath("/admin/subCategory");
    return {
      success: true,
      message: "Sub Category updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteSubCategory(id: string) {
  try {
    await connectToDatabase();
    const res = await SubCategory.findByIdAndDelete(id);
    if (!res) throw new Error("Sub Category not found");
    revalidatePath("/admin/subCategory");
    return {
      success: true,
      message: "Sub Category deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ONE SUB CATEGORY BY ID
export async function getSubCategoryById(subCategoryId: string) {
  await connectToDatabase();
  const subCategory =
    await SubCategory.findById(subCategoryId).populate("mainCategory");
  return JSON.parse(JSON.stringify(subCategory)) as ISubCategory;
}

// GET SUB CATEGORIES BY MAIN CATEGORY ID
export async function getSubCategoryByMainCatId(mainCategoryId: string) {
  await connectToDatabase();
  const subCategories = await SubCategory.find({ mainCategory: mainCategoryId })
    .select("name _id slug")
    .lean();
  return JSON.parse(JSON.stringify(subCategories)) as ISubCategory[];
}

// GET ALL SUB CATEGORIES
export async function getAllSubCategories({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "latest" ? { _id: -1 } : { name: 1 }; // Sort by name for simplicity, can add more sort options if needed

  const subCategories = await SubCategory.find({
    ...queryFilter,
  })
    .populate("mainCategory", "name")
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countSubCategories = await SubCategory.countDocuments({
    ...queryFilter,
  });

  return {
    subCategories: JSON.parse(JSON.stringify(subCategories)) as ISubCategory[],
    totalPages: Math.ceil(countSubCategories / pageSize),
    totalSubCategories: countSubCategories,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + subCategories.length,
  };
}

// GET ALL MAIN CATEGORIES FOR SUB CATEGORY FORM
export async function getAllMainCategories({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "latest" ? { _id: -1 } : { name: 1 };

  const mainCategories = await MainCategory.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countMainCategories = await MainCategory.countDocuments({
    ...queryFilter,
  });

  return {
    mainCategories: JSON.parse(
      JSON.stringify(mainCategories)
    ) as IMainCategory[],
    totalPages: Math.ceil(countMainCategories / pageSize),
    totalMainCategories: countMainCategories,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + mainCategories.length,
  };
}
