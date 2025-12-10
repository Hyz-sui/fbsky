import { ClientEnvironment } from "../client-environment";

import jaPostNotFoundHtml from '../static/ja/error/post-not-found.html';
import enPostNotFoundHtml from '../static/en/error/post-not-found.html';
import jaApiFailureHtml from '../static/ja/error/api-failure.html';
import enApiFailureHtml from '../static/en/error/api-failure.html';
import ja404Html from '../static/ja/error/404.html';
import en404Html from '../static/en/error/404.html';

// 基本HTML(Acceptは一旦考慮しないことにする)
export type UsedErrorPageMimeType = 'text/html' | 'application/json' | 'text/plain';

export type ResponseContentSummary = {
    content: string;
    mimeType: UsedErrorPageMimeType;
}

export const errorResponseService = {
    get404Page: (clientEnvironment: ClientEnvironment): ResponseContentSummary => {
        return {
            content: clientEnvironment.language === 'ja' ? ja404Html : en404Html,
            mimeType: 'text/html',
        };
    },
    getPostNotFoundPage: (clientEnvironment: ClientEnvironment): ResponseContentSummary => {
        return {
            content: clientEnvironment.language === 'ja' ? jaPostNotFoundHtml : enPostNotFoundHtml,
            mimeType: 'text/html',
        };
    },
    getApiFailurePage: (clientEnvironment: ClientEnvironment): ResponseContentSummary => {
        return {
            content: clientEnvironment.language === 'ja' ? jaApiFailureHtml : enApiFailureHtml,
            mimeType: 'text/html',
        };
    },
};

export type ErrorResponseService = typeof errorResponseService;

