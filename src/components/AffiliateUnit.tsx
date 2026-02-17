import Link from "next/link";

interface Props {
  brandName: string;
  category: string | null;
  isOpen: boolean;
}

export default function AffiliateUnit({ brandName, category, isOpen }: Props) {
  const isFoodBrand = ["Fast Food", "Pizza", "Coffee", "Fast Casual"].includes(
    category || ""
  );
  const isRetailBrand = [
    "Retail",
    "Wholesale",
    "Home Improvement",
    "Pharmacy",
  ].includes(category || "");

  if (!isFoodBrand && !isRetailBrand) return null;

  const icon = isFoodBrand ? "🛵" : "🛒";
  const title = isFoodBrand
    ? isOpen
      ? `${brandName} too far? Order delivery`
      : `${brandName} is closed — order delivery instead`
    : isOpen
      ? `Shop ${brandName} online instead`
      : `${brandName} is closed — shop online now`;
  const sub = isFoodBrand
    ? "Uber Eats · Delivered in 20 min · Free on first order"
    : "Amazon · Same-day delivery available · Millions of products";
  const cta = isFoodBrand ? "Order now →" : "Shop now →";

  return (
    <Link
      href="#"
      className="bg-bg1 border border-border rounded-[14px] p-[18px] flex items-center gap-4 no-underline cursor-pointer transition-all hover:border-orange hover:-translate-y-px"
    >
      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-xl shrink-0" style={{ background: "var(--color-orange-dim)" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-semibold text-orange uppercase tracking-[0.1em] mb-0.5">
          Affiliate · {isFoodBrand ? "Uber Eats" : "Amazon"}
        </div>
        <div className="font-heading font-bold text-sm text-text">{title}</div>
        <div className="text-xs text-muted2">{sub}</div>
      </div>
      <div className="bg-orange text-black font-bold text-xs px-3.5 py-2 rounded-lg whitespace-nowrap shrink-0">
        {cta}
      </div>
    </Link>
  );
}
