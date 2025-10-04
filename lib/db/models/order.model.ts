import { IOrderInput } from "@/types";
import { Document, Model, model, models, Schema } from "mongoose";

export interface IOrder extends Document, IOrderInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        clientId: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        countInStock: { type: Number, required: true },
        quantity: { type: Number, required: true },
        subCategory: {
          type: Schema.Types.ObjectId,
          ref: "SubCategory",
          required: true,
        },
        brand: { type: String, required: true },
        partNumber: { type: String, required: true },
        color: { type: String },
        vehicleCompatibility: [
          {
            make: { type: String, trim: true },
            model: { type: String, trim: true },
            year: { type: [Number] },
          },
        ],
        specifications: {
          type: Map,
          of: String,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      province: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: { id: String, status: String, email_address: String },
    itemsPrice: { type: Number, required: true },
    shippingMethod: {
      name: { type: String },
      daysToDeliver: { type: Number },
      shippingPrice: { type: Number },
      freeShippingMinPrice: { type: Number },
    },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "Processing" },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Order =
  (models.Order as Model<IOrder>) || model<IOrder>("Order", orderSchema);

export default Order;
