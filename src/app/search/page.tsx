import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchPageClient from "@/components/SearchPageClient";

export const metadata: Metadata = {
  title: "Search Stores - IsItOpen",
  description:
    "Search a store, restaurant, or service and check if it is open now with real-time hours.",
  alternates: {
    canonical: "https://isopenow.com/search",
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
  },
};

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="page-pad" style={{ maxWidth: 848, paddingTop: 48, paddingBottom: 48 }}>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2 text-text">Search stores</h1>
          <p className="text-sm text-muted2 mb-8">
            Find any store, restaurant, or service and check if it is open right now.
          </p>
          <SearchPageClient />
        </div>
        <Footer />
      </div>
    </>
  );
}
