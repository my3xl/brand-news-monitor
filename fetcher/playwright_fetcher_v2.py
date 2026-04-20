#!/usr/bin/env python3
"""
Enhanced Playwright fetcher with anti-bot measures.
"""

import asyncio
import json
import random
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict

from playwright.async_api import async_playwright, Browser, BrowserContext


@dataclass
class NewsArticle:
    title: str
    link: str
    source: str
    time: str = ""
    content: str = ""
    summary: str = ""
    grade: str = "C"
    brand: str = ""
    fetch_status: str = ""


class EnhancedPlaywrightFetcher:
    """Enhanced fetcher with anti-bot protection."""

    USER_AGENTS = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    ]

    def __init__(
        self,
        proxy_server: str = "127.0.0.1:7897",
        proxy_type: str = "socks5",
        headless: bool = False,
        delay_min: float = 3.0,
        delay_max: float = 6.0
    ):
        self.proxy = {"server": f"{proxy_type}://{proxy_server}"} if proxy_type != "none" else None
        self.headless = headless
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.browser: Optional[Browser] = None

    async def init_browser(self):
        """Initialize browser with stealth settings."""
        self.playwright = await async_playwright().start()

        browser_args = {
            "headless": self.headless,
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--disable-web-security",
            ]
        }

        if self.proxy:
            browser_args["proxy"] = self.proxy

        self.browser = await self.playwright.chromium.launch(**browser_args)
        print(f"✅ Browser ready (headless={self.headless})")

    async def create_context(self) -> BrowserContext:
        """Create a new browser context with random settings."""
        user_agent = random.choice(self.USER_AGENTS)

        context = await self.browser.new_context(
            viewport={"width": random.randint(1200, 1400), "height": random.randint(800, 900)},
            user_agent=user_agent,
            locale="en-US",
        )

        # Add stealth scripts
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3, 4, 5]});
        """)

        return context

    async def fetch_with_retry(self, url: str, max_retries: int = 2) -> Optional[Dict]:
        """Fetch URL with retry and anti-bot handling."""
        for attempt in range(max_retries):
            try:
                delay = random.uniform(self.delay_min, self.delay_max)
                await asyncio.sleep(delay)

                context = await self.create_context()
                page = await context.new_page()

                response = await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                await asyncio.sleep(random.uniform(2, 4))

                # Check anti-bot
                page_title = await page.title()
                page_text = await page.inner_text('body')

                anti_bot_indicators = ['verify', 'captcha', 'robot', 'unusual', 'before you continue']
                is_anti_bot = any(indicator in page_title.lower() or indicator in page_text.lower()[:500]
                                 for indicator in anti_bot_indicators)

                if is_anti_bot:
                    await context.close()
                    print(f"   ⚠️ Anti-bot detected (attempt {attempt + 1})")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(random.uniform(5, 10))
                        continue
                    return {"status": "anti_bot", "content": "", "title": page_title}

                content = await self.extract_content(page)
                await context.close()

                return {
                    "status": "success" if content else "empty",
                    "content": content,
                    "title": page_title,
                    "url": page.url
                }

            except Exception as e:
                print(f"   ❌ Error (attempt {attempt + 1}): {str(e)[:50]}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(random.uniform(3, 6))
                else:
                    return {"status": "error", "content": "", "error": str(e)}

        return None

    async def extract_content(self, page) -> str:
        """Extract article content from page."""
        return await page.evaluate("""() => {
            const selectors = [
                'article', '[role="main"]', 'main',
                '.article-content', '.post-content', '.entry-content',
                '#article-body', '.story-body'
            ];

            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el) {
                    const text = el.innerText;
                    if (text.length > 300) return text.slice(0, 10000);
                }
            }

            // Fallback: paragraphs
            const paragraphs = document.querySelectorAll('p');
            let text = '';
            for (const p of paragraphs) {
                text += p.innerText + ' ';
                if (text.length > 1000) break;
            }

            return text.slice(0, 8000).trim();
        }""")

    async def fetch_article(self, url: str, title: str) -> NewsArticle:
        """Fetch single article."""
        print(f"\n📄 {title[:50]}...")

        result = await self.fetch_with_retry(url)
        article = NewsArticle(title=title, link=url, source="Unknown")

        if result:
            article.fetch_status = result.get("status", "unknown")
            if result.get("status") == "success":
                article.content = result.get("content", "")
                article.title = result.get("title", title)
                print(f"   ✅ Content: {len(article.content)} chars")
            elif result.get("status") == "anti_bot":
                print(f"   🚫 Anti-bot protection")
            else:
                print(f"   ❌ {result.get('status')}")

        return article

    async def close(self):
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()
