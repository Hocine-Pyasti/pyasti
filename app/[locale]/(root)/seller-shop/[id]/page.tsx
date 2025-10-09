import { getProductsBySellerId } from "@/lib/actions/product.actions";
import { auth } from "@/auth";
import SellerOnMap from "@/components/shared/map/seller-on-map";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import SellerShopSearch from "@/components/shared/seller/seller-shop-search";
import DisplayUserData from "@/components/shared/display-user-data";

export default async function SellerShopPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { query?: string };
}) {
  const { id } = params;
  const t = await getTranslations();
  if (!id) {
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

  // 👇 Extract the needed translations here (strings only)
  const translations = {
    searchPlaceholder: t("Search.Search by name or part number"),
    noProducts: t("Search.No results found"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-10">
      {/* Section 1: Shop Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <DisplayUserData
          userId={id}
          showBannerImage
          showName
          showShopType
          showAddress
          showPhoneNumber
          showDescription
          bannerImageStyle="w-60 h-36 lg:w-80 lg:h-56 rounded-xl"
          nameStyle="font-bold text-xl md:text-3xl"
          shopDataStyle="px-2 text-sm md:text-lg"
          divStyles="block px-2 2xl:flex  "
        />

        <div className="h-64 md:h-auto">
          <SellerOnMap sellerId={id} clientId={clientId || id} />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Section 2: Products with Auto Search */}
      <SellerShopSearch
        sellerId={params.id}
        initialProducts={initialProducts.products}
        translations={translations}
      />
    </div>
  );
}
