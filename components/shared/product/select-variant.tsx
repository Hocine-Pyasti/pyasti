"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ProductVariant {
  _id: string;
  colors: string[];
  sizes: string[];
}

interface SelectVariantProps {
  product: ProductVariant;
  color?: string;
  size?: string;
}

export default function SelectVariant({
  product,
  color,
  size,
}: SelectVariantProps) {
  const searchParams = useSearchParams();
  const selectedColor = color || product.colors?.[0] || "";
  const selectedSize = size || product.sizes?.[0] || "";

  const createQueryString = (
    key: string,
    value: string,
    otherKey: string,
    otherValue: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set(otherKey, otherValue);
    return `?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      {product.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((colorOption) => (
              <Button
                key={colorOption}
                asChild
                variant="outline"
                size="sm"
                className={`border-2 ${selectedColor === colorOption ? "border-primary" : "border-muted"}`}
                aria-label={`Select color ${colorOption}`}
              >
                <Link
                  href={createQueryString(
                    "color",
                    colorOption,
                    "size",
                    selectedSize
                  )}
                  replace
                  scroll={false}
                >
                  <span
                    className="mr-2 h-4 w-4 rounded-full border border-muted-foreground"
                    style={{ backgroundColor: colorOption }}
                    aria-hidden="true"
                  />
                  {colorOption}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {product.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((sizeOption) => (
              <Button
                key={sizeOption}
                asChild
                variant="outline"
                size="sm"
                className={`border-2 ${selectedSize === sizeOption ? "border-primary" : "border-muted"}`}
                aria-label={`Select size ${sizeOption}`}
              >
                <Link
                  href={createQueryString(
                    "size",
                    sizeOption,
                    "color",
                    selectedColor
                  )}
                  replace
                  scroll={false}
                >
                  {sizeOption}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
