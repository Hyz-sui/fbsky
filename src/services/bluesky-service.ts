import { AtpAgent, AppBskyFeedDefs, AppBskyFeedPost } from '@atproto/api';
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
};
export const isPostSummary = (value: any): value is PostSummary => {
    return value && typeof value === 'object' &&
        'accountName' in value &&
        'handle' in value && typeof value.handle === 'string' &&
        'text' in value &&
        'authorDid' in value && typeof value.authorDid === 'string' &&
        'rkey' in value && typeof value.rkey === 'string' &&
        'avatarUrl' in value;
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

            return {
                accountName: post.author.displayName,
                handle: post.author.handle,
                text,
                authorDid: post.author.did,
                rkey: post.uri.split('/').pop()!,
                avatarUrl: post.author.avatar,
            };
        } catch (error) {
            if (error instanceof NotFoundError) {
                return 'NotFound'
            }
            console.error('Error fetching post:', error);
            return 'RespondedWithFailure'
        }
    },
}

export type BlueskyService = typeof blueskyService;
