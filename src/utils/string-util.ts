/**
 * Converts a raw string to an HTML string.
 * 
 * This utility escapes the following special characters:
 * - &amp;
 * - &lt;
 * - &gt;
 * - &quot;
 * - &#39;
 * - &#47;
 * 
 * Only strings returned by this utility and their concatenations (can include hard-coded strings) can be named with the "safe" prefix (Hungarian notation).
 * 
 * @param str Raw string.
 * @returns HTML string.
 */
export const escapeHtml = (str: string) => {
    return str.replace(/[&<>"'/]/g, (match) => {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            case "/": return '&#47;';
            default: return match;
        }
    });
};

export const escapeJavaScript = (str: string) => {
    return JSON.stringify(str)
        .slice(1, -1)
        .replace(/[&<>'\/`\u2028\u2029]/g, (match) => {
            switch (match) {
                case '&': return '\\u0026';
                case '<': return '\\u003c';
                case '>': return '\\u003e';
                case "'": return '\\u0027';
                case '/': return '\\u002f';
                case '`': return '\\u0060';
                case '\u2028': return '\\u2028';
                case '\u2029': return '\\u2029';
                default: return match;
            }
        });
};

/**
 * Encodes a DID string for use in a URI component.
 * 
 * Bluesky does not recognize percent-encoded colons in DID strings, so this utility leaves ":" as is.
 * 
 * The result of this utility must be escaped according to the output context; do not use the result directly in output contexts.
 * 
 * @param did Raw DID string.
 * @returns Encoded DID string but ":" is left as is.
 */
export const encodeUriComponentDid = (did: string) => {
    return encodeURIComponent(did).replace(/%3[aA]/g, ':');
};
