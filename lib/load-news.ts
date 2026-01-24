import type { NewsArticle } from "./parse-news";
import { type NewsTopic } from "./scrape-news";
import { getNewsFilePath } from "./store-news";


export type NewsStoreRow = {
    topic: NewsTopic;
    article: NewsArticle;
    index: number;
}

export async function* loadNews(topics: NewsTopic[]): AsyncIterable<NewsStoreRow> {
    for (const topic of topics) {
        const file = Bun.file(getNewsFilePath(topic));
        if (!(await file.exists())) {
            continue;
        }
        const articles = await file.json() as NewsArticle[];

        for (let i = 0; i < articles.length; i++) {
            yield {
                topic,
                article: articles[i] as NewsArticle,
                index: i
            };
        }
    }
}

export async function newsExists(topic: NewsTopic) {
    return Bun.file(getNewsFilePath(topic)).exists();
}