export interface CityData {
  slug: string;
  name: string;
  state: string;
  timezone: string;
  featuredBrandSlugs: string[];
  focusCategories: string[];
}

export const cityData: CityData[] = [
  {
    slug: "new-york-ny",
    name: "New York",
    state: "NY",
    timezone: "America/New_York",
    featuredBrandSlugs: ["mcdonalds", "starbucks", "cvs", "walgreens", "target", "dunkin", "post-office", "ups-store"],
    focusCategories: ["Fast Food", "Coffee", "Retail", "Pharmacy", "Shipping"],
  },
  {
    slug: "los-angeles-ca",
    name: "Los Angeles",
    state: "CA",
    timezone: "America/Los_Angeles",
    featuredBrandSlugs: ["mcdonalds", "starbucks", "target", "home-depot", "7-eleven", "chipotle", "dominos", "fedex-office"],
    focusCategories: ["Fast Food", "Coffee", "Retail", "Home Improvement", "Convenience"],
  },
  {
    slug: "chicago-il",
    name: "Chicago",
    state: "IL",
    timezone: "America/Chicago",
    featuredBrandSlugs: ["walmart", "mcdonalds", "starbucks", "walgreens", "dunkin", "kroger", "cvs", "post-office"],
    focusCategories: ["Fast Food", "Retail", "Pharmacy", "Coffee", "Grocery"],
  },
  {
    slug: "houston-tx",
    name: "Houston",
    state: "TX",
    timezone: "America/Chicago",
    featuredBrandSlugs: ["walmart", "target", "chick-fil-a", "taco-bell", "kroger", "cvs", "home-depot", "planet-fitness"],
    focusCategories: ["Fast Food", "Retail", "Grocery", "Pharmacy", "Gym"],
  },
  {
    slug: "phoenix-az",
    name: "Phoenix",
    state: "AZ",
    timezone: "America/Phoenix",
    featuredBrandSlugs: ["walmart", "mcdonalds", "starbucks", "cvs", "walgreens", "home-depot", "lowes", "autozone"],
    focusCategories: ["Fast Food", "Retail", "Pharmacy", "Home Improvement", "Auto"],
  },
  {
    slug: "philadelphia-pa",
    name: "Philadelphia",
    state: "PA",
    timezone: "America/New_York",
    featuredBrandSlugs: ["dunkin", "mcdonalds", "starbucks", "cvs", "walgreens", "target", "post-office", "ups-store"],
    focusCategories: ["Fast Food", "Coffee", "Retail", "Pharmacy", "Shipping"],
  },
  {
    slug: "dallas-tx",
    name: "Dallas",
    state: "TX",
    timezone: "America/Chicago",
    featuredBrandSlugs: ["walmart", "target", "costco", "chick-fil-a", "chipotle", "dominos", "kroger", "fedex-office"],
    focusCategories: ["Fast Food", "Retail", "Wholesale", "Grocery", "Shipping"],
  },
  {
    slug: "miami-fl",
    name: "Miami",
    state: "FL",
    timezone: "America/New_York",
    featuredBrandSlugs: ["walmart", "target", "walgreens", "cvs", "starbucks", "mcdonalds", "burger-king", "planet-fitness"],
    focusCategories: ["Fast Food", "Retail", "Pharmacy", "Coffee", "Gym"],
  },
  {
    slug: "seattle-wa",
    name: "Seattle",
    state: "WA",
    timezone: "America/Los_Angeles",
    featuredBrandSlugs: ["starbucks", "target", "costco", "whole-foods", "home-depot", "fedex-office", "post-office", "cvs"],
    focusCategories: ["Coffee", "Retail", "Wholesale", "Grocery", "Shipping"],
  },
  {
    slug: "denver-co",
    name: "Denver",
    state: "CO",
    timezone: "America/Denver",
    featuredBrandSlugs: ["walmart", "target", "costco", "chipotle", "starbucks", "home-depot", "lowes", "autozone"],
    focusCategories: ["Retail", "Fast Casual", "Coffee", "Home Improvement", "Auto"],
  },
  {
    slug: "san-francisco-ca",
    name: "San Francisco",
    state: "CA",
    timezone: "America/Los_Angeles",
    featuredBrandSlugs: ["target", "whole-foods", "starbucks", "chipotle", "cvs", "walgreens", "post-office", "fedex-office"],
    focusCategories: ["Retail", "Grocery", "Coffee", "Fast Casual", "Pharmacy"],
  },
  {
    slug: "boston-ma",
    name: "Boston",
    state: "MA",
    timezone: "America/New_York",
    featuredBrandSlugs: ["dunkin", "starbucks", "cvs", "walgreens", "target", "post-office", "ups-store", "chase-bank"],
    focusCategories: ["Coffee", "Pharmacy", "Retail", "Shipping", "Banking"],
  },
];

export function getAllCitySlugs(): string[] {
  return cityData.map((city) => city.slug);
}

export function getCityBySlug(slug: string): CityData | undefined {
  return cityData.find((city) => city.slug === slug);
}

export function getCitiesForBrand(brandSlug: string, limit = 6): CityData[] {
  return cityData.filter((city) => city.featuredBrandSlugs.includes(brandSlug)).slice(0, limit);
}

export function getCitiesForCategory(category: string, limit = 6): CityData[] {
  return cityData.filter((city) => city.focusCategories.includes(category)).slice(0, limit);
}
