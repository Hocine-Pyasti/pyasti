"use server";

import bcrypt from "bcryptjs";
import { auth, signIn, signOut } from "@/auth";
import { IUserProfile, IUserSignIn, IUserSignUp } from "@/types";
import {
  UserSignUpSchema,
  UserUpdateSchema,
  UserProfileSchema,
} from "../validator";
import { connectToDatabase } from "../db";
import User, { IUser } from "../db/models/user.model";
import { formatError } from "../utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSetting } from "./setting.actions";
import { sendVerificationCodeEmail } from "@/emails";
import { sendWelcomeEmail } from "@/emails";

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      phoneNumber: userSignUp.phoneNumber,
      gender: userSignUp.gender,
      dateOfBirth: userSignUp.dateOfBirth,
      address: userSignUp.address,
      latitude: userSignUp.latitude,
      longitude: userSignUp.longitude,
      image: userSignUp.image,
      role: userSignUp.role,
      shopDetails: userSignUp.shopDetails,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    });

    await connectToDatabase();
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const createdUser = await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
      emailVerified: false,
      verificationCode,
      verificationCodeExpires,
      profileType: "Silver",
      status: "active",
      wallet: 0,
    });
    console.log(
      "🔍 [DEBUG] About to send verification email to:",
      createdUser.email
    );
    try {
      await sendVerificationCodeEmail({
        email: createdUser.email,
        code: verificationCode,
      });
      console.log(
        "✅ [DEBUG] Verification email sent successfully during registration"
      );
    } catch (error) {
      console.error(
        "❌ [DEBUG] Failed to send verification email during registration:",
        error
      );
      // Don't fail the registration, just log the error
    }
    return {
      success: true,
      message: "Verification code sent to your email.",
      userId: createdUser._id.toString(),
    };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    await connectToDatabase();
    const res = await User.findByIdAndDelete(id);
    if (!res) throw new Error("Use not found");
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) throw new Error("User not found");
    dbUser.name = user.name;
    dbUser.email = user.email;
    dbUser.role = user.role;
    const updatedUser = await dbUser.save();
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateUserProfile(
  user: z.infer<typeof UserProfileSchema>
) {
  try {
    await connectToDatabase();
    const session = await auth();
    const currentUser = await User.findById(session?.user?.id);
    if (!currentUser) throw new Error("User not found");

    currentUser.name = user.name;
    currentUser.phoneNumber = user.phoneNumber || currentUser.phoneNumber;
    currentUser.address = user.address || currentUser.address;
    if (currentUser.role === "Seller" || currentUser.role === "Admin") {
      currentUser.shopDetails = {
        ...currentUser.shopDetails,
        shopName:
          user.shopDetails?.shopName || currentUser.shopDetails?.shopName,
        shopPhone:
          user.shopDetails?.shopPhone || currentUser.shopDetails?.shopPhone,
        shopDescription:
          user.shopDetails?.shopDescription ||
          currentUser.shopDetails?.shopDescription,
        shopAddress:
          user.shopDetails?.shopAddress || currentUser.shopDetails?.shopAddress,
      };
    }

    const updatedUser = await currentUser.save();
    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn("credentials", { ...user, redirect: false });
}

export async function getUserByEmail(email: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return { success: false, error: "User not found" };
    return { success: true, user };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
export const SignInWithGoogle = async () => {
  await signIn("google");
};
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false });
  redirect(redirectTo.redirect);
};

// GET
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();

  const skipAmount = (Number(page) - 1) * limit;
  const users = await User.find()
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const usersCount = await User.countDocuments();
  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / limit),
  };
}
// GET ALL SELLERS
export async function getAllSellersForMap() {
  await connectToDatabase();
  const sellers = await User.find(
    { role: "Seller" },
    { latitude: 1, longitude: 1, shopDetails: 1 }
  ).sort({ createdAt: "desc" });
  return JSON.parse(JSON.stringify(sellers)) as Pick<
    IUser,
    "latitude" | "longitude" | "shopDetails"
  >[];
}

export async function getPublicUserDataById(userId: string) {
  await connectToDatabase();
  const user = await User.findOne(
    { _id: userId },
    { role: 1, latitude: 1, longitude: 1, shopDetails: 1 }
  );
  if (!user) throw new Error("Seller not found");
  return JSON.parse(JSON.stringify(user)) as Pick<
    IUser,
    "role" | "latitude" | "longitude" | "shopDetails"
  >;
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return JSON.parse(JSON.stringify(user)) as IUser;
}

export async function getSellerById(userId: string) {
  await connectToDatabase();
  const user = await User.findOne(
    { _id: userId, role: { $in: ["Seller", "Admin"] } },
    {
      name: 1,
      email: 1,
      image: 1,
      profileType: 1,
      latitude: 1,
      longitude: 1,
      shopDetails: 1,
    }
  );
  if (!user) throw new Error("Seller not found");
  return JSON.parse(JSON.stringify(user)) as Pick<
    IUser,
    | "name"
    | "email"
    | "image"
    | "profileType"
    | "latitude"
    | "longitude"
    | "shopDetails"
  >;
}

export async function verifyUserCode(userId: string, code: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return { success: false, error: "User not found" };
    if (user.emailVerified)
      return { success: false, error: "User already verified" };
    if (user.verificationCode !== code)
      return { success: false, error: "Invalid code" };
    user.emailVerified = true;
    user.verificationCode = null;
    await user.save();
    console.log("🔍 [DEBUG] About to send welcome email to:", user.email);
    try {
      await sendWelcomeEmail({ email: user.email, name: user.name });
      console.log(
        "✅ [DEBUG] Welcome email sent successfully after verification"
      );
    } catch (error) {
      console.error(
        "❌ [DEBUG] Failed to send welcome email after verification:",
        error
      );
    }
    return { success: true, message: "Account verified successfully" };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function resendVerificationCode(userId: string) {
  console.log("🔄 [DEBUG] Resending verification code for user:", userId);
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ [DEBUG] User not found:", userId);
      return { success: false, error: "User not found" };
    }
    if (user.emailVerified) {
      console.log("❌ [DEBUG] User already verified:", userId);
      return { success: false, error: "User already verified" };
    }

    console.log("🔍 [DEBUG] Checking cooldown for user:", userId);
    if (
      user.verificationCodeExpires &&
      new Date() <
        new Date(user.verificationCodeExpires.getTime() - 5 * 60 * 1000)
    ) {
      const timeLeft = Math.ceil(
        (user.verificationCodeExpires.getTime() -
          5 * 60 * 1000 -
          new Date().getTime()) /
          1000 /
          60
      );
      console.log(
        "⏰ [DEBUG] Cooldown active, time left:",
        timeLeft,
        "minutes"
      );
      return {
        success: false,
        error: `Please wait ${timeLeft} minutes before requesting a new code`,
      };
    }

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    console.log(
      "🔧 [DEBUG] Generated new verification code:",
      verificationCode
    );
    console.log("🔧 [DEBUG] Code expires at:", verificationCodeExpires);

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    console.log("✅ [DEBUG] User updated with new verification code");

    console.log("🔍 [DEBUG] Resending verification email to:", user.email);
    try {
      await sendVerificationCodeEmail({
        email: user.email,
        code: verificationCode,
      });
      console.log("✅ [DEBUG] Verification email resent successfully");
      return { success: true, message: "Verification code sent to your email" };
    } catch (error) {
      console.error("❌ [DEBUG] Failed to resend verification email:", error);
      return { success: false, error: "Failed to send verification code" };
    }
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}
