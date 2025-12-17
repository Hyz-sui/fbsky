import { AtpAgent, AppBskyFeedDefs, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia } from '@atproto/api';
import { NotFoundError } from '@atproto/api/dist/client/types/app/bsky/feed/getPostThread';

const agent: AtpAgent = new AtpAgent({
    service: 'https://api.bsky.app/',
});

export type ApiErrorKind = 'RespondedWithFailure' | 'NotFound';

export type PostSummary = {
    accountName: string | undefined;
    handle: string;
    text: string | undefined;
    authorDid: string;
    rkey: string;
    avatarUrl: string | undefined;
    imageUrl: string | undefined;
};
export const isPostSummary = (value: any): value is PostSummary => {
    return value && typeof value === 'object' &&
        'accountName' in value &&
        'handle' in value && typeof value.handle === 'string' &&
        'text' in value &&
        'authorDid' in value && typeof value.authorDid === 'string' &&
        'rkey' in value && typeof value.rkey === 'string' &&
        'avatarUrl' in value &&
        'imageUrl' in value;
}

export type ProfileSummary = {
    displayName: string | undefined;
    did: string;
    handle: string;
    avatarUrl: string | undefined;
    description: string | undefined;
}
export const isProfileSummary = (value: any): value is ProfileSummary => {
    return value && typeof value === 'object' &&
        'displayName' in value &&
        'did' in value && typeof value.did === 'string' &&
        'handle' in value && typeof value.handle === 'string' &&
        'avatarUrl' in value &&
        'description' in value;
}

export const blueskyService = {
    getPost: async (uri: string): Promise<PostSummary | ApiErrorKind> => {
        try {
            const response = await agent.getPostThread({
                uri: uri,
                depth: 0,
                parentHeight: 0,
            });

            if (!response.success) {
                return 'RespondedWithFailure'
            }

            const thread = response.data.thread;

            if (!AppBskyFeedDefs.isThreadViewPost(thread)) {
                return 'NotFound'
            }

            const post = thread.post;
            const record = post.record;
            const text = typeof record.text === 'string' ? record.text : undefined;

            const embed = post.embed;
            const imageUrl = AppBskyEmbedImages.isView(embed)
                ? embed.images[0].fullsize
                : AppBskyEmbedRecordWithMedia.isView(embed) && AppBskyEmbedImages.isView(embed.media)
                    ? embed.media.images[0].fullsize
                    : undefined;

            return {
                accountName: post.author.displayName,
                handle: post.author.handle,
                text,
                authorDid: post.author.did,
                rkey: post.uri.split('/').pop()!,
                avatarUrl: post.author.avatar,
                imageUrl,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return 'NotFound'
            }
            console.error('Error fetching post:', error);
            return 'RespondedWithFailure'
        }
    },
    getProfile: async (identifier: string): Promise<ProfileSummary | ApiErrorKind> => {
        try {
            const response = await agent.getProfile({
                actor: identifier,
            });

            if (!response.success) {
                return 'RespondedWithFailure'
            }

            const profile = response.data;
            const displayName = profile.displayName;
            const did = profile.did;
            const handle = profile.handle;
            const avatarUrl = profile.avatar;
            const description = profile.description;

            return {
                displayName,
                did,
                handle,
                avatarUrl,
                description,
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            return 'RespondedWithFailure'
        }
    },
}

export type BlueskyService = typeof blueskyService;
