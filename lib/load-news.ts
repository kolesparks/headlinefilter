import type { NewsArticle } from "./parse-news";
import { NEWS_TOPICS } from "./scrape-news";

const NEWS_TOPICS_ARRAY = Object.keys(NEWS_TOPICS);
export async function* loadNews(): AsyncIterable<NewsArticle> {

    for (const topic of NEWS_TOPICS_ARRAY) {
        const file = Bun.file(`data/news/${topic}.json`);
        if (!(await file.exists())) {
            continue;
        }
        const articles = await file.json() as NewsArticle[];

        for (const article of articles) {
            yield article;
        }
    }
}