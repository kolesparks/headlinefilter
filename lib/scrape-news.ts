import { parseNews } from "./parse-news";

export type NewsTopic = keyof typeof NEWS_TOPICS;

export async function scrapeNews(topic: NewsTopic) {
    if (!NEWS_TOPICS[topic]) {
        throw new Error(`Invalid news topic: ${topic}`);
    }
    const url = `https://news.google.com/topics/${NEWS_TOPICS[topic].googleId}`;
    const html = await scrapeUrl(url, {
        steps: [
            { click_and_wait_for_navigation: 'button[aria-label="Reject all"]' },
        ],
        render_js: true,
    });

    return parseNews(html);
}

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

async function scrapeUrl(
    url: string,
    options?: {
        steps?: {
            click_and_wait_for_navigation?: string;
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
