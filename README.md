# 八字命理可视化分析系统

React + TypeScript + Vite 构建的八字排盘与 AI 命理分析页面。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

在 `.env.local` 中配置：

```bash
VITE_AI_API_KEY=你的 API Key
VITE_AI_API_URL=https://api.deepseek.com/chat/completions
VITE_AI_MODEL=pro
```

## 部署到 GitHub Pages

1. 在 GitHub 创建一个新仓库，例如 `bazi-web`。
2. 本地初始化并推送：

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/<你的用户名>/bazi-web.git
git push -u origin main
```

3. 打开 GitHub 仓库的 `Settings -> Secrets and variables -> Actions`。
4. 在 `Secrets` 添加：

```bash
VITE_AI_API_KEY=你的 API Key
```

5. 在 `Variables` 可选添加：

```bash
VITE_AI_API_URL=https://api.deepseek.com/chat/completions
VITE_AI_MODEL=pro
```

6. 打开 `Settings -> Pages`，`Source` 选择 `GitHub Actions`。
7. 推送到 `main` 后，GitHub Actions 会自动构建并发布网站。

默认访问地址：

```text
https://<你的用户名>.github.io/<仓库名>/
```

## 构建

```bash
npm run build
```
