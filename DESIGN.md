# Hono + React SSR + Islands Architecture 設計書

## 📋 プロジェクト概要

シンプルなメッセージボードアプリケーション

**主な機能:**
- メッセージの投稿・一覧表示
- 静的なAboutページ

**技術的特徴:**
- Honoによる軽量バックエンド
- React SSRによるサーバーサイドレンダリング
- Islands Architectureによる部分的なクライアントハイドレーション
- Cloudflare Workers上でのエッジ実行

---

## 🏗️ 技術スタック

| カテゴリ | 技術 | 役割 |
|---------|------|------|
| **ランタイム** | Cloudflare Workers | エッジサーバー実行環境 |
| **バックエンド** | Hono | ルーティング・API・DB操作・SSR実行 |
| **UI** | React 19 | コンポーネントベースUI（SSR + Islands） |
| **ビルド** | Vite | 高速ビルド・HMR・バンドル |
| **スタイル** | Tailwind CSS v4 | ユーティリティファーストCSS |
| **データベース** | Cloudflare D1 | SQLiteデータベース |
| **キャッシュ** | Cloudflare KV | 静的ページキャッシュ |
| **言語** | TypeScript | 型安全な開発 |

---

## 🎨 アーキテクチャ

### ハイブリッド構成

```
┌─────────────────────────────────────────┐
│ サーバー側（Cloudflare Workers）         │
├─────────────────────────────────────────┤
│ Hono:                                   │
│  - ルーティング (app.get('/', ...))    │
│  - API処理 (app.post('/api/...'))      │
│  - DB操作 (D1)                          │
│  - React SSR実行                        │
│                                         │
│ React:                                  │
│  - renderToString() でHTML生成          │
│  - サーバー側のみで実行                  │
└─────────────────────────────────────────┘
                ↓ HTML送信
┌─────────────────────────────────────────┐
│ クライアント側（ブラウザ）               │
├─────────────────────────────────────────┤
│ React:                                  │
│  - Islands部分のみハイドレーション       │
│  - createRoot() でマウント              │
│  - インタラクティブUI                    │
└─────────────────────────────────────────┘
```

### Islands Architecture

**コンセプト:** 静的なページの中に、動的な「島（Islands）」を配置

```
サーバー側:
  ReactコンポーネントをHTML化
  ↓
  <div id="message-form">
    <form><!-- 静的プレースホルダー --></form>
  </div>
  <script src="/islands.js"></script>

クライアント側:
  islands.js が実行される
  ↓
  createRoot(element).render(<MessageForm />)
  ↓
  フォームがインタラクティブに！
```

**メリット:**
- JavaScriptの読み込み量を最小化
- 初期表示が高速
- 必要な部分だけクライアント実行

---

## 📁 ディレクトリ構造

```
hono-react-vite-app/
├── src/
│   ├── index.tsx              # Honoアプリ・ルーティング
│   ├── renderer.tsx            # （既存のまま）
│   ├── style.css              # グローバルスタイル
│   │
│   ├── components/            # 共通コンポーネント
│   │   └── layout.tsx         # ベースレイアウト
│   │
│   ├── pages/                 # ページコンポーネント（SSR）
│   │   ├── home.tsx           # ホームページ
│   │   └── about.tsx          # Aboutページ
│   │
│   ├── islands/               # Islandsコンポーネント（CSR）
│   │   └── message-form.tsx   # メッセージ投稿フォーム
│   │
│   ├── islands.tsx            # Islands エントリーポイント
│   │
│   ├── lib/                   # ユーティリティ
│   │   └── db.ts              # DB操作ヘルパー
│   │
│   └── types.ts               # 型定義
│
├── public/                    # ビルド成果物
│   └── islands.js             # Viteでビルドされたクライアント用JS
│
├── migrations/                # D1マイグレーション
│   └── 0001_create_messages.sql
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc
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
```

### KVキャッシュ戦略

```typescript
// Aboutページなどの静的コンテンツをKVにキャッシュ
app.get('/about', async (c) => {
  const cached = await c.env.CACHE.get('/about.html');
  if (cached) return c.html(cached);

  // キャッシュミス時はSSR
  const html = renderToString(<AboutPage />);
  return c.html(html);
});
```

---

## 📝 実装のポイント

### 1. Honoサーバー（`src/index.tsx`）

Honoでルーティングを定義し、Reactコンポーネントをレンダリング：

```tsx
import { Hono } from 'hono';
import { renderToString } from 'react-dom/server';
import { HomePage } from './pages/home';

const app = new Hono<{ Bindings: Bindings }>();

// SSR: ホームページ
app.get('/', async (c) => {
  // 1. バックエンド処理（DB取得）
  const { results } = await c.env.DB
    .prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 20')
    .all();

  // 2. React SSR
  const html = renderToString(<HomePage messages={results} />);

  // 3. HTMLレスポンス
  return c.html(html);
});

// API: メッセージ投稿
app.post('/api/messages', async (c) => {
  const { content, author } = await c.req.json();

  await c.env.DB
    .prepare('INSERT INTO messages (content, author) VALUES (?, ?)')
    .bind(content, author || 'Anonymous')
    .run();

  return c.json({ success: true });
});

export default app;
```

**ポイント:**
- HonoはルーティングとAPI処理を担当
- `renderToString()` でReactをHTML化
- バックエンド処理とSSRを1つのエンドポイントで実行

### 2. Reactページコンポーネント（`src/pages/home.tsx`）

サーバー側でレンダリングされるコンポーネント：

