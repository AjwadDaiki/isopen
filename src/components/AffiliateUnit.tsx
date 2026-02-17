interface Props {
  brandName: string;
  category: string | null;
  isOpen: boolean;
}

export default function AffiliateUnit({ brandName, category, isOpen }: Props) {
  // Show delivery affiliate for food brands when open, shopping when retail
  const isFoodBrand = ["Fast Food", "Pizza", "Coffee", "Fast Casual"].includes(
    category || ""
  );
  const isRetailBrand = [
    "Retail",
    "Wholesale",
    "Home Improvement",
    "Pharmacy",
  ].includes(category || "");

  if (isFoodBrand) {
    return (
      <div className="bg-ink rounded-xl p-5 mb-4 flex items-center gap-5 cursor-pointer hover:-translate-y-0.5 transition-transform">
        <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-2xl shrink-0">
          🛵
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-bg mb-0.5">
            {isOpen
              ? `${brandName} too far? Order delivery`
              : `${brandName} is closed — order delivery instead`}
          </div>
          <div className="text-xs text-bg/50">
            Uber Eats · Delivered in 20 min · Free on first order
          </div>
          <div className="font-mono text-[8px] text-bg/30 uppercase tracking-wider mt-1">
            affiliate
          </div>
        </div>
        <button className="bg-green text-white border-none rounded-md px-3.5 py-2 font-semibold text-xs cursor-pointer whitespace-nowrap hover:bg-green/90">
          Order now →
        </button>
      </div>
    );
  }

  if (isRetailBrand) {
    return (
      <div className="bg-ink rounded-xl p-5 mb-4 flex items-center gap-5 cursor-pointer hover:-translate-y-0.5 transition-transform">
        <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-2xl shrink-0">
          🛒
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-bg mb-0.5">
            {isOpen
              ? `Shop ${brandName} online instead`
              : `${brandName} is closed — shop online now`}
          </div>
          <div className="text-xs text-bg/50">
            Amazon · Same-day delivery available · Millions of products
          </div>
          <div className="font-mono text-[8px] text-bg/30 uppercase tracking-wider mt-1">
            affiliate
          </div>
        </div>
        <button className="bg-green text-white border-none rounded-md px-3.5 py-2 font-semibold text-xs cursor-pointer whitespace-nowrap hover:bg-green/90">
          Shop now →
        </button>
      </div>
    );
  }

  return null;
}
