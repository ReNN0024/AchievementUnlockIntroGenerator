## 项目概述

Achievement Unlock Intro Generator — 以游戏成就解锁叙事结构，生成具有磨砂玻璃质感的品牌/Logo 介绍卡片。纯前端创作工具，无需后端，支持 PNG/SVG 导出。

## 技术栈

- 语言：Vanilla JavaScript（无框架、无构建工具）
- 样式：原生 CSS（CSS Custom Properties）
- 结构：单页 HTML + 内联 SVG 渲染
- 存储：localStorage + IndexedDB（自动恢复）
- 部署目标：静态文件服务（Node.js serve.js）

## 目录结构

```
/workspace/projects/
├── index.html          # 主页面入口
├── styles.css          # 全局样式
├── app.js              # 主逻辑（~174KB，含 SVG 渲染、状态管理、导出）
├── .coze               # 项目配置
├── .preview             # 预览端口声明
├── scripts/
│   ├── serve.js         # 零依赖静态文件服务器
│   ├── build.sh         # 预览构建（no-op）
│   ├── run.sh           # 预览启动
│   ├── deploy_build.sh  # 部署构建（no-op）
│   └── deploy_run.sh    # 部署启动
└── .gitignore
```

## 关键入口 / 核心模块

- `index.html`：页面结构、编辑器面板、预览画布
- `app.js`：全部业务逻辑，包括：
  - SVG 渲染引擎（磨砂玻璃效果、排版居中算法）
  - 状态管理（撤销/重做、自动保存）
  - 图片处理（底图/Logo 上传、透明裁切、颜色采样）
  - 导出（PNG 300dpi、SVG 字体内嵌）
  - 材质预设系统（7 种玻璃风格）
- `styles.css`：编辑器 UI 样式

## 运行与预览

- 预览：`bash scripts/run.sh`（从 `.preview` 读取端口，默认 5000）
- 部署：`bash scripts/deploy_run.sh`（端口 5000）
- 无构建步骤，修改源码后需重启服务（无 HMR）

## 用户偏好与长期约束

- 纯前端项目，无 package.json，无外部依赖
- 使用 Node.js 内置 http 模块提供静态文件服务

## 常见问题和预防

- `app.js` 文件较大（~174KB），编辑时注意定位具体功能区域
- 无 HMR，预览时需重启服务才能看到改动
- SVG 导出与预览共用同一套渲染结构，确保一致性
