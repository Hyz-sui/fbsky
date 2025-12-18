export type FeedGeneratorSummary = {
    displayName: string;
    did: string;
    rkey: string;
    avatarUrl: string | undefined;
    description: string | undefined;
    creator: {
        displayName: string | undefined;
        did: string;
        handle: string;
    }
};

export const isFeedGeneratorSummary = (value: any): value is FeedGeneratorSummary => {
    return value && typeof value === 'object' &&
        'displayName' in value && typeof value.displayName === 'string' &&
        'did' in value && typeof value.did === 'string' &&
        'rkey' in value && typeof value.rkey === 'string' &&
        'avatarUrl' in value &&
        'description' in value &&
        'creator' in value && typeof value.creator === 'object' && value.creator &&
        'displayName' in value.creator &&
        'did' in value.creator && typeof value.creator.did === 'string' &&
        'handle' in value.creator && typeof value.creator.handle === 'string';
};

