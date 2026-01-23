import { parseNews } from "./parse-news";

export const NEWS_TOPICS = {
    world: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB",
    },
    us: {
        googleId: "CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE",
    },
    business: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
    },
    technology: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB",
    },
    entertainment: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB",
    },
    sports: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB",
    },
    science: {
        googleId: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB",
    },
    health: {
        googleId: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ",
    },
};

export type NewsTopic = keyof typeof NEWS_TOPICS;

export const NEWS_TOPICS_ARRAY = Object.keys(NEWS_TOPICS) as NewsTopic[];


const decodeGoogleNewsLinksScript = await Bun.file('./lib/decode-google-news-links-script.js').text();

export async function scrapeNews(topic: NewsTopic) {
    if (!NEWS_TOPICS[topic]) {
        throw new Error(`Invalid news topic: ${topic}`);
    }
    const url = `https://news.google.com/topics/${NEWS_TOPICS[topic].googleId}`;
    const html = await scrapeUrl(url, {
        steps: [
            { click_and_wait_for_navigation: 'button[aria-label="Reject all"]' },
            {
                evaluate: decodeGoogleNewsLinksScript,
            },
            {
                wait_for: '#done-decoding-links'
            }
        ],
        render_js: true,
    });

    if (html.includes("Unknown error occured")) {
        throw new Error("Unknown error occured");
    }

    return parseNews(html);
}

async function scrapeUrl(
    url: string,
    options?: {
        steps?: {
            click_and_wait_for_navigation?: string;
            evaluate?: string;
            wait_for?: string;
        }[];
        render_js?: boolean;
    }
) {
    const steps = options?.steps ?? [];
    const render_js = options?.render_js ?? false;
    const res = await fetch(
        `https://scraping.narf.ai/api/v1/?url=${encodeURIComponent(url)}&api_key=${process.env.SCRAPING_FISH_API_KEY}&js_scenario=${encodeURIComponent(
            JSON.stringify({
                steps,
            })
        )}&render_js=${render_js ? "true" : "false"}`
    );
    return await res.text();
}

export async function decodeGoogleNewsUrl(googleUrl: string) {

    const googleId = new URL(googleUrl).pathname.split("/").pop();

    const response = await fetch(`https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=qYhfLd&source-path=%2Fread%2F${googleId}&f.sid=1992591776305399511&bl=boq_dotssplashserver_20260119.15_p0&hl=en-US&gl=US&soc-app=140&soc-platform=1&soc-device=4&_reqid=325298&rt=c`, {
        "headers": {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        "body": `f.req=%5B%5B%5B%22qYhfLd%22%2C%22%5B%5C%22waareq%5C%22%2C%5B%5C%22en-US%5C%22%2C%5C%22US%5C%22%2C%5B%5C%22FINANCE_TOP_INDICES%5C%22%2C%5C%22WEB_TEST_1_0_0%5C%22%5D%2Cnull%2Cnull%2C2%2C1%2C%5C%22US%3Aen%5C%22%2Cnull%2C-300%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C0%5D%2C%5C%22${googleId}%5C%22%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2Cnull%2C4%5D%22%2Cnull%2C%221%22%5D%5D%5D&`,
        "method": "POST"
    }).then((r) => r.text());


    return decodeGoogleNewsUrlResponse(response);

}

export function decodeGoogleNewsUrlResponse(response: string) {

    const urlStart = response.indexOf("https://");
    const urlEnd = response.slice(urlStart).indexOf(`\\"`) + urlStart;
    return response.slice(urlStart, urlEnd);
}


