import { parseNews } from "./parse-news";

export type NewsTopic = typeof NEWS_TOPICS;

export async function scrapeNews(topic: NewsTopic) {
    if (!NEWS_TOPICS[topic]) {
        throw new Error(`Invalid news topic: ${topic}`);
    }
    const url = `https://news.google.com/topics/${NEWS_TOPICS[topic].id}`;
    const html = await scrape(url, {
        steps: [
            { click_and_wait_for_navigation: 'button[aria-label="Reject all"]' },
        ],
        render_js: true,
    });

    return parseNews(html);
}

export const NEWS_TOPICS = {
    world: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB",
    },
    us: {
        id: "CAAqIggKIhxDQkFTRHdvSkwyMHZNRGxqTjNjd0VnSmxiaWdBUAE",
    },
    business: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
    },
    technology: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB",
    },
    entertainment: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB",
    },
    sports: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0FtVnVHZ0pWVXlnQVAB",
    },
    science: {
        id: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB",
    },
    health: {
        id: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ",
    },
};

function scrapeUrl(
    url: string,
    options?: {
        steps?: {
            click_and_wait_for_navigation?: string;
        }[];
        render_js?: boolean;
    }
): Promise<string> {
    const steps = options?.steps ?? [];
    const render_js = options?.render_js ?? false;
    return fetch(
        `https://scraping.narf.ai/api/v1/?url=${encodeURIComponent(url)}&api_key=${process.env.SCRAPING_FISH_API_KEY
        }&js_scenario=${encodeURIComponent(
            JSON.stringify({
                steps,
            })
        )}&render_js=${render_js ? "true" : "false"}`
    ).then((res) => res.text());
}
