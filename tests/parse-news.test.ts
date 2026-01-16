import { describe, test, expect } from "bun:test";
import { parseNews } from "../lib/parse-news";


describe("articles parser", () => {
    test("parse articles from raw html", async () => {
        const rawNews = await Bun.file("./tests/news.html").text();

        const parsed = parseNews(rawNews);


        await Bun.file("./tests/news.json").write(JSON.stringify(parsed, null, 2));

        const expected = await Bun.file("./tests/news.json").text();


        expect(JSON.stringify(parsed, null, 2)).toEqual(expected);
    });
});