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
import { useToast } from "@/hooks/use-toast";
import {
  createMainCategory,
  updateMainCategory,
} from "@/lib/actions/mainCategory.actions";
import { IMainCategory } from "@/lib/db/models/mainCategory.model";
import { MainCategoryInputSchema } from "@/lib/validator";
import { IMainCategoryInput } from "@/types";
import { toSlug } from "@/lib/utils";

const mainCategoryDefaultValues: IMainCategoryInput = {
  name: "",
  slug: "",
  description: "",
};

const MainCategoryForm = ({
  type,
  mainCategory,
  mainCategoryId,
}: {
  type: "Create" | "Update";
  mainCategory?: IMainCategory;
  mainCategoryId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<IMainCategoryInput>({
    resolver: zodResolver(MainCategoryInputSchema),
    defaultValues:
      mainCategory && type === "Update"
        ? mainCategory
        : mainCategoryDefaultValues,
  });

  async function onSubmit(values: IMainCategoryInput) {
    if (type === "Create") {
      const res = await createMainCategory(values);
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        toast({ description: res.message });
        router.push(`/admin/mainCategory`);
      }
    }
    if (type === "Update") {
      if (!mainCategoryId) {
        router.push(`/admin/mainCategory`);
        return;
      }
      const res = await updateMainCategory({ ...values, _id: mainCategoryId });
      if (!res.success) {
        toast({ variant: "destructive", description: res.message });
      } else {
        router.push(`/admin/mainCategory`);
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
                  placeholder="Enter main category name (e.g., Engine Parts)"
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
                    placeholder="Enter main category slug"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter main category description"
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
            : `${type} Main Category`}
        </Button>
      </form>
    </Form>
  );
};

export default MainCategoryForm;
