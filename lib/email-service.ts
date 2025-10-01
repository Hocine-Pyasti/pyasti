import nodemailer from "nodemailer";
import { SENDER_EMAIL, SENDER_NAME } from "./constants";

// Interface for Nodemailer error with additional properties
interface NodemailerError extends Error {
  code?: string;
  command?: string;
}

// Create transporter for Gmail SMTP
const createTransporter = () => {
  console.log("🔧 [DEBUG] Creating Nodemailer transporter...");
  console.log(
    "🔧 [DEBUG] Gmail User:",
    process.env.GMAIL_USER ? "✅ Set" : "❌ Not set"
  );
  console.log(
    "🔧 [DEBUG] Gmail App Password:",
    process.env.GMAIL_APP_PASSWORD ? "✅ Set" : "❌ Not set"
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
    },
  });

  console.log("🔧 [DEBUG] Transporter created successfully");
  return transporter;
};

// Send email with HTML content
export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) => {
  console.log("📧 [DEBUG] Starting email send process...");
  console.log("📧 [DEBUG] To:", to);
  console.log("📧 [DEBUG] Subject:", subject);
  console.log("📧 [DEBUG] Sender Name:", SENDER_NAME);
  console.log("📧 [DEBUG] Sender Email:", SENDER_EMAIL);
  console.log("📧 [DEBUG] Has HTML:", !!html);
  console.log("📧 [DEBUG] Has Text:", !!text);

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };

    console.log("📧 [DEBUG] Mail options prepared:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasHtml: !!mailOptions.html,
      hasText: !!mailOptions.text,
    });

    console.log("📧 [DEBUG] Attempting to send email...");
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ [DEBUG] Email sent successfully!");
    console.log("✅ [DEBUG] Message ID:", result.messageId);
    console.log("✅ [DEBUG] Response:", result.response);
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send email:", error);

    if (error instanceof Error) {
      console.error("❌ [DEBUG] Error name:", error.name);
      console.error("❌ [DEBUG] Error message:", error.message);

      // Type assertion for nodemailer specific error properties
      const nodemailerError = error as NodemailerError;
      console.error("❌ [DEBUG] Error code:", nodemailerError.code);
      console.error("❌ [DEBUG] Error command:", nodemailerError.command);

      // Provide specific error guidance
      if (nodemailerError.code === "EAUTH") {
        console.error(
          "🔐 [DEBUG] Authentication failed. Check your Gmail credentials and App Password."
        );
      } else if (nodemailerError.code === "ECONNECTION") {
        console.error(
          "🌐 [DEBUG] Connection failed. Check your internet connection."
        );
      } else if (nodemailerError.code === "ETIMEDOUT") {
        console.error(
          "⏰ [DEBUG] Request timed out. Check your internet connection."
        );
      }
    }

    throw error;
  }
};

