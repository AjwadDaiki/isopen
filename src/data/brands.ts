import type { BrandData, HoursData } from "@/lib/types";

export interface BrandWithHours {
  brand: BrandData;
  hours: HoursData[];
}

// Helper: create standard week hours
function weekHours(
  weekdayOpen: string,
  weekdayClose: string,
  satOpen: string,
  satClose: string,
  sunOpen: string,
  sunClose: string,
  options?: {
    fridayClose?: string;
    spansMidnight?: number[]; // days that span midnight
    sundayClosed?: boolean;
  }
): HoursData[] {
  const days: HoursData[] = [];
  for (let d = 0; d <= 6; d++) {
    let open: string;
    let close: string;
    let isClosed = false;

    if (d === 0) {
      // Sunday
      if (options?.sundayClosed) {
        isClosed = true;
        open = sunOpen;
        close = sunClose;
      } else {
        open = sunOpen;
        close = sunClose;
      }
    } else if (d === 6) {
      // Saturday
      open = satOpen;
      close = satClose;
    } else if (d === 5 && options?.fridayClose) {
      // Friday
      open = weekdayOpen;
      close = options.fridayClose;
    } else {
      // Mon-Thu (and Fri if no override)
      open = weekdayOpen;
      close = weekdayClose;
    }

    days.push({
      dayOfWeek: d,
      openTime: isClosed ? null : open,
      closeTime: isClosed ? null : close,
      isClosed,
      spansMidnight: options?.spansMidnight?.includes(d) ?? false,
    });
  }
  return days;
}

