import { ClientEnvironment } from "./client-environment";
import { blueskyService } from "./services/bluesky-service";
import { work } from "./worker";
import { errorResponseService } from "./services/error-response-service";


export default {

    async fetch(request, env, ctx): Promise<Response> {
        const language = request.headers.get('Accept-Language');
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