// Send verification code email
export const sendVerificationCodeEmail = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  console.log(
    "🔍 [DEBUG] Attempting to send verification code email to:",
    email
  );
  // console.log("🔍 [DEBUG] Verification code:", code);
  // console.log("🔍 [DEBUG] Gmail user exists:", !!process.env.GMAIL_USER);
  // console.log("🔍 [DEBUG] Sender email:", SENDER_EMAIL);
  // console.log("🔍 [DEBUG] Sender name:", SENDER_NAME);

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Votre code de vérification est: <strong style="font-size: 18px; color: #007bff;">${code}</strong></p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    const text = `Your verification code is: ${code}.`;

    const result = await sendEmail({
      to: email,
      subject: "Votre code de vérification",
      html,
      text,
    });

    // console.log("✅ [DEBUG] Verification email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send verification email:", error);
    console.error("❌ [DEBUG] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      email,
      code,
    });
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async ({
  email,
  name,
}: {
  email: string;
  name: string;
}) => {
  console.log("🔍 [DEBUG] Attempting to send welcome email to:", email);
  console.log("🔍 [DEBUG] User name:", name);
  console.log("🔍 [DEBUG] Gmail user exists:", !!process.env.GMAIL_USER);

  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #333;">Bienvenue!</h2>
        <p>Bonjour <strong>${name}</strong>! votre compte a été vérifié avec succès.</p>
        <p>Merci d'avoir rejoint la plateforme PYASTI </p>
        <p>Visiter notre site web</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${"https://pyasti.com"}"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            Aller à PYASTI
          </a>
        </div>
      </div>
    `;

    const text = `Welcome, ${name}! Your account has been successfully verified.`;

    const result = await sendEmail({
      to: email,
      subject: "Welcome to PYASTI!",
      html,
      text,
    });

    // console.log("✅ [DEBUG] Welcome email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send welcome email:", error);
    console.error("❌ [DEBUG] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      email,
      name,
    });
    throw error;
  }
};

// Send purchase receipt email
export const sendPurchaseReceipt = async ({
  order,
  email,
  language = "fr",
  description,
}: {
  order: {
    _id: string;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalPrice: number;
    createdAt: string | Date;
  };
  email: string;
  language?: string;
  description: string;
}) => {
  console.log("🛒 [DEBUG] Starting purchase receipt email...");
  console.log("🛒 [DEBUG] Order ID:", order._id);
  console.log("🛒 [DEBUG] Email:", email);
  console.log("🛒 [DEBUG] Language:", language);
  console.log("🛒 [DEBUG] Order items count:", order.items.length);
  console.log("🛒 [DEBUG] Total price:", order.totalPrice);

  try {
    const subject =
      language === "fr" ? "Confirmation de commande" : "Order Confirmation";

    console.log("🛒 [DEBUG] Generated subject:", subject);

    // Convert React email component to HTML string
    const html = await generatePurchaseReceiptHTML(
      order,
      language,
      description
    );
    console.log("🛒 [DEBUG] Generated HTML length:", html.length);

    const result = await sendEmail({
      to: email,
      subject,
      html,
    });

    console.log(
      "✅ [DEBUG] Purchase receipt email sent successfully:",
      result.messageId
    );
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send purchase receipt email:", error);
    if (error instanceof Error) {
      console.error("❌ [DEBUG] Error details:", {
        message: error.message,
        stack: error.stack,
        orderId: order._id,
        email,
        language,
      });
    }
    throw error;
  }
};

// Send ask review email
export const sendAskReviewOrderItems = async ({
  order,
}: {
  order: {
    _id: string;
    user: { email: string } | string;
    items: Array<{ name: string }>;
  };
}) => {
  console.log("📝 [DEBUG] Starting ask review email...");
  console.log("📝 [DEBUG] Order ID:", order._id);
  console.log("📝 [DEBUG] User type:", typeof order.user);
  console.log("📝 [DEBUG] Items count:", order.items.length);

  try {
    const html = await generateAskReviewHTML(order);
    console.log("📝 [DEBUG] Generated HTML length:", html.length);

    const userEmail =
      typeof order.user === "string" ? order.user : order.user.email;
    console.log("📝 [DEBUG] User email:", userEmail);

    const result = await sendEmail({
      to: userEmail,
      subject: "Review your order items",
      html,
    });

    console.log(
      "✅ [DEBUG] Ask review email sent successfully:",
      result.messageId
    );
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send ask review email:", error);
    if (error instanceof Error) {
      console.error("❌ [DEBUG] Error details:", {
        message: error.message,
        stack: error.stack,
        orderId: order._id,
        userType: typeof order.user,
      });
    }
    throw error;
  }
};

// Send order status email
export const sendOrderStatusEmail = async ({
  order,
  email,
  status,
  language = "fr",
}: {
  order: { _id: string };
  email: string;
  status: "cancelled" | "delivered";
  language?: string;
}) => {
  console.log("📊 [DEBUG] Starting order status email...");
  console.log("📊 [DEBUG] Order ID:", order._id);
  console.log("📊 [DEBUG] Email:", email);
  console.log("📊 [DEBUG] Status:", status);
  console.log("📊 [DEBUG] Language:", language);

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

  const lang = (["fr", "en"].includes(language) ? language : "fr") as
    | "fr"
    | "en";
  const subject = EMAIL_TEMPLATES[status][lang].subject;
  const text = EMAIL_TEMPLATES[status][lang].body(order._id);
  const html = `<p>${text}</p>`;

  console.log("📊 [DEBUG] Generated subject:", subject);
  console.log("📊 [DEBUG] Generated text:", text);
  console.log("📊 [DEBUG] Language used:", lang);

  try {
    const result = await sendEmail({
      to: email,
      subject,
      html,
      text,
    });

    console.log(
      "✅ [DEBUG] Order status email sent successfully:",
      result.messageId
    );
    return result;
  } catch (error) {
    console.error("❌ [DEBUG] Failed to send order status email:", error);
    if (error instanceof Error) {
      console.error("❌ [DEBUG] Error details:", {
        message: error.message,
        stack: error.stack,
        orderId: order._id,
        email,
        status,
        language,
      });
    }
    throw error;
  }
};

// Helper function to generate purchase receipt HTML
async function generatePurchaseReceiptHTML(
  order: {
    _id: string;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalPrice: number;
    createdAt: string | Date;
  },
  language: string,
  description: string
) {
  console.log("🔧 [DEBUG] Generating purchase receipt HTML...");
  console.log("🔧 [DEBUG] Processing", order.items.length, "items");

  // This is a simplified version - you might want to create a proper HTML template
  const items = order.items
    .map(
      (item: { name: string; price: number; quantity: number }) => `
    <tr>
      <td>${item.name} x ${item.quantity}</td>
      <td>${item.price}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${language === "fr" ? "Confirmation de commande" : "Order Confirmation"}</h2>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>

      </table>
      
      <div style="text-align: right; margin-top: 20px;">
        <p><strong>Total:</strong> ${order.totalPrice} DA</p>
      </div>
      <div style="margin-top: 30px;"> 
             ${description}
      </div>
      <p>Merci d'avoir choisi PYASTI</p>
      <p>Visiter note site web</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${"https://pyasti.com"}"
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Aller à PYASTI
        </a>
      </div>
        
      
    </div>
  `;

  console.log("🔧 [DEBUG] Generated HTML length:", html.length);
  console.log("🔧 [DEBUG] Language used:", language);
  return html;
}

// Helper function to generate ask review HTML
async function generateAskReviewHTML(order: {
  _id: string;
  user: { email: string } | string;
  items: Array<{ name: string }>;
}) {
  console.log("🔧 [DEBUG] Generating ask review HTML...");
  console.log("🔧 [DEBUG] Processing", order.items.length, "items");

  const items = order.items
    .map(
      (item: { name: string }) => `
    <li>${item.name}</li>
  `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Vérifiez votre commande</h2>
      <p>Merci pour votre commande ! Nous espérons que vous apprécierez votre achat.</p>
      
      <h3>Articles commandés :</h3>
      <ul>
        ${items}
      </ul>
      
      <p>Veuillez prendre un moment pour examiner vos articles et partager votre expérience avec nous.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${order._id}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
          Voir votre commande
        </a>
      </div>
    </div>
  `;

  console.log("🔧 [DEBUG] Generated HTML length:", html.length);
  console.log(
    "🔧 [DEBUG] Review URL:",
    `${process.env.NEXT_PUBLIC_SERVER_URL}/account/orders/${order._id}`
  );
  return html;
}
