export type ProfileSummary = {
    displayName: string | undefined;
    did: string;
    handle: string;
    avatarUrl: string | undefined;
    description: string | undefined;
};

export const isProfileSummary = (value: any): value is ProfileSummary => {
    return value && typeof value === 'object' &&
        'displayName' in value &&
        'did' in value && typeof value.did === 'string' &&
        'handle' in value && typeof value.handle === 'string' &&
        'avatarUrl' in value &&
        'description' in value;
};
