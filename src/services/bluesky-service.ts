import { AtpAgent, AppBskyFeedDefs, AppBskyEmbedImages, AppBskyEmbedRecordWithMedia } from '@atproto/api';
import { NotFoundError } from '@atproto/api/dist/client/types/app/bsky/feed/getPostThread';
import { PostSummary } from './bsky-summary/post-summary';
import { ProfileSummary } from './bsky-summary/profile-summary';
import { FeedGeneratorSummary } from './bsky-summary/feed-generator-summary';

const agent: AtpAgent = new AtpAgent({
    service: 'https://api.bsky.app/',
});

export type ApiErrorKind = 'RespondedWithFailure' | 'NotFound';

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
                ? embed.images[0]?.fullsize
                : AppBskyEmbedRecordWithMedia.isView(embed) && AppBskyEmbedImages.isView(embed.media)
                    ? embed.media.images[0]?.fullsize
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

    getFeedGenerator: async (uri: string): Promise<FeedGeneratorSummary | ApiErrorKind> => {
        try {
            const response = await agent.app.bsky.feed.getFeedGenerator({
                feed: uri,
            });

            if (!response.success) {
                return 'RespondedWithFailure'
            }

            const feedGeneratorView = response.data.view;
            const feedGenDisplayName = feedGeneratorView.displayName;
            const feedGenDid = feedGeneratorView.did;
            const feedGenRkey = feedGeneratorView.uri.split('/').pop()!;
            const image = feedGeneratorView.avatar;
            const description = feedGeneratorView.description;
            const creator = feedGeneratorView.creator;
            const creatorDisplayName = creator.displayName;
            const creatorDid = creator.did;
            const creatorHandle = creator.handle;

            return {
                displayName: feedGenDisplayName,
                did: feedGenDid,
                description,
                rkey: feedGenRkey,
                avatarUrl: image,
                creator: {
                    displayName: creatorDisplayName,
                    did: creatorDid,
                    handle: creatorHandle,
                }
            };
        } catch (error) {
            console.error('Error fetching feed generator:', error);
            return 'RespondedWithFailure'
        }
    }
}

export type BlueskyService = typeof blueskyService;
