import { notFound } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/translations";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  // Only generate for non-English locales (English is the root)
  return LOCALES.filter((l) => l !== "en").map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale) || locale === "en") {
    notFound();
  }
  return <>{children}</>;
}
