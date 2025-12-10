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

