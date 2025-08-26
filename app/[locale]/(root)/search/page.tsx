import Link from "next/link";

import Pagination from "@/components/shared/pagination";
import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts, getAllTags } from "@/lib/actions/product.actions";
import { getAllSubCategories } from "@/lib/actions/subCategory.actions";
import { IProduct } from "@/lib/db/models/product.model";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import { getFilterUrl, toSlug } from "@/lib/utils";
import Rating from "@/components/shared/product/rating";

import CollapsibleOnMobile from "@/components/shared/collapsible-on-mobile";
import { getTranslations } from "next-intl/server";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

const prices = [
  {
    name: "1 - 1000 DZD",
    value: "1-1000",
  },
  {
    name: "1k - 10k DZD",
    value: "1001-10000",
  },
  {
    name: "10k - 100k DZD",
    value: "10001-100000",
  },
  {
    name: "100k - 1M DZD",
    value: "100001-1000000",
  },
  {
    name: "1M - 10M DZD",
    value: "1000001-10000000",
  },
];

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string;
    subCategory: string;
    tag: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const t = await getTranslations();
  const {
    q = "all",
    subCategory = "all",
    tag = "all",
    price = "all",
    rating = "all",
  } = searchParams;

  if (
    (q !== "all" && q !== "") ||
    subCategory !== "all" ||
    tag !== "all" ||
    rating !== "all" ||
    price !== "all"
  ) {
    const subCategoryName =
      subCategory !== "all"
        ? (await getAllSubCategories({ query: "" })).subCategories.find(
            (sc) => sc._id === subCategory
          )?.name || subCategory
        : "";
    return {
      title: `${t("Search.Search")} ${q !== "all" ? q : ""}
          ${subCategory !== "all" ? ` : ${subCategoryName}` : ""}
          ${tag !== "all" ? ` : ${t("Search.Tag")} ${tag}` : ""}
          ${price !== "all" ? ` : ${t("Search.Price")} ${price}` : ""}
          ${rating !== "all" ? ` : ${t("Search.Rating")} ${rating}` : ""}`,
    };
  } else {
    return {
      title: t("Search.Search Products"),
    };
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string;
    subCategory: string;
    tag: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>;
}) {
  const searchParams = await props.searchParams;

  const {
    q = "all",
    subCategory = "all",
    tag = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = searchParams;

  const params = { q, subCategory, tag, price, rating, sort, page };

  const subCategories = await getAllSubCategories({ query: "" });
  const tags = await getAllTags();
  const data = await getAllProducts({
    subCategory,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  });
  const t = await getTranslations();
  return (
    <div>
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row">
        <div className="flex items-center">
          {data.totalProducts === 0
            ? t("Search.No")
            : `${data.from}-${data.to} ${t("Search.of")} ${
                data.totalProducts
              }`}{" "}
          {t("Search.results")}
          {(q !== "all" && q !== "") ||
          (subCategory !== "all" && subCategory !== "") ||
          (tag !== "all" && tag !== "") ||
          rating !== "all" ||
          price !== "all"
            ? ` ${t("Search.for")} `
            : null}
          {q !== "all" && q !== "" && '"' + q + '"'}
          {subCategory !== "all" &&
            subCategory !== "" &&
            (subCategories.subCategories.find((sc) => sc._id === subCategory)
              ?.name ||
              subCategory)}
          {tag !== "all" && tag !== "" && ` ${t("Search.Tag")}: ` + tag}
          {price !== "all" && ` ${t("Search.Price")}: ` + price}
          {rating !== "all" &&
            ` ${t("Search.Rating")}: ` + rating + ` & ${t("Search.up")}`}
           
          {(q !== "all" && q !== "") ||
          (subCategory !== "all" && subCategory !== "") ||
          (tag !== "all" && tag !== "") ||
          rating !== "all" ||
          price !== "all" ? (
            <Button variant={"link"} asChild>
              <Link href="/search">{t("Search.Clear")}</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>
      <div className="bg-card grid md:grid-cols-5 md:gap-4">
        <CollapsibleOnMobile title={t("Search.Filters")}>
          <div className="space-y-4">
            <div>
              <div className="font-bold">{t("Search.Department")}</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ("all" === subCategory || "" === subCategory) &&
                      "text-primary"
                    }`}
                    href={getFilterUrl({ subCategory: "all", params })}
                  >
                    {t("Search.All")}
                  </Link>
                </li>
                {subCategories.subCategories.map((sc: any) => (
                  <li key={sc._id}>
                    <Link
                      className={`${sc._id === subCategory && "text-primary"}`}
                      href={getFilterUrl({ subCategory: sc._id, params })}
                    >
                      {sc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold">{t("Search.Price")}</div>
              <ul>
                <li>
                  <Link
                    className={`${"all" === price && "text-primary"}`}
                    href={getFilterUrl({ price: "all", params })}
                  >
                    {t("Search.All")}
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      href={getFilterUrl({ price: p.value, params })}
                      className={`${p.value === price && "text-primary"}`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold">{t("Search.Customer Review")}</div>
              <ul>
                <li>
                  <Link
                    href={getFilterUrl({ rating: "all", params })}
                    className={`${"all" === rating && "text-primary"}`}
                  >
                    {t("Search.All")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getFilterUrl({ rating: "4", params })}
                    className={`${"4" === rating && "text-primary"}`}
                  >
                    <div className="flex">
                      <Rating size={4} rating={4} /> {t("Search.& Up")}
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-bold">{t("Search.Tag")}</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ("all" === tag || "" === tag) && "text-primary"
                    }`}
                    href={getFilterUrl({ tag: "all", params })}
                  >
                    {t("Search.All")}
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link
                      className={`${toSlug(t) === tag && "text-primary"}`}
                      href={getFilterUrl({ tag: t, params })}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        <div className="md:col-span-4 space-y-4">
          <div>
            <div className="font-bold text-xl">{t("Search.Results")}</div>
            <div>
              {t("Search.Check each product page for other buying options")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.products.length === 0 && (
              <div>{t("Search.No product found")}</div>
            )}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
