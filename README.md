<div align="center">

<img src="static/logo.png" alt="Token Ledger" width="96" />

# Token Ledger

**AI Token usage tracker for developers**

Track costs, budgets, and savings across platforms · Local-first · Ready to use

<br />

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)](constants/settings.js)
[![uni-app](https://img.shields.io/badge/uni--app-Vue%202-42b983?style=flat-square&logo=vue.js&logoColor=white)](https://uniapp.dcloud.net.cn/)
[![Platforms](https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20WeChat%20Mini%20Program%20%7C%20H5-6366f1?style=flat-square)](docs/依赖选型.md)
[![License](https://img.shields.io/badge/license-AGPL--3.0-orange?style=flat-square)](LICENSE.txt)

[**中文**](README.zh.md) · **English**

[Overview](#-overview) · [Screenshots](#-screenshots) · [Getting Started](#-getting-started) · [Contact](#-contact)

</div>

---

## ✨ Overview

**Token Ledger** helps individual developers and small teams track AI token usage and costs across platforms with clarity and control.

| Feature                 | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| 🤖 **Smart logging**    | Record token usage via AI assistant chat or manual entry on Records    |
| 📋 **Bill details**     | Filter by time, vendor, and model; view stats and line items           |
| 📈 **Cost analytics**   | Trends, comparisons, and rankings to support budget decisions        |
| 🔑 **API Key mgmt**     | Official and custom keys in one place; client shows masked values only |
| 📱 **Local mode**       | Data stays on device; bookkeeping, stats, and assistant work offline   |
| 🎭 **Persona & memory** | Optional persona tone and on-device vector memory for chat context     |
| 🌐 **Bilingual UI**     | Full i18n with light / dark themes                                     |

> **Release status:** The cloud edition is not publicly available yet. **Local mode** is recommended — data stays on your device and core features are ready for everyday use.

---

## 📱 Screenshots

### Chinese UI

<p align="center">
  <img src="static/images/screenshots/zh/home-overview.jpg" alt="Home overview" width="240" />
  <img src="static/images/screenshots/zh/records-chat.jpg" alt="Records chat" width="240" />
  <img src="static/images/screenshots/zh/bills-default.jpg" alt="Bills list" width="240" />
</p>
<p align="center"><sub>Home · Records · Bills</sub></p>

<p align="center">
  <img src="static/images/screenshots/zh/stats-trend.jpg" alt="Stats trend" width="240" />
  <img src="static/images/screenshots/zh/profile-default.jpg" alt="Profile" width="240" />
  <img src="static/images/screenshots/zh/profile-local-mode.jpg" alt="Local mode" width="240" />
</p>
<p align="center"><sub>Statistics · Profile · Local mode setup</sub></p>

<details>
<summary><strong>More Chinese screenshots</strong></summary>

<br />

| Section               | Preview                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| Home · Mode switch    | <img src="static/images/screenshots/zh/home-local-mode.jpg" width="220" />     |
| Records · Report      | <img src="static/images/screenshots/zh/records-report.jpg" width="220" />      |
| Records · History     | <img src="static/images/screenshots/zh/records-history.jpg" width="220" />     |
| Records · Memory      | <img src="static/images/screenshots/zh/records-memory.jpg" width="220" />      |
| Bills · Date filter   | <img src="static/images/screenshots/zh/bills-date-filter.jpg" width="220" />   |
| Bills · Vendor filter | <img src="static/images/screenshots/zh/bills-vendor-filter.jpg" width="220" /> |
| Stats · Default       | <img src="static/images/screenshots/zh/stats-default.jpg" width="220" />       |
| Stats · Compare       | <img src="static/images/screenshots/zh/stats-compare.jpg" width="220" />       |
| Profile · Settings    | <img src="static/images/screenshots/zh/profile-settings.jpg" width="220" />    |
| Profile · API Keys    | <img src="static/images/screenshots/zh/profile-api-keys.jpg" width="220" />    |
| Profile · Persona     | <img src="static/images/screenshots/zh/profile-persona.jpg" width="220" />     |

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

## 🚀 Core Features

### Quick Guide

1. Use the **Records** tab with the AI assistant or manual entry
2. Filter bills by time and platform on the **Bills** tab
3. Review trends, comparisons, and rankings in **Statistics**
4. Manage API keys, backup, and membership in **Profile**
5. **Local mode** is recommended: data stays on-device with core features ready
6. Enable persona mode and local memory under **Settings → Persona Mode**

### Local Mode

After binding an API key and selecting a chat model, you can on-device:

- Log token usage and browse bills
- View charts and cost analytics
- Chat with the AI assistant and generate usage reports

Data is stored locally by default — no cloud dependency required.

### Persona Mode & Persistent Memory

Optional features. When enabled, the AI replies in your chosen persona style and can retrieve relevant chat snippets from an on-device vector store.

- Memory data stays on your device by default and is not auto-uploaded
- Manage vector store size, clear data, or rebuild from chat history in settings
- Clearing vectors does not delete chat logs

---

## 📦 Tech Stack

| Layer     | Choice                                           |
| --------- | ------------------------------------------------ |
| Framework | [uni-app](https://uniapp.dcloud.net.cn/) (Vue 2) |
| UI        | [uView UI 2](https://www.uviewui.com/)           |
| Charts    | qiun-data-charts                                 |
| State     | Vuex 3                                           |
| HTTP      | luch-request                                     |
| Dates     | dayjs                                            |

**Target platforms:** Android · iOS · WeChat Mini Program · H5 (Web)

See [`docs/依赖选型.md`](docs/依赖选型.md) for dependency notes (Chinese).

---

## 🛠️ Getting Started

### Requirements

- [Node.js](https://nodejs.org/) 18+
- [HBuilderX](https://www.dcloud.io/hbuilderx.html) or uni-app CLI

### Install & verify

```bash
git clone https://github.com/sunG91/Token-Ledger.git
cd Token-Ledger
npm install
npm run check
```

### Run

Open the project in HBuilderX and run on your target platform (App / Mini Program / H5).

On first launch, configure your API key and chat model under **Profile → Local Mode**.

---

## 🔒 Privacy & Security

We value your privacy:

- Sensitive keys are stored securely; the client **only shows masked values**
- Core bookkeeping works **offline** in local mode
- User data belongs to users; the developer processes data only as needed to provide the service

---

## 📄 Legal Notice

This software, including its documentation, UI design, icons, and source code, is protected under applicable copyright law.

- **Copyright owner:** Sun Rui (independent developer)
- **Nature:** Commercial product; the developer reserves all IP and monetization rights
- **License:** Released under [GNU AGPL v3](LICENSE.txt); use beyond the license requires written permission

Without the copyright owner's written consent, no one may plagiarize, misappropriate, or falsely claim this project, or copy, modify, distribute, or reverse-engineer it for competing products. Authorized use under AGPL is not restricted by the above. The software is provided "as is".

---

## 🤝 Contact

For partnerships, feedback, or suggestions:

|               |                                                                          |
| ------------- | ------------------------------------------------------------------------ |
| **Developer** | Sun Rui (independent developer)                                          |
| **Email**     | [sunr20050503@163.com](mailto:sunr20050503@163.com)                      |
| **Repository**| [github.com/sunG91/Token-Ledger](https://github.com/sunG91/Token-Ledger) |
| **中文文档**  | [README.zh.md](README.zh.md)                                             |

---

<div align="center">

<br />

**Token Ledger** — Every token counted, every cost clear.

© 2026 Sun Rui · Token Ledger. All rights reserved.

</div>
