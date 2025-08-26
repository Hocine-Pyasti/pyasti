import { Document, Model, model, models, Schema } from "mongoose";
import slugify from "slugify";
import { IMainCategoryInput } from "@/types";

export interface IMainCategory extends Document, IMainCategoryInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const mainCategorySchema = new Schema<IMainCategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
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
mainCategorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

mainCategorySchema.index({ slug: 1 });

const MainCategory =
  (models.MainCategory as Model<IMainCategory>) ||
  model<IMainCategory>("MainCategory", mainCategorySchema);

export default MainCategory;
