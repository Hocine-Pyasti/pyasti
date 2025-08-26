"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import { ISubCategory } from "@/lib/db/models/subCategory.model";
import { UploadButton } from "@/lib/uploadthing";
import { ProductInputSchema, ProductUpdateSchema } from "@/lib/validator";
import { IProductInput } from "@/types";
import { cn, toSlug } from "@/lib/utils";
import { useTranslations } from "next-intl";

const productDefaultValues: IProductInput = {
  name: "",
  slug: "",
  subCategory: "",
  // seller: "",
  images: [],
  brand: "",
  description: "",
  price: 0,
  discountPrice: 0,
  countInStock: 0,
  tags: [],
  colors: [],
  // sizes: [],
  vehicleCompatibility: [],
  partNumber: "",
  specifications: {},
  avgRating: 0,
  numReviews: 0,
  ratingDistribution: [],
  numSales: 0,
  isPublished: false,
  reviews: [],
};

const ProductForm = ({
  type,
  product,
  productId,
  subCategories,
}: {
  type: "Create" | "Update";
  product?: IProduct;
  productId?: string;
  subCategories: ISubCategory[];
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [specFields, setSpecFields] = useState<
    { key: string; value: string }[]
  >([{ key: "", value: "" }]);

  const t = useTranslations();

  const form = useForm<IProductInput>({
    resolver:
      type === "Update"
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const {
    fields: vehicleFields,
    append: appendVehicle,
    remove: removeVehicle,
  } = useFieldArray({
    control: form.control,
    name: "vehicleCompatibility",
  });

  async function onSubmit(values: IProductInput) {
    try {
      // Convert string inputs to numbers for numeric fields
      const formattedValues = {
        ...values,
        slug: toSlug(values.name),
        price: Number(values.price),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : 0,
        countInStock: Number(values.countInStock),
        specifications: specFields.reduce(
          (acc, { key, value }) => {
            if (key.trim() && value.trim()) acc[key.trim()] = value.trim();
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      console.log("Submitting Form with Values:", formattedValues);

      if (type === "Create") {
        const res = await createProduct(formattedValues);
        console.log("Create Product Response:", res);
        if (!res.success) {
          toast({ variant: "destructive", description: res.message });
        } else {
          toast({ description: res.message });
          router.push(`/seller/products`);
        }
      }
      if (type === "Update") {
        if (!productId) {
          router.push(`/seller/products`);
          return;
        }
        const res = await updateProduct({ ...formattedValues, _id: productId });
        console.log("Update Product Response:", res);
        if (!res.success) {
          toast({ variant: "destructive", description: res.message });
        } else {
          toast({ description: res.message });
          router.push(`/seller/products`);
        }
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast({
        variant: "destructive",
        description: "An error occurred while submitting the form.",
      });
    }
  }

  const images = form.watch("images");

  const handleAddSpecField = () => {
    setSpecFields([...specFields, { key: "", value: "" }]);
  };

  const handleSpecChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updatedFields = [...specFields];
    updatedFields[index][field] = value;
    setSpecFields(updatedFields);
  };

  // Log validation errors for debugging
  const errors = form.formState.errors;
  if (Object.keys(errors).length > 0) {
    console.log("Form Validation Errors:", errors);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("Product.Enter name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="partNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Part Number")} </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Product.Enter part number")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Product.SubCategory")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subcategory" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subCategories.map((subCategory) => (
                    <SelectItem key={subCategory._id} value={subCategory._id}>
                      {subCategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Brand")}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand (e.g., Bosch)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countInStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Stock Quantity")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter stock quantity"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Discounted Price")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter discount price"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Colors")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const newColors = field.value.includes(value)
                        ? field.value.filter((c) => c !== value)
                        : [...field.value, value];
                      field.onChange(newColors);
                    }}
                    value=""
                  >
                    <SelectTrigger className="h-auto min-h-9">
                      <SelectValue
                        placeholder={
                          field.value.length > 0
                            ? field.value.join(", ")
                            : t("Product.Select Color")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Transparent",
                        "Red",
                        "Blue",
                        "Green",
                        "Yellow",
                        "Black",
                        "White",
                        "Silver",
                        "Gold",
                        "Purple",
                        "Orange",
                        "Pink",
                        "Brown",
                      ].map((color) => (
                        <SelectItem
                          key={color}
                          value={color}
                          className={cn(
                            "flex items-center",
                            field.value.includes(color) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <span
                            className="mr-2 h-4 w-4 rounded-full"
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Product.Tags")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const newTags = field.value.includes(value)
                        ? field.value.filter((t) => t !== value)
                        : [...field.value, value];
                      field.onChange(newTags);
                    }}
                    value=""
                  >
                    <SelectTrigger className="h-auto min-h-9">
                      <SelectValue
                        placeholder={
                          field.value.length > 0
                            ? field.value.join(", ")
                            : t("Product.Select Tags")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "new arrival",
                        "best-seller",
                        "todays-deal",
                        "my-featured",
                      ].map((tag) => (
                        <SelectItem
                          key={tag}
                          value={tag}
                          className={cn(
                            "flex items-center",
                            field.value.includes(tag) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          {tag
                            .split("-")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter tags (e.g., new arrival, best-seller, todays-deal, featured, best-seller)"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value.split(",").map((t) => t.trim())
                      )
                    }
                    value={field.value.join(", ")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Product.Description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Describe the product in detail.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t("Product.Vehicle Compatibility")}</FormLabel>
          <Card>
            <CardContent className="space-y-4 mt-2">
              {vehicleFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                  <FormField
                    control={form.control}
                    name={`vehicleCompatibility.${index}.make`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Product.Brand")}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Toyota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`vehicleCompatibility.${index}.model`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Product.Model")}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Corolla" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`vehicleCompatibility.${index}.year`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Product.Years")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 2018, 2019, 2020"
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  .split(",")
                                  .map((y) => Number(y.trim()))
                                  .filter((y) => !isNaN(y))
                              )
                            }
                            value={field.value?.join(", ") || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeVehicle(index)}
                    className="mt-8"
                  >
                    {t("Product.Remove")}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => appendVehicle({ make: "", model: "", year: [] })}
              >
                {t("Product.Add Vehicle")}
              </Button>
            </CardContent>
          </Card>
          <FormMessage />
        </FormItem>

        <FormItem>
          <FormLabel>{t("Product.Specifications")}</FormLabel>
          <Card>
            <CardContent className="space-y-4 mt-2">
              {specFields.map((spec, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <Input
                    placeholder={t("Product.Specifications Key")}
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(index, "key", e.target.value)
                    }
                  />
                  <Input
                    placeholder={t("Product.Specifications Value")}
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(index, "value", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      setSpecFields(specFields.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSpecField}
              >
                {t("Product.Add Specification")}
              </Button>
            </CardContent>
          </Card>
        </FormItem>

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>{t("Product.Images")}</FormLabel>
              <Card>
                <CardContent className="space-y-2 mt-2 min-h-48">
                  <div className="flex flex-wrap gap-2">
                    {images.map((image: string, index: number) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt="Product image"
                          className="w-20 h-20 object-cover rounded-sm"
                          width={80}
                          height={80}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-0"
                          onClick={() =>
                            form.setValue(
                              "images",
                              images.filter((_, i) => i !== index)
                            )
                          }
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res: { url: string }[]) => {
                        form.setValue("images", [...images, res?.[0]?.url]);
                      }}
                      onUploadError={(error: Error) => {
                        toast({
                          variant: "destructive",
                          description: `ERROR! ${error.message}`,
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{t("Product.Publish Product")}</FormLabel>
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
          {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
