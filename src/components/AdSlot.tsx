interface Props {
  size: "728x90" | "300x250" | "300x600";
  position: string;
}

export default function AdSlot({ size, position }: Props) {
  const [w, h] = size.split("x").map(Number);

  const heightClass =
    h === 90 ? "h-[90px]" : h === 250 ? "h-[250px]" : "h-[600px]";

  const widthClass = w === 300 ? "w-[300px]" : "w-full";

  return (
    <div className="my-6">
      <span className="block text-center font-mono text-[9px] uppercase tracking-[0.12em] text-ink3/60 mb-1">
        advertisement
      </span>
      <div
        className={`${widthClass} ${heightClass} mx-auto bg-[#f0ede5] border border-dashed border-ink/15 rounded-lg flex flex-col items-center justify-center relative overflow-hidden`}
      >
        {/* Diagonal stripe pattern */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(26,22,18,0.02) 8px, rgba(26,22,18,0.02) 9px)",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="font-mono text-sm text-ink3">📢 {size}</div>
          <div className="font-mono text-[11px] text-ink3 mt-1">{position}</div>
        </div>
      </div>
    </div>
  );
}
