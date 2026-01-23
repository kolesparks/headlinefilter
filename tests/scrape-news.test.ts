import { describe, test, expect } from "bun:test";
import { decodeGoogleNewsUrl, decodeGoogleNewsUrlResponse, scrapeNews } from "../lib/scrape-news";



describe("scrape news", () => {
    test("scrape and parse news articles", async () => {
        const articles = await scrapeNews("science");

        expect(articles.length).toBeGreaterThan(0);

        expect(articles[0]).toMatchObject({
            source: expect.any(String),
            linkText: expect.any(String),
            linkHref: expect.stringContaining("https://"),
            timestamp: expect.any(String),
            relativeTime: expect.any(String),
            author: expect.any(String),
        });

    }, {
        timeout: 60_000
    });


    test("decodeGoogleNewsUrl", async () => {
        const url = await decodeGoogleNewsUrl("https://news.google.com/read/CBMiuwFBVV95cUxPdm5KY3ZrcGpCRjlfYTdqVEJfNTNwTVFZNnplMUhnQmRyOGZXNU5CbXZKZmhSQjZWakpNSERibG9FNFJabi1HSWliTl9xaFJtUnNCXzB4a3ZQTERBTk01c0otX3pQSU5jNHNuMXNKWURjZkxrV21VUDRIbUxZc2FVMzE4VVlBQlpYWFIzX2tNRHJBcy14bV9tSE5yenV6TEs3TE1zTWNEeVBfSUxSRzlEdHdNZlRxZDM4TFhV?hl=en-US&gl=US&ceid=US%3Aen");

        expect(url).toMatchInlineSnapshot(`"https://www.bluewin.ch/en/news/international/study-finds-no-negative-effects-of-fluoride-in-drinking-water-3060432.html"`);
    })

    test("decodeGoogleNewsUrlResponse", () => {
        const response = `)]}'

917
[["wrb.fr","qYhfLd","[\\"waares\\",[3,null,null,[13,[13,\\"CBMijgFBVV95cUxNQ1d0YUdyRUNlN1Nxck5mMU9oZzA2U3p1eEcySEZpM25PMXFBTEx3TmJJRXo0N1V6ZFdBUUxLQzF4WDF0NEo2Q0FFWGdQN0pRVEhXU3RveU1MZlZkR3RRYjFPd3AxUzQ1Vy1tUmFNV1U1VFREaHpRZVBJUUFIa3V5U05Ma2dFZVZZdUVFUDFR\\"],null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,\\"https://www.nytimes.com/2026/01/21/us/politics/davos-trump-speech-greenland-deal.html\\",null,null,null,[[null,null,null,null,null,null,null,null,null,null,null,null,[]]]],null,null,null,null,\\"aa|CBMijgFBVV95cUxNQ1d0YUdyRUNlN1Nxck5mMU9oZzA2U3p1eEcySEZpM25PMXFBTEx3TmJJRXo0N1V6ZFdBUUxLQzF4WDF0NEo2Q0FFWGdQN0pRVEhXU3RveU1MZlZkR3RRYjFPd3AxUzQ1Vy1tUmFNV1U1VFREaHpRZVBJUUFIa3V5U05Ma2dFZVZZdUVFUDFR\\"],null,4]",null,null,null,"1"],["di",18],["af.httprm",17,"5144516757069800060",81]]
25
[["e",4,null,null,953]]`;

        const decoded = decodeGoogleNewsUrlResponse(response);

        expect(decoded).toEqual("https://www.nytimes.com/2026/01/21/us/politics/davos-trump-speech-greenland-deal.html");

    });
});