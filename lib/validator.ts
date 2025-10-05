import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

// Common
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: "Invalid MongoDB ID" });

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`
    );

export const MainCategoryInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().optional(),
});

export const SubCategoryInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  mainCategory: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid MainCategory ID"),
  description: z.string().optional(),
});

export const ReviewInputSchema = z.object({
  product: MongoId,
  user: MongoId,
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, "Title is required"),
  comment: z.string().min(1, "Comment is required"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

export const ProductInputSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().optional(),
  subCategory: z.string().min(1, "Subcategory is required"),
  seller: z.string().optional(),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  brand: z.string().min(1, "Brand is required"),
  description: z.string().min(1, "Description is required"),
  price: Price("Price"),
  discountPrice: Price("Discount price").optional(),
  countInStock: z.coerce
    .number()
    .int()
    .nonnegative("Count in stock must be a non-negative number"),
  tags: z.array(z.string()).default([]),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  vehicleCompatibility: z
    .array(
      z.object({
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.array(z.number()).optional(),
      })
    )
    .optional(),
  partNumber: z.string().min(1, "Part number is required"),
  specifications: z.record(z.string()).optional(),
  avgRating: z.coerce
    .number()
    .min(0, "Average rating must be at least 0")
    .max(5, "Average rating must be at most 5")
    .default(0),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative("Number of reviews must be a non-negative number")
    .default(0),
  ratingDistribution: z
    .array(
      z.object({
        rating: z.number().min(1).max(5),
        count: z.number().min(0),
      })
    )
    .max(5)
    .default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative("Number of sales must be a non-negative number")
    .default(0),
  isPublished: z.boolean().default(false),
  reviews: z.array(ReviewInputSchema).default([]),
});

export const ProductUpdateSchema = ProductInputSchema.extend({
  _id: z.string(),
});

// Order Item
export const OrderItemSchema = z.object({
  clientId: z.string().min(1, "clientId is required"),
  product: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  subCategory: z.string().min(1, "subCategory is required"),
  quantity: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative number"),
  countInStock: z
    .number()
    .int()
    .nonnegative("Quantity must be a non-negative number"),
  image: z.string().min(1, "Image is required"),
  price: Price("Price"),
  size: z.string().optional(),
  color: z.string().optional(),
});
export const ShippingAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  street: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  province: z.string().min(1, "Province is required"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
});

// Order
export const OrderInputSchema = z.object({
  user: z.string(),
  seller: z.string(),
  items: z.array(
    z.object({
      product: z.string(),
      clientId: z.string(),
      name: z.string(),
      slug: z.string(),
      image: z.string(),
      price: z.number().min(0),
      discountPrice: z.number().min(0).optional(),
      countInStock: z.number().min(0),
      quantity: z.number().min(1),
      subCategory: z.string(),
      brand: z.string(),
      partNumber: z.string(),
      color: z.string().optional(),
      size: z.string().optional(),
      vehicleCompatibility: z
        .array(
          z.object({
            make: z.string(),
            model: z.string(),
            year: z.array(z.number()),
          })
        )
        .optional(),
      specifications: z.record(z.string()).optional(),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    province: z.string().min(1),
    phone: z.string().min(1),
  }),
  paymentMethod: z.string().min(1),
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
    })
    .optional(),
  itemsPrice: z.number().min(0),
  shippingMethod: z.object({
    name: z.string(),
    daysToDeliver: z.number(),
    shippingPrice: z.number(),
    freeShippingMinPrice: z.number(),
  }),
  taxPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  status: z.string().optional(),
  isPaid: z.boolean().default(false),
  paidAt: z.date().optional(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  clientOrder: z.string().optional(),
});

// Cart

export const CartSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, "Order must contain at least one item"),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  shippingMethod: z.optional(
    z.object({
      name: z.string(),
      daysToDeliver: z.number(),
      shippingPrice: z.number(),
      freeShippingMinPrice: z.number(),
    })
  ),
  brand: z.string(),
  partNumber: z.string(),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  shippingAddress: z.optional(ShippingAddressSchema),
  deliveryDateIndex: z.optional(z.number()),
});

// USER
const UserName = z
  .string()
  .min(2, { message: "Username must be at least 2 characters" })
  .max(50, { message: "Username must be at most 50 characters" });
const Email = z.string().min(1, "Email is required").email("Invalid email");
const Password = z.string().min(3, "Password must be at least 3 characters");
const UserRole = z.enum(["User", "Admin", "Seller"], {
  message: "Invalid role",
});

export const UserUpdateSchema = z.object({
  _id: MongoId,
  name: UserName,
  email: Email,
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide").optional(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z
    .object({
      fullName: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  role: UserRole,
  image: z.string().optional(),
  bannerImage: z.string().optional(),
  profileType: z.enum(["Silver", "Gold", "Platinum"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  wallet: z.number().min(0).optional(),
  shopDetails: z.record(z.any()).optional(),
  emailVerified: z.boolean().optional(),
});

export const UserInputSchema = z.object({
  name: UserName,
  email: Email,
  phoneNumber: z.string().min(1, "Phone number is required").optional(),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  address: z
    .object({
      fullName: z.string().min(1, "Full name is required"),
      street: z.string().min(1, "Street is required"),
      city: z.string().min(1, "City is required"),
      province: z.string().min(1, "Province is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
      phone: z.string().min(1, "Phone number is required"),
    })
    .optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  role: UserRole,
  password: Password,
  image: z.string().optional(),
  bannerImage: z.string().optional(),
  profileType: z.enum(["Silver", "Gold", "Platinum"]).default("Silver"),
  status: z.enum(["active", "inactive"]).default("active"),
  wallet: z.number().min(0).default(0),
  shopDetails: z.record(z.any()).optional(),
  emailVerified: z.boolean().default(false),
  language: z.string().default("fr"),
});

export const UserSignInSchema = z.object({
  email: Email,
  password: Password,
});
export const UserSignUpSchema = UserSignInSchema.extend({
  name: UserName,
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  gender: z.enum(["Male", "Female"]).optional(),
  dateOfBirth: z.date().optional(),
  address: z
    .object({
      country: z.string().optional(),
      province: z.string().optional(),
      city: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional()
    .default({}),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  image: z.string().min(3, "Image URL is required").optional(),
  role: z.enum(["User", "Seller"]).default("User"),
  shopDetails: z
    .object({
      bannerImage: z.string().min(3, "Image URL is required").optional(),
      shopName: z
        .string()
        .min(3, "Shop name must be at least 3 characters")
        .optional(),
      shopPhone: z.string().min(8, "Numéro de téléphone invalide").optional(),
      shopDescription: z
        .string()
        .min(20, "Shop description must be at least 20 characters")
        .optional(),
      shopAddress: z.string().optional(),
      shopType: z
        .enum([
          "Physical Shop",
          "Online Shop",
          "Physical and Online Shop",
          "Repair Workshop with Sales",
          "Specialized Distributor",
          "Automotive Recycler",
          "Custom Manufacturer",
          "Collection Point",
        ])
        .optional(),
    })
    .optional()
    .default({}),
  confirmPassword: Password,
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "Seller") {
        return (
          !!data.shopDetails?.bannerImage &&
          !!data.shopDetails?.shopName &&
          !!data.shopDetails?.shopPhone &&
          !!data.shopDetails?.shopDescription &&
          !!data.shopDetails?.shopAddress &&
          !!data.shopDetails?.shopType
        );
      }
      return true;
    },
    {
      message: "All shop details are required for Seller role",
      path: ["shopDetails"],
    }
  );

export const UserNameSchema = z.object({
  name: UserName,
});

export const UserProfileSchema = z.object({
  name: UserName,
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide").optional(),
  address: z
    .object({
      country: z.string().optional(),
      province: z.string().optional(),
      city: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional()
    .default({}),
  shopDetails: z
    .object({
      bannerImage: z.string().min(3, "Image URL is required").optional(),
      shopName: z
        .string()
        .min(3, "Shop name must be at least 3 characters")
        .optional(),
      shopPhone: z.string().min(8, "Numéro de téléphone invalide").optional(),
      shopDescription: z
        .string()
        .min(20, "Shop description must be at least 20 characters")
        .optional(),
      shopAddress: z.string().optional(),
    })
    .optional()
    .default({}),
});

// WEBPAGE
export const WebPageInputSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(1, "Content is required"),
  isPublished: z.boolean(),
});

export const WebPageUpdateSchema = WebPageInputSchema.extend({
  _id: z.string(),
});

// Setting

export const SiteLanguageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
});
export const CarouselSchema = z.object({
  title: z.string().min(1, "title is required"),
  url: z.string().min(1, "url is required"),
  image: z.string().min(1, "image is required"),
  buttonCaption: z.string().min(1, "buttonCaption is required"),
});

export const SiteCurrencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  convertRate: z.coerce.number().min(0, "Convert rate must be at least 0"),
  symbol: z.string().min(1, "Symbol is required"),
});

export const PaymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  commission: z.coerce.number().min(0, "Commission must be at least 0"),
});

export const DeliveryDateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  daysToDeliver: z.number().min(0, "Days to deliver must be at least 0"),
  shippingPrice: z.coerce.number().min(0, "Shipping price must be at least 0"),
  freeShippingMinPrice: z.coerce
    .number()
    .min(0, "Free shipping min amount must be at least 0"),
});

export const SettingInputSchema = z.object({
  // PROMPT: create fields
  // codeium, based on the mongoose schema for settings
  common: z.object({
    pageSize: z.coerce
      .number()
      .min(1, "Page size must be at least 1")
      .default(9),
    isMaintenanceMode: z.boolean().default(false),
    freeShippingMinPrice: z.coerce
      .number()
      .min(0, "Free shipping min price must be at least 0")
      .default(0),
    defaultTheme: z
      .string()
      .min(1, "Default theme is required")
      .default("light"),
    defaultColor: z
      .string()
      .min(1, "Default color is required")
      .default("Blue"),
  }),
  site: z.object({
    name: z.string().min(1, "Name is required"),
    logo: z.string().min(1, "logo is required"),
    slogan: z.string().min(1, "Slogan is required"),
    description: z.string().min(1, "Description is required"),
    keywords: z.string().min(1, "Keywords is required"),
    url: z.string().min(1, "Url is required"),
    email: z.string().min(1, "Email is required"),
    phone: z.string().min(1, "Phone is required"),
    author: z.string().min(1, "Author is required"),
    copyright: z.string().min(1, "Copyright is required"),
    address: z.string().min(1, "Address is required"),
  }),
  availableLanguages: z
    .array(SiteLanguageSchema)
    .min(1, "At least one language is required"),

  carousels: z
    .array(CarouselSchema)
    .min(1, "At least one language is required"),
  defaultLanguage: z.string().min(1, "Language is required"),
  availableCurrencies: z
    .array(SiteCurrencySchema)
    .min(1, "At least one currency is required"),
  defaultCurrency: z.string().min(1, "Currency is required"),
  availablePaymentMethods: z
    .array(PaymentMethodSchema)
    .min(1, "At least one payment method is required"),
  defaultPaymentMethod: z.string().min(1, "Payment method is required"),
  availableDeliveryDates: z
    .array(DeliveryDateSchema)
    .min(1, "At least one delivery date is required"),
  defaultDeliveryDate: z.string().min(1, "Delivery date is required"),
});
