import { Data, IProductInput, IUserInput } from "@/types";
import { toSlug } from "./utils";
import bcrypt from "bcryptjs";
import { i18n } from "@/i18n-config";

const users: IUserInput[] = [
  {
    name: "Hocine Hamdouch",
    email: "admin@gcw.com",
    password: bcrypt.hashSync("123456", 5),
    phoneNumber: "1234567890",
    role: "Admin",
    address: {
      fullName: "Hocine Hamdouch",
      street: "RTE de liberte Bejaia",
      city: "Bejaia",
      province: "Bejaia-06",
      postalCode: "06000",
      country: "Algeria",
      phone: "1234567890",
    },
    emailVerified: false,
    gender: "Male",
    dateOfBirth: new Date("1985-05-15"),
    image: "/images/admin.jpg",
    bannerImage: "/images/admin-banner.jpg",
    profileType: "Platinum",
    status: "active",
    wallet: 1000,
    shopDetails: {},
  },
  {
    name: "Amina Belkacem",
    email: "amina.seller@gcw.com",
    password: bcrypt.hashSync("password123", 5),
    phoneNumber: "0987654321",
    role: "Seller",
    address: {
      fullName: "Amina Belkacem",
      street: "Rue de la Paix",
      city: "Algiers",
      province: "Algiers-16",
      postalCode: "16000",
      country: "Algeria",
      phone: "0987654321",
    },
    emailVerified: true,
    gender: "Female",
    dateOfBirth: new Date("1990-08-22"),
    image: "/images/seller1.jpg",
    bannerImage: "/images/seller1-banner.jpg",
    profileType: "Gold",
    status: "active",
    wallet: 500,
    shopDetails: { shopName: "Amina's Auto Parts", verified: true },
  },
  {
    name: "Youssef Amrani",
    email: "youssef@gcw.com",
    password: bcrypt.hashSync("youssef2023", 5),
    phoneNumber: "0551234567",
    role: "User",
    address: {
      fullName: "Youssef Amrani",
      street: "Avenue des Martyrs",
      city: "Oran",
      province: "Oran-31",
      postalCode: "31000",
      country: "Algeria",
      phone: "0551234567",
    },
    emailVerified: false,
    gender: "Male",
    dateOfBirth: new Date("1995-03-10"),
    image: "/images/user1.jpg",
    bannerImage: "/images/user1-banner.jpg",
    profileType: "Silver",
    status: "active",
    wallet: 0,
    shopDetails: {},
  },
];

