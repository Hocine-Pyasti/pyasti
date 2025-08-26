import { Document, Model, model, models, Schema } from "mongoose";

export interface IClientOrder extends Document {
  _id: string;
  user: string | Schema.Types.ObjectId;
  items: Array<{
    product: string | Schema.Types.ObjectId;
    clientId: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    discountPrice?: number;
    countInStock: number;
    quantity: number;
    subCategory: string | Schema.Types.ObjectId;
    brand: string;
    partNumber: string;
    color?: string;
    vehicleCompatibility?: Array<{
      make: string;
      model: string;
      year: number[];
    }>;
    specifications?: Record<string, string>;
    seller: string | Schema.Types.ObjectId;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    province: string;
    phone: string;
  };
  expectedDeliveryDate: Date;
  paymentMethod: string;
  paymentResult?: { id: string; status: string; email_address: string };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  sellerOrders: string[];
  createdAt: Date;
  updatedAt: Date;
}

const clientOrderSchema = new Schema<IClientOrder>(
  {
    user: {
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
        seller: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
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
    expectedDeliveryDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    paymentResult: { id: String, status: String, email_address: String },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    sellerOrders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const ClientOrder =
  (models.ClientOrder as Model<IClientOrder>) ||
  model<IClientOrder>("ClientOrder", clientOrderSchema);

export default ClientOrder;
