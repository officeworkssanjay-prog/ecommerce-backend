"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, MapPin, Package, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { AuthUser } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { AccountHeader, AccountPage } from "@/components/account/AccountHeader";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";

const LINKS = [
  { href: "/account/orders", label: "My orders", text: "Track and manage your purchases", icon: Package },
  { href: "/account/addresses", label: "Addresses", text: "Delivery addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", text: "Pieces you love", icon: Heart },
  { href: "/account/reviews", label: "Reviews", text: "Your product reviews", icon: Star },
];

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const profile = useApi(async () => (await api.get<AuthUser>("/user/profile")).data, [], { enabled: !!user });

  const signOut = async () => {
    try {
      await logout();
    } finally {
      router.push("/");
    }
  };

  return (
    <AccountPage>
      <AccountHeader
        title={user ? `Welcome, ${user.name}` : "My account"}
        description="Manage your profile, orders and saved details."
        action={
          <Button variant="outline" icon={<LogOut className="h-4 w-4" aria-hidden />} onClick={signOut}>
            Sign out
          </Button>
        }
      />

      <nav aria-label="Account sections" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map(({ href, label, text, icon: Icon }) => (
          <Link key={href} href={href} className="rounded-2xl border border-sand bg-white p-5 transition-colors hover:border-gold hover:bg-parchment/40">
            <Icon className="mb-3 h-6 w-6 text-gold-dark" aria-hidden />
            <p className="font-serif text-lg text-ink">{label}</p>
            <p className="text-xs text-ink/60">{text}</p>
          </Link>
        ))}
      </nav>

      {profile.loading && !profile.data ? (
        <PageLoader label="Loading your profile…" className="py-10" />
      ) : profile.error || !profile.data ? (
        <ErrorState message={profile.message} onRetry={profile.reload} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileForm profile={profile.data} />
          <PasswordForm />
        </div>
      )}
    </AccountPage>
  );
}
