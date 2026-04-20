#!/usr/bin/env python3
"""
Helly Hansen 新闻抓取 + AI 摘要 + Gmail 发送
验证 Chrome DevTools MCP 的登录状态复用能力
"""

import subprocess
import json
import time
import os
import re
from datetime import datetime
import requests

class MCPClient:
    def __init__(self, command, args=None):
        self.command = command
        self.args = args or []
        self.process = None
        self.request_id = 0

    def start(self):
        cmd = [self.command] + self.args
        self.process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

    def send_request(self, method, params=None):
        self.request_id += 1
        request = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params or {},
            "id": self.request_id
        }

        request_line = json.dumps(request) + "\n"
        self.process.stdin.write(request_line)
        self.process.stdin.flush()

        response_line = self.process.stdout.readline()
        return json.loads(response_line)

    def call_tool(self, name, arguments):
        return self.send_request("tools/call", {
            "name": name,
            "arguments": arguments
        })

    def close(self):
        if self.process:
            self.process.terminate()
            self.process.wait()


class KimiSummarizer:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("KIMI_API_KEY") or os.getenv("ANTHROPIC_AUTH_TOKEN")
        # Kimi Code 使用 Anthropic API 格式
        self.api_url = "https://api.kimi.com/coding/v1/messages"
        self.model = "kimi-k2.5"

    def summarize(self, title, content):
        """使用 Kimi 生成 100 字以内的新闻摘要"""
        try:
            if not self.api_key:
                print("   ⚠️ 未设置 KIMI_API_KEY，使用简单摘要")
                return content[:100] + "..." if len(content) > 100 else content

            prompt = f"""请用中文为以下新闻写一段摘要，100字以内，突出关键信息：

标题：{title}

正文：{content[:3000]}

要求：
1. 100字以内
2. 突出关键信息（如财务数据、人事变动、战略调整等）
3. 语言简洁专业

摘要："""

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            # 使用 Anthropic API 格式 (Kimi Code 兼容)
            data = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 200,
                "temperature": 0.3
            }

            response = requests.post(self.api_url, headers=headers, json=data, timeout=30)
            response.raise_for_status()

            result = response.json()
            # Anthropic 格式返回
            if "content" in result and len(result["content"]) > 0:
                summary = result["content"][0]["text"].strip()
            else:
                summary = result["choices"][0]["message"]["content"].strip()

            # 确保不超过 100 字
            if len(summary) > 100:
                summary = summary[:97] + "..."
            return summary

        except Exception as e:
            print(f"   Kimi API 失败: {e}")
            # 备用方案：智能提取前100字，尝试在句子边界截断
            return self._fallback_summary(content)

    def _fallback_summary(self, content):
        """备用摘要方法：智能提取前100字"""
        text = content.replace('\n', ' ').strip()

        # 清理常见噪音（导航、广告等）
        noise_patterns = [
            r'登录|免费注册|实时行情|投资组合|财经日历|股票筛选器',
            r'最新资讯|热门资讯|财经要闻|股市|外汇|商品',
            r'去购买|更新于|微博认证|超话粉丝大咖',
        ]
        for pattern in noise_patterns:
            text = re.sub(pattern, '', text)

        text = re.sub(r'\s+', ' ', text).strip()

        # 取前100字，尝试在句子边界截断
        if len(text) <= 100:
            return text

        # 找前100字内的最后一个句号
        end = text.rfind('。', 0, 100)
        if end == -1:
            end = text.rfind('.', 0, 100)
        if end == -1:
            end = text.rfind(' ', 0, 100)
        if end == -1:
            end = 97

        return text[:end+1] + "..." if end < len(text) - 1 else text[:end+1]


def extract_news_links(client):
    """从 Google News 提取新闻链接"""
    print("\n[2/8] 提取新闻链接...")

    js_code = """() => {
        const links = [];
        const selectors = [
            'article a[href^="./article"]',
            'article a[href^="./read"]',
            'h3 a', 'h4 a', '[data-n-tid] a'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
                const href = el.getAttribute('href');
                const title = el.innerText?.trim();

                if (href && title && title.length > 10) {
                    let fullUrl = href;
                    if (href.startsWith('./')) {
                        fullUrl = 'https://news.google.com' + href.substring(1);
                    } else if (href.startsWith('/')) {
                        fullUrl = 'https://news.google.com' + href;
                    }

                    if (!links.find(l => l.url === fullUrl)) {
                        links.push({ title, url: fullUrl });
                    }
                }
            }
            if (links.length >= 10) break;
        }

        return { count: links.length, links: links.slice(0, 5) };
    }"""

    response = client.call_tool("evaluate_script", { "function": js_code })

    result = None
    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                try:
                    text = item['text']
                    if '```json' in text:
                        json_str = text.split('```json')[1].split('```')[0].strip()
                    elif '```' in text:
                        json_str = text.split('```')[1].strip()
                    else:
                        json_str = text
                    result = json.loads(json_str)
                except:
                    pass

    if result and result.get('links'):
        print(f"   找到 {len(result['links'])} 条新闻")
        for i, link in enumerate(result['links'], 1):
            print(f"   {i}. {link['title'][:50]}...")
        return result['links']
    return []


