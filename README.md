# Me｜日本酒タイプ診断

32問の回答からキャラクターと日本酒のタイプを紹介するWebアプリです。

公開サイト：https://ryoryo78.github.io/Sake-Personality-Test/

## ファイル構成

```text
├── index.html           トップページ
├── diagnosis.html       診断ページ
├── result.html          診断結果・詳しいタイプ紹介
├── characters.html      キャラクター一覧
├── css/                 ページ別・共通スタイル
├── js/                  ページ処理、タイプデータ、採点処理
├── data/                質問データ（questions.json）
├── images/              16種類のキャラクター画像
└── assets/
    ├── backgrounds/     背景・装飾画像、デザイン素材
    ├── previews/        トップページ用の画像素材
    ├── instagram-glyph.png
    └── x-logo.svg
```

## 編集と公開

HTMLは最上位に置き、既存のページURLを維持しています。
JavaScript内の画像・データURLはHTMLからの相対パス、CSS内の画像URLはCSSファイルからの相対パスです。

ビルド不要の静的サイトです。`main` ブランチのルートをGitHub Pagesで公開しています。
背景の元デザイン素材は、再編集用に `assets/backgrounds/` に保管しています。
