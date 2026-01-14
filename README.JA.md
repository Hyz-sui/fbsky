# fbsky

[![ライセンス: MIT](https://img.shields.io/github/license/Hyz-sui/fbsky?style=for-the-badge&labelColor=222222&color=afbdff)](https://github.com/Hyz-sui/fbsky/blob/main/LICENSE)
[![Bluesky: @hyzsui.com](https://img.shields.io/badge/Bluesky-%40hyzsui.com-afbdff?style=for-the-badge&logo=bluesky&labelColor=222222)
](https://bsky.app/profile/hyzsui.com)

https://fbsky.hyzsui.com/

BlueskyのリンクをSNSなどでリンクカードとして表示するためのツールです。

## 機能

APIを利用してポストやプロフィール等の情報を取得し、[Open Graph Protocol](https://ogp.me/)に従ったメタタグを生成します。

ブラウザなどでアクセスされた場合、元の投稿等へリダイレクトします。

URLのパス構成はBlueskyと同一で、BlueskyのURL (`https://bsky.app/...`) の `bsky.app` 部分をこのツールをデプロイしたドメインに置き換えたものになっています。

## 使い方

単にURLの `bsky.app` 部を置き換えてもよいですが、トップページの変換ツールを利用すると打ち間違いの心配がなく、サムネイル表示などのカスタマイズも可能です。

## 開発

このプロジェクトは [Cloudflare Workers](https://www.cloudflare.com/ja-jp/developer-platform/products/workers/) 上で動作します。

### 前提条件

- Node.js
- npm

### ローカルでの開発

依存関係をインストールし、ローカル開発サーバーを起動します。

1. 依存関係のインストール
    ```bash
    $ npm install
    ```

2. ローカル開発サーバーの起動
    ```bash
    $ npm run dev
    ```

## Credits & Thanks

- [Google Fonts](https://fonts.google.com/icons): アイコンを使用しています。  
    [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt)
- [@atproto/api](https://www.npmjs.com/package/@atproto/api): APIからBlueskyの情報を取得するために使用しています。  
    [Apache License 2.0](https://github.com/bluesky-social/atproto/blob/main/LICENSE-APACHE.txt)

## ライセンス

[MIT License](https://github.com/Hyz-sui/fbsky/blob/main/LICENSE)
