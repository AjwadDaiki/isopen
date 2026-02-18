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
  // --- 70 more brands ---
  // Grocery
  {
    brand: { id: "heb", slug: "heb", name: "H-E-B", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.heb.com", is24h: false },
    hours: weekHours("06:00", "23:00", "06:00", "23:00", "06:00", "23:00"),
  },
  {
    brand: { id: "wegmans", slug: "wegmans", name: "Wegmans", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.wegmans.com", is24h: false },
    hours: weekHours("06:00", "00:00", "06:00", "00:00", "06:00", "00:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "winco-foods", slug: "winco-foods", name: "WinCo Foods", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.wincofoods.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "food-lion", slug: "food-lion", name: "Food Lion", category: "Grocery", emoji: "🦁", logoUrl: null, website: "https://www.foodlion.com", is24h: false },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "07:00", "22:00"),
  },
  {
    brand: { id: "giant-eagle", slug: "giant-eagle", name: "Giant Eagle", category: "Grocery", emoji: "🦅", logoUrl: null, website: "https://www.gianteagle.com", is24h: false },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "07:00", "22:00"),
  },
  {
    brand: { id: "meijer", slug: "meijer", name: "Meijer", category: "Grocery", emoji: "🛒", logoUrl: null, website: "https://www.meijer.com", is24h: false },
    hours: weekHours("06:00", "00:00", "06:00", "00:00", "06:00", "00:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "piggly-wiggly", slug: "piggly-wiggly", name: "Piggly Wiggly", category: "Grocery", emoji: "🐷", logoUrl: null, website: "https://www.pigglywiggly.com", is24h: false },
    hours: weekHours("07:00", "21:00", "07:00", "21:00", "07:00", "21:00"),
  },
  {
    brand: { id: "save-a-lot", slug: "save-a-lot", name: "Save-A-Lot", category: "Grocery", emoji: "💰", logoUrl: null, website: "https://www.savealot.com", is24h: false },
    hours: weekHours("08:00", "20:00", "08:00", "20:00", "08:00", "20:00"),
  },
  // Fast Food
  {
    brand: { id: "jack-in-the-box", slug: "jack-in-the-box", name: "Jack in the Box", category: "Fast Food", emoji: "🍔", logoUrl: null, website: "https://www.jackinthebox.com", is24h: false },
    hours: weekHours("06:00", "00:00", "06:00", "02:00", "06:00", "00:00", { fridayClose: "02:00", spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "arbys", slug: "arbys", name: "Arby's", category: "Fast Food", emoji: "🥩", logoUrl: null, website: "https://www.arbys.com", is24h: false },
    hours: weekHours("10:00", "22:00", "10:00", "22:00", "10:00", "22:00"),
  },
  {
    brand: { id: "carls-jr", slug: "carls-jr", name: "Carl's Jr.", category: "Fast Food", emoji: "⭐", logoUrl: null, website: "https://www.carlsjr.com", is24h: false },
    hours: weekHours("06:00", "23:00", "06:00", "00:00", "06:00", "23:00", { fridayClose: "00:00", spansMidnight: [5, 6] }),
  },
  {
    brand: { id: "hardees", slug: "hardees", name: "Hardee's", category: "Fast Food", emoji: "⭐", logoUrl: null, website: "https://www.hardees.com", is24h: false },
    hours: weekHours("06:00", "22:00", "06:00", "22:00", "07:00", "22:00"),
  },
  {
    brand: { id: "zaxbys", slug: "zaxbys", name: "Zaxby's", category: "Fast Food", emoji: "🍗", logoUrl: null, website: "https://www.zaxbys.com", is24h: false },
    hours: weekHours("10:30", "22:00", "10:30", "22:00", "10:30", "22:00"),
  },
  {
    brand: { id: "raising-canes", slug: "raising-canes", name: "Raising Cane's", category: "Fast Food", emoji: "🐔", logoUrl: null, website: "https://www.raisingcanes.com", is24h: false },
    hours: weekHours("10:00", "23:00", "10:00", "00:00", "10:00", "23:00", { fridayClose: "00:00", spansMidnight: [5, 6] }),
  },
  {
    brand: { id: "whataburger", slug: "whataburger", name: "Whataburger", category: "Fast Food", emoji: "🍔", logoUrl: null, website: "https://www.whataburger.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "in-n-out-burger", slug: "in-n-out-burger", name: "In-N-Out Burger", category: "Fast Food", emoji: "🍔", logoUrl: null, website: "https://www.in-n-out.com", is24h: false },
    hours: weekHours("10:30", "01:00", "10:30", "01:30", "10:30", "01:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "white-castle", slug: "white-castle", name: "White Castle", category: "Fast Food", emoji: "🏰", logoUrl: null, website: "https://www.whitecastle.com", is24h: false },
    hours: weekHours("06:00", "01:00", "06:00", "02:00", "06:00", "00:00", { spansMidnight: [1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "culvers", slug: "culvers", name: "Culver's", category: "Fast Food", emoji: "🧈", logoUrl: null, website: "https://www.culvers.com", is24h: false },
    hours: weekHours("10:30", "22:00", "10:30", "22:00", "10:30", "22:00"),
  },
  {
    brand: { id: "cook-out", slug: "cook-out", name: "Cook Out", category: "Fast Food", emoji: "🍔", logoUrl: null, website: "https://www.cookout.com", is24h: false },
    hours: weekHours("10:00", "03:00", "10:00", "04:00", "10:00", "02:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "rallys-checkers", slug: "rallys-checkers", name: "Rally's/Checkers", category: "Fast Food", emoji: "🏁", logoUrl: null, website: "https://www.checkers.com", is24h: false },
    hours: weekHours("10:00", "00:00", "10:00", "02:00", "10:00", "00:00", { fridayClose: "02:00", spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  // Coffee
  {
    brand: { id: "peets-coffee", slug: "peets-coffee", name: "Peet's Coffee", category: "Coffee", emoji: "☕", logoUrl: null, website: "https://www.peets.com", is24h: false },
    hours: weekHours("05:00", "20:00", "05:30", "20:00", "06:00", "19:00"),
  },
  {
    brand: { id: "tim-hortons", slug: "tim-hortons", name: "Tim Hortons", category: "Coffee", emoji: "☕", logoUrl: null, website: "https://www.timhortons.com", is24h: false },
    hours: weekHours("05:00", "22:00", "05:00", "22:00", "06:00", "21:00"),
  },
  {
    brand: { id: "dutch-bros", slug: "dutch-bros", name: "Dutch Bros", category: "Coffee", emoji: "☕", logoUrl: null, website: "https://www.dutchbros.com", is24h: false },
    hours: weekHours("05:00", "22:00", "05:00", "22:00", "05:00", "22:00"),
  },
  {
    brand: { id: "caribou-coffee", slug: "caribou-coffee", name: "Caribou Coffee", category: "Coffee", emoji: "☕", logoUrl: null, website: "https://www.cariboucoffee.com", is24h: false },
    hours: weekHours("05:30", "21:00", "06:00", "21:00", "06:00", "20:00"),
  },
  // Pizza
  {
    brand: { id: "pizza-hut", slug: "pizza-hut", name: "Pizza Hut", category: "Pizza", emoji: "🍕", logoUrl: null, website: "https://www.pizzahut.com", is24h: false },
    hours: weekHours("10:00", "23:00", "10:00", "00:00", "10:00", "23:00", { fridayClose: "00:00", spansMidnight: [5, 6] }),
  },
  {
    brand: { id: "marcos-pizza", slug: "marcos-pizza", name: "Marco's Pizza", category: "Pizza", emoji: "🍕", logoUrl: null, website: "https://www.marcos.com", is24h: false },
    hours: weekHours("11:00", "22:00", "11:00", "23:00", "11:00", "22:00", { fridayClose: "23:00" }),
  },
  {
    brand: { id: "hungry-howies", slug: "hungry-howies", name: "Hungry Howie's", category: "Pizza", emoji: "🍕", logoUrl: null, website: "https://www.hungryhowies.com", is24h: false },
    hours: weekHours("11:00", "22:00", "11:00", "23:00", "11:00", "22:00", { fridayClose: "23:00" }),
  },
  // Fast Casual
  {
    brand: { id: "noodles-and-company", slug: "noodles-and-company", name: "Noodles & Company", category: "Fast Casual", emoji: "🍜", logoUrl: null, website: "https://www.noodles.com", is24h: false },
    hours: weekHours("11:00", "21:00", "11:00", "21:00", "11:00", "21:00"),
  },
  {
    brand: { id: "qdoba", slug: "qdoba", name: "Qdoba", category: "Fast Casual", emoji: "🌯", logoUrl: null, website: "https://www.qdoba.com", is24h: false },
    hours: weekHours("10:30", "22:00", "10:30", "22:00", "10:30", "21:00"),
  },
  {
    brand: { id: "wawa", slug: "wawa", name: "Wawa", category: "Convenience", emoji: "🏪", logoUrl: null, website: "https://www.wawa.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "sheetz", slug: "sheetz", name: "Sheetz", category: "Convenience", emoji: "🏪", logoUrl: null, website: "https://www.sheetz.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "jersey-mikes", slug: "jersey-mikes", name: "Jersey Mike's", category: "Fast Casual", emoji: "🥖", logoUrl: null, website: "https://www.jerseymikes.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "10:00", "21:00"),
  },
  // Retail
  {
    brand: { id: "kohls", slug: "kohls", name: "Kohl's", category: "Retail", emoji: "🏬", logoUrl: null, website: "https://www.kohls.com", is24h: false },
    hours: weekHours("09:00", "21:00", "09:00", "21:00", "10:00", "20:00"),
  },
  {
    brand: { id: "tj-maxx", slug: "tj-maxx", name: "TJ Maxx", category: "Retail", emoji: "🏷️", logoUrl: null, website: "https://www.tjmaxx.tjx.com", is24h: false },
    hours: weekHours("09:30", "21:30", "09:30", "21:30", "10:00", "20:00"),
  },
  {
    brand: { id: "marshalls", slug: "marshalls", name: "Marshalls", category: "Retail", emoji: "🏷️", logoUrl: null, website: "https://www.marshalls.com", is24h: false },
    hours: weekHours("09:30", "21:30", "09:30", "21:30", "10:00", "20:00"),
  },
  {
    brand: { id: "ross-stores", slug: "ross-stores", name: "Ross Stores", category: "Retail", emoji: "👗", logoUrl: null, website: "https://www.rossstores.com", is24h: false },
    hours: weekHours("09:00", "22:00", "09:00", "22:00", "10:00", "21:00"),
  },
  {
    brand: { id: "old-navy", slug: "old-navy", name: "Old Navy", category: "Retail", emoji: "👕", logoUrl: null, website: "https://www.oldnavy.gap.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "10:00", "19:00"),
  },
  {
    brand: { id: "nordstrom-rack", slug: "nordstrom-rack", name: "Nordstrom Rack", category: "Retail", emoji: "👠", logoUrl: null, website: "https://www.nordstromrack.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "19:00"),
  },
  {
    brand: { id: "dicks-sporting-goods", slug: "dicks-sporting-goods", name: "Dick's Sporting Goods", category: "Retail", emoji: "⚽", logoUrl: null, website: "https://www.dickssportinggoods.com", is24h: false },
    hours: weekHours("09:00", "21:00", "09:00", "21:00", "10:00", "19:00"),
  },
  {
    brand: { id: "academy-sports", slug: "academy-sports", name: "Academy Sports", category: "Retail", emoji: "🏈", logoUrl: null, website: "https://www.academy.com", is24h: false },
    hours: weekHours("09:00", "21:00", "09:00", "21:00", "10:00", "19:00"),
  },
  // Pharmacy
  {
    brand: { id: "rite-aid", slug: "rite-aid", name: "Rite Aid", category: "Pharmacy", emoji: "💊", logoUrl: null, website: "https://www.riteaid.com", is24h: false },
    hours: weekHours("08:00", "22:00", "08:00", "22:00", "08:00", "22:00"),
  },
  {
    brand: { id: "duane-reade", slug: "duane-reade", name: "Duane Reade", category: "Pharmacy", emoji: "💊", logoUrl: null, website: "https://www.walgreens.com/topic/duane-reade/duane-reade.jsp", is24h: false },
    hours: weekHours("07:00", "22:00", "08:00", "22:00", "08:00", "21:00"),
  },
  // Electronics
  {
    brand: { id: "micro-center", slug: "micro-center", name: "Micro Center", category: "Electronics", emoji: "🖥️", logoUrl: null, website: "https://www.microcenter.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  {
    brand: { id: "apple-store", slug: "apple-store", name: "Apple Store", category: "Electronics", emoji: "🍎", logoUrl: null, website: "https://www.apple.com/retail", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  // Home Improvement
  {
    brand: { id: "menards", slug: "menards", name: "Menards", category: "Home Improvement", emoji: "🔨", logoUrl: null, website: "https://www.menards.com", is24h: false },
    hours: weekHours("06:00", "22:00", "06:00", "22:00", "08:00", "20:00"),
  },
  {
    brand: { id: "harbor-freight", slug: "harbor-freight", name: "Harbor Freight", category: "Home Improvement", emoji: "🛠️", logoUrl: null, website: "https://www.harborfreight.com", is24h: false },
    hours: weekHours("08:00", "20:00", "08:00", "20:00", "09:00", "18:00"),
  },
  // Convenience
  {
    brand: { id: "circle-k", slug: "circle-k", name: "Circle K", category: "Convenience", emoji: "🏪", logoUrl: null, website: "https://www.circlek.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  {
    brand: { id: "caseys", slug: "caseys", name: "Casey's", category: "Convenience", emoji: "🏪", logoUrl: null, website: "https://www.caseys.com", is24h: false },
    hours: weekHours("05:00", "00:00", "05:00", "00:00", "05:00", "00:00", { spansMidnight: [0, 1, 2, 3, 4, 5, 6] }),
  },
  {
    brand: { id: "speedway", slug: "speedway", name: "Speedway", category: "Convenience", emoji: "⛽", logoUrl: null, website: "https://www.speedway.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  // Banking
  {
    brand: { id: "wells-fargo", slug: "wells-fargo", name: "Wells Fargo", category: "Banking", emoji: "🏦", logoUrl: null, website: "https://www.wellsfargo.com", is24h: false },
    hours: weekHours("09:00", "17:00", "09:00", "13:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "citibank", slug: "citibank", name: "Citibank", category: "Banking", emoji: "🏦", logoUrl: null, website: "https://www.citi.com", is24h: false },
    hours: weekHours("09:00", "17:00", "09:00", "13:00", "00:00", "00:00", { sundayClosed: true }),
  },
  {
    brand: { id: "td-bank", slug: "td-bank", name: "TD Bank", category: "Banking", emoji: "🏦", logoUrl: null, website: "https://www.td.com", is24h: false },
    hours: weekHours("08:30", "17:00", "08:30", "13:00", "00:00", "00:00", { sundayClosed: true }),
  },
  // Shipping
  {
    brand: { id: "dhl", slug: "dhl", name: "DHL", category: "Shipping", emoji: "📦", logoUrl: null, website: "https://www.dhl.com", is24h: false },
    hours: weekHours("08:00", "18:00", "09:00", "14:00", "00:00", "00:00", { sundayClosed: true }),
  },
  // Gym
  {
    brand: { id: "la-fitness", slug: "la-fitness", name: "LA Fitness", category: "Gym", emoji: "💪", logoUrl: null, website: "https://www.lafitness.com", is24h: false },
    hours: weekHours("05:00", "23:00", "08:00", "20:00", "08:00", "20:00"),
  },
  {
    brand: { id: "24-hour-fitness", slug: "24-hour-fitness", name: "24 Hour Fitness", category: "Gym", emoji: "🏋️", logoUrl: null, website: "https://www.24hourfitness.com", is24h: true },
    hours: weekHours("00:00", "00:00", "00:00", "00:00", "00:00", "00:00"),
  },
  // Auto
  {
    brand: { id: "oreilly-auto-parts", slug: "oreilly-auto-parts", name: "O'Reilly Auto Parts", category: "Auto", emoji: "🔧", logoUrl: null, website: "https://www.oreillyauto.com", is24h: false },
    hours: weekHours("07:30", "21:00", "07:30", "21:00", "09:00", "18:00"),
  },
  {
    brand: { id: "advance-auto-parts", slug: "advance-auto-parts", name: "Advance Auto Parts", category: "Auto", emoji: "🔧", logoUrl: null, website: "https://www.advanceautoparts.com", is24h: false },
    hours: weekHours("07:30", "21:00", "07:30", "21:00", "09:00", "18:00"),
  },
  // Department Store
  {
    brand: { id: "macys", slug: "macys", name: "Macy's", category: "Department Store", emoji: "🏬", logoUrl: null, website: "https://www.macys.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "19:00"),
  },
  {
    brand: { id: "jcpenney", slug: "jcpenney", name: "JCPenney", category: "Department Store", emoji: "🏬", logoUrl: null, website: "https://www.jcpenney.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "19:00"),
  },
  {
    brand: { id: "nordstrom", slug: "nordstrom", name: "Nordstrom", category: "Department Store", emoji: "👔", logoUrl: null, website: "https://www.nordstrom.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  // Pet
  {
    brand: { id: "petsmart", slug: "petsmart", name: "PetSmart", category: "Pet", emoji: "🐾", logoUrl: null, website: "https://www.petsmart.com", is24h: false },
    hours: weekHours("09:00", "21:00", "09:00", "21:00", "10:00", "19:00"),
  },
  {
    brand: { id: "petco", slug: "petco", name: "Petco", category: "Pet", emoji: "🐶", logoUrl: null, website: "https://www.petco.com", is24h: false },
    hours: weekHours("09:00", "21:00", "09:00", "21:00", "10:00", "19:00"),
  },
  // Grocery/Wholesale
  {
    brand: { id: "sams-club", slug: "sams-club", name: "Sam's Club", category: "Wholesale", emoji: "🛒", logoUrl: null, website: "https://www.samsclub.com", is24h: false },
    hours: weekHours("10:00", "20:00", "09:00", "20:00", "10:00", "18:00"),
  },
  {
    brand: { id: "bjs-wholesale-club", slug: "bjs-wholesale-club", name: "BJ's Wholesale Club", category: "Wholesale", emoji: "🛒", logoUrl: null, website: "https://www.bjs.com", is24h: false },
    hours: weekHours("08:00", "21:00", "08:00", "21:00", "09:00", "19:00"),
  },
  // Additional brands to reach 70 new
  {
    brand: { id: "cracker-barrel", slug: "cracker-barrel", name: "Cracker Barrel", category: "Fast Casual", emoji: "🪵", logoUrl: null, website: "https://www.crackerbarrel.com", is24h: false },
    hours: weekHours("07:00", "21:00", "07:00", "21:00", "07:00", "21:00"),
  },
  {
    brand: { id: "sephora", slug: "sephora", name: "Sephora", category: "Retail", emoji: "💄", logoUrl: null, website: "https://www.sephora.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  {
    brand: { id: "ulta-beauty", slug: "ulta-beauty", name: "Ulta Beauty", category: "Retail", emoji: "💅", logoUrl: null, website: "https://www.ulta.com", is24h: false },
    hours: weekHours("10:00", "21:00", "10:00", "21:00", "11:00", "18:00"),
  },
  {
    brand: { id: "ace-hardware", slug: "ace-hardware", name: "Ace Hardware", category: "Home Improvement", emoji: "🔩", logoUrl: null, website: "https://www.acehardware.com", is24h: false },
    hours: weekHours("08:00", "20:00", "08:00", "20:00", "09:00", "18:00"),
  },
  {
    brand: { id: "sprouts-farmers-market", slug: "sprouts-farmers-market", name: "Sprouts Farmers Market", category: "Grocery", emoji: "🌱", logoUrl: null, website: "https://www.sprouts.com", is24h: false },
    hours: weekHours("07:00", "22:00", "07:00", "22:00", "07:00", "22:00"),
  },
  {
    brand: { id: "firehouse-subs", slug: "firehouse-subs", name: "Firehouse Subs", category: "Fast Casual", emoji: "🚒", logoUrl: null, website: "https://www.firehousesubs.com", is24h: false },
    hours: weekHours("10:30", "21:00", "10:30", "21:00", "10:30", "21:00"),
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
