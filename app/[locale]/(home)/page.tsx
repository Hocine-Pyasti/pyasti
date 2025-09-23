import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { HomeCard } from "@/components/shared/home/home-card";
import { HomeCarousel } from "@/components/shared/home/home-carousel";
import ProductSlider from "@/components/shared/product/product-slider";
import { Card, CardContent } from "@/components/ui/card";

import {
  getProductsForCard,
  getProductsByTag,
} from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
// import { getAllSubCategories } from "@/lib/actions/subCategory.actions";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const { carousels } = await getSetting();
  const todaysDeals = await getProductsByTag({ tag: "todays-deal" });
  const bestSellingProducts = await getProductsByTag({ tag: "best-seller" });

  // const subCategories = await getAllSubCategories({ query: "" });
  // const allSubCategories = subCategories.subCategories;
  const newArrivals = await getProductsForCard({ tag: "new-arrival" });
  const featureds = await getProductsForCard({ tag: "featured" });
  const bestSellers = await getProductsForCard({ tag: "best-seller" });

  const cards = [
    // render the first 4 sub categories
    // {
    //   title: t("Categories to explore"),
    //   link: {
    //     text: t("See More"),
    //     href: "/search",
    //   },
    //   items: allSubCategories.map((subCategory) => ({
    //     name: subCategory.name,
    //     image: `/images/${toSlug(subCategory.name)}.jpg`,
    //     href: `/search?subCategory=${subCategory._id}`,
    //   })),
    // },
    {
      title: t("Explore New Arrivals"),
      items: newArrivals,
      link: {
        text: t("View All"),
        href: "/search?tag=new-arrival",
      },
    },
    {
      title: t("Discover Best Sellers"),
      items: bestSellers,
      link: {
        text: t("View All"),
        href: "/search?tag=best-seller",
      },
    },
    {
      title: t("Featured Products"),
      items: featureds,
      link: {
        text: t("Shop Now"),
        href: "/search?tag=featured",
      },
    },
  ];

  return (
    <div
      className=" bg-border bg-cover bg-no-repeat bg-top bg-fixed"
      style={{
        backgroundImage: "url('/images/home-bg.png')",
      }}
    >
      <HomeCarousel items={carousels} />
      <div className="md:p-4 md:space-y-4">
        <HomeCard cards={cards} />
        <Card className="w-full rounded-xl">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title={t("Today's Deals")} products={todaysDeals} />
          </CardContent>
        </Card>
        <Card className="w-full rounded-xl">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider
              title={t("Best Selling Products")}
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-card backdrop-blur-md">
        <BrowsingHistoryList />
      </div>
    </div>
  );
}