const products: IProductInput[] = [
  {
    name: "Bosch Oil Filter",
    slug: toSlug("Bosch Oil Filter"),
    subCategory: "66f7e3a4b2c1d9e8f7c9a123", // Example ObjectId for SubCategory "Oil Filters"
    seller: "66f7e3a4b2c1d9e8f7c9a456", // Example ObjectId for Amina Belkacem
    images: ["/images/oil-filter-1.jpg", "/images/oil-filter-2.jpg"],
    brand: "Bosch",
    description: "High-performance oil filter for enhanced engine protection.",
    price: 15.99,
    discountPrice: 12.99,
    countInStock: 50,
    tags: ["new arrival", "engine"],
    colors: ["Silver"],
    sizes: ["Standard"],
    vehicleCompatibility: [
      { make: "Toyota", model: "Corolla", year: [2018, 2019, 2020] },
      { make: "Honda", model: "Civic", year: [2017, 2018, 2019] },
    ],
    partNumber: "BOF-12345",
    specifications: { Diameter: "76mm", "Thread Size": "M20x1.5" },
    avgRating: 4.8,
    numReviews: 10,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 1 },
      { rating: 4, count: 3 },
      { rating: 5, count: 6 },
    ],
    numSales: 20,
    isPublished: true,
    reviews: [],
  },
  {
    name: "NGK Spark Plug",
    slug: toSlug("NGK Spark Plug"),
    subCategory: "66f7e3a4b2c1d9e8f7c9a124", // Example ObjectId for SubCategory "Spark Plugs"
    seller: "66f7e3a4b2c1d9e8f7c9a456", // Example ObjectId for Amina Belkacem
    images: ["/images/spark-plug-1.jpg", "/images/spark-plug-2.jpg"],
    brand: "NGK",
    description:
      "Premium spark plug for optimal combustion and fuel efficiency.",
    price: 8.5,
    discountPrice: 7.0,
    countInStock: 100,
    tags: ["new arrival", "ignition"],
    colors: ["Silver"],
    sizes: ["Standard"],
    vehicleCompatibility: [
      { make: "Ford", model: "Focus", year: [2015, 2016, 2017] },
      { make: "Chevrolet", model: "Malibu", year: [2016, 2017, 2018] },
    ],
    partNumber: "NGK-67890",
    specifications: { "Thread Diameter": "14mm", Reach: "19mm" },
    avgRating: 4.5,
    numReviews: 8,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 1 },
      { rating: 3, count: 0 },
      { rating: 4, count: 3 },
      { rating: 5, count: 4 },
    ],
    numSales: 15,
    isPublished: true,
    reviews: [],
  },
  {
    name: "Brembo Brake Pads",
    slug: toSlug("Brembo Brake Pads"),
    subCategory: "66f7e3a4b2c1d9e8f7c9a125", // Example ObjectId for SubCategory "Brake Pads"
    seller: "66f7e3a4b2c1d9e8f7c9a456", // Example ObjectId for Amina Belkacem
    images: ["/images/brake-pads-1.jpg", "/images/brake-pads-2.jpg"],
    brand: "Brembo",
    description: "High-quality ceramic brake pads for superior stopping power.",
    price: 45.0,
    discountPrice: 40.0,
    countInStock: 30,
    tags: ["new arrival", "brakes"],
    colors: ["Black"],
    sizes: ["Standard"],
    vehicleCompatibility: [
      { make: "BMW", model: "3 Series", year: [2019, 2020, 2021] },
      { make: "Mercedes-Benz", model: "C-Class", year: [2018, 2019, 2020] },
    ],
    partNumber: "BRM-54321",
    specifications: { Material: "Ceramic", Thickness: "17mm" },
    avgRating: 4.9,
    numReviews: 12,
    ratingDistribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 2 },
      { rating: 5, count: 10 },
    ],
    numSales: 25,
    isPublished: true,
    reviews: [],
  },
];
const reviews = [
  {
    rating: 1,
    title: "Poor quality",
    comment:
      "Very disappointed. The item broke after just a few uses. Not worth the money.",
  },
  {
    rating: 2,
    title: "Disappointed",
    comment:
      "Not as expected. The material feels cheap, and it didn't fit well. Wouldn't buy again.",
  },
  {
    rating: 2,
    title: "Needs improvement",
    comment:
      "It looks nice but doesn't perform as expected. Wouldn't recommend without upgrades.",
  },
];

