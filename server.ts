

import Bun, { type BunRequest } from "bun";
import { escapeHtml } from "./lib/escape-html";
import { searchNews } from "./lib/search-news";
import type { NewsArticle } from "./lib/parse-news";
import { newsExists } from "./lib/load-news";
import { runNewsJob } from "./lib/news-job";

const landingHtml = await Bun.file("./html/landing.html").text();
const newsArticleHtml = await Bun.file("./html/news-article.html").text();

const port = process.env.PORT || 3000;
const hostname = process.env.PORT ? "0.0.0.0" : "localhost";

function renderLanding({ search, newsArticles }: { search: string, newsArticles: string }) {
    return landingHtml
        .replace("$SEARCH", escapeHtml(search))
        .replace("$NEWS_ARTICLES", newsArticles);
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

            const stream = new ReadableStream({
                start: async function (controller) {
                    controller.enqueue(renderLanding({ search, newsArticles: "" }).slice(0, landingHtml.indexOf("$NEWS_ARTICLES") + 1));

                    for await (const article of searchNews(search, { concurrency: 10, limit: 25 })) {
                        controller.enqueue(`<li>${renderNewsArticle(article)}</li>`);
                    }

                    controller.close();
                }
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/html; charset=UTF-8"
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