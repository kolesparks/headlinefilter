import { describe, expect, test } from "bun:test";
import { clearSearchCache, getSearchCache, loadNewsFromSearchCache, setSearchCache } from "../lib/search-cache";


describe("search cache", () => {
    test("set", async () => {
        await setSearchCache("no politics", [{ topic: "business", index: 2 }]);
    });

    test("get", async () => {
        const cached = await getSearchCache("no politics");

        expect(cached).toMatchObject([{ topic: "business", index: 2 }]);

    });


    test("load", async () => {
        const articles = await loadNewsFromSearchCache("no politics");

        expect(articles?.[0]?.article).toMatchInlineSnapshot(`
          {
            "author": "Bob Tita, Anne Tergesen & Peter Loftus",
            "linkHref": "https://www.wsj.com/livecoverage/stock-market-today-dow-sp-500-nasdaq-01-22-2026",
            "linkText": "Stock Market Today: Dow Gains, Global Stocks Rise After Trump Tariff U-Turn — Live Updates",
            "relativeTime": "44 minutes ago",
            "source": "The Wall Street Journal",
            "timestamp": "2026-01-23T02:16:00Z",
          }
        `);
    });

    test("clear", async () => {
        await clearSearchCache();
        const cached = await getSearchCache("no politics");

        expect(cached).toBeNull();
    });

});