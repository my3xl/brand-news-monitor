# Fetcher - 新闻抓取模块

基于 Playwright + Clash VPN 的 Google News 抓取器。

## 环境要求

- Python 3.8+
- Clash Verge 运行中（SOCKS5 代理端口 7897）

## 安装

```bash
cd fetcher

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

## 测试抓取

确保 Clash Verge 已开启并运行，然后：

```bash
python fetch_google_news.py
```

按提示回车开始抓取测试。

## 输出示例

成功后会生成 JSON 文件，格式如下：

```json
[
  {
    "title": "Nike SB's Retooled Air Force 1 Will Get Its First Wide Release Next Week",
    "link": "https://news.google.com/read/CBMisgFBVV95cUx...",
    "source": "WWD",
    "time": "2026-04-14T03:33:45Z"
  },
  {
    "title": "Nike Honors Bronny James With Heartfelt New Shoes",
    "link": "https://news.google.com/read/CBMinAFBVV95cUxP...",
    "source": "Sports Illustrated",
    "time": "2026-04-13T12:20:51Z"
  }
]
```

## 技术细节

- **代理**: SOCKS5 (127.0.0.1:7897)
- **选择器**: Google News 使用 `./read/` 格式的链接
- **提取字段**: 标题、链接、来源、时间
- **默认限制**: 每品牌抓取前 10 条新闻

## 故障排查

1. **SSL 证书错误**: 使用 `--trusted-host` 安装依赖
2. **Clash 代理问题**: 确认 Clash Verge 中 SOCKS5 端口为 7897
3. **抓取失败**: 检查 Clash 是否能正常访问 Google
