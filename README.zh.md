<div align="center">

<img src="static/logo.png" alt="Token随手记" width="96" />

# Token随手记

**面向开发者的 AI Token 消耗记账工具**

清晰掌握各平台调用成本、预算与节省情况 · 本地优先 · 开箱即用

<br />

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](constants/settings.js)
[![uni-app](https://img.shields.io/badge/uni--app-Vue%202-42b983?style=flat-square&logo=vue.js&logoColor=white)](https://uniapp.dcloud.net.cn/)
[![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20微信小程序%20%7C%20H5-6366f1?style=flat-square)](docs/依赖选型.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-orange?style=flat-square)](LICENSE.txt)

**中文** · [**English**](README.md)

[产品简介](#-产品简介) · [界面预览](#-界面预览) · [快速开始](#-快速开始) · [联系作者](#-联系作者)

</div>

---

## ✨ 产品简介

**Token随手记**是一款面向个人与团队开发者的 AI Token 消耗记账工具，帮助您清晰掌握各平台调用成本、预算与节省情况。

| 能力                | 说明                                                        |
| ------------------- | ----------------------------------------------------------- |
| 🤖 **智能记账**     | 在「记录」页通过 AI 助手对话或手动方式，快速记录 Token 消耗 |
| 📋 **账单明细**     | 按时间、厂商与模型筛选，查看统计与明细列表                  |
| 📈 **成本分析**     | 趋势、对比与排行图表，辅助预算与成本决策                    |
| 🔑 **API Key 管理** | 官方与自定义 Key 统一管理，客户端仅展示脱敏信息             |
| 📱 **本地模式**     | 数据保存在本设备，记账、统计与助手对话等核心功能开箱即用    |
| 🎭 **人设与记忆**   | 可选人设风格与本地向量记忆，对话更贴合个人习惯              |
| 🌐 **中英双语**     | 完整 i18n 支持，浅色 / 暗色主题自由切换                     |

> **版本说明：** 云端版本暂不对公众开放。当前推荐使用**本地模式**——数据留在本机，核心功能均已可用，日常使用完全够用。

---

## 📱 界面预览

### 中文界面

<p align="center">
  <img src="static/images/screenshots/zh/home-overview.jpg" alt="首页总览" width="240" />
  <img src="static/images/screenshots/zh/records-chat.jpg" alt="记录对话" width="240" />
  <img src="static/images/screenshots/zh/bills-default.jpg" alt="账单列表" width="240" />
</p>
<p align="center"><sub>首页总览 · 记录对话 · 账单列表</sub></p>

<p align="center">
  <img src="static/images/screenshots/zh/stats-trend.jpg" alt="统计趋势" width="240" />
  <img src="static/images/screenshots/zh/profile-default.jpg" alt="我的" width="240" />
  <img src="static/images/screenshots/zh/profile-local-mode.jpg" alt="本地模式" width="240" />
</p>
<p align="center"><sub>统计趋势 · 个人中心 · 本地模式设置</sub></p>

<details>
<summary><strong>查看更多中文截图</strong></summary>

<br />

| 模块            | 预览                                                                           |
| --------------- | ------------------------------------------------------------------------------ |
| 首页 · 模式切换 | <img src="static/images/screenshots/zh/home-local-mode.jpg" width="220" />     |
| 记录 · 统计报告 | <img src="static/images/screenshots/zh/records-report.jpg" width="220" />      |
| 记录 · 对话历史 | <img src="static/images/screenshots/zh/records-history.jpg" width="220" />     |
| 记录 · 用户记忆 | <img src="static/images/screenshots/zh/records-memory.jpg" width="220" />      |
| 账单 · 日期筛选 | <img src="static/images/screenshots/zh/bills-date-filter.jpg" width="220" />   |
| 账单 · 厂商筛选 | <img src="static/images/screenshots/zh/bills-vendor-filter.jpg" width="220" /> |
| 统计 · 默认视图 | <img src="static/images/screenshots/zh/stats-default.jpg" width="220" />       |
| 统计 · 对比分析 | <img src="static/images/screenshots/zh/stats-compare.jpg" width="220" />       |
| 我的 · 设置     | <img src="static/images/screenshots/zh/profile-settings.jpg" width="220" />    |
| 我的 · API Key  | <img src="static/images/screenshots/zh/profile-api-keys.jpg" width="220" />    |
| 我的 · 人设模式 | <img src="static/images/screenshots/zh/profile-persona.jpg" width="220" />     |

</details>

### English · Dark Theme

<p align="center">
  <img src="static/images/screenshots/en/home.jpg" alt="Home" width="200" />
  <img src="static/images/screenshots/en/records.jpg" alt="Records" width="200" />
  <img src="static/images/screenshots/en/bills.jpg" alt="Bills" width="200" />
  <img src="static/images/screenshots/en/stats.jpg" alt="Statistics" width="200" />
  <img src="static/images/screenshots/en/profile.jpg" alt="Profile" width="200" />
  <img src="static/images/screenshots/en/settings.jpg" alt="Settings" width="200" />
</p>
<p align="center"><sub>Home · Records · Bills · Statistics · Profile · Settings</sub></p>

---

## 🚀 核心功能

### 使用帮助

1. 在 **「记录」** 页通过 AI 助手或手动方式记账 Token 消耗
2. 在 **「账单」** 页按时间与平台筛选，查看模型统计与明细
3. 在 **「统计」** 查看趋势、对比与排行，辅助成本决策
4. 在 **「我的」** 管理 API Key、备份与会员权益
5. 推荐使用 **本地模式**：数据留在本机，核心功能开箱即用
6. 在 **「设置 → 人设模式」** 可开启 AI 人设与本地持久记忆

### 本地模式

绑定 API Key 并选择对话模型后，即可在本机完成：

- Token 记账与账单查询
- 统计图表与成本分析
- AI 助手对话与使用报告

数据默认保存在设备本地，无需依赖云端服务。

### 人设模式与持久记忆

可选功能。开启后 AI 将按您选择的人设风格回复，并可基于本机向量记忆库检索相关对话片段。

- 记忆数据默认仅保存在本设备，不会自动上传至第三方
- 可在设置中查看向量库占用、清空或从聊天历史重建
- 清空向量库不会删除聊天记录

---

## 📦 技术栈

| 层级 | 选型                                             |
| ---- | ------------------------------------------------ |
| 框架 | [uni-app](https://uniapp.dcloud.net.cn/) (Vue 2) |
| UI   | [uView UI 2](https://www.uviewui.com/)           |
| 图表 | qiun-data-charts                                 |
| 状态 | Vuex 3                                           |
| 请求 | luch-request                                     |
| 日期 | dayjs                                            |

**目标平台：** Android · iOS · 微信小程序 · H5 (Web)

更多选型说明见 [`docs/依赖选型.md`](docs/依赖选型.md)，编码规范见 [`docs/代码规范.md`](docs/代码规范.md)。

---

## 🛠️ 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) 或 uni-app CLI 开发环境

### 安装与检查

```bash
git clone https://github.com/sunG91/Token-Ledger.git
cd Token-Ledger
npm install
npm run check
```

### 运行

使用 HBuilderX 打开项目，选择目标平台（App / 小程序 / H5）运行即可。

首次使用建议在 **「我的 → 本地模式」** 中配置 API Key 与对话模型。

---

## 🔒 隐私与安全

我们重视您的隐私：

- API Key 等敏感信息通过安全渠道存储，客户端**仅展示脱敏信息**
- 本地模式下可**离线使用**核心记账功能
- 用户数据归用户本人所有；开发者仅在提供服务所必需的范围内处理数据

---

## 📄 法律声明

本软件及其文档、界面设计、图标、源代码及相关成果，受中华人民共和国著作权法及其他适用法律保护。

- **著作权人：** 孙瑞（个人开发者）
- **性质：** 商业产品，开发者保留全部知识产权及商业化运营权利
- **许可：** 依 [GNU AGPL v3](LICENSE.txt) 开源发布；超出许可范围的使用须取得书面授权

未经著作权人书面同意，不得剽窃、盗用或冒领本项目，不得以复制、修改、传播、反编译等方式侵害著作权，或将其用于同类竞争产品；依 AGPL 许可进行的合规使用不在此限。软件按「现状」提供。

---

## 🤝 联系作者

如有合作意向或对项目有任何想法与建议，欢迎联系：

|              |                                                                          |
| ------------ | ------------------------------------------------------------------------ |
| **开发者**   | 孙瑞（个人开发者）                                                       |
| **邮箱**     | [sunr20050503@163.com](mailto:sunr20050503@163.com)                      |
| **仓库**     | [github.com/sunG91/Token-Ledger](https://github.com/sunG91/Token-Ledger) |
| **英文文档** | [README.md](README.md)                                                   |

---

<div align="center">

<br />

**Token随手记** — 让每一次 Token 消耗，都清晰可查。

© 2026 孙瑞 · Token随手记 保留所有权利

</div>
