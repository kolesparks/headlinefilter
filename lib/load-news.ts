import type { NewsArticle } from "./parse-news";
import { type NewsTopic } from "./scrape-news";
import { getNewsFilePath } from "./store-news";


export async function* loadNews(topics: NewsTopic[]): AsyncIterable<NewsArticle> {
    for (const topic of topics) {
        const file = Bun.file(getNewsFilePath(topic));
        if (!(await file.exists())) {
            continue;
        }
        const articles = await file.json() as NewsArticle[];

        for (const article of articles) {
            yield article;
        }
    }
}

export async function newsExists(topic: NewsTopic) {
    return Bun.file(getNewsFilePath(topic)).exists();
}