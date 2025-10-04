import { Document, Model, model, models, Schema } from "mongoose";
import { IProductInput } from "@/types";
import slugify from "slugify";

export interface IProduct extends Document, IProductInput {
  _id: string;
  subCategory: Schema.Types.ObjectId;
  seller: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [{ type: String, required: true }],
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tags: { type: [String], default: ["new arrival"] },
    colors: { type: [String], required: true, default: [] },
    sizes: { type: [String], required: true, default: [] },
    vehicleCompatibility: [
      {
        make: { type: String, trim: true },
        model: { type: String, trim: true },
        year: { type: [Number] },
      },
    ],
    partNumber: {
      type: String,
      required: true,
      trim: true,
    },
    specifications: {
      type: Map,
      of: String,
    },
    avgRating: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    ratingDistribution: [
      {
        rating: { type: Number, required: true, min: 1, max: 5 },
        count: { type: Number, required: true, min: 0 },
      },
    ],
    numSales: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug from name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Indexes for performance
// productSchema.index({ slug: 1 });
productSchema.index({ subCategory: 1 });
// productSchema.index({ partNumber: 1 });
productSchema.index({
  "vehicleCompatibility.make": 1,
  "vehicleCompatibility.model": 1,
});

const Product =
  (models.Product as Model<IProduct>) ||
  model<IProduct>("Product", productSchema);

export default Product;
