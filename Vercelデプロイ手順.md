# Vercelでピラティスウェブサイトを公開する手順

## 前提条件
- Vercelアカウント（無料）が必要です
- Node.jsがインストールされている必要があります

## 手順1: Vercelアカウントの作成
1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントで登録（推奨）またはメールアドレスで登録

## 手順2: Vercel CLIのインストール
コマンドプロンプトまたはPowerShellで以下を実行：
```bash
npm install -g vercel
```

## 手順3: プロジェクトのデプロイ

### 方法A: Vercel CLIを使用（推奨）
1. コマンドプロンプトを開く
2. プロジェクトフォルダに移動：
   ```bash
   cd C:\Users\user\pilates-website
   ```
3. Vercelにデプロイ：
   ```bash
   vercel
   ```
4. 初回は以下の質問に答えます：
   - Set up and deploy? → `Y`
   - Which scope? → あなたのアカウントを選択
   - Link to existing project? → `N`（新規プロジェクト）
   - Project name → `pilates-website`（または任意の名前）
   - In which directory is your code located? → `.`（現在のディレクトリ）
   - Want to override the settings? → `N`

### 方法B: GitHubとの連携（継続的デプロイ）
1. GitHubでリポジトリを作成
2. プロジェクトをGitHubにプッシュ
3. Vercelダッシュボードで「New Project」をクリック
4. GitHubリポジトリをインポート
5. 設定はデフォルトのままで「Deploy」をクリック

## 手順4: デプロイ完了後
- Vercelが自動的にURLを生成します（例：https://pilates-website.vercel.app）
- このURLをモバイルデバイスで開けます
- QRコードも生成されるので、それをスキャンしてアクセスも可能

## 更新方法
### CLIを使用している場合：
```bash
vercel --prod
```

### GitHubと連携している場合：
- GitHubにプッシュすると自動的に更新されます

## カスタムドメインの設定（オプション）
1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Domains」
3. カスタムドメインを追加

## トラブルシューティング
- デプロイが失敗する場合は、`vercel.json`の設定を確認
- 画像が表示されない場合は、パスが正しいか確認
- 日本語が文字化けする場合は、HTMLのcharsetがUTF-8になっているか確認