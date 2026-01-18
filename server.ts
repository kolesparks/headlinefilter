

import Bun, { type BunRequest } from "bun";
import { escapeHtml } from "./lib/escape-html";
import { loadNews } from "./lib/load-news";
import { filterNewsArticle } from "./lib/filter-news";
const landingHtml = await Bun.file("./html/landing.html").text();
const emailMeFormHtml = await Bun.file("./html/email-me-form.html").text();


const port = process.env.PORT || 3000;
const hostname = process.env.PORT ? "0.0.0.0" : "localhost";


function renderLanding({ search, emailMeForm, resultsListItems }: { search: string, emailMeForm: string, resultsListItems: string }) {
    return landingHtml
        .replace("$SEARCH", escapeHtml(search))
        .replace("$EMAIL_ME_FORM", emailMeForm)
        .replace("$RESULTS_LIST_ITEMS", resultsListItems);
}

Bun.serve({
    port,
    hostname,
    routes: {

        "/": async function search(req, res) {

            const url = new URL(req.url);

            const search = url.searchParams.get("search");

            if (!search || typeof search !== "string") {
                return new Response(renderLanding({ search: "", emailMeForm: "", resultsListItems: "" }), {
                    headers: {
                        "Content-Type": "text/html"
                    }
                });
            }

            if (search.length > 1000) {
                return new Response("Search must be 1000 characters or less", { status: 400 });
            }




            return new Response(renderLanding({ search: search, emailMeForm: emailMeFormHtml, resultsListItems: "" }), {
                headers: {
                    "Content-Type": "text/html"
                }
            });
        },
    }
});


console.log(`Serving on http://${hostname}:${port}`);