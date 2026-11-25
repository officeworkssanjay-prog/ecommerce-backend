/** Shapes returned by the API (money is always a plain number). Extend as pages need more fields. */

export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------- Catalogue ----------
export interface ChildCategory { id: string; subCategoryId: string; name: string; slug: string; status: boolean }
export interface SubCategory { id: string; categoryId: string; name: string; slug: string; status: boolean; childCategories?: ChildCategory[] }
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  status: boolean;
  subCategories?: SubCategory[];
  _count?: { subCategories?: number; products?: number };
}
export interface Brand { id: string; name: string; slug: string; logo?: string | null; isFeatured: boolean; status: boolean }

export interface VariantItem { id: string; name: string; price: number; isDefault: boolean; status: boolean }
export interface Variant { id: string; name: string; status: boolean; items: VariantItem[] }

export type ProductType = "NEW_ARRIVAL" | "FEATURED_PRODUCT" | "TOP_PRODUCT" | "BEST_PRODUCT";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  thumbImage: string;
  qty: number;
  price: number;
  offerPrice?: number | null;
  offerStartDate?: string | null;
  offerEndDate?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  videoLink?: string | null;
  productType?: ProductType | null;
  status: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  childCategoryId?: string | null;
  brandId?: string | null;
  category?: { name: string; slug?: string };
  brand?: { name: string; slug?: string } | null;
  variants?: Variant[];
  imageGallery?: { id: string; image: string }[];
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  review: string;
  status: boolean;
  createdAt: string;
  user?: { name: string; avatar?: string | null };
  product?: { id?: string; name: string; slug: string; thumbImage?: string };
}

export interface Slider { id: string; banner: string; type?: string | null; title?: string | null; subtitle?: string | null; startingPrice?: number | null; btnUrl?: string | null; serial: number; status: boolean }

export interface FlashSale {
  id: string;
  endDate: string;
  showAtHome: boolean;
  products: { id: string; showAtHome: boolean; status: boolean; product: Product }[];
}

// ---------- Cart & orders ----------
export interface Address {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  address: string;
  addressType: "home" | "office" | string;
  isDefault: boolean;
}

export interface ShippingRule { id: string; name: string; type: string; minCost: number; cost: number; status: boolean }

export interface PricedItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  qty: number;
  unitPrice: number;
  variantTotal: number;
  lineTotal: number;
  variants: Record<string, { id: string; name: string; price: number }>;
}

export interface PricingResult {
  items: PricedItem[];
  subTotal: number;
  discount: number;
  shippingCost: number;
  finalPayable: number;
  coupon: { code: string; discountType: "PERCENT" | "AMOUNT"; discount: number } | null;
  couponError: string | null;
  shippingRule: { id: string; name: string; type: string; cost: number } | null;
  onlinePaymentAvailable: boolean;
}

export interface CheckoutResult {
  orderId: string;
  invoiceId: number;
  paymentMethod: "COD" | "RAZORPAY";
  gateway: { keyId: string; orderId: string; amount: number; currency: string } | null;
}

export type OrderStatus =
  | "PENDING"
  | "PROCESSED_AND_READY_TO_SHIP"
  | "DROPPED_OFF"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

export interface OrderLine { id: string; productId: string; productName: string; unitPrice: number; qty: number; variantTotal: number; variants?: Record<string, { id: string; name: string; price: number }> | null }

export interface Order {
  id: string;
  invoiceId: number;
  subTotal: number;
  amount: number;
  currencyName: string;
  currencyIcon: string;
  productQty: number;
  paymentMethod: string;
  paymentStatus: "UNPAID" | "PAID";
  orderStatus: OrderStatus;
  orderAddress: Omit<Address, "id" | "isDefault">;
  shippingMethod: { name: string; cost: number; type?: string };
  coupon?: { code: string; discount: number; calculatedDiscount: number; discountType: "PERCENT" | "AMOUNT" } | null;
  orderProducts: OrderLine[];
  transaction?: { transactionId: string } | null;
  user?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

// ---------- Content ----------
export interface BlogCategory { id: string; name: string; slug: string; status: boolean; _count?: { blogs: number } }
export interface Blog {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  image: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: boolean;
  createdAt: string;
  category?: { id?: string; name: string; slug?: string };
  comments?: { id: string; comment: string; createdAt: string; user: { name: string; avatar?: string | null } }[];
  _count?: { comments: number };
}

export interface ChatPartner { id: string; name: string; avatar?: string | null; role: Role }
export interface ChatMessage { id: string; senderId: string; receiverId: string; message: string; seen: boolean; createdAt: string; sender?: { id: string; name: string; avatar?: string | null } }
export interface Conversation { partner: ChatPartner; lastMessage: { id: string; message: string; senderId: string; seen: boolean; createdAt: string }; unseenCount: number }

// ---------- Admin: marketing, content & settings ----------
export interface Coupon {
  id: string;
  name: string;
  code: string;
  quantity: number;
  maxUse: number;
  totalUsed: number;
  startDate: string;
  endDate: string;
  discountType: "PERCENT" | "AMOUNT";
  discount: number;
  status: boolean;
}
export interface Advertisement { id: string; key: string; value: { banner?: string | null; url?: string | null; status?: boolean } }
export interface AdminBlogComment {
  id: string;
  comment: string;
  status: boolean;
  createdAt: string;
  blog?: { title: string; slug: string };
  user?: { name: string; email: string };
}
export interface Subscriber { id: string; email: string; isVerified: boolean; createdAt: string }
export interface AdminSettings {
  general: { siteName: string; contactEmail?: string | null; contactPhone?: string | null; contactAddress?: string | null; mapUrl?: string | null; currencyName: string; currencyIcon: string; timeZone: string } | null;
  email: { email: string; host: string; username: string; password: string; hasPassword: boolean; port: number; encryption: string } | null;
  pusher: { appId: string; key: string; secret: string; hasSecret: boolean; cluster: string } | null;
  paymentGateways: {
    razorpay: { status: boolean; countryName?: string | null; currencyName: string; currencyRate: number } | null;
    razorpayKeysConfigured: boolean;
    cod: { status: boolean } | null;
  };
}
