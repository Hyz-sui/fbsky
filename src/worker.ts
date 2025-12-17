import { ClientEnvironment } from "./client-environment";
import { ResponseSummary } from "./response-summary";
import { BlueskyService } from "./services/bluesky-service";
import { isProfileSummary } from './services/bsky-summary/profile-summary';
import { ProfileSummary } from './services/bsky-summary/profile-summary';
import { isPostSummary } from './services/bsky-summary/post-summary';
import { PostSummary } from './services/bsky-summary/post-summary';
import { ErrorResponseService } from "./services/error-response-service";

import jaIndexHtml from './static/ja/index.html';
import enIndexHtml from './static/en/index.html';
import { generatePostRedirectPage } from "./redirect-pages/post";
import { generateProfileRedirectPage } from "./redirect-pages/profile";

type FetchErrorKind = 'InvalidUrl' | 'NotFound' | 'ApiFailure';

const respondWithPostSummary = (postSummary: PostSummary, clientEnvironment: ClientEnvironment): ResponseSummary => {
    return {
        content: generatePostRedirectPage(postSummary, clientEnvironment),
        mimeType: 'text/html',
        status: 200,
    };
}

const respondWithProfileSummary = (profileSummary: ProfileSummary, clientEnvironment: ClientEnvironment): ResponseSummary => {
    return {
        content: generateProfileRedirectPage(profileSummary, clientEnvironment),
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

const respondWith404 = (errorResponseService: ErrorResponseService, clientEnvironment: ClientEnvironment): ResponseSummary => {
    const responseContentSummary = errorResponseService.get404Page(clientEnvironment);
    return {
        content: responseContentSummary.content,
        mimeType: responseContentSummary.mimeType,
        status: 404,
    };
}

const respondWithError = (
    errorResponseService: ErrorResponseService,
    errorKind: FetchErrorKind,
    clientEnvironment: ClientEnvironment,
): ResponseSummary => {
    if (errorKind === 'InvalidUrl') {
        return respondWith404(errorResponseService, clientEnvironment);
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
const profileUrlRegex = /^\/profile\/(?<identifier>[^/]+)$/;

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

const fetchPostSummary = async (
    blueskyService: BlueskyService,
    query: { identifier: string, rkey: string },
): Promise<FetchErrorKind | PostSummary> => {
    try {
        const postUri = `at://${query.identifier}/app.bsky.feed.post/${query.rkey}`;
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

const fetchProfileSummary = async (
    blueskyService: BlueskyService,
    query: { identifier: string },
): Promise<FetchErrorKind | ProfileSummary> => {
    try {
        const profileSummary = await blueskyService.getProfile(query.identifier);
        if (profileSummary === 'NotFound') {
            return 'NotFound';
        }
        if (profileSummary === 'RespondedWithFailure') {
            return 'ApiFailure';
        }
        return profileSummary;
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
    if (url.pathname === '/') {
        return respondWithTopPage(clientEnvironment);
    }
    const postMatch = url.pathname.match(postUrlRegex);
    if (postMatch && postMatch.groups && postMatch.groups.identifier && postMatch.groups.rkey) {
        const { identifier, rkey } = postMatch.groups;
        const postSummary = await fetchPostSummary(blueskyService, { identifier, rkey });
        const isErroring = !isPostSummary(postSummary);
        if (isErroring) {
            return respondWithError(errorResponseService, postSummary, clientEnvironment);
        }
        return respondWithPostSummary(postSummary, clientEnvironment);
    }
    const profileMatch = url.pathname.match(profileUrlRegex);
    if (profileMatch && profileMatch.groups && profileMatch.groups.identifier) {
        const { identifier } = profileMatch.groups;
        const profileSummary = await fetchProfileSummary(blueskyService, { identifier });
        const isErroring = !isProfileSummary(profileSummary);
        if (isErroring) {
            return respondWithError(errorResponseService, profileSummary, clientEnvironment);
        }
        return respondWithProfileSummary(profileSummary, clientEnvironment);
    }
    return respondWith404(errorResponseService, clientEnvironment);
}