def get_article_content(client, url):
    """获取文章内容"""
    print(f"\n   正在打开: {url[:50]}...")

    response = client.call_tool("navigate_page", {"url": url})
    time.sleep(5)

    js_code = """() => {
        const selectors = ['article', '[role="main"]', 'main', '.article-content', '.post-content'];
        let content = '';

        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                content = el.innerText;
                if (content.length > 200) break;
            }
        }

        if (!content || content.length < 100) {
            content = document.body?.innerText || '';
        }

        return {
            title: document.title,
            content: content.replace(/\s+/g, ' ').trim().slice(0, 4000),
            url: window.location.href
        };
    }"""

    response = client.call_tool("evaluate_script", {"function": js_code})

    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                try:
                    text = item['text']
                    if '```json' in text:
                        json_str = text.split('```json')[1].split('```')[0].strip()
                    elif '```' in text:
                        json_str = text.split('```')[1].strip()
                    else:
                        json_str = text
                    return json.loads(json_str)
                except:
                    pass
    return None


def remove_duplicates(news_items):
    """简单的去重：基于标题相似度"""
    print("\n[6/8] 对比去重...")

    unique_items = []
    for item in news_items:
        # 检查是否与已有的项目相似
        is_duplicate = False
        for existing in unique_items:
            # 简单判断：标题相似度 > 70%
            title1 = item['title'].lower()
            title2 = existing['title'].lower()

            # 计算共同词比例
            words1 = set(title1.split())
            words2 = set(title2.split())
            if len(words1) > 0 and len(words2) > 0:
                overlap = len(words1 & words2) / min(len(words1), len(words2))
                if overlap > 0.7:
                    is_duplicate = True
                    print(f"   去重: {item['title'][:40]}...")
                    break

        if not is_duplicate:
            unique_items.append(item)

    print(f"   去重后: {len(unique_items)} 条新闻")
    return unique_items


