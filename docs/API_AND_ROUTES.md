# API & Route Reference Guide

This document provides a comprehensive catalog of all routes registered across the Multi-Vendor E-Commerce Platform, categorized by domain, authentication middleware, HTTP method, URL pattern, and controller action.

---

## 📑 Route Groups & Middleware Map

| Domain Group | URL Prefix | Route Name Prefix | Enforced Middleware | Primary Target |
| :--- | :--- | :--- | :--- | :--- |
| **Public Storefront** | `/` | *(none)* | `web` | General visitors & shoppers |
| **Authentication & SSO**| `/` | *(various)* | `guest` / `auth` | Account creation, login, OAuth callbacks |
| **Customer Dashboard** | `/user` | `user.` | `web`, `auth`, `verified` | Authenticated customers |
| **Vendor Portal** | `/vendor` | `vendor.` | `web`, `auth`, `role:vendor` | Verified merchants |
| **Admin Control Panel** | `/admin` | `admin.` | `web`, `auth`, `role:admin` | System administrators |
| **Broadcasting** | `/broadcasting` | *(none)* | `auth` | Private WebSocket channel auth |

---

## 🌐 1. Public Storefront Routes (`routes/web.php`)

These routes handle the public-facing e-commerce storefront, product discovery, shopping cart, and informational pages.

### Home & Discovery
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | `home` | `Frontend\HomeController@index` | Main marketplace homepage |
| `GET` | `/flash-sale` | `flash-sale` | `Frontend\FlashSaleController@index` | Active flash sale event page |
| `GET` | `/products` | `products.index` | `Frontend\FrontendProductController@productsIndex` | Product catalog with search and filters |
| `GET` | `/product-detail/{slug}` | `product-detail` | `Frontend\FrontendProductController@showProduct` | Detailed single product view |
| `GET` | `/change-product-list-view` | `change-product-list-view` | `Frontend\FrontendProductController@chageListView` | Session toggle between grid & list view |
| `GET` | `/show-product-modal/{id}` | `show-product-modal` | `Frontend\HomeController@ShowProductModal` | AJAX quick-view modal popup |
| `GET` | `/vendor` | `vendor.index` | `Frontend\HomeController@vendorPage` | Public directory of approved vendors |
| `GET` | `/vendor-product/{id}` | `vendor.products` | `Frontend\HomeController@vendorProductsPage` | Products filtered by vendor shop |

### Shopping Cart
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/add-to-cart` | `add-to-cart` | `Frontend\CartController@addToCart` | Add item with variants to cart |
| `GET` | `/cart-details` | `cart-details` | `Frontend\CartController@cartDetails` | Full cart review page |
| `POST` | `/cart/update-quantity` | `cart.update-quantity` | `Frontend\CartController@updateProductQty` | AJAX cart item quantity updater |
| `GET` | `/cart/remove-product/{rowId}`| `cart.remove-product` | `Frontend\CartController@removeProduct` | Delete line item from cart |
| `GET` | `/clear-cart` | `clear.cart` | `Frontend\CartController@clearCart` | Empty all items from active cart |
| `GET` | `/cart-count` | `cart-count` | `Frontend\CartController@getCartCount` | AJAX header cart badge count |
| `GET` | `/cart-products` | `cart-products` | `Frontend\CartController@getCartProducts` | AJAX fetch mini-cart dropdown items |
| `POST` | `/cart/remove-sidebar-product`| `cart.remove-sidebar-product` | `Frontend\CartController@removeSidebarProduct`| AJAX remove item from mini-cart sidebar |
| `GET` | `/cart/sidebar-product-total` | `cart.sidebar-product-total` | `Frontend\CartController@cartTotal` | AJAX fetch subtotal for mini-cart |
| `GET` | `/apply-coupon` | `apply-coupon` | `Frontend\CartController@applyCoupon` | Validate and apply promo coupon |
| `GET` | `/coupon-calculation` | `coupon-calculation` | `Frontend\CartController@couponCalculation` | AJAX get discounted cart balance |

### Content, Newsletters & Utilities
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/newsletter-request` | `newsletter-request` | `Frontend\NewsletterController@newsLetterRequset` | Submit email for newsletter |
| `GET` | `/newsletter-verify/{token}`| `newsletter-verify` | `Frontend\NewsletterController@newsLetterEmailVarify` | Double opt-in token verification |
| `GET` | `/blog` | `blog` | `Frontend\BlogController@blog` | Blog listing page |
| `GET` | `/blog-details/{slug}` | `blog-details` | `Frontend\BlogController@blogDetails` | Single blog article view |
| `GET` | `/about` | `about` | `Frontend\PageController@about` | About Us CMS page |
| `GET` | `/terms-and-conditions` | `terms-and-conditions` | `Frontend\PageController@termsAndCondition` | Terms and Conditions CMS page |
| `GET` | `/contact` | `contact` | `Frontend\PageController@contact` | Contact Us form page |
| `POST` | `/contact` | `handle-contact-form`| `Frontend\PageController@handleContactForm` | Send email inquiry |
| `GET` | `/product-traking` | `product-traking.index`| `Frontend\ProductTrackController@index` | Public order status tracker |
| `GET` | `/wishlist/add-product` | `wishlist.store` | `Frontend\WishlistController@addToWishlist` | Add item to customer wishlist |

