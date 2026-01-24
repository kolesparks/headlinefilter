import type { NewsArticle } from "./parse-news";
import { NEWS_TOPICS_ARRAY, type NewsTopic } from "./scrape-news";



type OpenRouterResponse = {
    "id": string;
    "provider": string;
    "model": string;
    "object": string;
    "created": number;
    "choices": {
        "logprobs": null;
        "finish_reason": string;
        "native_finish_reason": string;
        "index": number;
        "message": {
            "role": string;
            "content": string;
            "refusal": null,
            "reasoning": null
        }
    }[],
    "usage": {
        "prompt_tokens": number,
        "completion_tokens": number,
        "total_tokens": number,
        "cost": number,
        "is_byok": boolean,
        "prompt_tokens_details": {
            "cached_tokens": number,
            "audio_tokens": number,
            "video_tokens": number
        },
        "cost_details": {
            "upstream_inference_cost": null | number,
            "upstream_inference_prompt_cost": number,
            "upstream_inference_completions_cost": number
        },
        "completion_tokens_details": {
            "reasoning_tokens": number,
            "image_tokens": number
        }
    }
}





export async function filterNewsArticle(article: NewsArticle, search: string) {

    const { relativeTime: _, linkHref: __, ...keyArticleDetails } = article;
    const fetchResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemma-3n-e4b-it",
            "messages": [

                {
                    "role": "system",
                    "content": `Should the article show up in results for the search term? Answer "yes" or "no".`
                },
                {
                    "role": "user",
                    "content": `====== ARTICLE ======\n"${JSON.stringify(keyArticleDetails)}"\n====== SEARCH ======\n"${search}"`
                }
            ],
            "temperature": 0.1,
            "max_tokens": 50
        })
    });



    const openRouterResponse = await fetchResponse.json() as unknown as OpenRouterResponse;
    return {
        meta: {
            openRouterResponse,
        },
        matches: openRouterResponse?.choices[0]?.message?.content?.toLowerCase().includes("yes") ? true : false,
    }
}


export async function filterNewsTopics(search: string) {

    const fetchResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemma-3n-e4b-it",
            "messages": [

                {
                    "role": "system",
                    "content": `Which of these topics should be included in this users search: ${NEWS_TOPICS_ARRAY.join(",")}? Answer with the topics separated by commas.`
                },
                {
                    "role": "user",
                    "content": search
                }
            ],
            "temperature": 0.1,
            "max_tokens": 300
        })
    });



    const openRouterResponse = await fetchResponse.json() as unknown as OpenRouterResponse;


    const parsed = openRouterResponse.choices[0]?.message.content
        .trim()
        .split(",")
        .map((s) => s.trim().toLowerCase() as NewsTopic)
        .filter((s) => NEWS_TOPICS_ARRAY.includes(s));


    return {
        topics: parsed || [],
        meta: {
            openRouterResponse,
        }
    }

}