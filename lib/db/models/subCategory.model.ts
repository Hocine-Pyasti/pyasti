import { Document, Model, model, models, Schema } from "mongoose";
import slugify from "slugify";
import { ISubCategoryInput } from "@/types";

export interface ISubCategory extends Document, ISubCategoryInput {
  _id: string;
  mainCategory: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subCategorySchema = new Schema<ISubCategory>(
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
    mainCategory: {
      type: Schema.Types.ObjectId,
      ref: "MainCategory",
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug from name before saving
subCategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

subCategorySchema.index({ slug: 1 });
subCategorySchema.index({ mainCategory: 1 });

const SubCategory =
  (models.SubCategory as Model<ISubCategory>) ||
  model<ISubCategory>("SubCategory", subCategorySchema);

export default SubCategory;