---

## 👤 2. Customer Dashboard Routes (`prefix: /user`)

Protected by `auth` and `verified` middleware.

| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/user/dashboard` | `user.dashboard` | `Frontend\UserDashboardController@index` | Customer account dashboard |
| `GET` | `/user/profile` | `user.profile` | `Frontend\UserProfileController@index` | Manage personal profile |
| `PUT` | `/user/profile` | `user.profile.update` | `Frontend\UserProfileController@updateProfile` | Update personal info & avatar |
| `POST` | `/user/profile` | `user.profile.update.password` | `Frontend\UserProfileController@updatePassword`| Change account password |
| `GET` | `/user/orders` | `user.orders.index` | `Frontend\UserOrderController@index` | Customer order history list |
| `GET` | `/user/orders/show/{id}` | `user.orders.show` | `Frontend\UserOrderController@show` | View order invoice & details |
| `GET` | `/user/wishlist` | `user.wishlist.index` | `Frontend\WishlistController@index` | View customer wishlist |
| `GET` | `/user/wishlist/remove-product/{id}` | `user.wishlist.destory` | `Frontend\WishlistController@destory` | Remove product from wishlist |
| `POST` | `/user/wishlist/remove-product-ajax` | `user.wishlist.destory-ajax` | `Frontend\WishlistController@destoryAjax` | AJAX remove from wishlist |
| `GET` | `/user/reviews` | `user.review.index` | `Frontend\ReviewController@index` | Product reviews submitted by user |
| `POST` | `/user/review` | `user.review.create` | `Frontend\ReviewController@create` | Post product review with rating |
| `POST` | `/user/blog-comment` | `user.blog-comment` | `Frontend\BlogController@comment` | Post comment on a blog post |
| `GET` | `/user/vendor-request` | `user.vendor-request.index` | `Frontend\UserVendorReqeustController@index` | Merchant application form |
| `POST` | `/user/vendor-request` | `user.vendor-request.create` | `Frontend\UserVendorReqeustController@create` | Submit application to become a vendor |

### Real-Time Chat (User)
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/user/messages` | `user.messages.index` | `Frontend\UserMessageController@index` | Messenger screen |
| `POST` | `/user/send-message` | `user.send-message` | `Frontend\UserMessageController@sendMessage` | Send message & broadcast event |
| `GET` | `/user/get-messages` | `user.get-messages` | `Frontend\UserMessageController@getMessages` | Fetch conversation history |

### Address Management
- `Resource /user/address` &rarr; `Frontend\UserAddressController` (`index`, `create`, `store`, `edit`, `update`, `destroy`)

