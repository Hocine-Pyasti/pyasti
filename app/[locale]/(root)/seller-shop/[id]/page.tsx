import { getProductsBySellerId } from "@/lib/actions/product.actions";
import { getSellerById } from "@/lib/actions/user.actions";
import { auth } from "@/auth";
import SellerOnMap from "@/components/shared/map/seller-on-map";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import ProductCard from "@/components/shared/product/product-card";
import { IProduct } from "@/lib/db/models/product.model";
import { Button } from "@/components/ui/button";

export default async function SellerShopPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { query?: string };
}) {
  const seller = await getSellerById(params.id);
  const { id } = params;
  const t = await getTranslations();
  if (!seller) {
    notFound();
  }
  const session = await auth();
  const clientId = session?.user.id;

  const initialProducts = await getProductsBySellerId({
    sellerId: params.id,
    query: searchParams?.query || "",
    page: 1,
    sort: "latest",
    limit: 20,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Section 1: Shop Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* Left: Shop Details */}
        <div className="space-y-4">
          {seller.shopDetails.bannerImage && (
            <Image
              src={seller.shopDetails.bannerImage}
              alt={`${seller.shopDetails.shopName} banner`}
              width={800}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}
          <h1 className="text-3xl font-bold">{seller.shopDetails.shopName}</h1>
          <p className="text-muted-foreground">
            {t("phone")}: {seller.shopDetails.shopPhone}
          </p>
          <p>{seller.shopDetails.shopDescription}</p>
        </div>

        {/* Right: Map */}
        <div className="h-64 md:h-auto">
          <SellerOnMap sellerId={id} clientId={clientId || id} />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Section 2: Products */}
      <div>
        {/* Search Bar */}
        <form method="GET" className="mb-4 flex gap-2">
          <Input
            name="query"
            placeholder={t("Search by name or part number")}
            defaultValue={searchParams?.query || ""}
            className="flex-1"
          />
          <Button type="submit">{t("Search")}</Button>
        </form>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {initialProducts.products.length === 0 && (
            <div>{t("Search.No product found")}</div>
          )}
          {initialProducts.products.map((product: IProduct) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {initialProducts.products.length === 0 && (
          <p className="text-center text-muted-foreground">{t("noProducts")}</p>
        )}
      </div>
    </div>
  );
}
