import { ClientEnvironment } from "../client-environment";
import { PostSummary } from "../services/bluesky-service";
import { escapeHtml, escapeJavaScript } from "../utils/string-util";

export const generatePostRedirectPage = (post: PostSummary, clientEnvironment: ClientEnvironment): string => {
    const safeAccountName = post.accountName ? escapeHtml(post.accountName) : undefined;
    const safeHandle = escapeHtml(post.handle);
    const safeText = post.text ? escapeHtml(post.text) : undefined;

    const dangerousEncodedAuthorDid = encodeURIComponent(post.authorDid).replace(/%3[aA]/g, ':');
    const safeEncodedAuthorDid = escapeHtml(dangerousEncodedAuthorDid);
    const jsEncodedAuthorDid = escapeJavaScript(dangerousEncodedAuthorDid);

    const dangerousEncodedRkey = encodeURIComponent(post.rkey);
    const safeEncodedRkey = escapeHtml(dangerousEncodedRkey);
    const jsEncodedRkey = escapeJavaScript(dangerousEncodedRkey);

    const dangerousWellFormedText = post.text ? post.text.replace(/\n+/g, ' ') : undefined;
    const safeWellFormedText = dangerousWellFormedText ? escapeHtml(dangerousWellFormedText) : undefined;

    const safePageTitle = `${safeAccountName
        ? `${safeAccountName} (@${safeHandle})`
        : safeHandle
        }${safeWellFormedText
            ? `: ${safeWellFormedText}`
            : clientEnvironment.language === 'ja'
                ? 'さんの投稿'
                : '\'s post'
        }`;

    const jsRedirectScript = `
setTimeout(() => {
    window.location.replace("https://bsky.app/profile/${jsEncodedAuthorDid}/post/${jsEncodedRkey}");
}, 1000);
        `;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safePageTitle}</title>
    <meta property="og:title" content="${safePageTitle}">
    <meta property="og:description" content="${safeText
        || (clientEnvironment.language === 'ja'
            ? '投稿を見る'
            : 'View post')
        }">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bsky.app/profile/${safeEncodedAuthorDid}/post/${safeEncodedRkey}">
</head>
<body>
    <h1>${clientEnvironment.language === 'ja'
            ? '移動しています...'
            : 'Redirecting to post...'
        }</h1>
    <p>${clientEnvironment.language === 'ja'
            ? 'すこしだけお待ちください...'
            : 'Please wait a moment...'
        }</p>
    <p>${clientEnvironment.language === 'ja'
        ? `自動で移動しない場合: <a href="https://bsky.app/profile/${safeEncodedAuthorDid}/post/${safeEncodedRkey}">手動で移動する</a>`
        : `If you are not redirected automatically: <a href="https://bsky.app/profile/${safeEncodedAuthorDid}/post/${safeEncodedRkey}">JUMP TO BLUESKY MANUALLY</a>`
        }</p>
    <script>
        ${jsRedirectScript}
    </script>
</body>
</html>
    `;
}
