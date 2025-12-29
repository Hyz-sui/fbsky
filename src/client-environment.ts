export type SupportedLanguage = 'ja' | 'en';

// Should be renamed 😅
export type ClientEnvironment = {
    language: SupportedLanguage;
    showThumbnail: boolean;
};
