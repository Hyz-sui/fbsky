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
 * @param {HTMLInputElement | null} showThumbnailInput 
 */
const wellFormInputs = (url, languageInput, showThumbnailInput) => {
    const language = languageInput?.checked ? languageInput.dataset.language || null : null;
    const showThumbnail = showThumbnailInput?.checked ?? false;
    return {
        url,
        language,
        showThumbnail
    }
}

/**
 * @typedef {ReturnType<typeof wellFormInputs>} WellFormedInput
 */

/**
 * @param {WellFormedInput} wellFormedInput 
 * @returns {string}
 */
const toFixedUrl = ({ url, language, showThumbnail }) => {
    const path = url.pathname;
    const currentUrl = new URL(window.location.href);
    const currentProtocol = currentUrl.protocol;
    const currentHost = currentUrl.hostname;
    const currentPort = currentUrl.port;

    const searchParams = new URLSearchParams();
    if (language) {
        searchParams.set('lang', language);
    }
    if (!showThumbnail) {
        searchParams.set('noThumb', '');
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
 * @param {HTMLInputElement | null} showThumbnailInput
 * @param {HTMLDivElement} fixedUrlArea 
 * @param {HTMLAnchorElement} fixedUrlElement 
 * @param {HTMLButtonElement} copyFixedUrlButton 
 * @param {HTMLButtonElement} postXButton 
 */
const updateFixedUrl = (urlInput, languageInput, showThumbnailInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton, postXButton) => {
    const urlString = urlInput.value;
    try {
        const url = new URL(urlString);
        if (!isValidUrl(url)) {
            fixedUrlElement.textContent = '';
            fixedUrlElement.href = '';
            fixedUrlElement.style.visibility = 'hidden';
            copyFixedUrlButton.ariaDisabled = 'true';
            postXButton.ariaDisabled = 'true';
            return;
        }
        const fixedUrl = toFixedUrl(wellFormInputs(url, languageInput, showThumbnailInput));
        fixedUrlElement.textContent = fixedUrl;
        fixedUrlElement.href = fixedUrl;
        fixedUrlElement.style.visibility = 'visible';
        fixedUrlArea.style.visibility = 'visible';
        copyFixedUrlButton.ariaDisabled = 'false';
        postXButton.ariaDisabled = 'false';
    } catch (error) {
        fixedUrlElement.textContent = '';
        fixedUrlElement.href = '';
        fixedUrlElement.style.visibility = 'hidden';
        copyFixedUrlButton.ariaDisabled = 'true';
        postXButton.ariaDisabled = 'true';
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

/**
 * @param {HTMLAnchorElement} fixedUrlElement
 */
const openXIntent = (fixedUrlElement) => {
    const fixedUrl = fixedUrlElement.textContent;
    if (fixedUrl) {
        const intentUrl = `https://x.com/intent/tweet?${new URLSearchParams({ url: fixedUrl }).toString()}`;
        window.open(intentUrl, '_blank', 'width=800,height=450,popup,noopener,noreferrer');
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
    try {
        const enforcement = JSON.parse(current);
        if (!isLanguageEnforcement(enforcement)) {
            return null;
        }
        return enforcement;
    } catch {
        return null;
    }
}
/**
 * @param {string} language 
 * @param {boolean} checked 
 */
const storeLanguageEnforcement = (language, checked) => {
    /** @type {LanguageEnforcement} */
    const browserEnforcement = loadLanguageEnforcement() ?? {};
    browserEnforcement[language] = checked;
    localStorage.setItem(LANGUAGE_ENFORCEMENT_STORAGE_KEY, JSON.stringify(browserEnforcement));
}

const THUMBNAIL_VISIBILITY_STORAGE_KEY = 'thumbnailVisibility';

/**
 * @returns {boolean | null}
 */
const loadThumbnailVisibility = () => {
    const current = localStorage.getItem(THUMBNAIL_VISIBILITY_STORAGE_KEY);
    if (!current) {
        return null;
    }
    try {
        const visibility = JSON.parse(current);
        if (typeof visibility !== 'boolean') {
            return null;
        }
        return visibility;
    } catch {
        return null;
    }
}

/**
 * @param {boolean} visibility 
 */
const storeThumbnailVisibility = (visibility) => {
    localStorage.setItem(THUMBNAIL_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
}

document.addEventListener('DOMContentLoaded', () => {
    const urlInput = /** @type {HTMLInputElement} */ (document.getElementById('url'));
    const fixedUrlArea = /** @type {HTMLDivElement} */ (document.getElementById('fixedUrlArea'));
    const fixedUrlElement = /** @type {HTMLAnchorElement} */ (document.getElementById('fixedUrl'));
    const copyFixedUrlButton = /** @type {HTMLButtonElement} */ (document.getElementById('copyFixedUrlButton'));
    const postXButton = /** @type {HTMLButtonElement} */ (document.getElementById('postXButton'));
    const langInput = /** @type {HTMLInputElement | null} */ (document.getElementById('lang'));
    const showThumbnailInput = /** @type {HTMLInputElement | null} */ (document.getElementById('showThumbnail'));
    urlInput.addEventListener('input', () => {
        updateFixedUrl(urlInput, langInput, showThumbnailInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton, postXButton);
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
            updateFixedUrl(urlInput, langInput, showThumbnailInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton, postXButton);
            storeLanguageEnforcement(lang, langInput.checked);
        });
    }
    if (showThumbnailInput) {
        const storedVisibility = loadThumbnailVisibility();
        if (storedVisibility !== null) {
            showThumbnailInput.checked = storedVisibility;
        }
        else {
            showThumbnailInput.checked = false;
        }
        showThumbnailInput.dataset.loaded = 'true';
        showThumbnailInput.addEventListener('change', () => {
            updateFixedUrl(urlInput, langInput, showThumbnailInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton, postXButton);
            storeThumbnailVisibility(showThumbnailInput.checked);
        });
    }

    copyFixedUrlButton.addEventListener('click', async () => {
        await copyFixedUrl(fixedUrlElement);
    });
    postXButton.addEventListener('click', () => {
        openXIntent(fixedUrlElement);
    });
    updateFixedUrl(urlInput, langInput, showThumbnailInput, fixedUrlArea, fixedUrlElement, copyFixedUrlButton, postXButton);
});
