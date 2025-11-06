# ミニマムMPA完全設計書

## 📋 プロジェクト概要

### アプリケーション仕様
**シンプルなメッセージボード**

- ユーザーがメッセージを投稿できる
- 投稿されたメッセージ一覧を表示
- Aboutページ（静的ページ）

### 技術体験の目的
最小限の実装で以下の技術スタックを体験：
- ✅ Hono フレームワーク
- ✅ Tailwind CSS v4
- ✅ Islands Architecture（部分的ハイドレーション）
- ✅ Cloudflare D1（データベース）
- ✅ Cloudflare KV（SSGキャッシュ）
- ✅ Cloudflare Workers（エッジデプロイ）

---

## 🏗️ 技術スタック詳細

### コア技術

| カテゴリ | 技術 | 役割 |
|---------|------|------|
| **ランタイム** | Cloudflare Workers | エッジサーバー実行環境 |
| **フレームワーク** | Hono | 軽量Webフレームワーク |
| **言語** | TypeScript | 型安全な開発 |
| **スタイリング** | Tailwind CSS | ユーティリティファーストCSS |
| **ビルドツール** | Vite | クライアントコードバンドル |
| **デプロイ** | Wrangler | Cloudflare CLIツール |

### データストレージ

| サービス | 用途 | 特徴 |
|---------|------|------|
| **D1** | SQLiteデータベース | メッセージ保存 |
| **KV** | Key-Valueストア | SSG済みページキャッシュ |

### 開発ツール

| ツール | 用途 |
|--------|------|
| **Biome** | Lint/Format（高速） |
| **pnpm** | パッケージマネージャー |
| **Volta** | Node.jsバージョン管理 |

---

## 📁 ディレクトリ構造

```
project-root/
├── src/
│   ├── index.tsx                    # Workerエントリーポイント
│   │
│   ├── components/                  # 共有UIコンポーネント
│   │   ├── layout.tsx               # ベースレイアウト
│   │   ├── header.tsx               # ヘッダー
│   │   └── footer.tsx               # フッター
│   │
│   ├── pages/                       # SSRページ
│   │   ├── home.tsx                 # メッセージ一覧
│   │   └── about.tsx                # 静的About
│   │
│   ├── islands/                     # クライアントコンポーネント
│   │   └── message-form.tsx         # メッセージ投稿フォーム
│   │
│   ├── islands.tsx                  # Islandsエントリーポイント
│   │
│   ├── lib/                         # ユーティリティ
│   │   └── db.ts                    # DB操作ヘルパー
│   │
│   ├── types.ts                     # 型定義
│   └── style.css                    # Tailwind CSS
│
├── public/                          # 静的アセット（ビルド成果物）
│   ├── islands.js                   # Viteビルド済みJS
│   └── favicon.ico                  # アイコン
│
├── migrations/                      # D1マイグレーション
│   └── 0001_create_messages.sql
│
├── .gitignore
├── biome.json                       # Biome設定
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                    # TypeScript設定
├── vite.config.ts                   # Vite設定
└── wrangler.jsonc                   # Cloudflare Workers設定
```

---

## 🎨 アーキテクチャ設計

### レンダリング戦略

```
┌──────────────────────────────────────────────┐
│ ハイブリッドレンダリング                      │
├──────────────────────────────────────────────┤
│                                              │
│ SSR (Server-Side Rendering)                  │
│ → ホームページ（メッセージ一覧）              │
│ → D1からデータ取得                           │
│ → サーバーでHTML生成                         │
│                                              │
│ SSG (Static Site Generation)                 │
│ → Aboutページ                                │
│ → ビルド時にHTMLを生成                       │
│ → KVストアに保存                             │
│ → リクエスト時はKVから配信                   │
│                                              │
│ Islands (Client-Side Hydration)              │
│ → メッセージ投稿フォーム                      │
│ → サーバーはプレースホルダーHTML             │
│ → クライアントでJSをマウント                 │
│                                              │
└──────────────────────────────────────────────┘
```

### Islands Architecture詳細

