// @ts-check

import { showSnackbar } from './snackbar.js';

/**
 * 有効なBlueskyのURLかどうかを判定する
 * @param {URL} url 
 * @returns {boolean}
 */
const isValidUrl = (url) => {
    const host = url.hostname;
    if (host !== 'bsky.app') {
        return false;
    }
    return true;
}
/**
 * @param {URL} url 
 * @returns {string}
 */
const toFixedUrl = (url) => {
    const path = url.pathname;
    const currentUrl = new URL(window.location.href);
    const currentProtocol = currentUrl.protocol;
    const currentHost = currentUrl.hostname;
    const currentPort = currentUrl.port;
    const fixedUrl = `${currentProtocol}//${currentHost}${currentPort ? `:${currentPort}` : ''}${path}`;
    return fixedUrl;
}
/**
 * @param {HTMLInputElement} urlInput 
 * @param {HTMLDivElement} fixedUrlArea 
 * @param {HTMLAnchorElement} fixedUrlElement 
 * @param {HTMLButtonElement} copyFixedUrlButton 
 */
const updateFixedUrl = (urlInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton) => {
    const urlString = urlInput.value;
    try {
        const url = new URL(urlString);
        if (!isValidUrl(url)) {
            fixedUrlElement.textContent = '';
            fixedUrlElement.href = '';
            fixedUrlElement.style.visibility = 'hidden';
            copyFixedUrlButton.ariaDisabled = 'true';
            return;
        }
        const fixedUrl = toFixedUrl(url);
        fixedUrlElement.textContent = fixedUrl;
        fixedUrlElement.href = fixedUrl;
        fixedUrlElement.style.visibility = 'visible';
        fixedUrlArea.style.visibility = 'visible';
        copyFixedUrlButton.ariaDisabled = 'false';
    } catch (error) {
        fixedUrlElement.textContent = '';
        fixedUrlElement.href = '';
        fixedUrlElement.style.visibility = 'hidden';
        copyFixedUrlButton.ariaDisabled = 'true';
        return;
    }
}
/**
 * @param {HTMLAnchorElement} fixedUrlElement 
 * @returns {Promise<void>}
 */
const copyFixedUrl = async (fixedUrlElement) => {
    const fixedUrl = fixedUrlElement.textContent;
    if (fixedUrl) {
        const lang = document.documentElement.lang;
        const isJapanese = lang === 'ja';
        try {
            await navigator.clipboard.writeText(fixedUrl);
        } catch (error) {
            showSnackbar(isJapanese ? 'URLをコピーできませんでした' : 'Failed to copy URL', {
                duration: 8000,
                allowClose: true
            });
            return;
        }
        showSnackbar(isJapanese ? 'URLをコピーしました' : 'URL copied to clipboard');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = /** @type {HTMLInputElement} */ (document.getElementById('url'));
    const fixedUrlArea = /** @type {HTMLDivElement} */ (document.getElementById('fixedUrlArea'));
    const fixedUrlElement = /** @type {HTMLAnchorElement} */ (document.getElementById('fixedUrl'));
    const copyFixedUrlButton = /** @type {HTMLButtonElement} */ (document.getElementById('copyFixedUrlButton'));
    urlInput.addEventListener('input', () => {
        updateFixedUrl(urlInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton);
    });
    copyFixedUrlButton.addEventListener('click', async () => {
        await copyFixedUrl(fixedUrlElement);
    });
    updateFixedUrl(urlInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton);
});