export const brandsData: BrandWithHours[] = [
  {
    brand: {
      id: "mcdonalds",
      slug: "mcdonalds",
      name: "McDonald's",
      category: "Fast Food",
      emoji: "🍟",
      logoUrl: null,
      website: "https://www.mcdonalds.com",
      is24h: false,
    },
    hours: weekHours("06:00", "23:00", "07:00", "01:00", "07:00", "22:00", {
      fridayClose: "01:00",
      spansMidnight: [5, 6],
    }),
  },
  {
    brand: {
      id: "walmart",
      slug: "walmart",
      name: "Walmart",
      category: "Retail",
      emoji: "🏪",
      logoUrl: null,
      website: "https://www.walmart.com",
      is24h: false,
    },
    hours: weekHours("06:00", "23:00", "06:00", "23:00", "06:00", "23:00"),
  },
  {
    brand: {
      id: "starbucks",
      slug: "starbucks",
      name: "Starbucks",
      category: "Coffee",
      emoji: "☕",
      logoUrl: null,
      website: "https://www.starbucks.com",
      is24h: false,
    },
    hours: weekHours("05:00", "21:00", "05:30", "21:00", "06:00", "20:00"),
  },
  {
    brand: {
      id: "costco",
      slug: "costco",
      name: "Costco",
      category: "Wholesale",
      emoji: "🛒",
      logoUrl: null,
      website: "https://www.costco.com",
      is24h: false,
    },
    hours: weekHours("10:00", "20:30", "09:30", "18:00", "10:00", "18:00", {
      sundayClosed: false,
    }),
  },
  {
    brand: {
      id: "target",
      slug: "target",
      name: "Target",
      category: "Retail",
      emoji: "🎯",
      logoUrl: null,
      website: "https://www.target.com",
      is24h: false,
    },
    hours: weekHours("08:00", "22:00", "08:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: {
      id: "burger-king",
      slug: "burger-king",
      name: "Burger King",
      category: "Fast Food",
      emoji: "🍔",
      logoUrl: null,
      website: "https://www.bk.com",
      is24h: false,
    },
    hours: weekHours("06:00", "23:00", "06:00", "00:00", "07:00", "22:00", {
      fridayClose: "00:00",
      spansMidnight: [5, 6],
    }),
  },
  {
    brand: {
      id: "taco-bell",
      slug: "taco-bell",
      name: "Taco Bell",
      category: "Fast Food",
      emoji: "🌮",
      logoUrl: null,
      website: "https://www.tacobell.com",
      is24h: false,
    },
    hours: weekHours("07:00", "01:00", "07:00", "02:00", "07:00", "00:00", {
      spansMidnight: [1, 2, 3, 4, 5, 6],
    }),
  },
  {
    brand: {
      id: "kfc",
      slug: "kfc",
      name: "KFC",
      category: "Fast Food",
      emoji: "🍗",
      logoUrl: null,
      website: "https://www.kfc.com",
      is24h: false,
    },
    hours: weekHours("10:30", "22:00", "10:30", "23:00", "10:30", "21:00"),
  },
  {
    brand: {
      id: "subway",
      slug: "subway",
      name: "Subway",
      category: "Fast Food",
      emoji: "🥗",
      logoUrl: null,
      website: "https://www.subway.com",
      is24h: false,
    },
    hours: weekHours("07:00", "22:00", "08:00", "22:00", "09:00", "21:00"),
  },
  {
    brand: {
      id: "dominos",
      slug: "dominos",
      name: "Domino's",
      category: "Pizza",
      emoji: "🍕",
      logoUrl: null,
      website: "https://www.dominos.com",
      is24h: false,
    },
    hours: weekHours("10:30", "00:00", "10:30", "01:00", "10:30", "00:00", {
      spansMidnight: [1, 2, 3, 4, 5, 6, 0],
    }),
  },
  {
    brand: {
      id: "cvs",
      slug: "cvs",
      name: "CVS Pharmacy",
      category: "Pharmacy",
      emoji: "💊",
      logoUrl: null,
      website: "https://www.cvs.com",
      is24h: false,
    },
    hours: weekHours("08:00", "22:00", "08:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: {
      id: "walgreens",
      slug: "walgreens",
      name: "Walgreens",
      category: "Pharmacy",
      emoji: "🏥",
      logoUrl: null,
      website: "https://www.walgreens.com",
      is24h: false,
    },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: {
      id: "home-depot",
      slug: "home-depot",
      name: "The Home Depot",
      category: "Home Improvement",
      emoji: "🔨",
      logoUrl: null,
      website: "https://www.homedepot.com",
      is24h: false,
    },
    hours: weekHours("06:00", "22:00", "06:00", "22:00", "08:00", "20:00"),
  },
  {
    brand: {
      id: "lowes",
      slug: "lowes",
      name: "Lowe's",
      category: "Home Improvement",
      emoji: "🪛",
      logoUrl: null,
      website: "https://www.lowes.com",
      is24h: false,
    },
    hours: weekHours("06:00", "22:00", "06:00", "22:00", "08:00", "20:00"),
  },
  {
    brand: {
      id: "chick-fil-a",
      slug: "chick-fil-a",
      name: "Chick-fil-A",
      category: "Fast Food",
      emoji: "🐔",
      logoUrl: null,
      website: "https://www.chick-fil-a.com",
      is24h: false,
    },
    hours: weekHours("06:30", "22:00", "06:30", "22:00", "00:00", "00:00", {
      sundayClosed: true,
    }),
  },
  {
    brand: {
      id: "wendys",
      slug: "wendys",
      name: "Wendy's",
      category: "Fast Food",
      emoji: "🍔",
      logoUrl: null,
      website: "https://www.wendys.com",
      is24h: false,
    },
    hours: weekHours("06:30", "00:00", "06:30", "01:00", "06:30", "23:00", {
      spansMidnight: [1, 2, 3, 4, 5, 6],
    }),
  },
  {
    brand: {
      id: "chipotle",
      slug: "chipotle",
      name: "Chipotle",
      category: "Fast Casual",
      emoji: "🌯",
      logoUrl: null,
      website: "https://www.chipotle.com",
      is24h: false,
    },
    hours: weekHours("10:45", "23:00", "10:45", "23:00", "10:45", "23:00"),
  },
  {
    brand: {
      id: "post-office",
      slug: "post-office",
      name: "Post Office (USPS)",
      category: "Government",
      emoji: "📮",
      logoUrl: null,
      website: "https://www.usps.com",
      is24h: false,
    },
    hours: weekHours("09:00", "17:00", "09:00", "13:00", "00:00", "00:00", {
      sundayClosed: true,
    }),
  },
  {
    brand: {
      id: "stock-market",
      slug: "stock-market",
      name: "Stock Market (NYSE)",
      category: "Financial",
      emoji: "📈",
      logoUrl: null,
      website: "https://www.nyse.com",
      is24h: false,
    },
    hours: weekHours("09:30", "16:00", "00:00", "00:00", "00:00", "00:00", {
      sundayClosed: true,
    }),
  },
  {
    brand: {
      id: "dunkin",
      slug: "dunkin",
      name: "Dunkin'",
      category: "Coffee",
      emoji: "🍩",
      logoUrl: null,
      website: "https://www.dunkindonuts.com",
      is24h: false,
    },
    hours: weekHours("05:00", "22:00", "05:00", "22:00", "06:00", "21:00"),
  },
];

// Saturday closed for stock market
brandsData[18].hours[6] = {
  dayOfWeek: 6,
  openTime: null,
  closeTime: null,
  isClosed: true,
  spansMidnight: false,
};

export function getBrandBySlug(slug: string): BrandWithHours | undefined {
  return brandsData.find((b) => b.brand.slug === slug);
}

export function getBrandsByCategory(category: string): BrandData[] {
  return brandsData
    .filter((b) => b.brand.category === category)
    .map((b) => b.brand);
}

export function getRelatedBrands(
  currentSlug: string,
  category: string | null,
  limit = 6
): BrandData[] {
  return brandsData
    .filter((b) => b.brand.slug !== currentSlug)
    .filter((b) => (category ? b.brand.category === category : true))
    .slice(0, limit)
    .map((b) => b.brand);
}

export function getAllBrandSlugs(): string[] {
  return brandsData.map((b) => b.brand.slug);
}
