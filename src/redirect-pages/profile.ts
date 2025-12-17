import { ProfileSummary } from '../services/bsky-summary/profile-summary';
import { ClientEnvironment } from "../client-environment";
import { escapeHtml, escapeJavaScript } from "../utils/string-util";

export const generateProfileRedirectPage = (profileSummary: ProfileSummary, clientEnvironment: ClientEnvironment): string => {
    const safeAccountName = profileSummary.displayName ? escapeHtml(profileSummary.displayName) : undefined;

    const safeDid = escapeHtml(profileSummary.did);
    const jsDid = escapeJavaScript(profileSummary.did);

    const safeHandle = escapeHtml(profileSummary.handle);

    const safeAvatarUrl = profileSummary.avatarUrl ? escapeHtml(profileSummary.avatarUrl) : undefined;
    const safeDescription = profileSummary.description ? escapeHtml(profileSummary.description) : undefined;

    const safePageTitle = `${safeAccountName
        ? `${safeAccountName} (@${safeHandle})`
        : `@${safeHandle}`
        }${clientEnvironment.language === 'ja'
            ? ' さん | Bluesky'
            : ' | Bluesky'
        }`

    const jsRedirectScript = `
setTimeout(() => {
    window.location.replace("https://bsky.app/profile/${jsDid}");
}, 1000);
`

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safePageTitle}</title>
    <meta property="og:title" content="${safePageTitle}">
    <meta property="og:description" content="${safeDescription
        || (clientEnvironment.language === 'ja'
            ? 'プロフィールを見る'
            : 'View profile')
        }">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://bsky.app/profile/${safeDid}">
    ${safeAvatarUrl ? `<meta property="og:image" content="${safeAvatarUrl}">` : ''}
</head>
<body>
    <h1>${clientEnvironment.language === 'ja'
            ? '移動しています...'
            : 'Redirecting to profile...'
        }</h1>
    <p>${clientEnvironment.language === 'ja'
            ? 'すこしだけお待ちください...'
            : 'Please wait a moment...'
        }</p>
    <p>${clientEnvironment.language === 'ja'
            ? `自動で移動しない場合: <a href="https://bsky.app/profile/${safeDid}">手動で移動する</a>`
            : `If you are not redirected automatically: <a href="https://bsky.app/profile/${safeDid}">JUMP TO BLUESKY MANUALLY</a>`
        }</p>
    <script>
        ${jsRedirectScript}
    </script>
</body>
</html>
`
};
