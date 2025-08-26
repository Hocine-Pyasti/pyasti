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
  language = "en",
}: {
  order: IOrder;
  email: string;
  language?: string;
}) => {
  return await sendPurchaseReceiptNodemailer({
    order,
    email,
    language,
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
  language = "en",
}: {
  order: { _id: string };
  email: string;
  status: "cancelled" | "delivered";
  language?: string;
}) => {
  const EMAIL_TEMPLATES = {
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

  const lang = (["fr", "en"].includes(language) ? language : "en") as
    | "fr"
    | "en";
  const subject = EMAIL_TEMPLATES[status][lang].subject;
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
    from: `support <${process.env.SENDER_EMAIL || "onboarding@resend.dev"}>`,
    to: email,
    subject,
    text,
    html,
  });
};