### Checkout & Payment Processing
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/user/checkout` | `user.checkout` | `Frontend\CheckOutController@index` | Step 1: Select address & shipping |
| `POST` | `/user/checkout/address-create` | `user.checkout.address.create` | `Frontend\CheckOutController@createAddress` | Add address during checkout |
| `POST` | `/user/checkout/form-submit` | `user.checkout.form-submit` | `Frontend\CheckOutController@checkOutFormSubmit` | Confirm shipping & proceed |
| `GET` | `/user/payment` | `user.payment` | `Frontend\PaymentController@index` | Step 2: Choose payment gateway |
| `GET` | `/user/payment-success` | `user.payment.success` | `Frontend\PaymentController@paymentSuccess` | Post-payment thank you page |
| `GET` | `/user/paypal/payment` | `user.paypal.payment` | `Frontend\PaymentController@payWithPaypal` | Initiate PayPal redirect |
| `GET` | `/user/paypal/success` | `user.paypal.success` | `Frontend\PaymentController@paypalSuccess` | PayPal capture return callback |
| `GET` | `/user/paypal/cancel` | `user.paypal.cancel` | `Frontend\PaymentController@paypalCancel` | PayPal cancelled redirect |
| `POST` | `/user/stripe/payment` | `user.stripe.payment` | `Frontend\PaymentController@payWithStripe` | Charge credit card via Stripe |
| `POST` | `/user/razorpay/payment` | `user.razorpay.payment` | `Frontend\PaymentController@payWithRazorPay` | Verify & capture Razorpay payment |
| `GET` | `/user/cod/payment` | `user.cod.payment` | `Frontend\PaymentController@payWithCod` | Complete Cash on Delivery order |

---

## 🏬 3. Vendor Portal Routes (`prefix: /vendor`)

Protected by `auth` and `role:vendor`.

| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendor/dashboard` | `vendor.dashbaord` | `Backend\VendorController@dashboard` | Merchant dashboard metrics |
| `GET` | `/vendor/profile` | `vendor.profile` | `Backend\VendorProfileController@index` | Merchant user profile |
| `PUT` | `/vendor/profile` | `vendor.profile.update` | `Backend\VendorProfileController@updateProfile`| Update profile info |
| `POST` | `/vendor/profile` | `vendor.profile.update.password`| `Backend\VendorProfileController@updatePassword`| Update password |
| `Resource` | `/vendor/shop-profile` | `vendor.shop-profile.*` | `Backend\VendorShopProfileController` | Manage shop name, banner, address |

### Catalog & Product Management
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendor/product/get-subcategories` | `vendor.product.get-subcategories` | `Backend\VendorProductController@getSubCategories` | Dependent category AJAX dropdown |
| `GET` | `/vendor/product/get-child-categories`| `vendor.product.get-child-categories`| `Backend\VendorProductController@getChildCategories` | Dependent subcategory AJAX dropdown |
| `PUT` | `/vendor/product/change-status` | `vendor.product.change-status` | `Backend\VendorProductController@changeStatus` | Active/Inactive product toggle |
| `Resource`| `/vendor/products` | `vendor.products.*` | `Backend\VendorProductController` | Full CRUD for vendor products |
| `Resource`| `/vendor/products-image-gallery` | `vendor.products-image-gallery.*`| `Backend\VendorProductImageGalleryController` | Manage secondary gallery images |

### Product Variants & Variant Items
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PUT` | `/vendor/products-variant/change-status` | `vendor.products-variant.change-status` | `Backend\VendorProductVariantController@changeStatus` | Toggle variant status |
| `Resource`| `/vendor/products-variant` | `vendor.products-variant.*` | `Backend\VendorProductVariantController` | Variant definitions (e.g. Size, Color) |
| `GET` | `/vendor/products-variant-item/{pId}/{vId}`| `vendor.products-variant-item.index` | `Backend\VendorProductVariantItemController@index` | List options under variant |
| `GET` | `/vendor/products-variant-item/create/{pId}/{vId}`| `vendor.products-variant-item.create`| `Backend\VendorProductVariantItemController@create` | Add new item (e.g. "XL", "Red") |
| `POST` | `/vendor/products-variant-item` | `vendor.products-variant-item.store` | `Backend\VendorProductVariantItemController@store` | Save variant item & price delta |
| `GET` | `/vendor/products-variant-item-edit/{id}` | `vendor.products-variant-item.edit` | `Backend\VendorProductVariantItemController@edit` | Edit variant item |
| `PUT` | `/vendor/products-variant-item-update/{id}` | `vendor.products-variant-item.update` | `Backend\VendorProductVariantItemController@update` | Update variant item |
| `DELETE` | `/vendor/products-variant-item/{id}` | `vendor.products-variant-item.destroy` | `Backend\VendorProductVariantItemController@destroy` | Delete variant item |
| `PUT` | `/vendor/products-variant-item-status` | `vendor.products-variant-item.chages-status`| `Backend\VendorProductVariantItemController@chageStatus` | Toggle item status |

