import { describe, test, expect } from "bun:test";
import { scrapeNews } from "../lib/scrape-news";



describe("scrape news", () => {
    test.todo("scrape and parse news articles", async () => {
        const articles = await scrapeNews("science");

        expect(articles).toMatchObject(expect.arrayContaining(expect.objectContaining({
            source: expect.any(String),
            linkText: expect.any(String),
            linkHref: expect.stringContaining("https://"),
            timestamp: expect.any(String),
            relativeTime: expect.any(String),
            author: expect.any(String),
        })));
    }, {
        timeout: 30_000
    });
});