```
┌─────────────────────────────────────────┐
│ サーバー側（SSR）                        │
├─────────────────────────────────────────┤
│ <div id="message-form"                  │
│      data-island="message-form">        │
│   <!-- プレースホルダー -->              │
│   <form>                                │
│     <textarea disabled></textarea>      │
│     <button disabled>送信</button>      │
│   </form>                               │
│ </div>                                  │
│ <script src="/islands.js"></script>     │
└─────────────────────────────────────────┘
         ↓ HTMLがブラウザに届く
┌─────────────────────────────────────────┐
│ クライアント側（CSR）                    │
├─────────────────────────────────────────┤
│ islands.js が実行される                  │
│   ↓                                     │
│ MessageFormコンポーネントをマウント       │
│   ↓                                     │
│ <form onSubmit={...}>                   │
│   <textarea value={...}></textarea>     │
│   <button>送信</button>                 │
│ </form>                                 │
│ ※クリック・入力が可能になる！            │
└─────────────────────────────────────────┘
```

---

## 💾 データベース設計

### D1スキーマ

```sql
-- migrations/0001_create_messages.sql

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Anonymous',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- サンプルデータ
INSERT INTO messages (content, author) VALUES
  ('Hello, World!', 'System'),
  ('Welcome to the message board!', 'Admin');
```

### KVキャッシュ戦略

```typescript
// KVに保存するデータ
{
  key: "/about.html",
  value: "<html>...</html>",
  metadata: {
    generated_at: "2025-01-03T00:00:00Z",
    version: "1.0"
  }
}

// キャッシュフロー
1. リクエスト受信
2. KVから `/${path}.html` をチェック
3. キャッシュあり → 即座に返す（超高速）
4. キャッシュなし → SSRで生成して返す
```

---

## 🔄 データフロー

### ホームページ（SSR）のリクエストフロー

```
1. ユーザー → https://app.example.com/ にアクセス
         ↓
2. Cloudflare Edge でリクエスト受信
         ↓
3. KVキャッシュをチェック
   - キャッシュなし → 次へ
         ↓
4. D1データベースから messages テーブル取得
   SELECT * FROM messages ORDER BY created_at DESC LIMIT 20
         ↓
5. pages/home.tsx でHTMLを生成
   - Layout + メッセージ一覧
   - Islands用のプレースホルダー含む
         ↓
6. ユーザーにHTMLを返す
   + <script src="/islands.js"> を含める
         ↓
7. ブラウザが islands.js をダウンロード
         ↓
8. MessageForm コンポーネントをハイドレーション
   → フォームがインタラクティブになる
```

### メッセージ投稿フロー

```
1. ユーザーがフォームに入力
         ↓
2. 「送信」ボタンをクリック
         ↓
3. islands/message-form.tsx の handleSubmit 実行
         ↓
4. fetch('/api/messages', { method: 'POST', ... })
         ↓
5. サーバー（index.tsx）でPOSTリクエスト受信
         ↓
6. D1に INSERT INTO messages (content) VALUES (?)
         ↓
7. 成功レスポンスを返す { success: true, id: 123 }
         ↓
8. クライアントでページリロード or 動的追加
```

### Aboutページ（SSG）のフロー

```
デプロイ時:
1. wrangler deploy 実行
2. scripts/build-ssg.ts が実行される（将来実装）
3. pages/about.tsx を事前レンダリング
4. 生成されたHTMLを KV に保存
   - key: "/about.html"
   - value: "<html>...</html>"

リクエスト時:
1. ユーザー → /about にアクセス
2. index.tsx で KV.get("/about.html") 実行
3. キャッシュあり → 即座に返す（1ms以下）
4. 超高速レスポンス！
```

---

## 📝 実装詳細

### 1. `wrangler.jsonc` - Workers設定

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "message-board-app",
  "compatibility_date": "2025-01-01",
  "main": "./src/index.tsx",

  // D1データベース
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "message_board",
      "database_id": "<wrangler d1 create で生成されるID>"
    }
  ],

  // KVネームスペース
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "<wrangler kv:namespace create で生成されるID>"
    }
  ],

  // 静的アセット
  "assets": {
    "directory": "./public",
    "binding": "ASSETS"
  }
}
```

### 2. `src/types.ts` - 型定義

```typescript
// Cloudflare Bindings
export type Bindings = {
  DB: D1Database;
  CACHE: KVNamespace;
  ASSETS: Fetcher;
};

