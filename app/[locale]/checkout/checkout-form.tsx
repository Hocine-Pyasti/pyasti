"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/actions/order.actions";
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from "@/lib/utils";
import { ShippingAddressSchema } from "@/lib/validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CheckoutFooter from "./checkout-footer";
import { ShippingAddress } from "@/types";
import useIsMounted from "@/hooks/use-is-mounted";
import Link from "next/link";
import useCartStore from "@/hooks/use-cart-store";
import useSettingStore from "@/hooks/use-setting-store";
import ProductPrice from "@/components/shared/product/product-price";
import { useTranslations } from "next-intl";

const shippingAddressDefaultValues = {
  fullName: "",
  street: "",
  city: "",
  province: "",
  phone: "",
  postalCode: "",
  country: "",
};

const CheckoutForm = () => {
  const t = useTranslations();
  const { toast } = useToast();
  const router = useRouter();
  const { setting, initialize } = useSettingStore();
  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    clearCart,
    setDeliveryDateIndex,
  } = useCartStore();
  const isMounted = useIsMounted();

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  });

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false);
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false);
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false);

  // Initialize setting store and set default delivery date
  useEffect(() => {
    if (!setting) {
      initialize();
    } else if (deliveryDateIndex === undefined && setting.defaultDeliveryDate) {
      const defaultIndex = setting.availableDeliveryDates.findIndex(
        (date) => date.name === setting.defaultDeliveryDate
      );
      if (defaultIndex !== -1) {
        setDeliveryDateIndex(defaultIndex);
        setIsDeliveryDateSelected(true);
      }
    }
  }, [setting, initialize, deliveryDateIndex, setDeliveryDateIndex]);

  useEffect(() => {
    if (!isMounted || !shippingAddress) return;
    shippingAddressForm.setValue("fullName", shippingAddress.fullName);
    shippingAddressForm.setValue("street", shippingAddress.street);
    shippingAddressForm.setValue("city", shippingAddress.city);
    shippingAddressForm.setValue("country", shippingAddress.country);
    shippingAddressForm.setValue("postalCode", shippingAddress.postalCode);
    shippingAddressForm.setValue("province", shippingAddress.province);
    shippingAddressForm.setValue("phone", shippingAddress.phone);
  }, [items, isMounted, router, shippingAddress, shippingAddressForm]);

  // Add null check for setting
  if (!setting) {
    return <div>{t("Loading.Loading")}</div>;
  }

  const {
    availablePaymentMethods,
    defaultPaymentMethod,
    availableDeliveryDates,
  } = setting;

  const finalPaymentMethod = paymentMethod || defaultPaymentMethod;

  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values);
    setIsAddressSelected(true);
  };

  const handlePlaceOrder = async () => {
    // Ensure deliveryDateIndex is set before placing order
    if (deliveryDateIndex === undefined || deliveryDateIndex === null) {
      toast({
        description: t("Order.Please select a delivery date"),
        variant: "destructive",
      });
      return;
    }

    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate: calculateFutureDate(
        availableDeliveryDates[deliveryDateIndex].daysToDeliver
      ),
      deliveryDateIndex,
      paymentMethod: finalPaymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
    } else {
      toast({
        description: res.message,
        variant: "default",
      });
      // Redirect to the order confirmation page
      if (res.data?.orderId) {
        router.push(`/checkout/${res.data.orderId}`);
        clearCart();
      } else {
        toast({
          description: t("Order.Order placed, but no order ID returned"),
          variant: "destructive",
        });
      }
    }
  };

  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true);
    setIsPaymentMethodSelected(true);
    setIsDeliveryDateSelected(!!deliveryDateIndex); // Maintain delivery date selection
  };

  const handleSelectShippingAddress = () => {
    shippingAddressForm.handleSubmit(onSubmitShippingAddress)();
  };

  // Helper function to get delivery date info safely
  const getDeliveryDateInfo = (index: number | undefined) => {
    if (index === undefined || !availableDeliveryDates[index]) {
      return {
        date: "",
        shippingCost: 0,
        name: "",
        isValid: false,
      };
    }

    const deliveryDate = availableDeliveryDates[index];
    const deliveryDateObj = calculateFutureDate(deliveryDate.daysToDeliver);
    return {
      date: formatDateTime(deliveryDateObj).dateOnly,
      shippingCost:
        deliveryDate.freeShippingMinPrice > 0 &&
        itemsPrice >= deliveryDate.freeShippingMinPrice
          ? 0
          : deliveryDate.shippingPrice,
      name: deliveryDate.name,
      isValid: true,
    };
  };

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        {!isAddressSelected && (
          <div className="border-b mb-4">
            <Button
              className="rounded-full w-full"
              onClick={handleSelectShippingAddress}
            >
              {t("Order.Shipping Address")}
            </Button>
            <p className="text-xs text-center py-2">
              {t("Order.Checkout Note1")}
            </p>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className="mb-4">
            <Button
              className="rounded-full w-full"
              onClick={handleSelectPaymentMethod}
            >
              {t("Order.Payment Method")}
            </Button>
            <p className="text-xs text-center py-2">
              {t("Order.Checkout Note2")}
            </p>
          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button
              onClick={handlePlaceOrder}
              className="rounded-full w-full"
              disabled={deliveryDateIndex === undefined}
            >
              {t("Order.Place Order")}
            </Button>
            <p className="text-xs text-center py-2">
              {t("Order.Checkout Note3")}
              <Link href="/page/privacy-policy">
                {t("Auth.Privacy Policy")}
              </Link>
            </p>
          </div>
        )}

        <div>
          <div className="text-lg font-bold">{t("Order.Order Summary")} </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t("Order.Items")} </span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("Order.Shipping & Handling")} </span>
              <span>
                {shippingPrice === undefined ? (
                  "--"
                ) : shippingPrice === 0 ? (
                  t("Order.FREE Shipping")
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("Order.Tax")}</span>
              <span>
                {taxPrice === undefined ? (
                  "--"
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className="flex justify-between pt-4 font-bold text-lg">
              <span>{t("Order.Order Total")} </span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <main className="max-w-6xl mx-auto highlight-link">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          {/* shipping address */}
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                <div className="col-span-5 flex text-lg font-bold">
                  <span className="w-8">1 </span>
                  <span>{t("Order.Shipping Address")} </span>
                </div>
                <div className="col-span-5">
                  <p>
                    {shippingAddress.fullName} <br />
                    {shippingAddress.street} <br />
                    {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                  </p>
                </div>
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsAddressSelected(false);
                      setIsPaymentMethodSelected(false);
                      setIsDeliveryDateSelected(false);
                    }}
                  >
                    {t("All.Change")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">1 </span>
                  <span>{t("Order.Enter shipping address")} </span>
                </div>
                <Form {...shippingAddressForm}>
                  <form
                    method="post"
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className="space-y-4"
                  >
                    <Card className="md:ml-8 my-4">
                      <CardContent className="p-4 space-y-2">
                        <div className="text-lg font-bold mb-2">
                          {t("Order.Your addresses")}
                        </div>

                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Full Name")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Full Name")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name="street"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Address")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Address")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.City")} </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.City")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Province")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Province")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Country")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Country")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-5 md:flex-row">
                          <FormField
                            control={shippingAddressForm.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Postal Code")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Postal Code")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>{t("Auth.Phone Number")}</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder={t("Auth.Phone Number")}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="p-4">
                        <Button
                          type="submit"
                          className="rounded-full font-bold"
                        >
                          {t("Order.Shipping Address")}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>

          {/* payment method */}
          <div className="border-y">
            {isPaymentMethodSelected && paymentMethod ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                <div className="flex text-lg font-bold col-span-5">
                  <span className="w-8">2 </span>
                  <span>{t("Order.Payment Method")} </span>
                </div>
                <div className="col-span-5">
                  <p>{paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsPaymentMethodSelected(false);
                      setIsDeliveryDateSelected(false);
                    }}
                  >
                    {t("All.Change")}
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">2 </span>
                  <span>{t("Order.Choose a payment method")} </span>
                </div>
                <Card className="md:ml-8 my-4">
                  <CardContent className="p-4">
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      {availablePaymentMethods.map((pm) => (
                        <div key={pm.name} className="flex items-center py-1">
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className="font-bold pl-2 cursor-pointer"
                            htmlFor={`payment-${pm.name}`}
                          >
                            {pm.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="p-4">
                    <Button
                      onClick={handleSelectPaymentMethod}
                      className="rounded-full font-bold"
                      disabled={!paymentMethod}
                    >
                      {t("Order.Use this payment method")}
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">2 </span>
                <span>{t("Order.Choose a payment method")}</span>
              </div>
            )}
          </div>

          {/* items and delivery date */}
          <div>
            {isDeliveryDateSelected && deliveryDateIndex !== undefined ? (
              <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
                <div className="flex text-lg font-bold col-span-5">
                  <span className="w-8">3 </span>
                  <span>{t("Order.Items and shipping")}</span>
                </div>
                <div className="col-span-5">
                  <p>
                    {t("Order.Delivery date")}:{" "}
                    {getDeliveryDateInfo(deliveryDateIndex).date}
                  </p>
                  <ul>
                    {items.map((item, _index) => (
                      <li key={_index}>
                        {item.name} ({item.brand}, {item.partNumber}) x{" "}
                        {item.quantity} ={" "}
                        <ProductPrice
                          price={item.price * item.quantity}
                          plain
                        />
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-2">
                  <Button
                    variant={"outline"}
                    onClick={() => {
                      setIsDeliveryDateSelected(false);
                    }}
                  >
                    {t("All.Change")}
                  </Button>
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              <>
                <div className="flex text-primary text-lg font-bold my-2">
                  <span className="w-8">3 </span>
                  <span>{t("Order.Review items and shipping")} </span>
                </div>
                <Card className="md:ml-8">
                  <CardContent className="p-4">
                    <p className="mb-2">
                      <span className="text-lg font-bold text-green-700">
                        {t("Order.Arriving")}{" "}
                        {getDeliveryDateInfo(deliveryDateIndex).isValid
                          ? getDeliveryDateInfo(deliveryDateIndex).date
                          : t("Order.Please select a delivery option")}
                      </span>{" "}
                      {getDeliveryDateInfo(deliveryDateIndex).isValid &&
                        t("Order.If you order within the next")}{" "}
                      {getDeliveryDateInfo(deliveryDateIndex).isValid &&
                        timeUntilMidnight().hours}{" "}
                      {t("Order.hours and")}{" "}
                      {getDeliveryDateInfo(deliveryDateIndex).isValid &&
                        timeUntilMidnight().minutes}{" "}
                      {t("Order.minutes")}
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {items.map((item, _index) => (
                          <div key={_index} className="flex gap-4 py-2">
                            <div className="relative w-16 h-16">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="20vw"
                                style={{
                                  objectFit: "contain",
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <p className="font-semibold">
                                {item.name} ({item.brand}, {item.partNumber})
                              </p>
                              <p className="text-sm">
                                {t("Product.SubCategory")}:{" "}
                                {item.subCategory?.name || "N/A"}
                              </p>
                              {item.color && (
                                <p className="text-sm">
                                  {t("Product.Color")}: {item.color}
                                </p>
                              )}
                              {item.size && (
                                <p className="text-sm">
                                  {t("Product.Size")}: {item.size}
                                </p>
                              )}
                              <p className="font-bold">
                                <ProductPrice price={item.price} plain />
                              </p>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === "0") removeItem(item);
                                  else updateItem(item, Number(value));
                                }}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue>
                                    {t("Product.Quantity")}: {item.quantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {Array.from({
                                    length: item.countInStock,
                                  }).map((_, i) => (
                                    <SelectItem key={i + 1} value={`${i + 1}`}>
                                      {i + 1}
                                    </SelectItem>
                                  ))}
                                  <SelectItem key="delete" value="0">
                                    {t("Cart.Delete")}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="font-bold">
                          <p className="mb-2">
                            {t("Order.Choose a shipping speed")}
                          </p>

                          <ul>
                            <RadioGroup
                              value={
                                deliveryDateIndex !== undefined
                                  ? availableDeliveryDates[deliveryDateIndex]
                                      .name
                                  : setting.defaultDeliveryDate || ""
                              }
                              onValueChange={(value) => {
                                const index = availableDeliveryDates.findIndex(
                                  (date) => date.name === value
                                );
                                if (index !== -1) {
                                  const deliveryInfo =
                                    getDeliveryDateInfo(index);
                                  setDeliveryDateIndex(
                                    index,
                                    deliveryInfo.shippingCost
                                  );
                                  setIsDeliveryDateSelected(true);
                                }
                              }}
                            >
                              {availableDeliveryDates.map((dd) => {
                                const deliveryInfo = getDeliveryDateInfo(
                                  availableDeliveryDates.findIndex(
                                    (date) => date.name === dd.name
                                  )
                                );
                                return (
                                  <div
                                    key={dd.name}
                                    className="flex items-center py-2"
                                  >
                                    <RadioGroupItem
                                      value={dd.name}
                                      id={`delivery-${dd.name}`}
                                    />
                                    <Label
                                      className="pl-2 space-y-2 cursor-pointer"
                                      htmlFor={`delivery-${dd.name}`}
                                    >
                                      <div className="text-green-700 font-semibold">
                                        {dd.name} (
                                        {deliveryInfo.shippingCost === 0
                                          ? t("Order.FREE Shipping")
                                          : t("Product.Price") +
                                            ": " +
                                            (
                                              <ProductPrice
                                                price={
                                                  deliveryInfo.shippingCost
                                                }
                                                plain
                                              />
                                            )}
                                        )
                                      </div>
                                      <div>{deliveryInfo.date}</div>
                                    </Label>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex text-muted-foreground text-lg font-bold my-4 py-3">
                <span className="w-8">3 </span>
                <span>{t("Order.Items and shipping")} </span>
              </div>
            )}
          </div>

          {isPaymentMethodSelected && isAddressSelected && (
            <div className="mt-6">
              <div className="block md:hidden">
                <CheckoutSummary />
              </div>

              <Card className="hidden md:block">
                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-3">
                  <Button
                    onClick={handlePlaceOrder}
                    className="rounded-full"
                    disabled={deliveryDateIndex === undefined}
                  >
                    {t("Order.Place Order")}
                  </Button>
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      {t("Order.Order Total")} :{" "}
                      <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className="text-xs">
                      <Link href="/page/privacy-policy">
                        {t("Order.Checkout Note3")}
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  );
};

export default CheckoutForm;
