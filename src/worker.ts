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
import jaAboutHtml from './static/ja/about/index.html';
import enAboutHtml from './static/en/about/index.html';
import { generatePostRedirectPage } from "./redirect-pages/post";
import { generateProfileRedirectPage } from "./redirect-pages/profile";
import { FeedGeneratorSummary, isFeedGeneratorSummary } from "./services/bsky-summary/feed-generator-summary";
import { generateFeedGeneratorRedirectPage } from "./redirect-pages/feed-generator";

type FetchErrorKind = 'InvalidUrl' | 'NotFound' | 'ApiFailure';

const respondWithRedirect = (to: string): ResponseSummary => {
    return {
        content: '',
        mimeType: 'text/html',
        status: 308,
        headers: {
            'Location': to,
        },
    };
}

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

const respondWithFeedGeneratorSummary = (feedGeneratorSummary: FeedGeneratorSummary, clientEnvironment: ClientEnvironment): ResponseSummary => {
    return {
        content: generateFeedGeneratorRedirectPage(feedGeneratorSummary, clientEnvironment),
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

const respondWithAboutPage = (clientEnvironment: ClientEnvironment): ResponseSummary => {
    return {
        content: clientEnvironment.language === 'ja' ? jaAboutHtml : enAboutHtml,
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
const feedGeneratorUrlRegex = /^\/profile\/(?<identifier>[^/]+)\/feed\/(?<cid>[^/]+)$/;

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

const fetchFeedGeneratorSummary = async (
    blueskyService: BlueskyService,
    query: { identifier: string, cid: string },
): Promise<FetchErrorKind | FeedGeneratorSummary> => {
    try {
        const feedGeneratorSummary = await blueskyService.getFeedGenerator(`at://${query.identifier}/app.bsky.feed.generator/${query.cid}`);
        if (feedGeneratorSummary === 'NotFound') {
            return 'NotFound';
        }
        if (feedGeneratorSummary === 'RespondedWithFailure') {
            return 'ApiFailure';
        }
        return feedGeneratorSummary;
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
    const decodedPathname = decodeURIComponent(url.pathname);
    if (decodedPathname === '/') {
        return respondWithTopPage(clientEnvironment);
    }
    if (/^\/about\/?$/.test(decodedPathname)) {
        if (clientEnvironment.language === 'ja') {
            return respondWithRedirect(encodeURI('/このサイトについて/'));
        }
        return respondWithAboutPage(clientEnvironment);
    }
    if (/^\/このサイトについて\/?$/.test(decodedPathname)) {
        if (clientEnvironment.language === 'en') {
            return respondWithRedirect('/about/');
        }
        return respondWithAboutPage(clientEnvironment);
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

    const feedGeneratorMatch = url.pathname.match(feedGeneratorUrlRegex);
    if (feedGeneratorMatch && feedGeneratorMatch.groups && feedGeneratorMatch.groups.identifier && feedGeneratorMatch.groups.cid) {
        const { identifier, cid } = feedGeneratorMatch.groups;
        const feedGeneratorSummary = await fetchFeedGeneratorSummary(blueskyService, { identifier, cid });
        const isErroring = !isFeedGeneratorSummary(feedGeneratorSummary);
        if (isErroring) {
            return respondWithError(errorResponseService, feedGeneratorSummary, clientEnvironment);
        }
        return respondWithFeedGeneratorSummary(feedGeneratorSummary, clientEnvironment);
    }

    return respondWith404(errorResponseService, clientEnvironment);
}
