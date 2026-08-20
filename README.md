# SkeldJS

SkeldJS 是一个用 TypeScript 编写的 Among Us 协议与游戏服务器实现。

本仓库由以下两部分合并而成：

- **packages/** — SkeldJS 协议 / 核心库（monorepo）：`@skeldjs/au-*`、`@skeldjs/events`、`@skeldjs/hazel` 等。
- **waterway/** — Waterway 服务器本体（`@skeldjs/waterway`），依赖上述库包。

## 环境要求

- Node.js（建议 18+）
- Yarn 4（使用 `corepack` 或直接运行 `.yarn/releases/yarn-4.10.3.cjs`）

## 安装依赖

```bash
yarn install
```

## 构建

```bash
yarn build
```

该命令会按依赖顺序构建所有工作区包（先库包，后 waterway）。

## 运行服务器

```bash
yarn start
```

首次运行会自动在 `waterway/` 目录下生成默认 `config.json`。服务器默认监听：

- 匹配服务器（Matchmaker）：`22023`
- 游戏服务器（Socket）：`22123`

常用脚本：

| 命令 | 说明 |
| --- | --- |
| `yarn build` | 构建全部工作区 |
| `yarn build:packages` | 仅构建库包 |
| `yarn build:waterway` | 仅构建服务器 |
| `yarn start` | 运行服务器（编译后的 `dist`） |
| `yarn dev` | 用 ts-node 直接运行（开发模式） |
| `yarn setup` | 重新生成配置 / 安装插件 |

## 许可

GPL-3.0-only
