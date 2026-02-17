/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://isopenow.com",
  generateRobotsTxt: false, // We already have public/robots.txt
  changefreq: "daily",
  priority: 0.8,
  sitemapSize: 5000,
  exclude: ["/api/*"],
  transform: async (config, path) => {
    // Brand pages get highest priority
    const isBrandPage = /^\/brand\/[^/]+$/.test(path) || /^\/is-[^/]+-open$/.test(path);
    // Homepage
    const isHome = path === "/" || path === "";
    // Category pages
    const isCategory = path.startsWith("/category/");
    // Legal pages
    const isLegal = ["/privacy", "/terms", "/about"].includes(path);

    let priority = 0.6;
    let changefreq = "weekly";

    if (isHome) {
      priority = 1.0;
      changefreq = "daily";
    } else if (isBrandPage) {
      priority = 0.9;
      changefreq = "daily";
    } else if (isCategory) {
      priority = 0.8;
      changefreq = "daily";
    } else if (isLegal) {
      priority = 0.3;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
