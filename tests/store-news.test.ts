import { describe, expect, test } from "bun:test";
import { getNewsFilePath, storeNews } from "../lib/store-news";


describe("store news", () => {
    test("create json file at path", async () => {

        await storeNews("business", []);


        expect(await Bun.file(getNewsFilePath("business")).exists());
    });
});