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
 * @param {HTMLInputElement | null} languageInput 
 */
const wellFormInputs = (url, languageInput) => {
    const language = languageInput?.checked ? languageInput.dataset.language || null : null;
    return {
        url,
        language
    }
}

/**
 * @typedef {ReturnType<typeof wellFormInputs>} WellFormedInput
 */

/**
 * @param {WellFormedInput} wellFormedInput 
 * @returns {string}
 */
const toFixedUrl = ({ url, language }) => {
    const path = url.pathname;
    const currentUrl = new URL(window.location.href);
    const currentProtocol = currentUrl.protocol;
    const currentHost = currentUrl.hostname;
    const currentPort = currentUrl.port;

    const searchParams = new URLSearchParams();
    if (language) {
        searchParams.set('lang', language);
    }

    const fixedUrl = new URL('https://placeholder.example/');
    fixedUrl.protocol = currentProtocol;
    fixedUrl.host = currentHost;
    fixedUrl.port = currentPort;
    fixedUrl.pathname = path;
    fixedUrl.search = searchParams.toString();

    return fixedUrl.toString();
}
/**
 * @param {HTMLInputElement} urlInput 
 * @param {HTMLInputElement | null} languageInput
 * @param {HTMLDivElement} fixedUrlArea 
 * @param {HTMLAnchorElement} fixedUrlElement 
 * @param {HTMLButtonElement} copyFixedUrlButton 
 */
const updateFixedUrl = (urlInput, languageInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton) => {
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
        const fixedUrl = toFixedUrl(wellFormInputs(url, languageInput));
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

const LANGUAGE_ENFORCEMENT_STORAGE_KEY = 'languageEnforcement';
/**
 * @typedef {Record<string, boolean>} LanguageEnforcement
 */

/**
 * @param {unknown} arg
 * @returns {arg is LanguageEnforcement}
 */
const isLanguageEnforcement = (arg) => {
    return typeof arg === 'object' && arg !== null && arg && Object.entries(arg).every(([key, value]) => {
        return typeof key === 'string' && typeof value === 'boolean';
    });
}

/**
 * @returns {LanguageEnforcement | null}
 */
const loadLanguageEnforcement = () => {
    const current = localStorage.getItem(LANGUAGE_ENFORCEMENT_STORAGE_KEY);
    if (!current) {
        return null;
    }
    const enforcement = JSON.parse(current);
    if (!isLanguageEnforcement(enforcement)) {
        return null;
    }
    return enforcement;
}
/**
 * @param {string} language 
 * @param {boolean} checked 
 */
const storeLanguageEnforcement = (language, checked) => {
    const browserEnforcement = loadLanguageEnforcement();
    if (browserEnforcement) {
        browserEnforcement[language] = checked;
        localStorage.setItem(LANGUAGE_ENFORCEMENT_STORAGE_KEY, JSON.stringify(browserEnforcement));
    }
    else {
        /** @type {LanguageEnforcement} */
        const enforcement = {
            [language]: checked
        }
        localStorage.setItem(LANGUAGE_ENFORCEMENT_STORAGE_KEY, JSON.stringify(enforcement));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = /** @type {HTMLInputElement} */ (document.getElementById('url'));
    const fixedUrlArea = /** @type {HTMLDivElement} */ (document.getElementById('fixedUrlArea'));
    const fixedUrlElement = /** @type {HTMLAnchorElement} */ (document.getElementById('fixedUrl'));
    const copyFixedUrlButton = /** @type {HTMLButtonElement} */ (document.getElementById('copyFixedUrlButton'));
    const langInput = /** @type {HTMLInputElement | null} */ (document.getElementById('lang'));
    urlInput.addEventListener('input', () => {
        updateFixedUrl(urlInput, langInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton);
    });

    if (langInput) {
        const storedEnforcement = loadLanguageEnforcement();
        if (storedEnforcement && langInput.dataset.language) {
            langInput.checked = storedEnforcement[langInput.dataset.language] ?? true;
        }
        else {
            langInput.checked = true;
        }
        langInput.dataset.loaded = 'true';
        langInput.addEventListener('change', () => {
            const lang = langInput.dataset.language;
            if (!lang) {
                return;
            }
            updateFixedUrl(urlInput, langInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton);
            storeLanguageEnforcement(lang, langInput.checked);
        });
    }

    copyFixedUrlButton.addEventListener('click', async () => {
        await copyFixedUrl(fixedUrlElement);
    });
    updateFixedUrl(urlInput, langInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton);
});
