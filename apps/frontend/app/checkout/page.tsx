"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatPrice } from "@/lib/format";
import type { Address } from "@/lib/types";
import { FormError } from "@/components/ui/Field";
import { PageLoader } from "@/components/ui/States";
import { AddressStep } from "@/components/checkout/AddressStep";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { ContactStep } from "@/components/checkout/ContactStep";
import { DeliveryStep } from "@/components/checkout/DeliveryStep";
import { Outcomes } from "@/components/checkout/Outcomes";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import type { PaymentChoice } from "@/components/checkout/PaymentStep";
import { CHECKOUT_STEPS, StepCard, StepIndicator } from "@/components/checkout/StepCard";
import { useCheckout } from "@/components/checkout/useCheckout";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useCartPricing } from "@/components/cart/useCartPricing";
import { usePricing } from "@/components/cart/usePricing";
import { usePincode } from "@/components/pincode/usePincode";

const HELPERS = ["", "Choose where your jewellery should arrive.", "Select a delivery service.", "Choose a secure payment method."];

const stateOf = (i: number, step: number) => (i < step ? "done" : i === step ? "active" : "future");

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [payment, setPayment] = useState<PaymentChoice>("COD");
  const [giftWrap, setGiftWrap] = useState(false);
  const { cart, pricing, loading, error, cartProblem, message, rules, setShippingRuleId, couponCode, shippingRuleId } = useCartPricing({ paymentMethod: payment, giftWrap });
  // A second preview for the other payment method (with gift wrap on) gives the hints shown on the options.
  const otherMethod: PaymentChoice = payment === "COD" ? "RAZORPAY" : "COD";
  const other = usePricing(cart.toApiItems(), { couponCode, shippingRuleId, paymentMethod: otherMethod, giftWrap: true, enabled: cart.items.length > 0 });
  const prefill = useMemo(() => ({ name: user?.name, email: user?.email }), [user?.name, user?.email]);
  const { outcome, busy, error: checkoutError, place, retryPayment, cancelUnpaid } = useCheckout({ clearCart: cart.clearCart, prefill });

  const addresses = useApi(async () => (await api.get<Address[]>("/user/addresses")).data, [], { enabled: !!user });
  const [step, setStep] = useState(0);
  const [chosenAddress, setChosenAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user && !outcome) router.replace("/login?next=/checkout");
  }, [authLoading, user, router, outcome]);

  // The shopper's choice, else the default (or first) saved address.
  const list = addresses.data ?? [];
  const addressId = list.some((a) => a.id === chosenAddress) ? chosenAddress : ((list.find((a) => a.isDefault) ?? list[0])?.id ?? chosenAddress);
  const address = list.find((a) => a.id === addressId);
  const pincode = usePincode(address?.zipCode);

  if (outcome) return <Outcomes outcome={outcome} busy={busy} error={checkoutError} onRetry={retryPayment} onCancel={cancelUnpaid} />;
  if (authLoading || !user) return <PageLoader label="Checking your session…" />;
  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4">
        <EmptyCart />
      </div>
    );
  }

  const onlineAvailable = !!pricing?.onlinePaymentAvailable;
  const codBlocked = pincode.status === "done" && pincode.result.configured && pincode.result.serviceable && !pincode.result.codAvailable;
  const unserviceable = pincode.status === "done" && pincode.result.configured && !pincode.result.serviceable;
  const method: PaymentChoice = onlineAvailable ? payment : "COD";
  const ready = !!pricing && !error && !!addressId && !unserviceable && !(codBlocked && method === "COD");
  const forMethod = (m: PaymentChoice) => (method === m ? pricing : other.pricing);
  const hints = {
    prepaidDiscount: forMethod("RAZORPAY")?.prepaidDiscount ?? 0,
    codFee: forMethod("COD")?.codFee ?? 0,
    giftWrapFee: (giftWrap ? pricing?.giftWrapFee : other.pricing?.giftWrapFee) ?? 0,
  };

  const onPlace = () => {
    if (!pricing || !addressId) return;
    void place({
      items: cart.toApiItems(),
      addressId,
      paymentMethod: method,
      couponCode: pricing.coupon?.code ?? (pricing.couponError ? undefined : couponCode),
      shippingRuleId: pricing.shippingRule?.id,
      giftWrap,
    });
  };

  const summaries = [
    <>
      {user.name} · {user.email}
      {user.phone ? ` · ${user.phone}` : ""}
    </>,
    address ? `${address.name} · ${address.address}, ${address.city} ${address.zipCode}` : "",
    pricing?.shippingRule ? `${pricing.shippingRule.name} · ${pricing.shippingRule.cost === 0 ? "FREE" : formatPrice(pricing.shippingRule.cost)}` : "",
    "",
  ];

  const bodies = [
    <ContactStep key="c" user={user} onContinue={() => setStep(1)} />,
    <AddressStep
      key="a"
      addresses={addresses.data}
      loading={addresses.loading}
      error={addresses.message}
      reload={addresses.reload}
      selectedId={addressId}
      onSelect={setChosenAddress}
      onContinue={() => setStep(2)}
      pincode={pincode}
      userName={user.name}
      userEmail={user.email}
    />,
    pricing ? <DeliveryStep key="d" rules={rules} pricing={pricing} onSelect={setShippingRuleId} onContinue={() => setStep(3)} /> : <PageLoader key="d" label="Calculating shipping…" className="py-10" />,
    <div key="p" className="space-y-3">
      <PaymentStep online={onlineAvailable} value={method} onChange={setPayment} onPlace={onPlace} placing={busy} total={pricing?.finalPayable ?? 0} disabled={!ready} codBlocked={codBlocked} hints={hints} giftWrap={giftWrap} onGiftWrap={setGiftWrap} />
      {unserviceable && <p role="alert" className="text-xs text-danger">We do not deliver to {address?.zipCode}. Choose a different address.</p>}
      {!ready && !unserviceable && <p className="text-xs text-ink/60">Choose a delivery address and make sure your cart has no problems to place the order.</p>}
    </div>,
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <header className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
          <Lock className="h-3.5 w-3.5" aria-hidden /> Secure checkout
        </p>
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">A few details. Then, a little sparkle.</h1>
      </header>
      <StepIndicator step={step} />

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            {message}{" "}
            {cartProblem && (
              <Link href="/cart" className="font-semibold underline">
                Review your cart
              </Link>
            )}
          </span>
        </div>
      )}
      <FormError message={checkoutError} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-4 lg:order-1 lg:col-span-8">
          {CHECKOUT_STEPS.map((title, i) => (
            <StepCard key={title} index={i} title={title} state={stateOf(i, step)} summary={summaries[i]} helper={HELPERS[i]} onEdit={() => setStep(i)}>
              {bodies[i]}
            </StepCard>
          ))}
        </div>
        <div className="order-first lg:order-2 lg:col-span-4">
          <CheckoutSummary pricing={pricing} loading={loading} />
        </div>
      </div>
    </div>
  );
}