// Message型
export type Message = {
  id: number;
  content: string;
  author: string;
  created_at: string;
};

// Hono Context型
export type HonoContext = {
  Bindings: Bindings;
};
```

### 3. `src/index.tsx` - Workerエントリーポイント

```tsx
import { Hono } from 'hono';
import type { Bindings } from './types';
import { HomePage } from './pages/home';
import { AboutPage } from './pages/about';

const app = new Hono<{ Bindings: Bindings }>();

// 静的アセット配信
app.get('/islands.js', async (c) => {
  return c.env.ASSETS.fetch(new Request('http://x/islands.js'));
});

app.get('/favicon.ico', async (c) => {
  return c.env.ASSETS.fetch(new Request('http://x/favicon.ico'));
});

// SSG: KVキャッシュチェック
app.get('/about', async (c) => {
  const cached = await c.env.CACHE.get('/about.html');
  if (cached) {
    return c.html(cached);
  }

  // キャッシュなし → SSR
  return c.html(<AboutPage />);
});

// SSR: ホームページ
app.get('/', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20')
    .all();

  return c.html(<HomePage messages={results} />);
});

// API: メッセージ投稿
app.post('/api/messages', async (c) => {
  const { content, author } = await c.req.json();

  const result = await c.env.DB
    .prepare('INSERT INTO messages (content, author) VALUES (?, ?)')
    .bind(content || '', author || 'Anonymous')
    .run();

  return c.json({
    success: true,
    id: result.meta.last_row_id
  });
});

// API: メッセージ一覧取得
app.get('/api/messages', async (c) => {
  const { results } = await c.env.DB
    .prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20')
    .all();

  return c.json(results);
});

export default app;
```

### 4. `src/components/layout.tsx` - レイアウト

```tsx
import type { FC, PropsWithChildren } from 'hono/jsx';

type LayoutProps = PropsWithChildren<{
  title: string;
  includeIslands?: boolean;
}>;

export const Layout: FC<LayoutProps> = ({
  title,
  includeIslands = false,
  children
}) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link href="/src/style.css" rel="stylesheet" />
        <link href="/favicon.ico" rel="icon" />
      </head>
      <body class="bg-gray-50 min-h-screen">
        <header class="bg-white shadow">
          <nav class="container mx-auto px-4 py-4">
            <div class="flex gap-6">
              <a href="/" class="text-blue-600 hover:text-blue-800 font-semibold">
                Home
              </a>
              <a href="/about" class="text-gray-600 hover:text-gray-800">
                About
              </a>
            </div>
          </nav>
        </header>

        <main class="container mx-auto px-4 py-8">
          {children}
        </main>

        <footer class="bg-gray-800 text-white mt-auto">
          <div class="container mx-auto px-4 py-6 text-center">
            <p>© 2025 Message Board - Built with Hono + Cloudflare Workers</p>
          </div>
        </footer>

        {includeIslands && <script type="module" src="/islands.js"></script>}
      </body>
    </html>
  );
};
```

### 5. `src/pages/home.tsx` - ホームページ

```tsx
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';
import type { Message } from '../types';

type HomePageProps = {
  messages: Message[];
};