### Vendor Orders, Reviews & Financial Payouts
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendor/orders` | `vendor.orders.index` | `Backend\VendorOrderController@index` | Orders containing vendor items |
| `GET` | `/vendor/orders/show/{id}` | `vendor.orders.show` | `Backend\VendorOrderController@show` | View order items & customer address |
| `GET` | `/vendor/orders/status/{id}` | `vendor.orders.status` | `Backend\VendorOrderController@orderStatus` | Update status to 'ready to ship' |
| `GET` | `/vendor/reviews` | `vendor.reviews.index` | `Backend\VendorProductReviewController@index` | Customer reviews on vendor items |
| `GET` | `/vendor/withdraw-request/{id}` | `vendor.withdraw-request.show` | `Backend\VendorWithdrawController@showRequest` | View payout request details |
| `Resource`| `/vendor/withdraw` | `vendor.withdraw.*` | `Backend\VendorWithdrawController` | Check balance & request payout |

### Real-Time Chat (Vendor)
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/vendor/messages` | `vendor.messages.index` | `Backend\VendorMessageController@index` | Vendor live chat interface |
| `POST` | `/vendor/send-message` | `vendor.send-message` | `Backend\VendorMessageController@sendMessage` | Send reply to customer |
| `GET` | `/vendor/get-messages` | `vendor.get-messages` | `Backend\VendorMessageController@getMessages` | Load customer chat thread |

---

## 🛡️ 4. Admin Control Panel Routes (`prefix: /admin`)

Protected by `auth` and `role:admin`.

### Dashboard, Profile & Admins
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/dashboard` | `admin.dashbaord` | `Backend\AdminController@dashboard` | Admin executive analytics |
| `GET` | `/admin/profile` | `admin.profile` | `Backend\ProfileController@index` | Admin user profile |
| `POST` | `/admin/profile/update` | `admin.profile.update` | `Backend\ProfileController@updateProfile` | Update admin info & avatar |
| `POST` | `/admin/profile/update/password`| `admin.password.update` | `Backend\ProfileController@updatePassword` | Update admin password |
| `GET` | `/admin/admin-list` | `admin.admin-list.index` | `Backend\AdminListController@index` | List staff/admin accounts |
| `PUT` | `/admin/admin-list/status-change`| `admin.admin-list.status-change`| `Backend\AdminListController@changeStatus` | Enable/disable admin account |
| `DELETE` | `/admin/admin-list/{id}` | `admin.admin-list.destory` | `Backend\AdminListController@destory` | Remove admin user |
| `GET` | `/admin/manage-user` | `admin.manage-user.index` | `Backend\ManageUserController@index` | Create user/vendor accounts |
| `POST` | `/admin/manage-user` | `admin.manage-user.create` | `Backend\ManageUserController@create` | Store new user & send welcome mail |
| `GET` | `/admin/customer` | `admin.customer.index` | `Backend\CustomerListController@index` | Registered customer directory |
| `PUT` | `/admin/customer/status-change` | `admin.customer.status-change` | `Backend\CustomerListController@changeStatus` | Ban or activate customer account |

### Vendor Oversight & Moderation
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/vendor-list` | `admin.vendor-list.index` | `Backend\VendorListController@index` | Approved vendor directory |
| `PUT` | `/admin/vendor-list/status-change` | `admin.vendor-list.status-change`| `Backend\VendorListController@changeStatus` | Suspend or activate vendor shop |
| `GET` | `/admin/vendor-requests` | `admin.vendor-requests.index` | `Backend\VendorRequestController@index` | Incoming merchant applications |
| `GET` | `/admin/vendor-requests/{id}/show` | `admin.vendor-requests.show` | `Backend\VendorRequestController@show` | Review merchant documentation |
| `PUT` | `/admin/vendor-requests/{id}/change-status`| `admin.vendor-requests.change-status`| `Backend\VendorRequestController@changeStatus`| Approve or reject vendor application |
| `GET` | `/admin/vendor-condition` | `admin.vendor-condition.index` | `Backend\VendorConditionController@index` | Edit terms shown to vendor applicants |
| `PUT` | `/admin/vendor-condition/update` | `admin.vendor-condition.update` | `Backend\VendorConditionController@update` | Update vendor terms content |
| `Resource`| `/admin/vendor-profile` | `admin.vendor-profile.*` | `Backend\AdminVendorProfileController` | Admin's own shop profile |

