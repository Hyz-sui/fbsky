import { ClientEnvironment } from "../client-environment";
import { PostSummary } from "../services/bluesky-service";
import { escapeHtml } from "../utils/string-util";

export const generatePostRedirectPage = (post: PostSummary, clientEnvironment: ClientEnvironment): string => {
    const safeAccountName = post.accountName ? escapeHtml(post.accountName) : undefined;
    const safeHandle = escapeHtml(post.handle);
    const safeText = post.text ? escapeHtml(post.text) : undefined;
    const safeAuthorDid = escapeHtml(post.authorDid);
    const safeRkey = escapeHtml(post.rkey);

    const safePageTitle = `${safeAccountName
        ? `${safeAccountName} (@${safeHandle})`
        : safeHandle
        } ${clientEnvironment.language === 'ja'
            ? 'さんの投稿'
            : '\'s post'
        }`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safePageTitle}</title>
    <meta property="og:title" content="${safePageTitle}">
    <meta property="og:description" content="${safeText}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bsky.app/profile/${safeAuthorDid}/post/${safeRkey}">
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
            ? `自動で移動しない場合: <a href="https://bsky.app/profile/${safeAuthorDid}/post/${safeRkey}">手動で移動する</a>`
            : `If you are not redirected automatically: <a href="https://bsky.app/profile/${safeAuthorDid}/post/${safeRkey}">JUMP TO BLUESKY MANUALLY</a>`
        }</p>
    <script>
        setTimeout(() => {
            window.location.replace("https://bsky.app/profile/${safeAuthorDid}/post/${safeRkey}");
        }, 1000);
    </script>
</body>
</html>
    `;
}
