"use server";

import { connectToDatabase } from "@/lib/db";
import MainCategory, {
  IMainCategory,
} from "@/lib/db/models/mainCategory.model";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { MainCategoryInputSchema } from "../validator";
import { IMainCategoryInput } from "@/types";
import { z } from "zod";
import { getSetting } from "./setting.actions";

// CREATE
export async function createMainCategory(data: IMainCategoryInput) {
  try {
    const mainCategory = MainCategoryInputSchema.parse(data);
    await connectToDatabase();
    await MainCategory.create(mainCategory);
    revalidatePath("/admin/mainCategory");
    return {
      success: true,
      message: "Main Category created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateMainCategory(
  data: IMainCategoryInput & { _id: string }
) {
  try {
    const mainCategory = MainCategoryInputSchema.extend({
      _id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID"),
    }).parse(data);
    await connectToDatabase();
    await MainCategory.findByIdAndUpdate(mainCategory._id, mainCategory);
    revalidatePath("/admin/mainCategory");
    return {
      success: true,
      message: "Main Category updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteMainCategory(id: string) {
  try {
    await connectToDatabase();
    const res = await MainCategory.findByIdAndDelete(id);
    if (!res) throw new Error("Main Category not found");
    revalidatePath("/admin/mainCategory");
    return {
      success: true,
      message: "Main Category deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ONE MAIN CATEGORY BY ID
export async function getMainCategoryById(mainCategoryId: string) {
  await connectToDatabase();
  const mainCategory = await MainCategory.findById(mainCategoryId);
  return JSON.parse(JSON.stringify(mainCategory)) as IMainCategory;
}

// GET ALL MAIN CATEGORIES
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
    sort === "latest" ? { _id: -1 } : { name: 1 }; // Sort by name for simplicity, can add more sort options if needed

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
