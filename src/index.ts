import { ClientEnvironment } from "./client-environment";
import { blueskyService } from "./services/bluesky-service";
import { work } from "./worker";
import { errorResponseService } from "./services/error-response-service";


export default {

    async fetch(request, env, ctx): Promise<Response> {
        const requestUrl = new URL(request.url);
        // UA is browser or wants to be treated as browser
        const isBrowser = (() => {
            if (request.headers.has('sec-fetch-mode')) {
                return true;
            }
            const userAgent = request.headers.get('user-agent');
            return userAgent && userAgent.includes('Mozilla');
        })();
        const language = (() => {
            // If browser, use Accept-Language header
            if (isBrowser) {
                return request.headers.get('Accept-Language');
            }
            // Expects Twitterbot or other bots
            const langParameter = requestUrl.searchParams.get('lang');
            return langParameter || request.headers.get('Accept-Language');
        })();
        // 優先順位の判定はサボる
        const isJapanese = language?.includes('ja');
        const clientEnvironment: ClientEnvironment = {
            language: isJapanese ? 'ja' : 'en',
        };

        const responseContentSummary = await work(blueskyService, errorResponseService, request.url, clientEnvironment);
        return new Response(responseContentSummary.content, {
            headers: {
                'Content-Type': responseContentSummary.mimeType,
                ...responseContentSummary.headers,
            },
            status: responseContentSummary.status,
        });
    },
} satisfies ExportedHandler<Env>;
