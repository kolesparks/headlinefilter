import { describe, test, expect } from "bun:test";
import { createAnyOrderAsyncGenerator, searchNews } from "../lib/search-news";

describe("search news", () => {
    test("search", async () => {
        const article = await searchNews("3D printing").next();
        expect(article.value?.linkText.toLowerCase()).toInclude("3d-printed");
    }, {
        timeout: 30_000
    });


    test("any order async generator", async () => {

        const promises: Promise<number>[] = [
            new Promise((res) => setTimeout(() => res(0), 100)),
            new Promise((res) => setTimeout(() => res(1), 50)),
            new Promise((res) => setTimeout(() => res(2), 150)),
            new Promise((res) => setTimeout(() => res(3), 10))
        ];

        const iter = createAnyOrderAsyncGenerator(promises, (i) => i);

        expect((await iter.next()).value).toBe(3);
        expect((await iter.next()).value).toBe(1);
        expect((await iter.next()).value).toBe(0);
        expect((await iter.next()).value).toBe(2);


    });
});