```tsx
import type { FC } from 'react';
import { Layout } from '../components/layout';

type Message = {
  id: number;
  content: string;
  author: string;
  created_at: string;
};

export const HomePage: FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <Layout title="Message Board" includeIslands={true}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">📝 Message Board</h1>

        {/* Islands: クライアント側でハイドレーション */}
        <div id="message-form" data-island="message-form"
             className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* プレースホルダー */}
          <form>
            <textarea className="w-full border p-3 mb-4" disabled />
            <button className="bg-blue-500 text-white px-6 py-2" disabled>
              送信中...
            </button>
          </form>
        </div>

        {/* メッセージ一覧（SSR） */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <article key={msg.id} className="bg-white rounded-lg shadow p-6">
              <p>{msg.content}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>by {msg.author}</span>
                <time>{new Date(msg.created_at).toLocaleString('ja-JP')}</time>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};
```

**ポイント:**
- サーバー側で完全なHTMLとして生成
- `id="message-form"` がIslands用のマウントポイント
- プレースホルダーはJSが読み込まれるまで表示

### 3. Islands コンポーネント（`src/islands/message-form.tsx`）

クライアント側でハイドレーションされるインタラクティブコンポーネント：

```tsx
import { useState, type FC, type FormEvent } from 'react';

export const MessageForm: FC = () => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author: author || 'Anonymous' })
      });

      if (res.ok) window.location.reload();
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Your name..."
        className="w-full border p-3"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your message..."
        className="w-full border p-3 h-32"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-500 text-white py-3 px-6"
      >
        {isSubmitting ? '送信中...' : '送信'}
      </button>
    </form>
  );
};
```

**ポイント:**
- `useState` などReactフックが使える
- クライアント側のみで実行
- API呼び出しやイベント処理が可能

### 4. Islandsエントリーポイント（`src/islands.tsx`）

クライアント側でコンポーネントをマウント：

```tsx
import { createRoot } from 'react-dom/client';
import { MessageForm } from './islands/message-form';

if (typeof document !== 'undefined') {
  const formContainer = document.getElementById('message-form');
  if (formContainer) {
    createRoot(formContainer).render(<MessageForm />);
  }
}
```

**ポイント:**
- `createRoot()` でReact 18の新API使用
- DOMのマウントポイントにコンポーネントを注入
- このファイルがViteでビルドされて `public/islands.js` になる

### 5. Vite設定（`vite.config.ts`）

```typescript
import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    cloudflare(),
    tailwindcss(),
    react({ jsxRuntime: 'automatic' }),
  ],
  build: {
    rollupOptions: {
      input: { islands: './src/islands.tsx' },
      output: {
        entryFileNames: '[name].js',
        dir: 'public',
      },
    },
  },
});
```

**ポイント:**
- `@vitejs/plugin-react` でReact対応
- Islands用のエントリーポイントを指定
- ビルド成果物は `public/islands.js`

### 6. TypeScript設定（`tsconfig.json`）

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true,
    "lib": ["ESNext"],
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**ポイント:**
- `jsxImportSource: "react"` でReact使用
- `jsx: "react-jsx"` で自動JSX変換

---

## 🚀 セットアップ手順

### 1. 依存関係インストール

```bash
pnpm install
```

### 2. D1データベース作成

```bash
# データベース作成
pnpm d1:create

# wrangler.jsonc に database_id をコピー

# マイグレーション実行（ローカル）
pnpm d1:migrate
```

### 3. KVネームスペース作成

```bash
pnpm kv:create

# wrangler.jsonc に id をコピー
```

### 4. 開発サーバー起動

```bash
pnpm dev
```

### 5. ビルド・デプロイ

```bash
# クライアントJSビルド + Workersデプロイ
pnpm deploy
```

---

## 🔍 技術的な判断ポイント

### なぜHono + Reactのハイブリッド？

**Honoの強み:**
- 軽量（Cloudflare Workersに最適）
- シンプルなルーティング
- ミドルウェアが使いやすい

**Reactの強み:**
- 豊富なエコシステム
- コンポーネント再利用
- 状態管理が強力

**組み合わせの利点:**
- サーバー側はHonoで軽量に保つ
- UI部分はReactで開発効率を上げる
- Islands Architectureで初期ロードを高速化

### Islands Architectureの選択理由

- SPAと比較してJavaScript量が少ない
- SSRと比較して部分的なインタラクティブ性
- パフォーマンスとDXのバランスが良い

---

## 📚 参考リソース

- [Hono公式ドキュメント](https://hono.dev/)
- [React公式ドキュメント](https://react.dev/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Islands Architecture](https://jasonformat.com/islands-architecture/)
- [Vite](https://vitejs.dev/)

---

## 🎯 実装チェックリスト

開発時の確認項目:

### 環境構築
- [ ] Node.js・pnpmのインストール確認
- [ ] D1データベース作成・マイグレーション
- [ ] KVネームスペース作成
- [ ] 依存関係インストール

### 実装
- [ ] `src/index.tsx`: Honoルーティング・SSR処理
- [ ] `src/pages/`: ページコンポーネント作成
- [ ] `src/components/`: 共通コンポーネント作成
- [ ] `src/islands/`: Islandsコンポーネント作成
- [ ] `src/islands.tsx`: クライアント側マウント処理

### 動作確認
- [ ] `pnpm dev` でローカル開発サーバー起動
- [ ] SSRでページが表示される
- [ ] Islandsコンポーネントがインタラクティブに動作
- [ ] API経由でDB操作が成功
- [ ] ビルドが成功（`pnpm build`）
- [ ] デプロイが成功（`pnpm deploy`）

---

以上が **Hono + React SSR + Islands Architecture** の完全設計書です。

この設計に従って実装すれば、軽量で高速、かつ開発効率の高いアプリケーションを構築できます。
