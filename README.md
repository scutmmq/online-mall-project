# Online Mall Project

- 姓名：莫明钦
- 学号：202366451351

## 项目概述

Online Mall 是一个包含前后端的前后端分离在线商城项目，旨在提供商品浏览、购物车管理、订单结算等功能。

- **后端项目**：`online-mall-application`，基于 Java 和 Spring Boot 构建。
- **前端项目**：`online-mall-vue`，基于 Vue 3 和 Vite 构建。
- **技术栈**: `Spring Boot` `Maven` `Mybatis-plus` `MySQL` `Redis` `SpringAOP` `SpringJWT` `Vue3` `WebSocket` 
---

## 项目结构

```
Project/
├── online-mall-application/   # 后端项目
│   ├── pom.xml               # Maven 配置文件
│   ├── src/                  # 源代码目录
│   ├── target/               # 编译输出目录
│   └── log/                  # 日志文件
├── online-mall-vue/          # 前端项目
│   ├── src/                  # 源代码目录
│   ├── public/               # 静态资源目录
│   ├── package.json          # 项目依赖配置
│   └── vite.config.js        # Vite 配置文件
```

---

## 快速开始

### 后端项目

1. 安装依赖：
   ```bash
   mvn clean install
   ```
2. 配置相关参数
```yml
spring:
  aop:
    proxy-target-class: true
  application:
    name: online-mall-application
  datasource:
    url: jdbc:mysql://localhost:3306/online_mall
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: your mysql username
    password: your password
 data:
    redis:
      host: localhost
      port: 6379
      lettuce:
        pool:
          max-active: 10
          max-idle: 10
          min-idle: 1
          time-between-eviction-runs: 10s
      database: 1
```
3. 设置你的OSS环境变量
```bash
export OSS_ACCESS_KEY_ID=yourId
export OSS_ACCESS_KEY_SECRET=yourSecret
```

4. 启动服务：
   ```bash
   mvn spring-boot:run
   ```

### 前端项目

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```

---

## 技术栈

- **后端**：Java, Spring Boot, Maven, MySQL, Redis
- **前端**：Vue 3, Vite, Element Plus, Nginx

---

## 贡献指南

1. Fork 本仓库。
2. 创建分支：`git checkout -b feature/your-feature`
3. 提交代码：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request。

---

## 开发人员

- Mingqin MO