import { loadNews } from "./load-news";
import type { NewsTopic } from "./scrape-news";
import { rm } from "node:fs/promises";

const searchCacheFolderPath = './data/search-cache';

export type SearchCacheArticle = { topic: NewsTopic; index: number };

export async function setSearchCache(search: string, articles: SearchCacheArticle[]) {

    const file = getSearchCacheFile(search);

    await file.write(JSON.stringify(articles));
}

export async function getSearchCache(search: string) {

    const file = getSearchCacheFile(search);


    if (!(await file.exists())) {
        return null;
    }

    return await file.json() as SearchCacheArticle[];
}

export async function clearSearchCache() {
    await rm(searchCacheFolderPath, {
        force: true,
        recursive: true,
    });
}

export async function loadNewsFromSearchCache(search: string) {

    const cache = await getSearchCache(search);

    if (cache) {
        const topics = Array.from(new Set(cache.map((c) => c.topic))) as NewsTopic[];
        const rows = await Array.fromAsync(loadNews(topics));
        return rows.filter((row) => cache.some((c) => c.index === row.index && c.topic === row.topic));
    }

    return null;
}

function getSearchCacheFile(search: string) {
    return Bun.file(`${searchCacheFolderPath}/search-${encodeURIComponent(search)}.json`);
}

