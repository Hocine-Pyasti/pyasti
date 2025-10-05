import { IOrder } from "@/lib/db/models/order.model";
import {
  sendVerificationCodeEmail as sendVerificationCodeEmailNodemailer,
  sendWelcomeEmail as sendWelcomeEmailNodemailer,
  sendPurchaseReceipt as sendPurchaseReceiptNodemailer,
  sendAskReviewOrderItems as sendAskReviewOrderItemsNodemailer,
} from "@/lib/email-service";

export const sendPurchaseReceipt = async ({
  order,
  email,
  language = "fr",
  subject,
  description,
}: {
  order: IOrder;
  email: string;
  language?: string;
  subject: string;
  description: string;
}) => {
  return await sendPurchaseReceiptNodemailer({
    order,
    email,
    language,
    subject,
    description,
  });
};

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  return await sendAskReviewOrderItemsNodemailer({ order });
};

export const sendVerificationCodeEmail = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  return await sendVerificationCodeEmailNodemailer({ email, code });
};

export const sendWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  return await sendWelcomeEmailNodemailer({ email, name });
};

export const EMAIL_TEMPLATES = {
  cancelled: {
    fr: {
      subject: "Commande annulée",
      body: (orderId: string) => `Votre commande ${orderId} a été annulée.`,
    },
    en: {
      subject: "Order Cancelled",
      body: (orderId: string) => `Your order ${orderId} has been cancelled.`,
    },
  },
  delivered: {
    fr: {
      subject: "Commande livrée",
      body: (orderId: string) => `Votre commande ${orderId} a été livrée.`,
    },
    en: {
      subject: "Order Delivered",
      body: (orderId: string) => `Your order ${orderId} has been delivered.`,
    },
  },
};

export const sendOrderStatusEmail = async ({
  order,
  email,
  status,
  language = "fr",
}: {
  order: { _id: string; totalPrice: number };
  email: string;
  status: "cancelled" | "delivered";
  language?: string;
}) => {
  const EMAIL_TEMPLATES = {
    cancelled: {
      fr: {
        subject: "Commande annulée",
        body: (orderId: string) =>
          `Votre commande de <strong>${order.totalPrice} DA </strong> <br/> ID: ${orderId} a été annulée. ❌`,
      },
      en: {
        subject: "Order Cancelled",
        body: (orderId: string) =>
          `Your order of <strong>${order.totalPrice} DA </strong> <br/> ID: ${orderId} has been cancelled. ❌`,
      },
    },
    delivered: {
      fr: {
        subject: "Commande livrée",
        body: (orderId: string) =>
          `Votre commande de  <strong>${order.totalPrice} DA </strong> <br/>  ID: ${orderId} a été livrée. 🚚✅`,
      },
      en: {
        subject: "Order Delivered",
        body: (orderId: string) =>
          `Your order of <strong>${order.totalPrice} DA </strong>  <br/> ID: ${orderId} has been delivered. 🚚✅`,
      },
    },
  };

  const lang = (["fr", "en"].includes(language) ? language : "fr") as
    | "fr"
    | "en";
  const subject = subject;
  const text = EMAIL_TEMPLATES[status][lang].body(order._id);
  const html = `<p>${text}</p>`;

  // For now, we'll use a simple HTML email since we're not using React Email components
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `PYASTI support <${process.env.SENDER_EMAIL || "onboarding@resend.dev"}>`,
    to: email,
    subject,
    text,
    html,
  });
};