### Product Catalog & Seller Product Moderation
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Resource`| `/admin/slider` | `admin.slider.*` | `Backend\SliderController` | Homepage hero sliders |
| `Resource`| `/admin/category` | `admin.category.*` | `Backend\CategoryController` | Root categories CRUD |
| `Resource`| `/admin/sub-category` | `admin.sub-category.*` | `Backend\SubCategoryController` | Subcategories CRUD |
| `Resource`| `/admin/child-category` | `admin.child-category.*` | `Backend\ChildCategoryController` | Child categories CRUD |
| `Resource`| `/admin/brand` | `admin.brand.*` | `Backend\BrandController` | Product brands CRUD |
| `Resource`| `/admin/products` | `admin.products.*` | `Backend\ProductController` | Platform products CRUD |
| `Resource`| `/admin/products-image-gallery`| `admin.products-image-gallery.*`| `Backend\ProductImageGalleryController` | Admin product gallery images |
| `Resource`| `/admin/products-variant` | `admin.products-variant.*` | `Backend\ProductVariantController` | Product variant headers |
| `GET` | `/admin/seller-products` | `admin.seller-products.index` | `Backend\SellerProductController@index` | All vendor-submitted products |
| `GET` | `/admin/seller-pending-products` | `admin.seller-pending-products.index`| `Backend\SellerProductController@pendingProducts`| Moderation queue (pending approval) |
| `PUT` | `/admin/change-approve-status` | `admin.change-approve-status` | `Backend\SellerProductController@changeApproveStatus`| Approve/reject seller product |
| `GET` | `/admin/reviews` | `admin.reviews.index` | `Backend\AdminReviewController@index` | All customer product reviews |
| `PUT` | `/admin/reviews/change-status` | `admin.reviews.change-status` | `Backend\AdminReviewController@changeStatus` | Approve or hide review |

### Orders & Logistics Pipeline
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Resource`| `/admin/order` | `admin.order.*` | `Backend\OrderController` | Order details & invoice printing |
| `GET` | `/admin/pending-orders` | `admin.pending-orders` | `Backend\OrderController@pendingOrders` | Filter: Pending orders |
| `GET` | `/admin/processed-orders` | `admin.processed-orders` | `Backend\OrderController@processedOrders` | Filter: Processed & ready to ship |
| `GET` | `/admin/dropped-off-orders` | `admin.dropped-off-orders` | `Backend\OrderController@droppedOfOrders` | Filter: Dropped off by seller |
| `GET` | `/admin/shipped-orders` | `admin.shipped-orders` | `Backend\OrderController@shippedOrders` | Filter: In logistics transit |
| `GET` | `/admin/out-for-delivery-orders`| `admin.out-for-delivery-orders`| `Backend\OrderController@outForDeliveryOrders`| Filter: Out for final delivery |
| `GET` | `/admin/delivered-orders` | `admin.delivered-orders` | `Backend\OrderController@deliveredOrders` | Filter: Successfully delivered |
| `GET` | `/admin/canceled-orders` | `admin.canceled-orders` | `Backend\OrderController@canceledOrders` | Filter: Cancelled orders |
| `GET` | `/admin/order-status` | `admin.order.status` | `Backend\OrderController@changeOrderStatus` | Update order workflow stage |
| `GET` | `/admin/payment-status` | `admin.payment.status` | `Backend\OrderController@changePaymentStatus` | Mark payment as 0 (unpaid) or 1 (paid) |
| `GET` | `/admin/transaction` | `admin.transaction` | `Backend\TransactionController@index` | Gateway transaction audit log |

