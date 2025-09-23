import {
  CarouselSchema,
  CartSchema,
  DeliveryDateSchema,
  OrderInputSchema,
  ClientOrderInputSchema,
  OrderItemSchema,
  PaymentMethodSchema,
  MainCategoryInputSchema,
  // SubCategoryInputSchema,
  // ProductInputSchema,
  ReviewInputSchema,
  SettingInputSchema,
  ShippingAddressSchema,
  SiteCurrencySchema,
  SiteLanguageSchema,
  UserInputSchema,
  UserProfileSchema,
  UserSignInSchema,
  UserSignUpSchema,
  WebPageInputSchema,
} from "@/lib/validator";
import { Schema } from "mongoose";
import { z } from "zod";

export type IReviewInput = z.infer<typeof ReviewInputSchema>;
export type IReviewDetails = IReviewInput & {
  _id: string;
  createdAt: string;
  user: {
    name: string;
  };
};
export type IMainCategoryInput = z.infer<typeof MainCategoryInputSchema>;
export interface ISubCategoryInput {
  name: string;
  slug: string;
  mainCategory: string | Schema.Types.ObjectId;
  description?: string;
}
export interface IProductInput {
  name: string;
  slug: string;
  subCategory: string | Schema.Types.ObjectId;
  seller: string | Schema.Types.ObjectId;
  images: string[];
  brand: string;
  description: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  tags: string[];
  colors: string[];
  vehicleCompatibility?: {
    make: string;
    model: string;
    year: number[];
  }[];
  partNumber: string;
  specifications?: Record<string, string>;
  avgRating?: number;
  numReviews?: number;
  ratingDistribution?: {
    rating: number;
    count: number;
  }[];
  numSales?: number;
  isPublished?: boolean;
  reviews?: IReviewInput[];
}

export type Data = {
  settings: ISettingInput[];
  webPages: IWebPageInput[];
  users: IUserInput[];
  products: IProductInput[];
  reviews: {
    title: string;
    rating: number;
    comment: string;
  }[];
  headerMenus: {
    name: string;
    href: string;
  }[];
  carousels: {
    image: string;
    url: string;
    title: string;
    buttonCaption: string;
    isPublished: boolean;
  }[];
};
// Order
export type IOrderInput = z.infer<typeof OrderInputSchema>;
export type IOrderList = IOrderInput & {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: Date;
};

// Client Order
export type IClientOrderInput = z.infer<typeof ClientOrderInputSchema>;
export type IClientOrderList = IClientOrderInput & {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: Date;
};
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

// user
export type IUserInput = z.infer<typeof UserInputSchema>;
export type IUserSignIn = z.infer<typeof UserSignInSchema>;
export type IUserSignUp = z.infer<typeof UserSignUpSchema>;
export type IUserProfile = z.infer<typeof UserProfileSchema>;

// webpage
export type IWebPageInput = z.infer<typeof WebPageInputSchema>;

// setting
export type ICarousel = z.infer<typeof CarouselSchema>;
export type ISettingInput = z.infer<typeof SettingInputSchema>;
export type ClientSetting = ISettingInput & {
  currency: string;
};
export type SiteLanguage = z.infer<typeof SiteLanguageSchema>;
export type SiteCurrency = z.infer<typeof SiteCurrencySchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type DeliveryDate = z.infer<typeof DeliveryDateSchema>;
