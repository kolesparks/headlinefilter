
import * as cheerio from "cheerio";


export type NewsArticle = {
    source: string;
    linkText: string;
    linkHref?: string;
    timestamp: string;
    relativeTime: string;
    author: string;
}

export function parseNews(html: string) {
    const { html: cleanedHtml, links } = cleanHtml(html);

    const $ = cheerio.load(cleanedHtml);
    const articles: NewsArticle[] = [];

    $("a").each((_, element) => {
        const $article = $(element);
        const isArticleLink = $article.next().is("time"); //if anchor is followed by time
        if (!isArticleLink) {
            return;
        }
        const source = $article.prev().contents().text().trim();
        const rawLinkText = $article.text();
        const linkText = rawLinkText
            .trim()
            .replaceAll("\n", " ")
            .replace(/\s+/g, " ");
        const timestamp = $article.next().attr("datetime") || "";
        const relativeTime = $article
            .next()
            .text()
            .trim()
            .replaceAll("\n", " ")
            .replace(/\s+/g, " ");
        const author = $article
            .next()
            .next().is("hr") && $article.next().next().next().is("span") ?
            $article.next().next().next().contents().text()
                .replace("By ", "")
                .trim()
                .replaceAll("\n", " ")
                .replace(/\s+/g, " ") : "";


        articles.push({
            source,
            linkText,
            linkHref: links.has(rawLinkText) ? links.get(rawLinkText)?.includes('./read') ? `https://news.google.com/${links.get(rawLinkText)?.replace('./', '')}` : links.get(rawLinkText) : "",
            timestamp,
            relativeTime,
            author,
        });
    });

    return articles.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
}

function cleanHtml(html: string) {
    const $ = cheerio.load(html);

    const links = new Map<string, string>();
    // Remove all script and style tags
    $("script, style").remove();

    // remove svgs
    $("svg").remove();
    // remove all images
    $("img").remove();
    // remove buttons
    $("button").remove();
    // replace c-wiz elements
    $("c-wiz").each((_, el) => {
        $(el).replaceWith($(el).contents());
    });
    //remove c-data
    $("c-data").remove();
    // remove figure
    $("figure").remove();
    // remove empty divs
    $("div").each((_, el) => {
        if ($(el).text().trim() === "") {
            $(el).remove();
        }
    });
    // unnest divs
    $("div").each((_, el) => {
        if ($(el).parent().is("div") &&
            // exclude article source divs
            !$(el).next().is("a")) {
            $(el).replaceWith($(el).contents());
        }
    });

    // remove more divs
    $("div").each((_, el) => {
        if ($(el).contents().text().trim() === "More" || $(el).contents().text().startsWith("See more headlines")) {
            $(el).remove()
        }
    });

    // remove empty spans
    $("span").each((_, el) => {
        if ($(el).text().trim() === "") {
            $(el).remove();
        }
    });

    // Remove all element attributes
    $("*").each((_, el) => {
        // if link, save to links.txt
        if ($(el).attr("href")) {
            links.set($(el).text(), $(el).attr("href")!);
        }
        $(el).removeAttr("class");
        $(el).removeAttr("id");
        $(el).removeAttr("style");
        $(el).removeAttr("aria-hidden");
        $(el).removeAttr("aria-autocomplete");
        $(el).removeAttr("aria-haspopup");
        $(el).removeAttr("aria-expanded");
        $(el).removeAttr("aria-controls");
        $(el).removeAttr("aria-selected");
        $(el).removeAttr("aria-label");
        $(el).removeAttr("aria-live");
        $(el).removeAttr("aria-describedby");
        $(el).removeAttr("aria-labelledby");
        $(el).removeAttr("aria-disabled");
        $(el).removeAttr("aria-level");
        $(el).removeAttr("role");
        $(el).removeAttr("href");
        $(el).removeAttr("jsname");
        $(el).removeAttr("jsaction");
        $(el).removeAttr("jscontroller");
        $(el).removeAttr("name");
        $(el).removeAttr("value");
        $(el).removeAttr("jsshadow");
        $(el).removeAttr("jsdata");
        $(el).removeAttr("jsmodel");
        $(el).removeAttr("jslog");
        $(el).removeAttr("jsslot");
        $(el).removeAttr("tabindex");
        $(el).removeAttr("target");
        $(el).removeAttr("rel");
        $(el).removeAttr("jsrenderer");
        $(el).removeAttr("c-wiz");
        $(el).removeAttr("view");
        $(el).removeAttr("ve-visible");
        $(el).removeAttr("ng-non-bindable");
        Object.keys($(el).data()).forEach((key) => {
            const kebabKey = key.replace(
                /[A-Z]/g,
                (letter) => `- ${letter.toLowerCase()}`
            );
            $(el).removeAttr(`data - ${kebabKey}`);
            //fallback
            $(el).removeAttr(`data - ${key}`);
        });
    });

    // remove empty anchors
    $("a").each((_, el) => {
        if ($(el).text().trim() === "") {
            $(el).remove();
        }
    });

    // Extract the body text
    const text = $("body").html()!;

    return { html: text, links };
}
