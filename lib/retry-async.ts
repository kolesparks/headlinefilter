


export async function retryAsync<T>(fn: () => Promise<T>, config: {
    maxAttempts: number;
    maxDelaySeconds: number;
    delayIntervalSeconds: number;
    delayMultiplier: number;
    logErrors: boolean;
}) {

    let attempts = 0;

    while (true) {
        try {
            return await fn();
        } catch (e) {
            attempts++;
            if (attempts >= config.maxAttempts) {
                throw e;
            } else {
                if (config.logErrors) {
                    console.error(e, `retrying after ${attempts} attempts...`);
                }
                const baseDelay = 1000 * config.delayIntervalSeconds;
                const multiplier = attempts * config.delayMultiplier;
                await new Promise((res) => setTimeout(() => res(0),
                    Math.min(
                        1000 * config.maxDelaySeconds,
                        (baseDelay * multiplier)
                    )
                ));
            }
        }
    }
}