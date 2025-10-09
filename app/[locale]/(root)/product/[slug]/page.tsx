import { auth } from "@/auth";
import AddToCart from "@/components/shared/product/add-to-cart";
import { Card, CardContent } from "@/components/ui/card";
import {
  getProductBySlug,
  getRelatedProductsBySubCategory,
} from "@/lib/actions/product.actions";

import ReviewList from "./review-list";
import { generateId, round2 } from "@/lib/utils";
import SelectVariant from "@/components/shared/product/select-variant";
import ProductPrice from "@/components/shared/product/product-price";
import ProductGallery from "@/components/shared/product/product-gallery";
import AddToBrowsingHistory from "@/components/shared/product/add-to-browsing-history";
import { Separator } from "@/components/ui/separator";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import RatingSummary from "@/components/shared/product/rating-summary";
import ProductSlider from "@/components/shared/product/product-slider";
import { getTranslations } from "next-intl/server";
import SellerOnMap from "@/components/shared/map/seller-on-map";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayUserData from "@/components/shared/display-user-data";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations();
  const params = await props.params;
  const product = await getProductBySlug(params.slug);
  // console.log(product);
  if (!product) {
    return { title: t("Product.Product not found") };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetails(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page: string; color: string; size: string }>;
}) {
  const searchParams = await props.searchParams;
  const { page, color, size } = searchParams;
  const params = await props.params;
  const { slug } = params;

  const session = await auth();
  const product = await getProductBySlug(slug);

  const relatedProducts = await getRelatedProductsBySubCategory({
    subCategory: product.subCategory,
    productId: product._id,
    page: Number(page || "1"),
  });

  const t = await getTranslations();
  return (
    <div className="pt-10 px-2 md:px-10 lg:px-20">
      <AddToBrowsingHistory
        id={product._id}
        subCategory={product.subCategory.toString()}
      />
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          <div className="col-span-2">
            <ProductGallery images={product.images} />
          </div>

          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              <p className="p-medium-16 rounded-full bg-grey-500/10 text-grey-500">
                Cat: {product.subCategory.name}
              </p>

              <h1 className="font-bold text-xl lg:text-2xl text-blue-500">
                {product.name}
              </h1>
              <p>
                {" "}
                <span className="font-bold">
                  {t("Product.Part Number")} :
                </span>{" "}
                {product.partNumber}
              </p>
              <p>
                {" "}
                <span className="font-bold">{t("Product.Brand")} :</span>{" "}
                {product.brand}
              </p>

              <RatingSummary
                avgRating={product.avgRating?.valueOf() || 0}
                numReviews={product.numReviews?.valueOf() || 0}
                asPopover
                ratingDistribution={product.ratingDistribution || []}
              />
              <Separator />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex gap-3">
                  <ProductPrice
                    price={product.price}
                    discountPrice={product.discountPrice}
                    isDeal={product.tags.includes("todays-deal")}
                    forListing={false}
                  />
                </div>
              </div>
            </div>
            <div>
              <SelectVariant
                product={product}
                size={size || product?.sizes?.[0]}
                color={color || product?.colors?.[0]}
              />
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">
                {t("Product.Description")}:
              </p>
              <p className="p-medium-16 lg:p-regular-18">
                {product.description}
              </p>
            </div>
          </div>
          <div>
            <Card>
              <CardContent className="p-4 flex flex-col gap-4">
                {/* <ProductPrice price={product.price} /> */}

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">
                    {t("Product.Only X left in stock - order soon", {
                      count: product.countInStock,
                    })}
                  </div>
                )}
                {product.countInStock !== 0 ? (
                  <div className="text-green-700 text-xl">
                    {t("Product.In Stock")}
                  </div>
                ) : (
                  <div className="text-destructive text-xl">
                    {t("Product.Out of Stock")}
                  </div>
                )}

                {product.countInStock !== 0 && (
                  <div className="flex justify-center items-center">
                    <AddToCart
                      item={{
                        clientId: generateId(),
                        product: product._id,
                        countInStock: product.countInStock,
                        name: product.name,
                        slug: product.slug,
                        subCategory: product.subCategory.toString(),
                        price: round2(
                          product.discountPrice && product.discountPrice !== 0
                            ? product.discountPrice
                            : product.price
                        ),
                        quantity: 1,
                        image: product?.images?.[0] || "",
                        size: size || product.sizes?.[0],
                        color: color || product.colors?.[0],
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Separator />
      <section className="mt-10 grid grid-cols-1 gap-5 md:grid md:grid-cols-2">
        <div className="px-0 md:px-5">
          <div>
            {product.vehicleCompatibility &&
            product.vehicleCompatibility.length > 0 ? (
              <div>
                <h3 className="font-bold mb-2">
                  {t("Product.Vehicle Compatibility")}
                </h3>
                <ul className="list-disc pl-5">
                  {product.vehicleCompatibility.map((vc, idx) => (
                    <li key={idx} className="mb-1">
                      <span className="font-semibold">{vc.make}</span>{" "}
                      <span>{vc.model}</span>{" "}
                      <span>
                        (
                        {vc.year && Array.isArray(vc.year)
                          ? vc.year.join(", ")
                          : vc.year}
                        )
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>
                {" "}
                <span className="text-grey-500">
                  {t("Product.No vehicle compatibility information available")}
                </span>
              </p>
            )}
          </div>
          <div className="mt-5 md:mt-0">
            {product.specifications &&
            typeof product.specifications === "object" ? (
              <div>
                <h3 className="font-bold mb-2">
                  {t("Product.Specifications")}
                </h3>
                <ul className="list-disc pl-5">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <li key={key} className="mb-1">
                        <span className="font-semibold">{key}:</span>{" "}
                        <span>{value}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ) : (
              <span className="text-grey-500">
                {t("Product.No specifications available")}
              </span>
            )}
          </div>
        </div>
        <div className="border-2 border-secondary rounded-lg p-2 pt-4">
          <div className="pb-3">
            <div className="mb-4">
              <DisplayUserData
                userId={product.seller.toString()}
                showBannerImage
                showName
                showShopType
                showAddress
                bannerImageStyle="w-20 h-20 rounded-full"
                nameStyle="font-bold text-xl"
                addresspeStyle="ml-1 p-1"
                shoTypeStyle="bg-green-200 px-2 rounded-lg text-green-800"
              />
            </div>
            <Link href={`/seller-shop/${product.seller}`}>
              <Button variant="third">{t("Product.View Seller")}</Button>
            </Link>
          </div>
          <SellerOnMap
            sellerId={product.seller.toString()}
            clientId={session?.user.id || ""}
          />
        </div>
      </section>
      <section className="mt-10">
        <h2 className="h2-bold mb-2" id="reviews">
          {t("Product.Customer Reviews")}
        </h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>
      <section className="mt-10">
        <ProductSlider
          products={relatedProducts.data}
          title={t("Product.Best Sellers in", {
            name: product.subCategory.name,
          })}
        />
      </section>
      <section>
        <BrowsingHistoryList className="mt-10" />
      </section>
    </div>
  );
}
