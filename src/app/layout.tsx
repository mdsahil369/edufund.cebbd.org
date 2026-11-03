import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { DemoProvider } from "@/lib/store/demo-store";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://edufund.cebbd.org"),
  title: {
    default: "EduFund CEBBD — Every student deserves a chance to dream",
    template: "%s | EduFund CEBBD",
  },
  description:
    "EduFund CEBBD connects generous supporters with financially disadvantaged students across Bangladesh, helping them continue their education with dignity and transparency.",
  keywords: [
    "EduFund CEBBD",
    "Community Empowerment Bangladesh",
    "student scholarship Bangladesh",
    "education crowdfunding",
    "donate to students",
    "diploma scholarship",
  ],
  authors: [{ name: "Community Empowerment Bangladesh" }],
  creator: "Community Empowerment Bangladesh",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://edufund.cebbd.org",
    siteName: "EduFund CEBBD",
    title: "EduFund CEBBD — Every student deserves a chance to dream",
    description:
      "Support financially disadvantaged students in Bangladesh to continue their education. Transparent, verified, and community-driven.",
    images: [
      {
        url: "/images/og-cover.png",
        width: 1200,
        height: 630,
        alt: "EduFund CEBBD — Every student deserves a chance to dream",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduFund CEBBD — Every student deserves a chance to dream",
    description:
      "Support financially disadvantaged students in Bangladesh to continue their education.",
    images: ["/images/og-cover.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#138B60",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-ink antialiased">
        <DemoProvider>
          <MotionConfig reducedMotion="user">
            <a
              href="#main-content"
              className="sr-only z-100 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              Skip to content
            </a>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </MotionConfig>
        </DemoProvider>
      </body>
    </html>
  );
}
