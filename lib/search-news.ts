import { filterNewsArticle, filterNewsTopics } from "./filter-news";
import { loadNews } from "./load-news";
import type { NewsArticle } from "./parse-news";


export async function* searchNews(search: string, {
    concurrency = 20,
    limit = 100
} = {}) {

    let articleBatch: NewsArticle[] = [];

    let count = 0;

    const { topics } = await filterNewsTopics(search);

    for await (const article of loadNews(topics)) {
        if (articleBatch.length < concurrency) {
            articleBatch.push(article);
        } else {
            const filterPromises = articleBatch.map((a, i) => filterNewsArticle(a, search).then((r) => ({ article: a, matches: r.matches, i })));
            for await (const result of createAnyOrderAsyncGenerator(filterPromises, (item) => item.i)) {
                if (!result.matches) {
                    continue;
                }
                count++;
                yield result.article;
                if (count >= limit) {
                    return;
                }
            }
            articleBatch = [];
        }
    }
}


/**
 * Creates an async generator that yields the results of the given promises in the order in which they are resolved
 * @param inPromises an array of promises
 * @param getIndex an accessor function that should return the array index of the promise that resolved with the given item
 */
export async function* createAnyOrderAsyncGenerator<T>(inPromises: Promise<T>[], getIndex: (item: T) => number) {
    const promises = [...inPromises] as (Promise<T> | null)[];
    while (promises.filter(Boolean).length > 0) {
        const res = await Promise.race(promises.filter(Boolean));
        promises[getIndex(res as T)] = null;
        yield res as T;
    }
}