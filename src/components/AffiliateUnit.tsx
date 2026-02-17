interface Props {
  brandName: string;
  category: string | null;
  isOpen: boolean;
}

export default function AffiliateUnit({ brandName, category, isOpen }: Props) {
  const isFoodBrand = ["Fast Food", "Pizza", "Coffee", "Fast Casual"].includes(category || "");
  const isRetailBrand = ["Retail", "Wholesale", "Home Improvement", "Pharmacy"].includes(category || "");

  if (!isFoodBrand && !isRetailBrand) return null;

  const provider = isFoodBrand ? "Uber Eats" : "Amazon";
  const href = isFoodBrand ? "https://www.ubereats.com/" : "https://www.amazon.com/";
  const iconLabel = isFoodBrand ? "DLV" : "WEB";
  const title = isFoodBrand
    ? isOpen
      ? `${brandName} too far? Get delivery instead`
      : `${brandName} is closed. Order delivery instead`
    : isOpen
      ? `Prefer online shopping? Compare ${brandName} deals`
      : `${brandName} is closed. Shop online now`;
  const subtitle = isFoodBrand
    ? "Fast checkout, live tracking, and local delivery windows."
    : "Same-day options, wide inventory, and price comparisons.";
  const cta = isFoodBrand ? "Order now" : "Shop now";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="ui-panel no-underline overflow-hidden block transition-[border-color,transform,box-shadow] duration-200 hover:border-orange hover:-translate-y-px"
    >
      <div className="panel-body flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-bold tracking-[0.08em] text-orange shrink-0 bg-orange-dim border ui-border-orange-30">
          {iconLabel}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-orange uppercase tracking-[0.1em] mb-1.5">
            Sponsored - {provider}
          </div>
          <div className="font-heading font-bold text-[14px] md:text-[15px] text-text leading-snug">{title}</div>
          <div className="text-[12px] text-muted2 mt-1.5">{subtitle}</div>
        </div>

        <div className="bg-orange text-black font-bold text-[12px] px-4 py-2.5 rounded-xl whitespace-nowrap shrink-0">
          {cta}
        </div>
      </div>
    </a>
  );
}
