"use client";

import useSettingStore from "@/hooks/use-setting-store";
import { cn, round2 } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

const ProductPrice = ({
  price,
  className,
  discountPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number;
  isDeal?: boolean;
  discountPrice?: number;
  className?: string;
  forListing?: boolean;
  plain?: boolean;
}) => {
  const { getCurrency } = useSettingStore();
  const currency = getCurrency();
  const t = useTranslations();

  const format = useFormatter();
  const convertedPrice = round2(price / currency.convertRate);
  const convertedDiscountPrice = round2(discountPrice / currency.convertRate);

  const discountPercent =
    convertedDiscountPrice > 0
      ? Math.round(100 - (convertedPrice / convertedDiscountPrice) * 100)
      : 0;
  const stringValue = convertedPrice.toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  return plain ? (
    format.number(convertedPrice, {
      style: "currency",
      currency: currency.code,
      currencyDisplay: "narrowSymbol",
    })
  ) : convertedDiscountPrice === 0 ? (
    <div className={cn("text-3xl", className)}>
      <span className="text-xs align-super">{currency.symbol}</span>
      {intValue}
      <span className="text-xs align-super">
        {floatValue ? `.${floatValue}` : ""}
      </span>
    </div>
  ) : isDeal ? (
    <div className="space-y-2">
      <div className="flex justify-center items-center gap-2">
        <span className="bg-red-700 rounded-sm p-1 text-white text-sm font-semibold">
          {discountPercent}% {t("Product.Off")}
        </span>
        <span className="text-red-700 text-xs font-bold">
          {t("Product.Limited time deal")}
        </span>
      </div>
      <div
        className={`flex ${forListing && "justify-center"} items-center gap-2`}
      >
        <div className={cn("text-3xl", className)}>
          <span className="align-super">
            {format.number(convertedDiscountPrice, {
              style: "currency",
              currency: currency.code,
              currencyDisplay: "narrowSymbol",
            })}
          </span>
        </div>
        <div className="text-muted-foreground text-xs py-2">
          {t("Product.Was")}:{" "}
          <span className="text-xs ">{currency.symbol}</span>
          {intValue}
          <span className="text-xs line-through">
            {floatValue ? `.${floatValue}` : ""}
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="">
      <div className="flex justify-center gap-3">
        <div className="text-3xl text-orange-700">{discountPercent}%</div>
        <div className={cn("text-3xl", className)}>
          <span className="text-xs align-super">{currency.symbol}</span>
          {convertedDiscountPrice?.toFixed(2)?.split(".")?.[0]}
          <span className="text-xs align-super">
            {floatValue ? `.${floatValue}` : ""}
          </span>
        </div>
      </div>
      <div className="text-muted-foreground text-xs py-2">
        {t("Product.List price")}:{" "}
        <span className="line-through">
          {format.number(convertedPrice, {
            style: "currency",
            currency: currency.code,
            currencyDisplay: "narrowSymbol",
          })}
        </span>
      </div>
    </div>
  );
};

export default ProductPrice;
