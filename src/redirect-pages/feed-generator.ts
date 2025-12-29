import { ClientEnvironment } from "../client-environment";
import { FeedGeneratorSummary } from "../services/bsky-summary/feed-generator-summary";
import { encodeUriComponentDid, escapeHtml, escapeJavaScript } from "../utils/string-util";

export const generateFeedGeneratorRedirectPage = (feedGeneratorSummary: FeedGeneratorSummary, clientEnvironment: ClientEnvironment): string => {
    const safeFeedGenDisplayName = escapeHtml(feedGeneratorSummary.displayName);

    const safeCreatorHandle = escapeHtml(feedGeneratorSummary.creator.handle);

    const dangerousEncodedCreatorDid = encodeUriComponentDid(feedGeneratorSummary.creator.did);
    const safeEncodedCreatorDid = escapeHtml(dangerousEncodedCreatorDid);
    const jsEncodedCreatorDid = escapeJavaScript(dangerousEncodedCreatorDid);

    const dangerousEncodedFeedGenRkey = encodeURIComponent(feedGeneratorSummary.rkey);
    const safeEncodedFeedGenRkey = escapeHtml(dangerousEncodedFeedGenRkey);
    const jsEncodedFeedGenRkey = escapeJavaScript(dangerousEncodedFeedGenRkey);

    const safeFeedGenAvatarUrl = feedGeneratorSummary.avatarUrl ? escapeHtml(feedGeneratorSummary.avatarUrl) : undefined;

    const safeFeedGenDescription = feedGeneratorSummary.description ? escapeHtml(feedGeneratorSummary.description) : undefined;

    const safeFeedGenCreatorDisplayName = feedGeneratorSummary.creator.displayName ? escapeHtml(feedGeneratorSummary.creator.displayName) : undefined;

    const safeTitle = `${clientEnvironment.language === 'ja'
        ? 'Blueskyの「'
        : 'Bluesky feed &quot;'
        }${safeFeedGenDisplayName}${clientEnvironment.language === 'ja'
            ? `」フィード | ${safeFeedGenCreatorDisplayName || safeCreatorHandle} さんによるカスタムフィード`
            : `&quot; | Custom feed by ${safeFeedGenCreatorDisplayName || safeCreatorHandle}`
        }`;

    const jsRedirectScript = `
setTimeout(() => {
    window.location.replace("https://bsky.app/profile/${jsEncodedCreatorDid}/feed/${jsEncodedFeedGenRkey}");
}, 1000);
        `;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeTitle}</title>
    <meta property="og:title" content="${safeTitle}">
    ${safeFeedGenDescription ? `<meta property="og:description" content="${safeFeedGenDescription}">` : ''}
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bsky.app/profile/${safeEncodedCreatorDid}/feed/${safeEncodedFeedGenRkey}">
    ${safeFeedGenAvatarUrl ? `<meta property="og:image" content="${safeFeedGenAvatarUrl}">` : ''}
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <h1>${clientEnvironment.language === 'ja'
            ? '移動しています...'
            : 'Redirecting to feed...'
        }</h1>
    <p>${clientEnvironment.language === 'ja'
            ? 'すこしだけお待ちください...'
            : 'Please wait a moment...'
        }</p>
    <p>${clientEnvironment.language === 'ja'
            ? `自動で移動しない場合: <a href="https://bsky.app/profile/${safeEncodedCreatorDid}/feed/${safeEncodedFeedGenRkey}">手動で移動する</a>`
            : `If you are not redirected automatically: <a href="https://bsky.app/profile/${safeEncodedCreatorDid}/feed/${safeEncodedFeedGenRkey}">JUMP TO BLUESKY MANUALLY</a>`
        }</p>
    <script>
        ${jsRedirectScript}
    </script>
</body>
</html>
    `;
}
