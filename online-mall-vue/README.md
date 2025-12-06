# online-mall

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

---

# 项目文档

## 项目简介
`online-mall` 是一个基于 Vue 3 和 Element Plus 构建的在线商城项目，提供了商品浏览、购物车管理、订单结算等功能，旨在为用户提供便捷的购物体验。

---

## 技术栈
- **前端框架**：Vue 3
- **UI 框架**：Element Plus
- **构建工具**：Vite
- **语言**：JavaScript
- **状态管理**：基于 Vue 的响应式 API
- **路由管理**：Vue Router

---

## 项目结构
```
online-mall/
├── index.html                # 项目入口 HTML
├── jsconfig.json             # JavaScript 配置
├── package.json              # 项目依赖和脚本
├── README.md                 # 项目说明文档
├── vite.config.js            # Vite 配置
├── public/                   # 静态资源
│   └── favicon.ico           # 网站图标
├── src/                      # 源代码
│   ├── App.vue               # 根组件
│   ├── main.js               # 应用入口
│   ├── api/                  # API 接口
│   ├── assets/               # 静态资源（图片、样式等）
│   ├── components/           # 可复用组件
│   ├── images/               # 图片资源
│   ├── router/               # 路由配置
│   ├── utils/                # 工具函数
│   └── views/                # 页面组件
└── ...
```

---

## 核心功能
### 1. 商品管理
- 商品分类展示
- 商品详情查看

### 2. 购物车
- 按商家分组展示商品
- 支持商品数量调整、单选/全选、删除商品
- 购物车总价实时计算

### 3. 订单管理
- 选择收货地址
- 添加订单备注
- 提交订单并跳转至订单详情页

### 4. 用户管理
- 用户登录/注册
- 用户信息查看与修改

---

## 主要页面
### 1. 首页
- 展示商品分类和推荐商品

### 2. 商品详情页
- 展示商品详细信息
- 支持加入购物车

### 3. 购物车页
- 展示购物车商品
- 支持商品管理和结算

### 4. 订单页
- 展示订单详情
- 支持订单状态查看

---

## API 接口
### 示例接口文件
#### `src/api/cart.js`
- `getCartsApi`：获取购物车数据
- `updateCartItemApi`：更新购物车商品数量
- `deleteCartItemByIdApi`：删除单个购物车商品
- `deleteCartItemsApi`：批量删除购物车商品

---

## 项目运行
### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产环境
```bash
npm run build
```

---

## 目录说明
### `src/views/cart/cart.vue`
购物车页面，主要功能包括：
- 按商家分组展示商品
- 支持商品数量调整、单选/全选、删除商品
- 购物车总价实时计算
- 结算弹窗：选择收货地址、添加备注并提交订单

---

## 贡献指南
1. Fork 本仓库
2. 创建分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

---