export const HomePage: FC<HomePageProps> = ({ messages }) => {
  return (
    <Layout title="Message Board" includeIslands={true}>
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-800 mb-8">
          📝 Message Board
        </h1>

        {/* Islands: メッセージ投稿フォーム */}
        <div
          id="message-form"
          data-island="message-form"
          class="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          {/* プレースホルダー（JSが読み込まれるまで表示） */}
          <form>
            <textarea
              class="w-full border rounded p-3 mb-4 bg-gray-100"
              placeholder="メッセージを入力..."
              disabled
            ></textarea>
            <button
              class="bg-blue-500 text-white px-6 py-2 rounded opacity-50"
              disabled
            >
              送信中...
            </button>
          </form>
        </div>

        {/* メッセージ一覧 */}
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">
            Recent Messages
          </h2>

          {messages.length === 0 ? (
            <p class="text-gray-500">まだメッセージがありません。</p>
          ) : (
            messages.map((msg) => (
              <article
                key={msg.id}
                class="bg-white rounded-lg shadow p-6"
              >
                <p class="text-gray-800 mb-2">{msg.content}</p>
                <div class="flex justify-between text-sm text-gray-500">
                  <span>by {msg.author}</span>
                  <time>{new Date(msg.created_at).toLocaleString('ja-JP')}</time>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
```

### 6. `src/pages/about.tsx` - Aboutページ

```tsx
import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';

export const AboutPage: FC = () => {
  return (
    <Layout title="About - Message Board">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-800 mb-6">
          About This App
        </h1>

        <div class="bg-white rounded-lg shadow-md p-8 space-y-4">
          <p class="text-gray-700">
            このアプリケーションは、Hono + Cloudflare Workersで構築された
            シンプルなメッセージボードです。
          </p>

          <h2 class="text-2xl font-semibold text-gray-800 mt-6">
            Technology Stack
          </h2>

          <ul class="list-disc list-inside space-y-2 text-gray-700">
            <li>Hono - 軽量Webフレームワーク</li>
            <li>Cloudflare Workers - エッジサーバー</li>
            <li>Cloudflare D1 - SQLiteデータベース</li>
            <li>Cloudflare KV - Key-Valueストア</li>
            <li>Tailwind CSS v4 - ユーティリティCSS</li>
            <li>Islands Architecture - 部分的ハイドレーション</li>
          </ul>

          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
            <p class="text-blue-800">
              💡 このページはKVキャッシュから配信されています（超高速！）
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
```

### 7. `src/islands/message-form.tsx` - メッセージ投稿フォーム

```tsx
import { useState } from 'hono/jsx';

export function MessageForm() {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('メッセージを入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          author: author.trim() || 'Anonymous'
        })
      });

      if (res.ok) {
        // 成功 → ページリロード
        window.location.reload();
      } else {
        alert('送信に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Name (optional)
        </label>
        <input
          type="text"
          value={author}
          onInput={(e) => setAuthor((e.target as HTMLInputElement).value)}
          class="w-full border border-gray-300 rounded-lg p-3"
          placeholder="Your name..."
          maxLength={50}
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={content}
          onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
          class="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none"
          placeholder="Write your message..."
          maxLength={500}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        class={`w-full py-3 px-6 rounded-lg font-semibold transition ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isSubmitting ? '送信中...' : '送信'}
      </button>
    </form>
  );
}
```

### 8. `src/islands.tsx` - Islandsエントリーポイント

```tsx
import { render } from 'hono/jsx/dom';
import { MessageForm } from './islands/message-form';

// DOMロード後に実行
if (typeof document !== 'undefined') {
  // message-form Island をマウント
  const formContainer = document.getElementById('message-form');
  if (formContainer) {
    render(<MessageForm />, formContainer);
  }
}
```

### 9. `vite.config.ts` - Vite設定

```typescript
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import ssrPlugin from 'vite-ssr-components/plugin';

export default defineConfig({
  plugins: [
    cloudflare(),
    tailwindcss(),
    ssrPlugin()
  ],

  build: {
    rollupOptions: {
      input: {
        islands: './src/islands.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        dir: 'public'
      }
    }
  },

  esbuild: {
    jsxImportSource: 'hono/jsx',
    jsx: 'automatic'
  }
});
```

### 10. `package.json` - スクリプト設定

```json
{
  "name": "hono-cloudflare-workers-vite-app",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc --noEmit && vite build",
    "client:build": "vite build",
    "client:watch": "vite build --watch",
    "deploy": "pnpm client:build && wrangler deploy",
    "d1:create": "wrangler d1 create message_board",
    "d1:migrate": "wrangler d1 migrations apply message_board --local",
    "d1:migrate:prod": "wrangler d1 migrations apply message_board --remote",
    "kv:create": "wrangler kv:namespace create CACHE",
    "typecheck": "tsc --noEmit",
    "lint": "biome check",
    "lint:fix": "biome check --write"
  },
  "dependencies": {
    "destyle.css": "4.0.1",
    "hono": "4.10.4"
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.2",
    "@cloudflare/vite-plugin": "1.13.18",
    "@cloudflare/workers-types": "^4.20250110.0",
    "@tailwindcss/vite": "4.1.16",
    "tailwindcss": "4.1.16",
    "typescript": "5.9.3",
    "vite": "7.1.12",
    "vite-ssr-components": "0.5.1",
    "wrangler": "4.45.3"
  },
  "packageManager": "pnpm@10.20.0",
  "volta": {
    "node": "24.11.0"
  }
}
```

---

## 🚀 セットアップ・デプロイ手順

### 1. D1データベース作成

```bash
# データベース作成
pnpm d1:create

# 出力されたdatabase_idをwrangler.jsoncにコピー

# マイグレーション実行（ローカル）
pnpm d1:migrate

# マイグレーション実行（本番）
pnpm d1:migrate:prod
```

### 2. KVネームスペース作成

```bash
# KV作成
pnpm kv:create

# 出力されたidをwrangler.jsoncにコピー
```

### 3. ローカル開発

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:8787 を開く
```

### 4. デプロイ

```bash
# クライアントJSビルド + Workersデプロイ
pnpm deploy

# デプロイ後のURLが表示される
# 例: https://message-board-app.your-subdomain.workers.dev
```

---

## 🎯 技術体験チェックリスト

### フロントエンド
- [ ] Hono JSX でコンポーネント作成
- [ ] Tailwind CSS v4 でスタイリング
- [ ] Layout/Page分離

### Islands Architecture
- [ ] サーバーでプレースホルダーHTML生成
- [ ] クライアントでコンポーネントマウント
- [ ] フォーム送信の動作確認

### Cloudflare サービス
- [ ] D1でデータベース操作（INSERT/SELECT）
- [ ] KVでキャッシュ配信
- [ ] Workersでエッジデプロイ

### ビルド・デプロイ
- [ ] Viteでクライアントコードビルド
- [ ] Wranglerでデプロイ
- [ ] 本番環境で動作確認

---

## 🔍 デバッグ・トラブルシューティング

### よくあるエラー

#### 1. `islands.js` が読み込まれない
```typescript
// vite.config.ts の output 設定を確認
output: {
  entryFileNames: '[name].js',  // ハッシュなし
  dir: 'public'
}
```

#### 2. D1が見つからない
```bash
# wrangler.jsonc のbindingとdatabase_idを確認
# ローカル開発時は --local フラグ必須
wrangler dev --local
```

#### 3. KVキャッシュが効かない
```typescript
// index.tsx でバインディング名を確認
const cached = await c.env.CACHE.get('/about.html');
// ↑ wrangler.jsonc の binding: "CACHE" と一致させる
```

---

## 📚 参考リソース

- [Hono公式ドキュメント](https://hono.dev/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Islands Architecture](https://jasonformat.com/islands-architecture/)

---

## 🎉 完成イメージ

### ホームページ
```
┌──────────────────────────────────────┐
│ Header: [Home] [About]              │
├──────────────────────────────────────┤
│ 📝 Message Board                    │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ Name: [        ]               │  │
│ │ Message: [                  ]  │  │
│ │          [                  ]  │  │
│ │ [送信]                         │  │
│ └────────────────────────────────┘  │
│                                      │
│ Recent Messages:                     │
│ ┌────────────────────────────────┐  │
│ │ Hello, World!                  │  │
│ │ by System | 2025-01-03 10:00  │  │
│ └────────────────────────────────┘  │
│ ┌────────────────────────────────┐  │
│ │ Welcome!                       │  │
│ │ by Admin | 2025-01-03 09:30   │  │
│ └────────────────────────────────┘  │
├──────────────────────────────────────┤
│ Footer: © 2025 Message Board        │
└──────────────────────────────────────┘
```

### Aboutページ（KVキャッシュから超高速配信）
```
┌──────────────────────────────────────┐
│ Header: [Home] [About]              │
├──────────────────────────────────────┤
│ About This App                      │
│                                      │
│ このアプリケーションは...            │
│                                      │
│ Technology Stack:                   │
│ • Hono                              │
│ • Cloudflare Workers                │
│ • D1 / KV                           │
│                                      │
│ 💡 このページはKVから配信            │
└──────────────────────────────────────┘
```

---

以上が完全な設計書です。この設計に従って実装すれば、全ての技術スタックを体験できます！
