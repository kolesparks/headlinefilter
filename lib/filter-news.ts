import type { NewsArticle } from "./parse-news";



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

    const fetchResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "meta-llama/llama-3.2-3b-instruct",
            "messages": [

                {
                    "role": "system",
                    "content": `Answer the user with "yes" if the article matches the search term, otherwise say "no".`
                },
                {
                    "role": "user",
                    "content": `Article: ${JSON.stringify(article)} Search: "${search}"`
                }
            ]
        })
    });


    const openRouterResponse = await fetchResponse.json() as unknown as OpenRouterResponse;
    return {
        meta: {
            openRouterResponse,
        },
        matches: openRouterResponse.choices[0]?.message.content.toLowerCase().includes("yes") ? true : false,
    }
}