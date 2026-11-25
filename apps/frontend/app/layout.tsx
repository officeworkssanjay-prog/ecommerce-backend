import type { Metadata } from "next";
import { Geist_Mono, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FeedbackProvider } from "@/components/ui/Feedback";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { HideOnAdmin } from "@/components/HideOnAdmin";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Sawariya Jewels | Fine Handcrafted Jewellery", template: "%s | Sawariya Jewels" },
  description: "Discover handcrafted gold, kundan, polki, diamond jewellery and bridal sets from master karigars.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <AuthProvider>
          <CartProvider>
            <FeedbackProvider>
              <HideOnAdmin>
                <AnnouncementBar />
                <Navbar />
              </HideOnAdmin>
              <main className="flex flex-1 flex-col">{children}</main>
              <HideOnAdmin>
                <CartDrawer />
                <Footer />
              </HideOnAdmin>
            </FeedbackProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