const data: Data = {
  users,
  products,
  reviews,
  webPages: [
    {
      title: "About Us",
      slug: "about-us",
      content: `Welcome to [Your Store Name], your trusted destination for quality products and exceptional service. Our journey began with a mission to bring you the best shopping experience by offering a wide range of products at competitive prices, all in one convenient platform.

At [Your Store Name], we prioritize customer satisfaction and innovation. Our team works tirelessly to curate a diverse selection of items, from everyday essentials to exclusive deals, ensuring there's something for everyone. We also strive to make your shopping experience seamless with fast shipping, secure payments, and excellent customer support.

As we continue to grow, our commitment to quality and service remains unwavering. Thank you for choosing [Your Store Name]—we look forward to being a part of your journey and delivering value every step of the way.`,
      isPublished: true,
    },
    {
      title: "Contact Us",
      slug: "contact-us",
      content: `We’re here to help! If you have any questions, concerns, or feedback, please don’t hesitate to reach out to us. Our team is ready to assist you and ensure you have the best shopping experience.

**Customer Support**
For inquiries about orders, products, or account-related issues, contact our customer support team:
- **Email:** support@example.com
- **Phone:** +1 (123) 456-7890
- **Live Chat:** Available on our website from 9 AM to 6 PM (Monday to Friday).

**Head Office**
For corporate or business-related inquiries, reach out to our headquarters:
- **Address:** 1234 E-Commerce St, Suite 567, Business City, BC 12345
- **Phone:** +1 (987) 654-3210

We look forward to assisting you! Your satisfaction is our priority.
`,
      isPublished: true,
    },
    {
      title: "Help",
      slug: "help",
      content: `Welcome to our Help Center! We're here to assist you with any questions or concerns you may have while shopping with us. Whether you need help with orders, account management, or product inquiries, this page provides all the information you need to navigate our platform with ease.

**Placing and Managing Orders**
Placing an order is simple and secure. Browse our product categories, add items to your cart, and proceed to checkout. Once your order is placed, you can track its status through your account under the "My Orders" section. If you need to modify or cancel your order, please contact us as soon as possible for assistance.

**Shipping and Returns**
We offer a variety of shipping options to suit your needs, including standard and express delivery. For detailed shipping costs and delivery timelines, visit our Shipping Policy page. If you're not satisfied with your purchase, our hassle-free return process allows you to initiate a return within the specified timeframe. Check our Returns Policy for more details.

**Account and Support**
Managing your account is easy. Log in to update your personal information, payment methods, and saved addresses. If you encounter any issues or need further assistance, our customer support team is available via email, live chat, or phone. Visit our Contact Us page for support hours and contact details.`,
      isPublished: true,
    },
    {
      title: "Privacy Policy",
      slug: "privacy-policy",
      content: `We value your privacy and are committed to protecting your personal information. This Privacy Notice explains how we collect, use, and share your data when you interact with our services. By using our platform, you consent to the practices described herein.

We collect data such as your name, email address, and payment details to provide you with tailored services and improve your experience. This information may also be used for marketing purposes, but only with your consent. Additionally, we may share your data with trusted third-party providers to facilitate transactions or deliver products.

Your data is safeguarded through robust security measures to prevent unauthorized access. However, you have the right to access, correct, or delete your personal information at any time. For inquiries or concerns regarding your privacy, please contact our support team.`,
      isPublished: true,
    },
    {
      title: "Conditions of Use",
      slug: "conditions-of-use",
      content: `Welcome to [Ecommerce Website Name]. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. These terms govern your use of our platform, including browsing, purchasing products, and interacting with any content or services provided. You must be at least 18 years old or have the consent of a parent or guardian to use this website. Any breach of these terms may result in the termination of your access to our platform.

We strive to ensure all product descriptions, pricing, and availability information on our website are accurate. However, errors may occur, and we reserve the right to correct them without prior notice. All purchases are subject to our return and refund policy. By using our site, you acknowledge that your personal information will be processed according to our privacy policy, ensuring your data is handled securely and responsibly. Please review these terms carefully before proceeding with any transactions.
`,
      isPublished: true,
    },
    {
      title: "Customer Service",
      slug: "customer-service",
      content: `At [Your Store Name], our customer service team is here to ensure you have the best shopping experience. Whether you need assistance with orders, product details, or returns, we are committed to providing prompt and helpful support.

If you have questions or concerns, please reach out to us through our multiple contact options:
- **Email:** support@example.com
- **Phone:** +1 (123) 456-7890
- **Live Chat:** Available on our website for instant assistance

We also provide helpful resources such as order tracking, product guides, and FAQs to assist you with common inquiries. Your satisfaction is our priority, and we’re here to resolve any issues quickly and efficiently. Thank you for choosing us!`,
      isPublished: true,
    },
    {
      title: "Returns Policy",
      slug: "returns-policy",
      content: "Returns Policy Content",
      isPublished: true,
    },
    {
      title: "Careers",
      slug: "careers",
      content: "careers Content",
      isPublished: true,
    },
    {
      title: "Blog",
      slug: "blog",
      content: "Blog Content",
      isPublished: true,
    },
  ],
  headerMenus: [
    {
      name: "Today's Deal",
      href: "/search?tag=todays-deal",
    },
    {
      name: "New Arrivals",
      href: "/search?tag=new-arrival",
    },
    {
      name: "Featured Products",
      href: "/search?tag=featured",
    },
    {
      name: "Best Sellers",
      href: "/search?tag=best-seller",
    },
    {
      name: "Browsing History",
      href: "/#browsing-history",
    },
    {
      name: "Customer Service",
      href: "/page/customer-service",
    },
    {
      name: "About Us",
      href: "/page/about-us",
    },
    {
      name: "Help",
      href: "/page/help",
    },
  ],
  carousels: [
    {
      title: "Most Popular Shoes For Sale",
      buttonCaption: "Shop Now",
      image: "/images/banner3.jpg",
      url: "/search?category=Shoes",
      isPublished: true,
    },
    {
      title: "Best Sellers in T-Shirts",
      buttonCaption: "Shop Now",
      image: "/images/banner1.jpg",
      url: "/search?category=T-Shirts",
      isPublished: true,
    },
    {
      title: "Best Deals on Wrist Watches",
      buttonCaption: "See More",
      image: "/images/banner2.jpg",
      url: "/search?category=Wrist Watches",
      isPublished: true,
    },
  ],
  settings: [
    {
      common: {
        freeShippingMinPrice: 35,
        isMaintenanceMode: false,
        defaultTheme: "Light",
        defaultColor: "Blue",
        pageSize: 9,
      },
      site: {
        name: "Pyasti",
        description:
          "NxtAmzn is a sample Ecommerce website built with Next.js, Tailwind CSS, and MongoDB.",
        keywords: "Next Ecommerce, Next.js, Tailwind CSS, MongoDB",
        url: "https://next-mongo-ecommerce-final.vercel.app",
        logo: "/logo.png",
        slogan: "Spend less, enjoy more.",
        author: "Next Ecommerce",
        copyright: "2000-2024, Next-Ecommerce.com, Inc. or its affiliates",
        email: "admin@example.com",
        address: "123, Main Street, Anytown, CA, Zip 12345",
        phone: "+1 (123) 456-7890",
      },
      carousels: [
        {
          title: "Most Popular Shoes For Sale",
          buttonCaption: "Shop Now",
          image: "/images/banner3.jpg",
          url: "/search?category=Shoes",
        },
        {
          title: "Best Sellers in T-Shirts",
          buttonCaption: "Shop Now",
          image: "/images/banner1.jpg",
          url: "/search?category=T-Shirts",
        },
        {
          title: "Best Deals on Wrist Watches",
          buttonCaption: "See More",
          image: "/images/banner2.jpg",
          url: "/search?category=Wrist Watches",
        },
      ],
      availableLanguages: i18n.locales.map((locale) => ({
        code: locale.code,
        name: locale.name,
      })),
      defaultLanguage: "fr",
      availableCurrencies: [
        {
          name: "United States Dollar",
          code: "USD",
          symbol: "$",
          convertRate: 1,
        },
        { name: "Euro", code: "EUR", symbol: "€", convertRate: 0.96 },
        { name: "UAE Dirham", code: "AED", symbol: "AED", convertRate: 3.67 },
      ],
      defaultCurrency: "USD",
      availablePaymentMethods: [
        { name: "PayPal", commission: 0 },
        { name: "Stripe", commission: 0 },
        { name: "COD - Paiement à la livraison", commission: 0 },
      ],
      defaultPaymentMethod: "PayPal",
      availableDeliveryDates: [
        {
          name: "Tomorrow",
          daysToDeliver: 1,
          shippingPrice: 12.9,
          freeShippingMinPrice: 0,
        },
        {
          name: "Next 3 Days",
          daysToDeliver: 3,
          shippingPrice: 6.9,
          freeShippingMinPrice: 0,
        },
        {
          name: "Next 5 Days",
          daysToDeliver: 5,
          shippingPrice: 4.9,
          freeShippingMinPrice: 35,
        },
      ],
      defaultDeliveryDate: "Next 5 Days",
    },
  ],
};

export default data;