### Marketing, Coupons & Advertisements
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/flash-sale` | `admin.flash-sale.index` | `Backend\FlashSaleController@index` | Flash sale management & item list |
| `PUT` | `/admin/flash-sale` | `admin.flash-sale.update` | `Backend\FlashSaleController@update` | Set flash sale end date & banner |
| `POST` | `/admin/flash-sale/add-product` | `admin.flash-sale.add-product` | `Backend\FlashSaleController@addProduct` | Add product to flash sale |
| `DELETE` | `/admin/flash-sale/{id}` | `admin.flash-sale.destory` | `Backend\FlashSaleController@destory` | Remove product from flash sale |
| `Resource`| `/admin/coupons` | `admin.coupons.*` | `Backend\CouponController` | Promo discount coupons CRUD |
| `Resource`| `/admin/shipping-rule` | `admin.shipping-rule.*` | `Backend\ShippingRuleController` | Delivery fees & rules CRUD |
| `GET` | `/admin/advertisement` | `admin.advertisement.index` | `Backend\AdvertisementController@index` | Banner ads control screen |
| `PUT` | `/admin/advertisement/homepage-banner-secion-one` | `admin.homepage-banner-secion-one` | `Backend\AdvertisementController@homepageBannerSecionOne` | Slot 1 Homepage Banner |
| `PUT` | `/admin/advertisement/homepage-banner-secion-two` | `admin.homepage-banner-secion-two` | `Backend\AdvertisementController@homepageBannerSecionTwo` | Slot 2 Homepage Banner |
| `PUT` | `/admin/advertisement/homepage-banner-secion-three` | `admin.homepage-banner-secion-three` | `Backend\AdvertisementController@homepageBannerSecionThree` | Slot 3 Homepage Banner |
| `PUT` | `/admin/advertisement/homepage-banner-secion-four` | `admin.homepage-banner-secion-four` | `Backend\AdvertisementController@homepageBannerSecionFour` | Slot 4 Homepage Banner |
| `PUT` | `/admin/advertisement/productpage-banner` | `admin.productpage-banner` | `Backend\AdvertisementController@productPageBanner` | Single Product Page Banner |
| `PUT` | `/admin/advertisement/cartpage-banner` | `admin.cartpage-banner` | `Backend\AdvertisementController@cartPageBanner` | Shopping Cart Page Banner |
| `GET` | `/admin/home-page-setting` | `admin.home-page-setting` | `Backend\HomePageSettingController@index` | Customize homepage dynamic sections |

### Payouts & Withdrawals
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Resource`| `/admin/withdraw-method` | `admin.withdraw-method.*` | `Backend\WithdrawMehtodController` | Configure payout channels & fees |
| `GET` | `/admin/withdraw` | `admin.withdraw.index` | `Backend\WithdrawController@index` | Review merchant payout requests |
| `GET` | `/admin/withdraw/{id}` | `admin.withdraw.show` | `Backend\WithdrawController@show` | View account info & requested balance |
| `PUT` | `/admin/withdraw/{id}` | `admin.withdraw.update` | `Backend\WithdrawController@update` | Approve (paid) or decline payout |

