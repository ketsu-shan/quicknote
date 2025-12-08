# QuickNote

<p align="center">
  <img src="build/icon.png" width="128" height="128" alt="QuickNote Icon">
</p>

<p align="center">
  <b>一款简约高效的桌面任务管理工具</b><br>
  <sub>A minimal and efficient desktop task manager</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-blue.svg" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

---

## ✨ 特性 Features

- 🎯 **四象限任务管理** - 区分「紧急重要」与「重要不紧急」
- 🎨 **毛玻璃 UI** - 现代化液态玻璃视觉效果
- 🔄 **拖拽排序** - 支持任务跨区域拖拽
- 📊 **进度可视化** - 彩色进度条实时显示完成度
- 📅 **归档记录** - 自动记录每日任务完成情况
- 🌓 **主题切换** - 支持浅色/深色模式
- 📌 **桌面置顶** - 始终显示在其他窗口之上
- 🪟 **迷你模式** - 收起后仅显示进度条
- 🔒 **本地存储** - 数据保存在本地，无需注册登录

## 📸 截图 Screenshots

| 深色模式 | 浅色模式 | 迷你模式 |
|:---:|:---:|:---:|
| Dark Mode | Light Mode | Mini Mode |

## 📥 下载 Download

前往 [Releases](../../releases) 页面下载最新版本的 DMG 安装包。

### 系统要求
- macOS 14.0 (Sonoma) 或更高版本
- Apple Silicon (M1/M2/M3) 或 Intel 处理器

### 安装步骤
1. 下载 `QuickNote-x.x.x-arm64.dmg`（Apple Silicon）或 `QuickNote-x.x.x-x64.dmg`（Intel）
2. 打开 DMG 文件
3. 将 QuickNote 拖入 Applications 文件夹
4. 首次打开时，右键点击应用选择「打开」以绕过 Gatekeeper

## 🛠️ 本地开发 Development

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 打包为 DMG
npm run dist
```

## 🏗️ 技术栈 Tech Stack

- **前端**: React + TypeScript + Vite
- **样式**: Tailwind CSS
- **桌面**: Electron
- **拖拽**: react-beautiful-dnd

## 📄 许可证 License

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">
  Made with ❤️ for productivity
</p>
