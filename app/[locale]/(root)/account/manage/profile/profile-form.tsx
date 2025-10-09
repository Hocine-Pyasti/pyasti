"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getUserById, updateUserProfile } from "@/lib/actions/user.actions";
import { UserProfileSchema } from "@/lib/validator";

export const ProfileForm = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const t = useTranslations();
  const form = useForm<z.infer<typeof UserProfileSchema>>({
    resolver: zodResolver(UserProfileSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      address: {
        country: "",
        province: "",
        city: "",
        street: "",
        postalCode: "",
      },
      shopDetails: {
        shopName: "",
        shopPhone: "",
        shopDescription: "",
        shopAddress: "",
      },
    },
  });

  // Fetch user data and set form values
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const user = await getUserById(session.user.id);
          form.reset({
            name: user.name || "",
            phoneNumber: user.phoneNumber || "",
            address: {
              country: user.address?.country || "",
              province: user.address?.province || "",
              city: user.address?.city || "",
              street: user.address?.street || "",
              postalCode: user.address?.postalCode || "",
            },
            shopDetails: {
              shopName: user.shopDetails?.shopName || "",
              shopPhone: user.shopDetails?.shopPhone || "",
              shopDescription: user.shopDetails?.shopDescription || "",
              shopAddress: user.shopDetails?.shopAddress || "",
            },
          });
        } catch (error) {
          toast({
            variant: "destructive",
            description:
              t("All.Error fetching user data") +
              ": " +
              (error as Error).message,
          });
        }
      }
    };
    fetchUserData();
  }, [session?.user?.id, form, toast, t]);

  async function onSubmit(values: z.infer<typeof UserProfileSchema>) {
    const res = await updateUserProfile(values);
    if (!res.success) {
      return toast({
        variant: "destructive",
        description: res.message,
      });
    }

    const { data, message } = res;
    const newSession = {
      ...session,
      user: {
        ...session?.user,
        name: data.name,
      },
    };
    await update(newSession);
    toast({
      description: message,
    });
    router.push("/account/manage");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <div className="grid md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">
                  {t("All.Full Name")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter full name")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">
                  {t("All.Phone Number")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter phone number")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">{t("All.Street")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter street")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">{t("All.City")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter city")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.province"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">{t("All.Province")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter province")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">{t("All.Country")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter country")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="font-bold">
                  {t("All.Postal Code")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("All.Enter postal code")}
                    {...field}
                    className="input-field"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(session?.user?.role === "Seller" ||
          session?.user?.role === "Admin") && (
          <>
            <h2 className="text-lg font-bold">{t("All.Business Details")}</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="shopDetails.shopName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">
                      {t("All.Business Name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("All.Enter Business name")}
                        {...field}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shopDetails.shopPhone"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="font-bold">
                      {t("All.Business Phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("All.Enter Business phone")}
                        {...field}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shopDetails.shopDescription"
                render={({ field }) => (
                  <FormItem className="w-full md:col-span-2">
                    <FormLabel className="font-bold">
                      {t("All.Business Description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("All.Enter Business description")}
                        {...field}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shopDetails.shopAddress"
                render={({ field }) => (
                  <FormItem className="w-full md:col-span-2">
                    <FormLabel className="font-bold">
                      {t("All.Business Address")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("All.Enter Business address")}
                        {...field}
                        className="input-field"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting
            ? t("All.Submitting")
            : t("All.Save Changes")}
        </Button>
      </form>
    </Form>
  );
};
