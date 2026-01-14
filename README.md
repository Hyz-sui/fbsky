# fbsky

[![LICENSE: MIT](https://img.shields.io/github/license/Hyz-sui/fbsky?style=for-the-badge&labelColor=222222&color=afbdff)](https://github.com/Hyz-sui/fbsky/blob/main/LICENSE)
[![Bluesky: @hyzsui.com](https://img.shields.io/badge/Bluesky-%40hyzsui.com-afbdff?style=for-the-badge&logo=bluesky&labelColor=222222)
](https://bsky.app/profile/hyzsui.com)


https://fbsky.hyzsui.com/

fbsky is a tool designed to display Bluesky links as rich link cards on various social media platforms.

## Features

This tool leverages the Bluesky API to retrieve post and profile information, generating meta tags that comply with the [Open Graph Protocol](https://ogp.me/).

When a user accesses an fbsky URL via a browser, they are automatically redirected to the original post or page on Bluesky.

The URL path structure mirrors that of Bluesky; simply replace the `bsky.app` domain in any Bluesky URL (`https://bsky.app/...`) with the domain where this tool is deployed.

## Usage

While you can manually replace the `bsky.app` portion of a URL, we recommend using the conversion tool available on the homepage. It helps prevent typos and offers customization options, such as thumbnail settings.

## Development

This project is built on [Cloudflare Workers](https://www.cloudflare.com/ja-jp/developer-platform/products/workers/).

### Prerequisites

- Node.js
- npm

### Local Development

To set up the environment, install the dependencies and start the local development server.

1. Install dependencies
    ```bash
    $ npm install
    ```

2. Start local development server
    ```bash
    $ npm run dev
    ```

## Credits & Thanks

- [Google Fonts](https://fonts.google.com/icons): Icons used in this project.  
    [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
- [@atproto/api](https://www.npmjs.com/package/@atproto/api): Library used to fetch data from the Bluesky API.  
    [Apache License 2.0](https://github.com/bluesky-social/atproto/blob/main/LICENSE-APACHE.txt)

## License

[MIT License](https://github.com/Hyz-sui/fbsky/blob/main/LICENSE)