def create_email_html(news_items):
    """创建邮件 HTML"""
    print("\n[7/8] 生成邮件内容...")

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
        h1 {{ color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; font-size: 20px; }}
        .meta {{ color: #666; font-size: 12px; margin: 15px 0; }}
        .news-item {{ background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px; }}
        .news-title {{ font-size: 15px; font-weight: 600; margin-bottom: 8px; }}
        .news-title a {{ color: #1a73e8; text-decoration: none; }}
        .news-summary {{ color: #444; font-size: 13px; line-height: 1.6; }}
        .footer {{ margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #999; font-size: 11px; text-align: center; }}
    </style>
</head>
<body>
    <h1>Helly Hansen 新闻摘要</h1>
    <div class="meta">报告时间: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}</div>
"""

    for i, item in enumerate(news_items, 1):
        html += f"""
    <div class="news-item">
        <div class="news-title"><a href="{item['url']}">{i}. {item['title']}</a></div>
        <div class="news-summary">{item.get('summary', '暂无摘要')}</div>
    </div>
"""

    html += """
    <div class="footer">
        由 Chrome DevTools MCP RPA 自动生成<br>
        如需更多信息，请点击标题查看原文
    </div>
</body>
</html>"""

    return html


def send_email_via_gmail(client, to_email, subject, html_content):
    """通过 Gmail Web 界面发送邮件 - 利用已登录状态"""
    print(f"\n[8/8] 通过 Gmail 发送邮件给 {to_email}...")

    # 1. 导航到 Gmail
    print("   打开 Gmail...")
    response = client.call_tool("navigate_page", {"url": "https://mail.google.com/mail/u/0/#inbox"})
    time.sleep(5)

    # 截图检查状态
    screenshot_path = "/tmp/gmail_check.png"
    client.call_tool("take_screenshot", {"fullPage": True, "filePath": screenshot_path})

    # 检查是否需要登录
    check_js = """() => {
        return {
            url: window.location.href,
            isInbox: window.location.href.includes('inbox') || window.location.href.includes('mail.google.com'),
            hasCompose: !!document.querySelector('[gh="cm"]') ||
                       !!document.querySelector('div[role="button"][gh="cm"]') ||
                       !!document.querySelector('.T-I.T-I-KE.L3')
        };
    }"""

    response = client.call_tool("evaluate_script", {"function": check_js})
    check_result = None

    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                try:
                    text = item['text']
                    if '```json' in text:
                        json_str = text.split('```json')[1].split('```')[0].strip()
                    elif '```' in text:
                        json_str = text.split('```')[1].strip()
                    else:
                        json_str = text
                    check_result = json.loads(json_str)
                except:
                    pass

    if not check_result:
        print("   ⚠️ 无法检查 Gmail 状态")
        return False

    print(f"   当前 URL: {check_result.get('url', 'N/A')[:60]}...")
    print(f"   是否有撰写按钮: {check_result.get('hasCompose', False)}")

    if not check_result.get('isInbox'):
        print("   ⚠️ Gmail 未登录或需要验证")
        print("   请先在 Chrome 中登录 Gmail，然后重新运行")
        return False

    print("   ✅ Gmail 已登录")

    # 2. 点击 Compose 按钮 - 使用 take_snapshot + click 工具
    print("   获取页面快照查找撰写按钮...")
    response = client.call_tool("take_snapshot", {})

    # 解析快照找 compose 按钮
    compose_uid = None
    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                snapshot = item['text']
                # 查找包含 "撰写" 或 "Compose" 的按钮
                lines = snapshot.split('\n')
                for i, line in enumerate(lines):
                    if ('撰写' in line or 'Compose' in line or 'cm' in line) and 'button' in line:
                        # 提取 uid
                        import re
                        uid_match = re.search(r'uid=[\d_]+', line)
                        if uid_match:
                            compose_uid = uid_match.group(0)
                            print(f"   找到撰写按钮: {compose_uid}")
                            break

    if compose_uid:
        print("   点击撰写按钮...")
        response = client.call_tool("click", {"uid": compose_uid})
    else:
        # 备用：使用 JavaScript 点击
        print("   使用 JavaScript 点击撰写按钮...")
        compose_js = """() => {
            const composeBtn = document.querySelector('[gh="cm"]') ||
                              document.querySelector('div[role="button"][gh="cm"]') ||
                              document.querySelector('.T-I.T-I-KE.L3');
            if (composeBtn) {
                composeBtn.click();
                return { success: true };
            }
            return { success: false, error: '未找到按钮' };
        }"""
        response = client.call_tool("evaluate_script", {"function": compose_js})

    time.sleep(3)

    # 3. 填写邮件 - 使用更可靠的方式
    print("   填写邮件内容...")

    # 保存 HTML 到临时文件
    temp_html_path = "/tmp/helly_hansen_email.html"
    with open(temp_html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

    # 使用 take_snapshot 获取 compose 窗口
    print("   获取撰写窗口快照...")
    response = client.call_tool("take_snapshot", {})

    # 查找输入框的 uid
    to_uid = None
    subject_uid = None
    body_uid = None

    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                snapshot = item['text']
                lines = snapshot.split('\n')
                for line in lines:
                    # 查找收件人输入框
                    if ('收件人' in line or 'To' in line or 'to' in line.lower()) and 'textbox' in line:
                        uid_match = re.search(r'uid=[\d_]+', line)
                        if uid_match and not to_uid:
                            to_uid = uid_match.group(0)
                            print(f"   找到收件人框: {to_uid}")
                    # 查找主题输入框
                    if ('主题' in line or 'Subject' in line) and 'input' in line:
                        uid_match = re.search(r'uid=[\d_]+', line)
                        if uid_match and not subject_uid:
                            subject_uid = uid_match.group(0)
                            print(f"   找到主题框: {subject_uid}")

    # 4. 使用 click + type 填写
    if to_uid:
        print(f"   点击收件人框...")
        client.call_tool("click", {"uid": to_uid})
        time.sleep(0.5)

    # 使用 JavaScript 填写
    fill_js = f"""() => {{
        try {{
            // 查找所有输入框
            const inputs = document.querySelectorAll('input, textarea, [role="textbox"]');
            let toField = null;
            let subjectField = null;

            for (const input of inputs) {{
                const ariaLabel = input.getAttribute('aria-label') || '';
                const placeholder = input.getAttribute('placeholder') || '';
                const name = input.getAttribute('name') || '';

                // 收件人
                if ((ariaLabel.includes('收件人') || ariaLabel.includes('To') ||
                     placeholder.includes('收件人') || name === 'to') && !toField) {{
                    toField = input;
                }}

                // 主题
                if ((ariaLabel.includes('主题') || ariaLabel.includes('Subject') ||
                     name === 'subjectbox' || placeholder.includes('主题')) && !subjectField) {{
                    subjectField = input;
                }}
            }}

            // 填写
            if (toField) {{
                toField.focus();
                toField.value = '{to_email}';
                toField.dispatchEvent(new Event('input', {{ bubbles: true }}));
                toField.dispatchEvent(new KeyboardEvent('keydown', {{ key: 'Tab', bubbles: true }}));
            }}

            if (subjectField) {{
                subjectField.focus();
                subjectField.value = '{subject}';
                subjectField.dispatchEvent(new Event('input', {{ bubbles: true }}));
            }}

            return {{
                success: true,
                toFound: !!toField,
                subjectFound: !!subjectField
            }};

        }} catch (e) {{
            return {{ success: false, error: e.message }};
        }}
    }}"""

    response = client.call_tool("evaluate_script", {"function": fill_js})

    result_text = ""
    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                result_text = item['text']
                print(f"   填写结果: {result_text[:200]}")

    print(f"\n   📧 邮件准备状态:")
    print(f"   收件人: {to_email}")
    print(f"   主题: {subject}")

    # 5. 粘贴 HTML 内容到邮件正文
    print("   粘贴邮件正文...")

    # 先复制 HTML 内容到剪贴板（通过临时文件）
    with open(temp_html_path, 'r', encoding='utf-8') as f:
        html_content_clean = f.read()

    # 使用 JavaScript 填写正文
    body_js = f"""() => {{
        try {{
            // 查找邮件正文编辑器
            const bodyEditors = document.querySelectorAll('[role="textbox"][contenteditable="true"]');
            let bodyEditor = null;

            for (const editor of bodyEditors) {{
                // 找到最大的 textbox 作为正文区域
                if (editor.offsetHeight > 100 || editor.getAttribute('aria-label')?.includes('邮件正文')) {{
                    bodyEditor = editor;
                    break;
                }}
            }}

            if (!bodyEditor) {{
                // 尝试其他选择器
                bodyEditor = document.querySelector('.Am.Al.editable') ||
                            document.querySelector('[g_editable="true"]');
            }}

            if (bodyEditor) {{
                // 聚焦并设置内容
                bodyEditor.focus();
                bodyEditor.innerHTML = {repr(html_content_clean)};

                // 触发输入事件
                bodyEditor.dispatchEvent(new Event('input', {{ bubbles: true }}));
                bodyEditor.dispatchEvent(new Event('blur', {{ bubbles: true }}));

                return {{ success: true, method: 'innerHTML' }};
            }}

            return {{ success: false, error: '未找到正文编辑器' }};
        }} catch (e) {{
            return {{ success: false, error: e.message }};
        }}
    }}"""

    response = client.call_tool("evaluate_script", {"function": body_js})
    time.sleep(2)

    # 6. 点击发送按钮
    print("   点击发送按钮...")

    send_js = """() => {
        try {
            // 查找发送按钮
            const sendButtons = [
                document.querySelector('[role="button"][data-tooltip="发送"]'),
                document.querySelector('[role="button"][data-tooltip="Send"]'),
                document.querySelector('div[role="button"][aria-label*="发送"]'),
                document.querySelector('div[role="button"][aria-label*="Send"]'),
                document.querySelector('.T-I.J-J5-Ji.aoO.T-I-atl.L3'),  // Gmail 经典选择器
                document.querySelector('[gh="send"]')
            ];

            for (const btn of sendButtons) {
                if (btn && btn.offsetParent !== null) {  // 确保按钮可见
                    btn.click();
                    return { success: true, method: 'button_click' };
                }
            }

            // 备用：快捷键发送
            document.body.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                ctrlKey: true,
                bubbles: true
            }));

            return { success: true, method: 'keyboard_shortcut' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }"""

    response = client.call_tool("evaluate_script", {"function": send_js})

    send_result = None
    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                send_result = item['text']
                print(f"   发送结果: {send_result[:200]}")

    time.sleep(3)

    # 7. 验证发送结果
    print("   验证发送状态...")
    verify_js = """() => {
        // 检查是否出现"正在发送"或"邮件已发送"提示
        const notifications = document.querySelectorAll('[role="alert"]');
        for (const notif of notifications) {
            const text = notif.innerText || '';
            if (text.includes('已发送') || text.includes('sent') || text.includes('正在发送')) {
                return { sent: true, message: text };
            }
        }

        // 检查是否回到收件箱
        if (window.location.href.includes('inbox') && !document.querySelector('[role="dialog"]')) {
            return { sent: true, message: '已返回收件箱' };
        }

        return { sent: false, url: window.location.href };
    }"""

    response = client.call_tool("evaluate_script", {"function": verify_js})

    if "result" in response and "content" in response["result"]:
        for item in response["result"]["content"]:
            if item.get("type") == "text":
                print(f"   验证结果: {item['text'][:200]}")

    # 截图
    screenshot_path = "/tmp/gmail_sent.png"
    client.call_tool("take_screenshot", {"fullPage": True, "filePath": screenshot_path})

    if send_result and 'success' in send_result and 'true' in send_result:
        print(f"\n   ✅ 邮件已成功发送给 {to_email}")
        return True
    else:
        print(f"\n   ⚠️ 发送可能未完成，请检查 Chrome")
        print(f"   截图: {screenshot_path}")
        return False


def main():
    # 初始化 MCP Client
    client = MCPClient("npx", [
        "chrome-devtools-mcp@latest",
        "--browserUrl=http://127.0.0.1:9222",
        "--no-performance-crux",
        "--no-usage-statistics"
    ])

    output_dir = "/Users/yangjiehong/Documents/CC_Chrome_dev_mcp/helly_hansen_news"
    os.makedirs(output_dir, exist_ok=True)

    # 初始化 Claude
    summarizer = KimiSummarizer()

    print("=" * 70)
    print("Helly Hansen 新闻抓取 + AI 摘要 + Gmail 发送")
    print("验证 Chrome DevTools MCP 登录状态复用能力")
    print("=" * 70)

    client.start()
    time.sleep(3)

    news_items = []

    try:
        # 1. 打开 Google News
        print("\n[1/8] 打开 Google News 搜索 Helly Hansen...")
        search_url = "https://news.google.com/search?q=Helly+Hansen&hl=zh-CN&gl=CN&ceid=CN:zh-Hans"
        response = client.call_tool("navigate_page", {"url": search_url})
        time.sleep(5)

        # 截图
        client.call_tool("take_screenshot", {
            "fullPage": True,
            "filePath": os.path.join(output_dir, "01_google_news.png")
        })

        # 2. 提取新闻链接
        links = extract_news_links(client)

        if not links:
            print("❌ 未找到新闻")
            return

        # 3-5. 遍历新闻，获取内容，AI 生成摘要
        for i, link in enumerate(links, 1):
            print(f"\n[{i+2}/8] 处理第 {i}/5 条新闻...")
            print(f"   标题: {link['title'][:60]}...")

            article = get_article_content(client, link['url'])

            if article and article.get('content'):
                print(f"   获取内容: {len(article['content'])} 字符")

                # 使用 Claude 生成摘要
                print(f"   使用 Claude 生成摘要...")
                summary = summarizer.summarize(
                    article.get('title', link['title']),
                    article['content']
                )
                print(f"   摘要: {summary}")

                news_items.append({
                    'title': article.get('title', link['title']),
                    'url': article.get('url', link['url']),
                    'summary': summary,
                    'content': article['content'][:500]  # 保存部分内容用于调试
                })

                # 截图
                client.call_tool("take_screenshot", {
                    "fullPage": True,
                    "filePath": os.path.join(output_dir, f"02_article_{i}.png")
                })
            else:
                print(f"   ⚠️ 无法获取内容")
                news_items.append({
                    'title': link['title'],
                    'url': link['url'],
                    'summary': '无法获取内容摘要'
                })

            time.sleep(2)

        # 6. 去重
        unique_news = remove_duplicates(news_items)

        # 7. 生成邮件 HTML
        email_html = create_email_html(unique_news)

        # 保存邮件 HTML
        email_path = os.path.join(output_dir, "email_content.html")
        with open(email_path, 'w', encoding='utf-8') as f:
            f.write(email_html)
        print(f"   邮件内容已保存: {email_path}")

        # 8. 发送到 Gmail
        send_email_via_gmail(
            client,
            "albert.yang@leverstyle.com",
            f"Helly Hansen 新闻摘要 - {datetime.now().strftime('%Y%m%d')}",
            email_html
        )

        print("\n" + "=" * 70)
        print("✅ 任务完成!")
        print(f"   新闻数量: {len(unique_news)}")
        print(f"   输出目录: {output_dir}")
        print("=" * 70)

    finally:
        client.close()


if __name__ == "__main__":
    main()