### Content & Platform Settings
| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `Resource`| `/admin/blog-category` | `admin.blog-category.*` | `Backend\BlogCategoryController` | Blog categories CRUD |
| `Resource`| `/admin/blog` | `admin.blog.*` | `Backend\BlogController` | Blog articles CRUD |
| `GET` | `/admin/blog-comments` | `admin.blog-comments.index` | `Backend\BlogCommentController@index` | Moderate blog comments |
| `GET` | `/admin/subscribers` | `admin.subscribers.index` | `Backend\SubscribersController@index` | Newsletter subscriber list |
| `POST` | `/admin/subscribers-send-mail`| `admin.subscribers-send-mail` | `Backend\SubscribersController@sendMail` | Broadcast bulk email to subscribers |
| `GET` | `/admin/settings` | `admin.settings.index` | `Backend\SettingController@index` | Main platform settings tab |
| `PUT` | `/admin/generale-setting-update`| `admin.generale-setting-update`| `Backend\SettingController@generalSettingUpdate` | Site title, currency, timezone |
| `PUT` | `/admin/email-setting-update` | `admin.email-setting-update` | `Backend\SettingController@emailConfigSettingUpdate`| SMTP host, port, credentials |
| `PUT` | `/admin/logo-setting-update` | `admin.logo-setting-update` | `Backend\SettingController@logoSettingUpdate` | Header logo & favicon |
| `PUT` | `/admin/pusher-setting-update`| `admin.pusher-setting-update` | `Backend\SettingController@pusherSettingUpdate` | Pusher app key, secret, cluster |
| `GET` | `/admin/payment-settings` | `admin.payment-settings.index` | `Backend\PaymentSettingController@index` | Gateway credential panel |
| `Resource`| `/admin/paypal-setting` | `admin.paypal-setting.*` | `Backend\PaypalSettingController` | PayPal client ID & secret |
| `PUT` | `/admin/stripe-setting/{id}` | `admin.stripe-setting.update` | `Backend\StripeSettingController@update` | Stripe publishable & secret keys |
| `PUT` | `/admin/razorpay-setting/{id}` | `admin.razorpay-setting.update`| `Backend\RazorpaySettingController@update` | Razorpay key ID & secret |
| `PUT` | `/admin/cod-setting/{id}` | `admin.cod-setting.update` | `Backend\CodSettingController@update` | Cash on Delivery enable toggle |

---

## 🔐 5. Authentication & OAuth Routes (`routes/auth.php`)

| Method | URI | Route Name | Action | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/login` | `login` | `Auth\AuthenticatedSessionController@create` | Customer/Vendor login form |
| `POST` | `/login` | *(none)* | `Auth\AuthenticatedSessionController@store` | Authenticate session & route by role |
| `GET` | `/admin/login` | `admin.login` | `Backend\AdminController@login` | Dedicated admin login portal |
| `POST` | `/register` | `register` | `Auth\RegisteredUserController@store` | Register new user account |
| `POST` | `/logout` | `logout` | `Auth\AuthenticatedSessionController@destroy` | Destroy session & invalidate token |
| `GET` | `/forgot-password` | `password.request` | `Auth\PasswordResetLinkController@create` | Request password reset link |
| `POST` | `/forgot-password` | `password.email` | `Auth\PasswordResetLinkController@store` | Send reset link email |
| `GET` | `/reset-password/{token}` | `password.reset` | `Auth\NewPasswordController@create` | Password reset form |
| `POST` | `/reset-password` | `password.store` | `Auth\NewPasswordController@store` | Save new password |
| `GET` | `/google/redirect` | `google.redirect` | Closure (Socialite redirect) | Redirect to Google OAuth |
| `GET` | `/google/callback` | `google.callback` | `Auth\SocialLoginRegisterController@googlecallback` | Handle Google login callback |
| `GET` | `/github/redirect` | `github.redirect` | Closure (Socialite redirect) | Redirect to GitHub OAuth |
| `GET` | `/github/callback` | `github.callback` | `Auth\SocialLoginRegisterController@githubcallback` | Handle GitHub login callback |
| `GET` | `/facebook/redirect` | `facebook.redirect` | Closure (Socialite redirect) | Redirect to Facebook OAuth |
| `GET` | `/facebook/callback` | `facebook.callback` | `Auth\SocialLoginRegisterController@facebookcallback`| Handle Facebook login callback |
| `GET` | `/x/redirect` | `x.redirect` | Closure (Socialite redirect) | Redirect to Twitter/X OAuth |
| `GET` | `/x/callback` | `twitter.callback` | `Auth\SocialLoginRegisterController@twittercallback` | Handle Twitter/X login callback |

---

## 📡 6. WebSocket Broadcasting Channels (`routes/channels.php`)

| Channel Name | Channel Type | Authorization Callback Logic | Purpose |
| :--- | :--- | :--- | :--- |
| `message.{id}` | **Private Channel** | `(int) $user->id === (int) $id` | Verifies that the connected client is the intended message recipient before streaming real-time chats. |
