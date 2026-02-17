interface Props {
  size: "728x90" | "300x250" | "300x600";
  id?: string;
}

/**
 * Ad slot placeholder — invisible in dev, will be replaced by real AdSense
 * units in production. Just reserves the space with a minimal label.
 */
export default function AdSlot({ size, id }: Props) {
  const [w, h] = size.split("x").map(Number);

  return (
    <div
      id={id}
      className="my-4"
      style={{ maxWidth: w, width: "100%" }}
    >
      {/* Will be replaced by AdSense auto-ads or manual units */}
      <div
        className="bg-bg2/50 rounded-lg flex items-center justify-center"
        style={{ height: h, maxWidth: w }}
      >
        <span className="font-mono text-[9px] text-ink3/30 uppercase tracking-widest">
          ad {size}
        </span>
      </div>
    </div>
  );
}
