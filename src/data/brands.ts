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
  // --- 30 new brands ---
  {
    brand: { id: "trader-joes", slug: "trader-joes", name: "Trader Joe's", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.traderjoes.com", is24h: false },
    hours: weekHours("08:00", "21:00", "08:00", "21:00", "08:00", "21:00"),
  },
  {
    brand: { id: "whole-foods", slug: "whole-foods", name: "Whole Foods", category: "Grocery", emoji: "🥑", logoUrl: null, website: "https://www.wholefoodsmarket.com", is24h: false },
    hours: weekHours("08:00", "22:00", "08:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: { id: "panera-bread", slug: "panera-bread", name: "Panera Bread", category: "Fast Casual", emoji: "🥖", logoUrl: null, website: "https://www.panerabread.com", is24h: false },
    hours: weekHours("07:00", "21:00", "07:00", "21:00", "08:00", "20:00"),
  },
  {
    brand: { id: "five-guys", slug: "five-guys", name: "Five Guys", category: "Fast Food", emoji: "🍔", logoUrl: null, website: "https://www.fiveguys.com", is24h: false },
    hours: weekHours("11:00", "22:00", "11:00", "22:00", "11:00", "22:00"),
  },
  {
    brand: { id: "popeyes", slug: "popeyes", name: "Popeyes", category: "Fast Food", emoji: "🍗", logoUrl: null, website: "https://www.popeyes.com", is24h: false },
    hours: weekHours("10:30", "22:00", "10:30", "23:00", "10:30", "22:00", { fridayClose: "23:00" }),
  },
  {
    brand: { id: "sonic-drive-in", slug: "sonic-drive-in", name: "Sonic Drive-In", category: "Fast Food", emoji: "🌭", logoUrl: null, website: "https://www.sonicdrivein.com", is24h: false },
    hours: weekHours("06:00", "23:00", "06:00", "00:00", "06:00", "23:00", { fridayClose: "00:00", spansMidnight: [5, 6] }),
  },
  {
    brand: { id: "dairy-queen", slug: "dairy-queen", name: "Dairy Queen", category: "Fast Food", emoji: "🍦", logoUrl: null, website: "https://www.dairyqueen.com", is24h: false },
    hours: weekHours("10:30", "22:00", "10:30", "22:00", "10:30", "21:00"),
  },
  {
    brand: { id: "papa-johns", slug: "papa-johns", name: "Papa John's", category: "Pizza", emoji: "🍕", logoUrl: null, website: "https://www.papajohns.com", is24h: false },
    hours: weekHours("10:00", "00:00", "10:00", "00:00", "10:00", "00:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "little-caesars", slug: "little-caesars", name: "Little Caesars", category: "Pizza", emoji: "🍕", logoUrl: null, website: "https://www.littlecaesars.com", is24h: false },
    hours: weekHours("11:00", "22:00", "11:00", "22:00", "11:00", "22:00"),
  },
  {
    brand: { id: "panda-express", slug: "panda-express", name: "Panda Express", category: "Fast Food", emoji: "🥡", logoUrl: null, website: "https://www.pandaexpress.com", is24h: false },
    hours: weekHours("10:00", "21:30", "10:00", "22:00", "10:00", "21:30", { fridayClose: "22:00" }),
  },
  {
    brand: { id: "wingstop", slug: "wingstop", name: "Wingstop", category: "Fast Food", emoji: "🍗", logoUrl: null, website: "https://www.wingstop.com", is24h: false },
    hours: weekHours("11:00", "23:00", "11:00", "00:00", "11:00", "23:00", { fridayClose: "00:00", spansMidnight: [5, 6] }),
  },
  {
    brand: { id: "ihop", slug: "ihop", name: "IHOP", category: "Fast Food", emoji: "🥞", logoUrl: null, website: "https://www.ihop.com", is24h: false },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "07:00", "22:00"),
  },
  {
    brand: { id: "dennys", slug: "dennys", name: "Denny's", category: "Fast Food", emoji: "🍳", logoUrl: null, website: "https://www.dennys.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "waffle-house", slug: "waffle-house", name: "Waffle House", category: "Fast Food", emoji: "🧇", logoUrl: null, website: "https://www.wafflehouse.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "aldi", slug: "aldi", name: "Aldi", category: "Grocery", emoji: "🏪", logoUrl: null, website: "https://www.aldi.us", is24h: false },
    hours: weekHours("09:00", "20:00", "09:00", "20:00", "09:00", "20:00"),
  },
  {
    brand: { id: "kroger", slug: "kroger", name: "Kroger", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.kroger.com", is24h: false },
    hours: weekHours("06:00", "23:00", "06:00", "23:00", "06:00", "23:00"),
  },
  {
    brand: { id: "safeway", slug: "safeway", name: "Safeway", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.safeway.com", is24h: false },
    hours: weekHours("06:00", "23:00", "06:00", "23:00", "06:00", "23:00"),
  },
  {
    brand: { id: "publix", slug: "publix", name: "Publix", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.publix.com", is24h: false },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "07:00", "21:00"),
  },
  {
    brand: { id: "7-eleven", slug: "7-eleven", name: "7-Eleven", category: "Convenience", emoji: "🏪", logoUrl: null, website: "https://www.7-eleven.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "dollar-general", slug: "dollar-general", name: "Dollar General", category: "Retail", emoji: "💲", logoUrl: null, website: "https://www.dollargeneral.com", is24h: false },
    hours: weekHours("08:00", "22:00", "08:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: { id: "dollar-tree", slug: "dollar-tree", name: "Dollar Tree", category: "Retail", emoji: "🌳", logoUrl: null, website: "https://www.dollartree.com", is24h: false },
    hours: weekHours("08:00", "21:00", "08:00", "21:00", "09:00", "21:00"),
  },
  {
    brand: { id: "bath-body-works", slug: "bath-body-works", name: "Bath & Body Works", category: "Retail", emoji: "🛁", logoUrl: null, website: "https://www.bathandbodyworks.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "10:00", "18:00"),
  },
  {
    brand: { id: "best-buy", slug: "best-buy", name: "Best Buy", category: "Electronics", emoji: "💻", logoUrl: null, website: "https://www.bestbuy.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "19:00"),
  },
  {
    brand: { id: "gamestop", slug: "gamestop", name: "GameStop", category: "Electronics", emoji: "🎮", logoUrl: null, website: "https://www.gamestop.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  {
    brand: { id: "autozone", slug: "autozone", name: "AutoZone", category: "Auto", emoji: "🔧", logoUrl: null, website: "https://www.autozone.com", is24h: false },
    hours: weekHours("07:30", "22:00", "07:30", "22:00", "08:00", "21:00"),
  },
  {
    brand: { id: "bank-of-america", slug: "bank-of-america", name: "Bank of America", category: "Banking", emoji: "🏦", logoUrl: null, website: "https://www.bankofamerica.com", is24h: false },
    hours: weekHours("09:00", "17:00", "09:00", "13:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "chase-bank", slug: "chase-bank", name: "Chase Bank", category: "Banking", emoji: "🏦", logoUrl: null, website: "https://www.chase.com", is24h: false },
    hours: weekHours("09:00", "17:00", "09:00", "13:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "ups-store", slug: "ups-store", name: "UPS Store", category: "Shipping", emoji: "📦", logoUrl: null, website: "https://www.theupsstore.com", is24h: false },
    hours: weekHours("08:00", "18:30", "09:00", "15:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "fedex-office", slug: "fedex-office", name: "FedEx Office", category: "Shipping", emoji: "📬", logoUrl: null, website: "https://www.fedex.com/en-us/office.html", is24h: false },
    hours: weekHours("08:00", "20:00", "09:00", "18:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "planet-fitness", slug: "planet-fitness", name: "Planet Fitness", category: "Gym", emoji: "💪", logoUrl: null, website: "https://www.planetfitness.com", is24h: false },
    hours: weekHours("05:00", "23:00", "07:00", "21:00", "07:00", "21:00"),
  },
];

// Saturday closed for stock market (safe lookup by slug)
const stockMarket = brandsData.find((b) => b.brand.slug === "stock-market");
if (stockMarket) {
  stockMarket.hours[6] = {
    dayOfWeek: 6,
    openTime: null,
    closeTime: null,
    isClosed: true,
    spansMidnight: false,
  };
}

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
