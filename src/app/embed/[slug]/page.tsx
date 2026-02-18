import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { brandsData } from "@/data/brands";
import { computeOpenStatus } from "@/lib/isOpenNow";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return brandsData.map((e) => ({ slug: e.brand.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = brandsData.find((e) => e.brand.slug === slug);
  if (!entry) return { title: "Not Found" };
  return {
    title: `Is ${entry.brand.name} Open? - Embed Widget`,
    robots: { index: false },
  };
}

export default async function EmbedPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = brandsData.find((e) => e.brand.slug === slug);
  if (!entry) notFound();

  const { brand, hours } = entry;
  const status = computeOpenStatus(hours, "America/New_York", brand.is24h);
  const isOpen = status.isOpen;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: transparent;
          }
          .widget {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid ${isOpen ? "rgba(24,242,142,0.25)" : "rgba(255,90,103,0.25)"};
            background: ${isOpen ? "rgba(24,242,142,0.05)" : "rgba(255,90,103,0.05)"};
            font-size: 14px;
            color: #e8e8e8;
            text-decoration: none;
            transition: opacity 0.15s;
            cursor: pointer;
          }
          .widget:hover { opacity: 0.85; }
          .emoji { font-size: 24px; flex-shrink: 0; }
          .info { flex: 1; min-width: 0; }
          .name { font-weight: 700; font-size: 15px; color: #fff; }
          .hours { font-size: 12px; color: #888; margin-top: 2px; }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            flex-shrink: 0;
            background: ${isOpen ? "rgba(24,242,142,0.15)" : "rgba(255,90,103,0.15)"};
            color: ${isOpen ? "#18f28e" : "#ff5a67"};
            border: 1px solid ${isOpen ? "rgba(24,242,142,0.3)" : "rgba(255,90,103,0.3)"};
          }
          .led {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: currentColor;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
          .powered {
            text-align: center;
            font-size: 10px;
            color: #555;
            margin-top: 6px;
          }
          .powered a { color: #555; text-decoration: none; }
          .powered a:hover { color: #888; }
        `}</style>
      </head>
      <body>
        <a
          href={`https://isopenow.com/brand/${brand.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="widget"
        >
          <span className="emoji">{brand.emoji || "🏪"}</span>
          <div className="info">
            <div className="name">{brand.name}</div>
            <div className="hours">{status.todayHours || "Hours vary by location"}</div>
          </div>
          <span className="badge">
            <span className="led" />
            {isOpen ? "Open" : "Closed"}
          </span>
        </a>
        <p className="powered">
          Powered by <a href="https://isopenow.com" target="_blank" rel="noopener noreferrer">isopenow.com</a>
        </p>
      </body>
    </html>
  );
}
