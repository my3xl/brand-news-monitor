#!/usr/bin/env python3
"""
Unified Playwright-based news fetcher.
Fetches news by: Google News search → extract links → visit each link → get content → AI process.
"""

import asyncio
import json
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Page, Browser


@dataclass
class NewsArticle:
    """News article with full content."""
    title: str
    link: str
    source: str
    time: str = ""
    content: str = ""
    summary: str = ""
    grade: str = "C"
    brand: str = ""


class PlaywrightNewsFetcher:
    """Fetch news using Playwright with SOCKS5 proxy."""

    def __init__(
        self,
        proxy_server: str = "127.0.0.1:7897",
        proxy_type: str = "socks5",
        timeout: int = 60000,
        js_wait_time: int = 3000,
        headless: bool = False
    ):
        self.proxy = {
            "server": f"{proxy_type}://{proxy_server}"
        } if proxy_type != "none" else None
        self.timeout = timeout
        self.js_wait_time = js_wait_time
        self.headless = headless
        self.browser: Optional[Browser] = None

    async def init_browser(self):
        """Initialize Playwright browser with proxy."""
        self.playwright = await async_playwright().start()

        browser_args = {
            "headless": self.headless,
        }

        if self.proxy:
            browser_args["proxy"] = self.proxy
            print(f"🌐 Using proxy: {self.proxy['server']}")

        self.browser = await self.playwright.chromium.launch(**browser_args)
        print(f"✅ Browser initialized (headless={self.headless})")

    async def close(self):
        """Close browser."""
        if self.browser:
            await self.browser.close()
        if hasattr(self, 'playwright'):
            await self.playwright.stop()
        print("👋 Browser closed")

    async def fetch_google_news_links(
        self,
        keyword: str,
        max_articles: int = 50
    ) -> List[Dict]:
        """
        Fetch article links from Google News search.

        Args:
            keyword: Search keyword
            max_articles: Max number of articles to fetch

        Returns:
            List of article metadata (title, link, source)
        """
        if not self.browser:
            await self.init_browser()

        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        # Construct Google News search URL
        search_url = f"https://news.google.com/search?q={keyword.replace(' ', '+')}&hl=en-US&gl=US&ceid=US:en"
        print(f"\n🔍 Opening Google News: {search_url}")

        try:
            await page.goto(search_url, wait_until="networkidle", timeout=self.timeout)
            await asyncio.sleep(self.js_wait_time / 1000)  # Wait for JS rendering

            print("📸 Taking screenshot of search results...")
            await page.screenshot(path="/tmp/google_news_search.png", full_page=True)

            # Extract article links using JavaScript
            articles = await page.evaluate("""() => {
                const results = [];
                const seen = new Set();

                // Try multiple selectors for article links
                const selectors = [
                    'article a[href^="./article"]',
                    'article a[href^="./read"]',
                    'a[href^="./article"]',
                    'a[href^="./read"]',
                    'h3 a',
                    'h4 a'
                ];

                for (const selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const el of elements) {
                        const href = el.getAttribute('href');
                        const title = el.innerText?.trim();

                        if (href && title && title.length > 10) {
                            // Convert relative URL to absolute
                            let fullUrl = href;
                            if (href.startsWith('./')) {
                                fullUrl = 'https://news.google.com' + href.substring(1);
                            } else if (href.startsWith('/')) {
                                fullUrl = 'https://news.google.com' + href;
                            }

                            // Avoid duplicates
                            if (!seen.has(fullUrl)) {
                                seen.add(fullUrl);

                                // Try to find source
                                let source = 'Unknown';
                                const article = el.closest('article');
                                if (article) {
                                    const sourceEl = article.querySelector('[data-n-tid]');
                                    if (sourceEl) {
                                        source = sourceEl.innerText?.trim() || 'Unknown';
                                    }
                                }

                                results.push({
                                    title: title,
                                    url: fullUrl,
                                    source: source
                                });
                            }
                        }
                    }
                    if (results.length >= 50) break;
                }

                return results.slice(0, 50);
            }""")

            print(f"✅ Found {len(articles)} articles")
            for i, art in enumerate(articles[:5], 1):
                print(f"   {i}. {art['title'][:60]}... ({art['source']})")

            await context.close()
            return articles[:max_articles]

        except Exception as e:
            print(f"❌ Error fetching Google News: {e}")
            await page.screenshot(path="/tmp/google_news_error.png")
            await context.close()
            return []

    async def fetch_article_content(self, url: str) -> Optional[Dict]:
        """
        Fetch full content from an article URL.

        Args:
            url: Article URL

        Returns:
            Article content dict or None
        """
        if not self.browser:
            await self.init_browser()

        context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        try:
            print(f"   📄 Fetching: {url[:60]}...")

            # Navigate to article
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(3)  # Wait for content to load

            # Try to extract content using multiple selectors
            content_data = await page.evaluate("""() => {
                // Try to find main content
                const selectors = [
                    'article',
                    '[role="main"]',
                    'main',
                    '.article-content',
                    '.post-content',
                    '.entry-content',
                    '#article-body',
                    '.story-body'
                ];

                let content = '';
                let title = document.title;

                for (const selector of selectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        content = el.innerText;
                        if (content.length > 200) break;
                    }
                }

                // Fallback to body text
                if (!content || content.length < 100) {
                    content = document.body?.innerText || '';
                }

                // Clean up content
                content = content
                    .replace(/\\s+/g, ' ')
                    .replace(/(Cookie|Privacy|Subscribe|Newsletter).*/gi, '')
                    .trim()
                    .slice(0, 8000);  // Limit to 8000 chars

                return {
                    title: title,
                    content: content,
                    url: window.location.href
                };
            }""")

            await context.close()

            if content_data['content'] and len(content_data['content']) > 100:
                print(f"   ✅ Content: {len(content_data['content'])} chars")
                return content_data
            else:
                print(f"   ⚠️  Content too short")
                return None

        except Exception as e:
            print(f"   ❌ Error: {e}")
            await context.close()
            return None

    async def fetch_brand_news(
        self,
        brand: str,
        keyword: str,
        max_articles: int = 50,
        fetch_full_content: bool = True
    ) -> List[NewsArticle]:
        """
        Complete pipeline: search → get links → fetch content.

        Args:
            brand: Brand name
            keyword: Search keyword
            max_articles: Max articles to fetch
            fetch_full_content: Whether to fetch full article content

        Returns:
            List of NewsArticle with content
        """
        print(f"\n{'='*70}")
        print(f"🚀 Fetching news for: {brand}")
        print(f"   Keyword: {keyword}")
        print(f"   Max articles: {max_articles}")
        print(f"   Fetch content: {fetch_full_content}")
        print(f"{'='*70}")

        # Step 1: Get article links from Google News
        articles = await self.fetch_google_news_links(keyword, max_articles)

        if not articles:
            print("❌ No articles found")
            return []

        # Step 2: Fetch full content for each article
        news_articles = []

        for i, art in enumerate(articles, 1):
            print(f"\n[{i}/{len(articles)}] {art['title'][:60]}...")

            news_art = NewsArticle(
                title=art['title'],
                link=art['url'],
                source=art['source'],
                brand=brand
            )

            if fetch_full_content:
                content_data = await self.fetch_article_content(art['url'])
                if content_data:
                    news_art.content = content_data['content']
                    # Update title if page has better title
                    if content_data['title'] and content_data['title'] != art['title']:
                        news_art.title = content_data['title']

            news_articles.append(news_art)

            # Delay between requests to be polite
            if i < len(articles):
                await asyncio.sleep(2)

        print(f"\n✅ Fetched {len(news_articles)} articles")
        return news_articles

    def save_articles(self, articles: List[NewsArticle], filename: str = None):
        """Save articles to JSON file."""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"articles_{timestamp}.json"

        data = [asdict(art) for art in articles]

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"💾 Saved to: {filename}")
        return filename


# Test function
async def test_fetcher():
    """Test the fetcher."""
    fetcher = PlaywrightNewsFetcher(
        proxy_server="127.0.0.1:7897",
        proxy_type="socks5",
        timeout=60000,
        js_wait_time=3000
    )

    try:
        print("⚠️  Make sure Clash Verge is running on port 7897")
        print("   Press Ctrl+C to cancel, or wait 3 seconds...")
        await asyncio.sleep(3)

        # Test with BONOBOS
        articles = await fetcher.fetch_brand_news(
            brand="BONOBOS",
            keyword="BONOBOS menswear",
            max_articles=10,  # Test with 10 first
            fetch_full_content=True
        )

        # Save results
        fetcher.save_articles(articles)

        # Print summary
        print(f"\n{'='*70}")
        print(f"📊 Summary")
        print(f"{'='*70}")
        print(f"Total articles: {len(articles)}")

        with_content = sum(1 for a in articles if a.content)
        print(f"With content: {with_content}")

        for i, art in enumerate(articles[:3], 1):
            print(f"\n{i}. {art.title[:60]}...")
            print(f"   Source: {art.source}")
            print(f"   Content: {len(art.content)} chars")
            print(f"   Preview: {art.content[:150]}...")

    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(test_fetcher())
