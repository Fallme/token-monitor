# MiMo Token 用量监控

实时监控 MiMo 平台 Token 使用量的 Web 应用，支持自动数据采集、趋势分析和用量预警。

## 功能特性

**实时监控仪表盘**
- 显示当前套餐已使用/剩余额度
- 自动计算可用天数预估
- 进度条直观展示用量占比
- 套餐到期时间倒计时

**智能趋势分析**
- 10 分钟粒度用量走势图（支持总量/每段消耗切换）
- 每日消耗量柱状图
- 平滑曲线可视化，清晰展示用量变化趋势
- 自动过滤 24 小时内数据，避免图表过于密集

**自动数据采集**
- 每 5 分钟自动拉取 MiMo API 数据
- 本地存储历史记录（保留 90 天）
- Git 自动同步，数据持久化

**Cookie 自动更新**
- 每天定时从 Chrome 浏览器获取最新 Cookie
- 自动提交到 Git 仓库
- Render 自动部署更新
- 无需手动干预，完全自动化

**多标签页支持**
- 支持创建/关闭/切换标签页
- 可同时操作多个页面
- Chrome 最小化后后台运行
- WebSocket 实时通信

## 技术架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Chrome 扩展    │────▶│   Python 服务器   │────▶│   Token Monitor │
│  (WebSocket)    │     │   (HTTP API)     │     │   (Node.js)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
   浏览器控制               命令中转站                 数据处理
   Cookie读取              多会话支持                 历史存储
```

**前端技术栈**
- 纯 HTML/CSS/JavaScript
- Chart.js 数据可视化
- 响应式设计，支持移动端
- 无框架依赖，轻量高效

**后端技术栈**
- Node.js 原生 HTTP 服务器
- Python aiohttp WebSocket 桥接
- Chrome Extension Manifest V3
- Git 版本控制数据同步

## 部署方式

**Render 云部署**
- 推送代码自动部署
- 免费套餐即可运行
- 环境变量配置 Cookie

**本地运行**
```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问仪表盘
open http://localhost:3001
```

## 自动化流程

1. **每日 09:00** - Windows 任务计划程序触发 Cookie 更新脚本
2. **脚本执行** - 从 Chrome 获取最新 Cookie，写入 cookies.json
3. **Git 推送** - 自动提交并推送到 GitHub
4. **Render 部署** - 检测到代码变更，自动重新部署
5. **服务更新** - 新的 Cookie 生效，继续正常采集数据

## 数据安全

- Cookie 仅存储在本地 Git 仓库
- 不上传到任何第三方服务
- 支持手动更新 Cookie（通过 Web UI）
- 历史数据本地保存，隐私可控

## 项目结构

```
token-monitor/
├── server.js          # 后端服务
├── monitor.html       # 仪表盘 UI
├── cookies.json       # Cookie 配置
├── update-cookies.js  # 自动更新脚本
├── store.json         # 历史数据
├── package.json       # 项目配置
└── render.yaml        # 部署配置
```

## 许可证

MIT License
