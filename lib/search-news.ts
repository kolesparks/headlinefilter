import { filterNewsArticle, filterNewsTopics } from "./filter-news";
import { loadNews, type NewsStoreRow } from "./load-news";
import type { NewsArticle } from "./parse-news";


export async function* searchNews(search: string, {
    concurrency = 20,
    limit = 100
} = {}) {

    let rowBatch: NewsStoreRow[] = [];

    let matchCount = 0;

    const { topics } = await filterNewsTopics(search);

    for await (const row of loadNews(topics)) {
        if (rowBatch.length < concurrency) {
            rowBatch.push(row);
        } else {
            const filterPromises = rowBatch.map((r, batchIndex) => filterNewsArticle(r.article, search).then((f) => ({ row: r, matches: f.matches, batchIndex })));
            for await (const filterResult of createAnyOrderAsyncGenerator(filterPromises, (item) => item.batchIndex)) {
                if (!filterResult.matches) {
                    yield filterResult;
                } else {
                    matchCount++;
                    if (matchCount >= limit) {
                        return filterResult;
                    } else {
                        yield filterResult;
                    }
                }

            }
            rowBatch = [];
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