import type { NewsArticle } from "./parse-news";
import type { NewsTopic } from "./scrape-news";


export function getNewsFilePath(topic: NewsTopic) {
    return `data/news/${topic}.json`;
}

export async function storeNews(topic: NewsTopic, articles: NewsArticle[]) {
    const file = Bun.file(getNewsFilePath(topic));
    await file.write(JSON.stringify(articles, null, 2));
}