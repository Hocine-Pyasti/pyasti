import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { IProduct } from "@/lib/db/models/product.model";

import Rating from "./rating";
import { formatNumber, generateId, round2 } from "@/lib/utils";
import ProductPrice from "./product-price";
import ImageHover from "./image-hover";
import AddToCart from "./add-to-cart";
import DisplayUserData from "../display-user-data";

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
  hideAddToCart = false,
}: {
  product: IProduct;
  hideDetails?: boolean;
  hideBorder?: boolean;
  hideAddToCart?: boolean;
}) => {
  const ProductImage = () => (
    <Link href={`/product/${product.slug}`}>
      <div className="relative h-52">
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className="relative h-52">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="80vw"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </Link>
  );
  const ProductDetails = () => (
    <div className="flex-1 space-y-2">
      <p>
        Marque: <span className="font-bold"> {product.brand}</span>
      </p>
      <Link
        href={`/product/${product.slug}`}
        className="overflow-hidden text-ellipsis font-bold text-lg lg:text-xl"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {product.name}
      </Link>
      <div
        className="flex gap-2 items-center absolute left-7 top-6"
        style={{
          transform: "rotate(90deg)",
          transformOrigin: "top left",
        }}
      >
        <Rating rating={product.avgRating} />
        <span
          style={{
            transform: "rotate(-90deg)",
          }}
        >
          ({formatNumber(product.numReviews)})
        </span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes("todays-deal")}
        price={product.price}
        discountPrice={product.discountPrice}
        forListing
      />
      <div className="text-center text-sm"> Ref: {product.partNumber}</div>
    </div>
  );
  const AddButton = () => (
    <div className="w-full text-center">
      <AddToCart
        minimal
        item={{
          clientId: generateId(),
          product: product._id,
          size: product?.sizes?.[0],
          color: product?.colors?.[0],
          countInStock: product.countInStock,
          name: product.name,
          slug: product.slug,
          subCategory: product.subCategory.toString(),
          price: round2(product.price),
          quantity: 1,
          image: product.images[0],
        }}
      />
    </div>
  );

  return hideBorder ? (
    <div className="flex flex-col">
      <ProductImage />
      {!hideDetails && (
        <>
          <div className="p-3 flex-1 text-center">
            <ProductDetails />
          </div>
          {!hideAddToCart && <AddButton />}
        </>
      )}
    </div>
  ) : (
    <Card className="pt-4 flex flex-col mb-2 border-t-2 border-t-blue-700 hover:shadow-lg hover:shadow-blue-400 transition-shadow relative">
      <div className="absolute top-[-10px] self-center z-10 bg-blue-700 text-white rounded-md shadow backdrop-blur-md">
        <DisplayUserData userId={product.seller.toString()} showName />
      </div>
      <CardHeader className="p-0">
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className="p-3 flex-1  text-center">
            <ProductDetails />
          </CardContent>
          <CardFooter className="p-3">
            {!hideAddToCart && <AddButton />}
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ProductCard;
