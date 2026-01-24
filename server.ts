

import Bun from "bun";
import { escapeHtml } from "./lib/escape-html";
import { searchNews } from "./lib/search-news";
import type { NewsArticle } from "./lib/parse-news";
import { newsExists } from "./lib/load-news";
import { runNewsJob } from "./lib/news-job";
import { loadNewsFromSearchCache, setSearchCache, type SearchCacheArticle } from "./lib/search-cache";
import { createRateLimit } from "./lib/rate-limit";

const landingHtml = await Bun.file("./html/landing.html").text();
const newsArticleHtml = await Bun.file("./html/news-article.html").text();

const port = process.env.PORT || 3000;
const hostname = process.env.PORT ? "0.0.0.0" : "localhost";

const rateLimit = createRateLimit({ limit: 60, windowSeconds: 60 });

function renderLanding({ search, newsArticles, metaDescription }: { search: string, newsArticles: string, metaDescription?: string }) {
    return landingHtml
        .replace("$SEARCH", escapeHtml(search))
        .replace("$NEWS_ARTICLES", newsArticles)
        .replace("$META_DESCRIPTION", escapeHtml(metaDescription || "News you ask for. No algorithm. No ads."));
}

function renderNewsArticle(article: NewsArticle) {
    return newsArticleHtml
        .replace("$LINK_HREF", escapeHtml(article.linkHref || ""))
        .replace("$LINK_TEXT", escapeHtml(article.linkText))
        .replace("$AUTHOR", escapeHtml(article.author))
        .replace("$SOURCE", escapeHtml(article.source))
        .replace("$TIMESTAMP", escapeHtml(article.timestamp))
}

Bun.serve({
    port,
    hostname,
    routes: {

        "/": async function search(req, res) {

            const url = new URL(req.url);

            const search = url.searchParams.get("search");

            if (!search || typeof search !== "string") {
                return new Response(renderLanding({ search: "", newsArticles: "" }), {
                    headers: {
                        "Content-Type": "text/html"
                    }
                });
            }

            if (search.length > 1000) {
                return new Response("Search must be 1000 characters or less", { status: 400 });
            }

            const cachedNewsStoreRows = await loadNewsFromSearchCache(search);

            if (cachedNewsStoreRows) {
                return new Response(renderLanding({ search, newsArticles: cachedNewsStoreRows.map((r) => `<li>${renderNewsArticle(r.article)}</li>`).join("\n"), metaDescription: search }), {
                    headers: {
                        "Content-Type": "text/html"
                    }
                })
            }

            const rateLimitHit = rateLimit();

            if (rateLimitHit) {
                return new Response("Too many requests", { status: 429 });
            }

            const stream = new ReadableStream({
                start: async function (controller) {

                    const renderedLandingHtml = renderLanding({ search, newsArticles: "$NEWS_ARTICLES", metaDescription: search });
                    const initialHtml = renderedLandingHtml.slice(0, renderedLandingHtml.indexOf("$NEWS_ARTICLES"));
                    controller.enqueue(initialHtml);

                    let articleCount = 0;
                    let foundCount = 0;
                    let searchCacheArticles: SearchCacheArticle[] = [];
                    for await (const { matches, row } of searchNews(search, { concurrency: 10, limit: 25 })) {
                        if (matches) {
                            controller.enqueue(`<li>${renderNewsArticle(row.article)}</li>`);
                            foundCount++;
                            searchCacheArticles.push({
                                index: row.index,
                                topic: row.topic,
                            });
                        }
                        articleCount++;
                        controller.enqueue(`<span hidden data-article-count="${articleCount}" data-found-count="${foundCount}"></span>`)
                    }

                    await setSearchCache(search, searchCacheArticles);

                    controller.close();
                }
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        },
    },
    idleTimeout: 30
});

// run news job immediately if no data yet
if (!(await newsExists("science"))) {
    await runNewsJob();
}

setInterval(async () => {
    await runNewsJob();
},
    1000 * 60 * 60 * 6 // every 6 hours
);



console.log(`Serving on http://${hostname}:${port}`);