"use client";

import { redirect, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { IUserSignUp } from "@/types";
import { registerUser } from "@/lib/actions/user.actions";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSignUpSchema } from "@/lib/validator";
import { Separator } from "@/components/ui/separator";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import SetMapLatLong from "@/components/shared/map/set-map-lat-long";
import dynamic from "next/dynamic";

const signUpDefaultValues: IUserSignUp = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "Male",
  dateOfBirth: undefined,
  address: {
    country: "Algeria",
    province: "",
    province: "",
    city: "",
    street: "",
    postalCode: "",
  },
  latitude: "",
  longitude: "",
  image: "",
  role: "User",
  shopDetails: {},
  password: "",
  confirmPassword: "",
};

export default function CredentialsSignInForm() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedBanner, setSelectedBanner] = useState("");

  const form = useForm<IUserSignUp>({
    resolver: zodResolver(UserSignUpSchema),
    defaultValues: signUpDefaultValues,
  });

  const { control, handleSubmit, watch, setValue } = form;
  const role = watch("role");
  // console.log("form Data:", form);
  const onSubmit = async (data: IUserSignUp) => {
    // console.log("Form data:", data);
    try {
      const res = await registerUser(data);
      if (!res.success) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      // Redirect to verification page
      redirect(`/sign-up/verify/${res.userId}`);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  const avatarImages = [
    "/avatars/av01.png",
    "/avatars/av02.png",
    "/avatars/av03.png",
    "/avatars/av04.png",
    "/avatars/av05.png",
    "/avatars/av06.png",
    "/avatars/av07.png",
    "/avatars/avf1.png",
    "/avatars/avf2.png",
    "/avatars/avf3.png",
    "/avatars/avf4.png",
    "/avatars/avf5.png",
    "/avatars/avf6.png",
    "/avatars/avf7.png",
  ];
  const bannerImages = [
    "/avatars/shop1.png",
    "/avatars/shop2.jpg",
    "/avatars/shop3.jpg",
    "/avatars/shop4.jpg",
    "/avatars/shop5.jpg",
  ];

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("latitude", lat.toString());
    setValue("longitude", lng.toString());
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <div className="space-y-6">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Full Name")}</FormLabel>
                <FormControl>
                  <Input placeholder="Nom et Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Phone Number")}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Gender")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le sexe" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Male">{t("Male")}</SelectItem>
                    <SelectItem value="Female">{t("Female")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("Date of birth")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="dd/mm/yyyy"
                    value={(() => {
                      const input =
                        field.value instanceof Date &&
                        !isNaN(field.value.getTime())
                          ? format(field.value, "dd/MM/yyyy")
                          : field.value?.toString() || "";
                      return input;
                    })()}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, "");
                      if (value.length > 8) value = value.slice(0, 8);

                      let formatted = "";
                      if (value.length > 0) formatted = value.slice(0, 2);
                      if (value.length > 2)
                        formatted += "/" + value.slice(2, 4);
                      if (value.length > 4)
                        formatted += "/" + value.slice(4, 8);

                      if (formatted.length === 10) {
                        const [day, month, year] = formatted
                          .split("/")
                          .map(Number);
                        const date = new Date(year, month - 1, day);
                        if (
                          date.getDate() === day &&
                          date.getMonth() === month - 1 &&
                          date.getFullYear() === year &&
                          date <= new Date() &&
                          date >= new Date("1900-01-01")
                        ) {
                          field.onChange(date);
                        } else {
                          field.onChange(undefined);
                        }
                      } else {
                        field.onChange(formatted);
                      }
                    }}
                    maxLength={10}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address.country"
            defaultValue="Algeria"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel> {t("Country")}</FormLabel>
                <FormControl>
                  <Input placeholder="Votre Pays " {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="address.province"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Province")} </FormLabel>
                <FormControl>
                  <Input placeholder="Votre Wilaya" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="address.city"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("City")}</FormLabel>
                <FormControl>
                  <Input placeholder="Votre Commune" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Address")}</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez votre adresse" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel> {t("Postal Code")}</FormLabel>
                <FormControl>
                  <Input placeholder="Vote code postal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Integrated Map Component for Location Selection */}
          <FormItem>
            <FormLabel>{t("Location")}</FormLabel>
            <SetMapLatLong onLocationChange={handleLocationChange} />
            <FormControl>
              <div className="hidden">
                <FormField
                  control={control}
                  name="latitude"
                  render={({ field }) => <Input {...field} />}
                />
                <FormField
                  control={control}
                  name="longitude"
                  render={({ field }) => <Input {...field} />}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormField
            control={control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Profile Image")}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {selectedImage && (
                      <Image
                        src={selectedImage}
                        alt="Selected profile image"
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                    )}
                    <Input {...field} value={field.value} readOnly />
                    <div className="flex flex-wrap gap-4">
                      {avatarImages.map((img) => (
                        <Button
                          key={img}
                          type="button"
                          className="p-0 rounded-full"
                          onClick={() => {
                            setSelectedImage(img);
                            field.onChange(img);
                          }}
                        >
                          <Image
                            src={img}
                            alt="Avatar option"
                            width={500}
                            height={500}
                            className="w-12 h-12 rounded-full object-cover hover:scale-150 transition-transform duration-200"
                          />
                        </Button>
                      ))}
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res: { url: string }[]) => {
                          setSelectedImage(res[0].url);
                          field.onChange(res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                          toast({
                            variant: "destructive",
                            description: `ERROR! ${error.message}`,
                          });
                        }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Role")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="User">{t("User")}</SelectItem>
                    <SelectItem value="Seller">{t("Seller")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {role === "Seller" && (
            <Card>
              <CardContent className="space-y-4 mt-4">
                <FormField
                  control={control}
                  name="shopDetails.bannerImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Banner Image")}</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {selectedBanner && (
                            <Image
                              src={selectedBanner}
                              alt="Selected banner image"
                              width={200}
                              height={100}
                              className="rounded-md"
                            />
                          )}
                          <Input {...field} value={field.value} readOnly />
                          <div className="flex flex-wrap gap-4">
                            {bannerImages.map((img) => (
                              <Button
                                key={img}
                                type="button"
                                className="p-0 rounded-full"
                                onClick={() => {
                                  setSelectedBanner(img);
                                  field.onChange(img);
                                }}
                              >
                                <Image
                                  src={img}
                                  alt="Banner option"
                                  width={800}
                                  height={425}
                                  className="w-20 rounded-md object-cover hover:scale-150 transition-transform duration-200"
                                />
                              </Button>
                            ))}
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(
                                res: { url: string }[]
                              ) => {
                                setSelectedBanner(res[0].url);
                                field.onChange(res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({
                                  variant: "destructive",
                                  description: `ERROR! ${error.message}`,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shopDetails.shopName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Shop Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de votre magasin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shopDetails.shopPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Shop Phone")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Téléphone de votre magasin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shopDetails.shopDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Shop Description")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Description de votre magasin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shopDetails.shopAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Shop Address")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=" Addresse de votre magasin"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="shopDetails.shopType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Shop Type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type de votre magasin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Physical Shop">
                            {t("Physical Shop.title")}
                          </SelectItem>
                          <SelectItem value="Online Shop">
                            {t("Online Shop.title")}
                          </SelectItem>
                          <SelectItem value="Physical and Online Shop">
                            {t("Physical and Online Shop.title")}
                          </SelectItem>
                          <SelectItem value="Repair Workshop with Sales">
                            {t("Repair Workshop with Sales.title")}
                          </SelectItem>
                          <SelectItem value="Specialized Distributor">
                            {t("Specialized Distributor.title")}
                          </SelectItem>
                          <SelectItem value="Automotive Recycler">
                            {t("Automotive Recycler.title")}
                          </SelectItem>
                          <SelectItem value="Custom Manufacturer">
                            {t("Custom Manufacturer.title")}
                          </SelectItem>
                          <SelectItem value="Collection Point">
                            {t("Collection Point.title")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              {"shopDetails" in watch() && (
                <CardContent className="p-3 mx-4 mb-5 text-sm text-green-700 border border-green-200 rounded-md bg-green-200/30">
                  {watch("shopDetails")?.shopType === "Physical Shop"
                    ? t("Physical Shop.description")
                    : watch("shopDetails")?.shopType === "Online Shop"
                      ? t("Online Shop.description")
                      : watch("shopDetails")?.shopType ===
                          "Physical and Online Shop"
                        ? t("Physical and Online Shop.description")
                        : watch("shopDetails")?.shopType ===
                            "Repair Workshop with Sales"
                          ? t("Repair Workshop with Sales.description")
                          : watch("shopDetails")?.shopType ===
                              "Specialized Distributor"
                            ? t("Specialized Distributor.description")
                            : watch("shopDetails")?.shopType ===
                                "Automotive Recycler"
                              ? t("Automotive Recycler.description")
                              : watch("shopDetails")?.shopType ===
                                  "Custom Manufacturer"
                                ? t("Custom Manufacturer.description")
                                : watch("shopDetails")?.shopType ===
                                    "Collection Point"
                                  ? t("Collection Point.description")
                                  : t("Select Type")}
                </CardContent>
              )}
            </Card>
          )}

          <FormField
            control={control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("Confirm Password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center ">
            <Button type="submit">{t("Sign Up")}</Button>
          </div>

          <div className="text-sm">
            {t("Privacy text")}
            <Link href="/page/privacy-policy">{t("Privacy Policy")}</Link>
          </div>

          <Separator className="mb-4" />

          <div className="text-sm">
            {t("Already have an account?")}
            <Link className="link" href={`/sign-in?callbackUrl=${callbackUrl}`}>
              {" "}
              {t("Sign In")}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
