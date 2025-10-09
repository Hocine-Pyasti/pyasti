"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/shared/product/product-card";
import { IProduct } from "@/lib/db/models/product.model";
import { Loader2, SearchIcon } from "lucide-react";

export default function SellerShopSearch({
  sellerId,
  initialProducts,
  translations,
}: {
  sellerId: string;
  initialProducts: IProduct[];
  translations: {
    searchPlaceholder: string;
    noProducts: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim() === "") {
      setProducts(initialProducts);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/seller/${sellerId}/search?query=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 400); // Debounce 400ms

    return () => clearTimeout(timeout);
  }, [query, sellerId, initialProducts]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8 mt-28 md:mt-12 flex border-2 border-primary rounded-xl">
        <Input
          placeholder={translations.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none shadow-none"
        />
        <button className="text-primary text-black rounded-s-none rounded-e-md h-full px-3 py-[6px] ">
          <SearchIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-6">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {!loading && products.length === 0 && (
          <div>{translations.noProducts}</div>
        )}
        {products.map((product: IProduct) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
