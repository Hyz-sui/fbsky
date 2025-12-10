import { ClientEnvironment } from "./client-environment";
import { ResponseSummary } from "./response-summary";
import { BlueskyService, isPostSummary, PostSummary } from "./services/bluesky-service";
import { ErrorResponseService } from "./services/error-response-service";

import jaIndexHtml from './static/ja/index.html';
import enIndexHtml from './static/en/index.html';
import { generatePostRedirectPage } from "./redirect-pages/post";

type FetchErrorKind = 'InvalidUrl' | 'NotFound' | 'ApiFailure';

const respondWithPostSummary = (postSummary: PostSummary, clientEnvironment: ClientEnvironment): ResponseSummary => {
    // 仮
    return {
        content: generatePostRedirectPage(postSummary, clientEnvironment),
        mimeType: 'text/html',
        status: 200,
    };
}

const respondWithTopPage = (clientEnvironment: ClientEnvironment): ResponseSummary => {
    return {
        content: clientEnvironment.language === 'ja' ? jaIndexHtml : enIndexHtml,
        mimeType: 'text/html',
        status: 200,
    };
}

const respondWithError = (
    errorResponseService: ErrorResponseService,
    errorKind: FetchErrorKind,
    clientEnvironment: ClientEnvironment,
): ResponseSummary => {
    if (errorKind === 'InvalidUrl') {
        const responseContentSummary = errorResponseService.get404Page(clientEnvironment);
        return {
            content: responseContentSummary.content,
            mimeType: responseContentSummary.mimeType,
            status: 404,
        };
    }
    if (errorKind === 'NotFound') {
        const responseContentSummary = errorResponseService.getPostNotFoundPage(clientEnvironment);
        return {
            content: responseContentSummary.content,
            mimeType: responseContentSummary.mimeType,
            status: 404,
        };
    }
    if (errorKind === 'ApiFailure') {
        const responseContentSummary = errorResponseService.getApiFailurePage(clientEnvironment);
        return {
            content: responseContentSummary.content,
            mimeType: responseContentSummary.mimeType,
            status: 502,
        };
    }
    return {
        content: 'Internal Server Error',
        mimeType: 'text/plain',
        status: 500,
    };
}

const postUrlRegex = /^\/profile\/(?<identifier>[^/]+)\/post\/(?<rkey>[^/]+)$/;

// https://bsky.app/profile/hyzsui.com/post/3m7ieabkso22k
// https://fbsky.domain.example/profile/hyzsui.com/post/3m7ieabkso22k
const extractPostUri = (requestUrl: URL) => {
    const path = requestUrl.pathname;

    const postMatch = path.match(postUrlRegex);
    if (postMatch) {
        const { identifier, rkey } = postMatch.groups!;
        return `at://${identifier}/app.bsky.feed.post/${rkey}`;
    }
    return undefined;
}

const fetchPostSummary = async (blueskyService: BlueskyService, requestUrl: URL): Promise<FetchErrorKind | PostSummary> => {
    const postUri = extractPostUri(requestUrl);
    if (!postUri) {
        return 'InvalidUrl';
    }
    try {
        const postSummary = await blueskyService.getPost(postUri);
        if (postSummary === 'NotFound') {
            return 'NotFound';
        }
        if (postSummary === 'RespondedWithFailure') {
            return 'ApiFailure';
        }
        return postSummary;
    } catch (error) {
        return 'ApiFailure';
    }
}

export const work = async (
    blueskyService: BlueskyService,
    errorResponseService: ErrorResponseService,
    requestUrl: string,
    clientEnvironment: ClientEnvironment,
) => {
    const url = new URL(requestUrl);
    console.log(url.pathname);
    if (url.pathname === '/') {
        return respondWithTopPage(clientEnvironment);
    }
    const postSummary = await fetchPostSummary(blueskyService, url);
    const isErroring = !isPostSummary(postSummary);
    if (isErroring) {
        return respondWithError(errorResponseService, postSummary, clientEnvironment);
    }
    return respondWithPostSummary(postSummary, clientEnvironment);
}
