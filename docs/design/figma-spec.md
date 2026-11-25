# Figma implementation spec - "All Remaining Pages" / Details Page - Step 2

Source: Jewellery Website Design - Sanjay (page "All Remaining Pages - 17/10/2026", section "Details Page - Step 2"). Read-only review via screenshots; canvas is rendered, so copy is transcribed visually. Hex values were read only where the Figma side panel showed them; everything else is marked "approx".
Brand in Figma is "AureliaJewels" (placeholder). Our brand is **Sawariya Jewels** - replace everywhere (logo, footer, "Copy", #AureliaMoments, coupon code AURELIA10 etc.).

Frame list (each has a Desktop 1440 frame and a 390 mobile frame): Product detail, Cart drawer (x2), Shopping cart, Checkout Contact, Checkout Address, Checkout Delivery, Checkout UPI payment, Order confirmation, Track order, My Wishlist, State preview (x2: desktop 1440 wide x 8472 tall, and mobile). There is NO separate "Checkout Confirm" frame; the last checkout step is the UPI payment frame, followed by Order confirmation.

## 0. Global tokens (read/approx)

- Desktop frame width 1440, mobile 390. Frame fill white `#FFFFFF` (cart, checkout, product detail top); order confirmation / track order / state preview frame fill `#F8F3EA` (warm cream). Canvas bg `#101115`.
- Header/footer/dark blocks: deep aubergine/near-black brown (approx `#2A1A1E`; top announcement bar slightly darker, approx `#1A1214`). Footer same dark colour.
- Gold (primary CTA fill, active step dot, links, eyebrows): approx `#C9A24A`. Eyebrow text is small caps-style gold/brown (approx `#8A6A1F`).
- Text dark `#2A1A1E`-ish; muted grey for helper copy; success green approx `#2E8B57` (text "Valid mobile number", "You saved", "FREE"); error red approx `#C0392B` with pink-red input border and pale pink bg for banners.
- Fonts: serif display = Playfair Display (H1/H2/section headings, totals); sans = Poppins (body, labels, buttons). Scale approx: H1 checkout/track 36-40px Playfair; section H2 28-32px; card heading 20-24px; body 13-14px; caption/eyebrow 10-11px uppercase letterspaced.
- Buttons: primary = gold fill, dark text, ~44px high, radius ~2-4px (nearly square); secondary = white fill, 1px dark border, same size; dark button = aubergine fill, white text (Add to Cart, Move to Cart); text link = gold-brown underlined.
- Cards: white, 1px hairline border (cream/gold when active), radius ~2-4px; order-summary card cream `#F5F0E6`-ish with no border.
- Announcement bar text: "Free Shipping above ₹499".
- Main header (non-checkout): logo "AureliaJewels" (gold gem icon + serif wordmark), nav: Bangles, Necklace, Earrings, Rings, Bridal, Anklets & Others, Sale (Sale in red/pink); right: search icon, wishlist heart (badge), cart bag (badge), "Sign in" outlined pill (gold border).
- Checkout header (reduced): logo left, lock icon + "100% Secure Checkout" right, no nav.
- Footer (dark): logo + tagline "Elegant jewellery, affordable price. Handcrafted with love for the modern Indian woman." + links Instagram / Facebook / YouTube; columns Shop (Bangles, Necklace, Earrings, Rings, Bridal, Anklets & Others), Discover (New Arrivals, Bestsellers, Sale, Gift Cards), Help (Track Order, Shipping, Returns, Jewellery Care, Size Guide), Company (Our Story, Contact, Careers, Privacy, Terms); bottom "© 2026 AureliaJewels" and "UPI · VISA · Mastercard · RuPay · COD". Checkout footer is a light one-liner: "© 2026 AureliaJewels · All rights reserved" left, "Privacy · Returns · Terms · Need help?" right (gold links).

## 1. Shopping cart (Desktop 1440; frame H 2619)

Purpose: full cart page before checkout.
Blocks top to bottom:
1. Announcement bar + main header.
2. Breadcrumb/progress: "Cart > Address > Payment" (Cart active, gold dot).
3. H1 "Shopping Cart" (Playfair) and right-aligned "2 items".
4. Free-shipping banner (cream, gold bottom/left progress line): "You're ₹0 away from free shipping 🎉" (text varies: "You're ₹X away from free shipping").
5. Two columns: left ~ 2/3 line items, right ~ 1/3 "Order summary" card (sticky).
   - Line item card (white, hairline border): thumbnail ~90px, name "Swarnika Layered Gold Necklace", meta "Gold · 18 inches", stock note "In stock" (green) or "Only 2 left" (green/orange), price "₹2,499", struck MRP "₹3,499", qty stepper "- 1 +", links "Move to Wishlist" (left) and "Remove" (right, gold-brown). Second item "Gul Jhumkas", "Gold · One size", "Only 2 left", ₹1,499 / ₹2,999 (approx) .
   - Gift-wrap row (cream): checkbox "Make it a gift · Gift wrap +₹49" with gift icon at right. When ticked: textarea "Your personal message" (example "For all your beautiful moments, with love.") and total shows wrap +₹49.
   - Trust line: "7-Day Easy Returns · Anti-tarnish · Skin-safe & Nickel-free". Link "← Continue Shopping".
   - Order summary: H3 "Order summary"; label "Coupon code" + input (example AURELIA10) + outlined "Apply" button; applied chip (dashed border) "AURELIA10 · ₹200 off above ₹1,999"; green "AURELIA10 applied! ×" and "You saved ₹200". Rows: Original MRP (2 items) ₹5,498; Product discounts − ₹1,500 (green); Subtotal (selling price) ₹3,998; Coupon · AURELIA10 − ₹200 (green); Shipping FREE (green); Gift wrapping ₹0. Divider. "Total" (Playfair) "₹3,798", "Inclusive of all taxes", green "You save ₹1,700 on this order". Gold button "Proceed to Checkout". Payment strip "UPI · VISA · Mastercard · RuPay · COD" and "🔒 100% Secure Checkout".
6. Cream section "CURATED FOR YOU" eyebrow, H2 "Frequently bought together": 4 product cards (4-col): badge "Bestseller" (dark pill top-left), heart button top-right, image, name, "★ 4.8 · Verified reviews", price ₹2,499 + struck ₹3,499, dark full-width button "Add to Cart".
7. Dark footer.
Mobile (390): same blocks stacked; sticky bottom bar: "Total ₹3,798" + gold "Checkout" button; order summary appears below items; "Frequently bought together" becomes horizontal scroller.

## 2. Cart drawer (two frames, desktop shows drawer over dimmed page; mobile = full-height sheet)

Header "Your Cart (2)" with × close. Free-shipping line "You're ₹X away from free shipping" + progress bar. Compact line items (thumb, name, variant, price, qty stepper, "Move to Wishlist", "Remove"). Section "A little something extra" with 2 add-on mini cards (image, name, price, "+ Add" outlined button). Subtotal "₹3,998" with note "Shipping, taxes and offers calculated at checkout." Buttons: outlined "View Cart", gold "Checkout". Bottom toast (dark) "Added to cart · View Cart" with check. Empty and partial variants in state previews.

## 3. Checkout (shared layout, Desktop 1440; frame H ~1500)

Layout: reduced checkout header; eyebrow "SECURE CHECKOUT"; H1 "A few details. Then, a little sparkle."; step indicator text row: "Contact · Address · Delivery · Payment" (dot + label; completed steps "✓ Contact", active gold dot, future grey dot). Two columns: left accordion of 4 numbered cards (~630px), right "Order summary" cream card (~290px). Only the active step is expanded (gold 1px border, white); completed steps collapse to a card with dark circular ✓ badge, title, one-line summary, "Edit" link (gold) on the right; future steps collapse to numbered grey circle + title + helper line:
- 2 Address: "Choose where your jewellery should arrive."
- 3 Delivery: "Select a delivery service."
- 4 Payment: "Choose a secure payment method."

Order summary (all checkout screens): H3 "Order summary"; lines with thumbnail, name, "Qty 1 · ₹2,499", right-aligned qty "1"; green "AURELIA10 applied! ×" / "You saved ₹200"; Original MRP (2 items) ₹5,498; Product discounts − ₹1,500; Subtotal (selling price) ₹3,998; Coupon · AURELIA10 − ₹200; Shipping FREE; Gift wrapping ₹0; (UPI step adds "Prepaid 10% · rounded − ₹380"); Total ₹3,798 (₹3,418 after prepaid discount); "Inclusive of all taxes"; "You save ₹1,700 on this order" (₹2,080 with prepaid); "UPI · VISA · Mastercard · RuPay · COD"; "🔒 100% Secure Checkout".
Mobile: step row stays; collapsible bar "Show order summary (2) ⌄" with total ₹3,798 right under the stepper (UPI frame shows "Order summary expanded ⌃" ₹3,418); summary card also repeated at bottom; cards full width.

### 3a. Checkout Contact (step 1 active)
- Card title "1 Contact". Copy: "We'll send order updates to your email and WhatsApp."
- Field "Mobile number" (value "+91 98765 43210", valid state: green border + green text "Valid mobile number").
- Outlined button "Send OTP" (full width). (OTP sub-state in State previews, see 5.)
- Field "Email address · Guest checkout" (value priya.sharma@gmail.com).
- Line "Already have an account?" + link "Sign in" (right).
- Gold full-width button "Continue as Guest".
- Legal: "By continuing, you agree to our Terms and Privacy Policy." (links).
Behaviour: Send OTP -> OTP verification panel; Continue as Guest -> Address step; Sign in -> login.

### 3b. Checkout Address (step 2 active)
- Contact collapsed: "Priya Sharma · +91 98765 43210 · priya.sharma@gmail.com" + "Edit".
- Address card: radio list of saved addresses. Selected card (cream fill + gold border, gold radio): "Priya Sharma · Home", "Flat 402, Lotus Residency, 18 Marine Drive, Mumbai, Maharashtra 400001", "+91 98765 43210", link "Edit address". Unselected: "Priya Sharma · Work", "Aurelia Studio, 24 MG Road, Fort, Mumbai, Maharashtra 400001", phone, "Edit address".
- Outlined full-width "+ Add New Address"; gold full-width "Deliver Here".
- New-address form fields (State previews 5): Full name, Mobile (invalid error "Enter a valid 10-digit mobile number"), Pincode (valid, 400001), City / State (auto-filled "Mumbai / Maharashtra"), Flat / House, Area / Street, Landmark (optional), type chips "Home" / "Work", button "Save & Deliver Here" (disabled = pale gold until valid).

### 3c. Checkout Delivery (step 3 active)
- Contact and Address collapsed with Edit ("Home · Flat 402, Lotus Residency, 18 Marine Drive, Mumbai 400001").
- Radio options: "Standard delivery" - "FREE" (green) - "4–6 days · Arrives Thu, 22 Oct" (selected, cream + gold border); "Express delivery" - "₹99" - "1–2 days · Arrives Mon, 19 Oct".
- Note: "Orders are carefully packed in our signature gift box. Dispatch updates arrive by email and WhatsApp."
- Gold full-width "Continue to Payment".

### 3d. Checkout UPI payment (step 4 active; "Checkout UPI payment")
- Collapsed: Contact, Address, Delivery ("Standard delivery · FREE · Thu, 22 Oct") each with Edit.
- Payment card, accordion of methods (radio rows): 
  - "UPI" (selected, gold border) with green tag "Extra 10% off"; app chips "GPay" (selected) / "PhonePe" / "Paytm"; field "UPI ID" value "priya@okaxis", green "UPI ID verified"; helper "Approve the payment request in your UPI app. Prepaid savings: ₹380 (10%, rounded)."
  - "Credit / Debit Card" (expands to Card number, Name on card, Expiry (MM / YY), CVV; line "₹3,798 − prepaid 10% (rounded ₹380)"; button "Place Order · ₹3,418"; note "VISA · Mastercard · RuPay · Secure encrypted payment").
  - "Net Banking" (chevron, expandable), "Wallets" (chevron, expandable), "Cash on Delivery · +₹49" (info icon tooltip: "A ₹49 handling fee applies. The prepaid 10% offer does not apply.").
- Green banner "Prepaid offer applied · You save an extra ₹380."
- Gold full-width "Place Order · ₹3,418" (COD variant: "Place Order · ₹3,847"; express: "Continue · ₹3,897").
- Legal: "By placing your order, you agree to our Terms & Conditions. All payments are securely encrypted."

## 4. Order confirmation (Desktop 1440, H 3720, bg `#F8F3EA`)
Standard header with nav. Blocks: (1) gold circle check icon; eyebrow "A LITTLE SPARKLE IS ON ITS WAY"; H1 "Thank you, Anushka Sharma!" (mobile frame says "Thank you, Priya!" - inconsistent placeholder, use customer first name); "Your order #AJ20481 is confirmed." ; "We've sent the details to priya.sharma@gmail.com and your WhatsApp." (2) White delivery card: "Arriving by Thu, 22 Oct" (Playfair) with 4-step mini tracker Confirmed - Packed - Shipped - Delivered (first dot gold), buttons gold "Track Order" and outlined "Continue Shopping". (3) Two columns: left white "Your jewellery" card (items with thumb, name, "Gold · 18 inches · Qty 1", price) then "DELIVERING TO" (Priya Sharma, address, phone) and "PAYMENT" ("UPI · GPay", "priya@okaxis", green "₹3,418 paid successfully", "AURELIA10 · −₹200 · Prepaid · −₹380"); right cream "Order summary" with the price rows and Total ₹3,418, "You save ₹2,080 on this order", payment strip. (4) Dark banner: gift icon, H3 "Beautiful from the very first moment." "Every AureliaJewels piece comes in our signature gift box" / gold "Made to keep. Made to treasure. Made for you." with product image left. (5) Social block: image + eyebrow "#AURELIAMOMENTS", H3 "Your moments, beautifully adorned.", "Share your look #AureliaMoments on Instagram. We'd love to see how you make it yours." link "Find us on Instagram ↗". (6) Eyebrow "CURATED FOR YOU", H2 "You may also like", 4 product cards (as cart). (7) Footer. Mobile: single column, tracker full width, buttons stacked.

## 5. Track order (Desktop 1440, bg `#F8F3EA`)
Eyebrow "YOUR SPARKLE IS ON ITS WAY"; H1 "Track your order"; meta "Order #AJ20481 · 17 Oct 2026" left and status chip "● Shipped" (gold dot, gold-brown text) right. Two columns:
- Left white card: H3 "Arriving by Thu, 22 Oct"; vertical timeline (gold dots done, larger dot = current, faint dots = pending, thin connecting line): "Order confirmed" / "Sat, 17 Oct · 11:42 am" / "We've received your order."; "Packed with care" / "Sun, 18 Oct · 4:30 pm" / "Your jewellery is ready for its journey."; "Shipped" (current) / "Tue, 20 Oct · 9:15 am" / "Departed the Mumbai sorting centre."; "Out for delivery" / "Expected Thu, 22 Oct" / "Your courier will contact you."; "Delivered" / "Expected Thu, 22 Oct" / "A little sparkle, at your doorstep."
- Right column: white card eyebrow "COURIER PARTNER", name "Blue Dart", "AWB · 78491204816" (approx) + link "Copy AWB", outlined button "Track on courier website"; white card "Your jewellery" (items with "Gold · 18 inches · Qty 1" + price); dark card "Need help?" "We're here for you, Monday–Saturday, 10 am–7 pm." gold button "Chat with us", link "Call · +91 1800 204 910" (placeholder number).
Mobile: single column, order: header meta, timeline, courier, items, help card.

## 6. My Wishlist (Desktop 1440, white bg)
Breadcrumb "Home / Wishlist"; H1 "My Wishlist (4)"; right link "Share Wishlist ↗"; subtitle "The pieces you love, all in one beautiful place." 4-col grid of cards: top row "Saved to your wishlist" (small caption) + × remove; image with "Bestseller" pill and filled/outlined heart; name; "★ 4.8 · Verified reviews"; price ₹2,499 + struck ₹3,499 + green chip "Price dropped ₹200" (only on price-drop items); dark full-width "Move to Cart". Items: Swarnika Layered Gold Necklace ₹2,499, Gul Jhumkas ₹1,499, Meenakari Bangles ₹2,249, Gold Ring ₹999. Dark footer. Mobile: single column cards, same content.

## 7. State previews (verbatim)
Desktop frame "State preview" has eyebrow, heading, supporting copy and 4 groups. Static demo options chips: "Empty", "Out of stock", "Payment failed".

### 7.1 Empty and recovery surfaces (2-col grid of cards)
- EMPTY CART PAGE: box outline icon; "Your cart is empty"; "Looks like you haven't added anything yet. Let's find something you'll love."; gold "Start Shopping"; links "Bangles · Necklace · Earrings · Rings"; "4 favourites in your wishlist" + dark "Move to Cart"; label "Bestsellers" + 2 product tiles ("Swarnika Necklace · ₹2,499", "Gul Jhumkas · ₹1,499").
- EMPTY CART DRAWER: "Your Cart (0)" ×; same icon/heading/copy; gold "Start Shopping"; category links; "Your wishlist has 4 pieces waiting for you." outlined "Move to Cart"; 2 tiles.
- EMPTY WISHLIST: heart outline; "Your wishlist is empty"; "Tap ♡ on any piece to save it for later."; gold "Explore Collection"; "A few pieces you might love" + 2 tiles.
- NO SEARCH RESULTS: search icon; "No results for 'xyz'"; "Try checking the spelling or browse these instead."; label "Search jewellery" input (value xyz, gold focus border); "Popular searches · Gold necklace · Jhumkas · Bridal sets · Bangles"; "Trending now" + 2 tiles.
- MY ORDERS - NO ORDERS: bag icon; "No orders yet"; "Your first sparkle is waiting."; gold "Shop Now"; 2 tiles.
- PAYMENT FAILED: red circle "!" icon; "Payment didn't go through"; "No money was deducted. If it was, it'll be refunded in 5–7 days."; "UPI payment attempt · ₹3,418"; gold "Retry Payment"; outlined "Choose another method"; "Your cart is saved." + "Swarnika Necklace +1 · Gul Jhumkas +1".

### 7.2 Product alternatives
- OOS: "Swarnika Layered Gold Necklace", "₹2,499 · Sold Out", label "Email or WhatsApp number" (priya.sharma@gmail.com), outlined "Notify Me When Available", "We'll let you know when this piece returns.", "Similar pieces" + 2 tiles.
- PINCODE ERROR: "Check delivery", label "Delivery pincode" (value 110XXX, red border), error "Sorry, we don't deliver to 110XXX yet. Try another pincode.", outlined "Check another pincode".
- ZOOM MODAL: "A closer look" × ; large image; footer "− 200% · Product detail +".
- VIDEO PREVIEW: "Swarnika in motion" ×; poster image; "0:00 / 0:24"; "Static video poster · No playback".
- SIZE-GUIDE MODAL: "Find your perfect length"; "16 inches · At the collarbone", "18 inches · Just below the collarbone", "20 inches · A graceful longer drape"; "All pieces include a 2-inch extender. Measure around your neck, allowing two fingers of breathing room."; gold "18 inches selected".
- LOADING (PDP, cards, cart and summary): beige `#E9E1D5`-ish skeleton blocks (one large image block, 2 half blocks, rows).

### 7.3 Cart and feedback alternatives
- ADD BUTTON: Normal "Add to Cart" (cart badge 1) ; Loading "○ Adding…" ; Added "✓ Added" (badge becomes 2); green text "✓ Added to cart".
- TOASTS (dark bar, white text): "Added to cart" + gold link "View Cart"; "♥ Saved to wishlist" + "View"; "Item removed · Undo".
- PARTIAL FREE-SHIPPING DRAWER: "Your Cart (1)"; "Add ₹150 more for FREE shipping" + gold progress line; item image "Everyday Gold Studs · Gold · Qty 1"; "Subtotal ₹349"; "Alternate cart example · Offers and shipping calculated at checkout."; gold "Checkout".
- GIFT-WRAP MESSAGE: "✓ Make it a gift · +₹49"; label "Your personal message" textarea "For all your beautiful moments, with love."; "Subtotal ₹3,998 − coupon ₹200 + wrap ₹49"; "Total ₹3,847".
- COUPON: "Coupon code · Error" (FESTIVE20, red border) "This code has expired" , "No coupon discount · Total ₹3,998"; "Coupon code · Applied" (AURELIA10, green border) "AURELIA10 applied! You saved ₹200 ×"; "Total ₹3,798 · Remove coupon ×".
- UNAVAILABLE ITEM / NETWORK ERROR: greyed item image "Gul Jhumkas ×1 · ₹1,499"; red "This item is no longer available"; "Remove · Move to Wishlist"; disabled (pale gold) "Proceed to Checkout"; red helper "Remove the unavailable item before checking out."; pink error banner "Something went wrong. Check your connection and try again." + outlined "Retry".

### 7.4 Checkout alternatives
- CONTACT - OTP VERIFICATION: "We sent a 6-digit OTP to +91 98765 43210."; "Verification code" (gold focus border, value "4 8 1 2 6 0"); "Resend in 00:28 · Change mobile number"; gold "Verify & Continue".
- ADDRESS - ADD NEW AND FIELD STATES: see 3b (Full name focus, Mobile invalid "98765 432" red, Pincode valid, City/State auto-filled, Flat/House, Area/Street, Landmark (optional), chips Home/Work, disabled "Save & Deliver Here").
- CREDIT / DEBIT CARD PAYMENT: Card number (green border), Name on card "PRIYA SHARMA", Expiry "08 / 29", CVV (focused gold, masked), "₹3,798 − prepaid 10% (rounded ₹380)", gold "Place Order · ₹3,418", "VISA · Mastercard · RuPay · Secure encrypted payment".
- COD TOOLTIP AND EXPRESS DELIVERY: "Cash on Delivery · +₹49 ⓘ", "A ₹49 handling fee applies. The prepaid 10% offer does not apply.", "Standard shipping FREE · ₹3,798 + ₹49 COD", "Place Order · ₹3,847"; "Express delivery · ₹99", "1–2 days · Arrives Mon, 19 Oct", "Alternate delivery example · ₹3,798 + ₹99 shipping", "Continue · ₹3,897".
- Footer caption: "Each alternate state is static. Optional charges shown here are separate examples…" (truncated).

## 8. Product detail page (Desktop 1440, H 5137; frame children: Header, Product details, Styling and social proof, Footer)
1. Breadcrumb "Home / Necklace / Swarnika Layered Gold Necklace".
2. Gallery (left ~ 620px): vertical thumbnail rail (5 images + video tile with play icon "0:24"), main image ~ 4:5 with "Bestseller" dark pill top-left, heart button top-right, zoom (magnifier) button bottom-right; caption "A closer look at everyday heirlooms. ◇ View video · 0:24". Mobile: swipe carousel with dots, same overlay buttons.
3. Info (right): eyebrow "SWARNIKA COLLECTION"; H1 "Swarnika Layered Gold Necklace"; "★★★★★ 4.8 / 312 reviews" (link to reviews); price "₹2,499" + struck "₹3,499" + chip "29% off"; green "You save ₹1,000 (29%)"; "Inclusive of all taxes"; dashed cream offer box: "Extra 10% off on prepaid orders" + "Copy"; "Use code AURELIA10 – Get ₹200 off above ₹1,999" + "Copy code".
4. Options: "Finish: Gold" - 3 swatch tiles with labels "Gold" (selected, gold border), "Rose Gold", "Antique"; "Length: 18 inches" - chips "16 inches / 18 inches / 20 inches" (selected gold border) + link "Size guide" (opens size-guide modal); qty stepper "- 1 +"; buttons dark "Add to Cart", gold "Buy Now", square heart button.
5. "Check delivery pincode" input (value 400001, green border) + link "Check"; result green "Delivery by Thu, 22 Oct · Free shipping · COD available"; error state in 7.2.
6. Trust badges 2x2: "Anti-tarnish", "Skin-safe & Nickel-free", "7-Day Easy Returns", "Secure Payments".
7. Accordions (first open): "Product Details" (text: "Material: brass · 18K gold plating · Weight: 18 g. Necklace length: 18 inches, with a 2-inch extender. Pendant: 3 × 2 cm. Nickel-free, skin-safe finish."), "Care Guide", "Shipping & Returns", "Gift Wrapping" (+/- icons).
8. Mobile only: sticky bottom bar "₹2,499 | Add to Cart | Buy Now".
9. Dark section "BETTER TOGETHER" / "Complete the Look" / "Three timeless pieces, one unforgettable impression." model photo with 3 hotspots; list of 3 items (Swarnika Layered Gold Necklace ₹2,499, Gul Jhumkas ₹1,499, Meenakari Bangles ₹2,249) with checkboxes; "Complete Look total ₹6,247"; gold "Add All · ₹6,247".
10. Reviews (cream): eyebrow "LOVED, WORN, TREASURED"; H2 "A little sparkle. A lot of love."; big "4.8" + stars + "Based on 312 verified reviews"; rating bars 5-1; outlined "Write a Review"; 3 customer photos; filter chips "With photos", "5 ★ ⌄", "Most recent ⌄"; 3 review cards with ★★★★★, italic Playfair quote (e.g. "The quality is exceptional and the design feels truly heirloom…"), avatar, name + city, "✓ Verified buyer".
11. "CURATED FOR YOU" / "You may also like": 4 product cards. Then "Recently viewed": 4 smaller cards (image, name, price). Footer.

## 9. Category sections other than Bangles - NOT CAPTURED
Necklace, Earrings, Rings, Bridal, Anklets & Others, Sale sections were visible only as 9-14% zoom thumbnails (each section holds a listing page, filter drawer, size guide/other modals, mobile frames). Copy was unreadable and the tool budget was exhausted. Expect the same template as Bangles (banner eyebrow = category name uppercase, H1, tagline, chips, filters sidebar, 3-col grid, "Load more"); the Necklace section appears to include a length strip rather than ring/bangle sizes, and the Sale section has extra frames (looks like countdown/promo banners). Needs a follow-up pass.

## 10. Mobile specifics (from frames seen)
- Header: hamburger left, centered logo, cart bag with badge right (checkout: lock icon only); announcement bar remains on top.
- Checkout/cart: sticky bottom bar (cart: "Total ₹3,798 | Checkout"); collapsible order summary bar in checkout; cards full width with 16px gutters; footer collapses to 2-col link grid.
- Menu drawer, filter drawer and category mobile frames not captured.

## Implementation notes / ambiguities
1. Brand: replace "AureliaJewels" / "#AureliaMoments" / coupon "AURELIA10" with Sawariya Jewels equivalents; support line "+91 1800 204 910" and email are placeholders.
2. UPI: the Figma shows an in-page UPI ID + GPay/PhonePe/Paytm chips, plus card, net banking, wallets, COD. Our backend uses Razorpay Checkout, so render the method list as selection UI but hand off to Razorpay (or collapse to "Pay online / COD"). The "UPI ID verified" check and "Approve request in your UPI app" copy cannot be done natively.
3. Prepaid discount (10%, rounded) and COD fee (+₹49) are business rules not in our backend unless already modelled - confirm. Express delivery (₹99) and delivery dates ("Arrives Thu, 22 Oct") imply a shipping-options feature; our checkout service may only compute one shipping rate.
4. Contact step: OTP login/guest checkout (Mobile + OTP, "Continue as Guest") - backend may only have email/password auth; confirm before building OTP.
5. Gift wrap +₹49 with personal message, "Price dropped" chips, "Notify Me When Available", pincode check, "Complete the Look", "Recently viewed", "Share Wishlist", courier AWB tracking ("Blue Dart", "Copy AWB") may be absent from backend - treat as optional/stub.
6. Order confirmation has inconsistent placeholder names (Anushka vs Priya); order id format "#AJ20481" - use our order number format. Dates are Oct 2026 placeholders.
7. Hex values marked approx were estimated from screenshots; verify against the Figma Dev Mode / design tokens before pixel-matching. Only confirmed hexes: page fill `#F8F3EA`, white `#FFFFFF`, canvas `#101115`.
8. Not covered: category sections (necklace/earrings/rings/bridal/anklets/sale), mobile menu/filter drawers, and the second set of the cart-drawer details; the "Shopping cart" top block text "You're ₹0 away from free shipping" emoji was not legible.
