import { retryAsync } from "./retry-async";
import { NEWS_TOPICS_ARRAY, scrapeNews } from "./scrape-news";
import { storeNews } from "./store-news";

export async function runNewsJob() {

    console.log("news job started");
    const t1 = Date.now();
    try {
        for (const topic of NEWS_TOPICS_ARRAY) {
            console.log(`scraping ${topic}`);
            const articles = await retryAsync(() => scrapeNews(topic), {
                maxAttempts: 10,
                delayIntervalSeconds: 1,
                delayMultiplier: 1,
                maxDelaySeconds: 10,
                logErrors: false
            });
            await storeNews(topic, articles);
        }

        const t2 = Date.now();


        console.log(`news job finished after ${(t2 - t1) / 1000}s`);
    } catch (e) {
        console.error(e);
    }
}
