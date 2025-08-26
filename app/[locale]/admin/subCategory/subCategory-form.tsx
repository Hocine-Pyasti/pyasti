"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createSubCategory,
  updateSubCategory,
} from "@/lib/actions/subCategory.actions";
import { ISubCategory } from "@/lib/db/models/subCategory.model";
import { IMainCategory } from "@/lib/db/models/mainCategory.model";
import { SubCategoryInputSchema } from "@/lib/validator";
import { ISubCategoryInput } from "@/types";
import { toSlug } from "@/lib/utils";

const subCategoryDefaultValues: ISubCategoryInput = {
  name: "",
  slug: "",
  mainCategory: "",
  description: "",
};

const SubCategoryForm = ({
  type,
  subCategory,
  subCategoryId,
  mainCategories,
}: {
  type: "Create" | "Update";
  subCategory?: ISubCategory;
  subCategoryId?: string;
  mainCategories: IMainCategory[];
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // Ensure mainCategory is set correctly for Update mode
  const initialValues =
    subCategory && type === "Update"
      ? {
          ...subCategory,
          mainCategory:
            typeof subCategory.mainCategory === "object" &&
            subCategory.mainCategory?._id
              ? subCategory.mainCategory._id.toString()
              : subCategory.mainCategory?.toString() || "",
        }
      : subCategoryDefaultValues;

  const form = useForm<ISubCategoryInput>({
    resolver: zodResolver(SubCategoryInputSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: ISubCategoryInput) {
    if (type === "Create") {
      const res = await createSubCategory(values);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        toast({ description: res.message });
        router.push(`/admin/subCategory`);
      }
    }
    if (type === "Update") {
      if (!subCategoryId) {
        router.push(`/admin/subCategory`);
        return;
      }
      const res = await updateSubCategory({ ...values, _id: subCategoryId });
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        router.push(`/admin/subCategory`);
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter sub category name (e.g., Oil Filters)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter sub category slug"
                    {...field}
                    className="pr-24"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      form.setValue("slug", toSlug(form.getValues("name")))
                    }
                  >
                    Generate
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mainCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a main category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mainCategories.map((mainCategory) => (
                    <SelectItem key={mainCategory._id} value={mainCategory._id}>
                      {mainCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter sub category description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting
            ? "Submitting..."
            : `${type} Sub Category`}
        </Button>
      </form>
    </Form>
  );
};

export default SubCategoryForm;
