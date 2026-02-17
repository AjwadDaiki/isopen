export interface BrandData {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  emoji: string | null;
  logoUrl: string | null;
  website: string | null;
  is24h: boolean;
}

export interface HoursData {
  dayOfWeek: number;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
  spansMidnight: boolean;
}

export interface OpenStatus {
  isOpen: boolean;
  reason: "open" | "closed_today" | "holiday" | "closed_hours" | "24h";
  holidayName?: string;
  opensAt: string | null;
  closesAt: string | null;
  closesIn: string | null;
  opensIn: string | null;
  localTime: string;
  timezone: string;
  todayHours: string | null;
}

export interface BrandPageData {
  brand: BrandData;
  status: OpenStatus;
  weeklyHours: HoursData[];
  relatedBrands: BrandData[];
}
