import { describe, test, expect } from "bun:test";
import { filterNewsArticle, filterNewsTopics } from "../lib/filter-news";


const blackHoleArticle = {
    "source": "Manchester Evening News",
    "linkText": "Black hole 'erupting like cosmic volcano' after 100 million years of silence",
    "linkHref": "https://news.google.com/read/CBMinAFBVV95cUxQcHQ0c0FMY0M2QXJScWVWTnFKaVRfdkxiWGtuU29RSzZRODV1ekNLdzVvQW04SlBjbXAxMVJWNmItcndCekNnT2xnbVJ4dTlscDBxN0VSVDlPcC0zM0wxaXJYMkdmOG1ENnlQejZmVFd5MkVpdWUxOHBYLVRpdzVXM1pVdkRyOVdQaU5yMDAySDhiOEdRNTl0VlJFOTHSAaIBQVVfeXFMT3UzVlN2dk1qdEFZc0tJWk5iZG9MTkRBRDFNOFBHTmF4a3lBd01pN19wVzJUejVlTjNORjd1cmIwVkxtQ0dTMXpuYWh3blc5Zkd0b2JxaVVRXzY5b2hZcnVRY1l4Wi0xSVFJZXl3N3lLdmxSVUpfUjZxRm5yYWQ5TXBvV2lhWWZROUV4Ny1ST19ZQjFTMjA1ZEx4R2RjUlBIdmN3?hl=en-US&gl=US&ceid=US%3Aen",
    "timestamp": "2026-01-16T14:19:00Z",
    "relativeTime": "42 minutes ago",
    "author": "Bethan Finighan"
};

describe("filter news", () => {
    test("filter news article returns true", async () => {
        const { matches } = await filterNewsArticle(blackHoleArticle, "Anything related to outer space");
        expect(matches).toBeTrue();
    });

    test("filter news article returns false", async () => {
        const { matches } = await filterNewsArticle(blackHoleArticle, "Nothing to do with space - i am sick of hearing about it...");
        expect(matches).toBeFalse();
    });
});


describe("filter topics", () => {
    test("spaceship launches", async () => {
        const { topics } = await filterNewsTopics("spaceship launches");
        expect(topics).toMatchObject([
            "science",
            "technology",
            "world",
        ]);
    });

    test("christopher walken dies sad face", async () => {
        const { topics } = await filterNewsTopics("christopher walken dies sad face");
        expect(topics).toMatchObject([
            "entertainment",
            "world",
        ]);
    });


    test("anything but politics", async () => {
        const { topics } = await filterNewsTopics("anything but politics");
        expect(topics).toMatchObject(
            [
                "world",
                "business",
                "technology",
                "entertainment",
                "sports",
                "science",
                "health",
            ]
        );
    });
})