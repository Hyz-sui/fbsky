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
};
