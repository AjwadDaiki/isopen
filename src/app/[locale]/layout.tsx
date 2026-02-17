import { notFound } from "next/navigation";
import { getNonEnglishLocales, LOCALES, type Locale } from "@/lib/i18n/translations";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return getNonEnglishLocales().map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale) || locale === "en") {
    notFound();
  }
  return <>{children}</>;
}
