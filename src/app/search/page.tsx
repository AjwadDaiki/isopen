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
        <div className="page-pad pt-12 pb-14">
          <div className="mx-auto w-full max-w-[920px] content-stack">
            <section className="ui-panel overflow-hidden">
              <div className="panel-body-lg">
                <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-text">Search stores</h1>
                <p className="text-sm text-muted2 mt-3">
                  Find any store, restaurant, or service and check if it is open right now.
                </p>
              </div>
            </section>

            <section className="ui-panel overflow-hidden">
              <div className="panel-body">
                <SearchPageClient />
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
