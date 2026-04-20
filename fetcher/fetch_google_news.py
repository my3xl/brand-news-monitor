#!/usr/bin/env python3
"""
Playwright-based Google News fetcher with Clash VPN proxy.
Fetches news for a single brand to test the pipeline.
"""

import asyncio
import json
from datetime import datetime
from playwright.async_api import async_playwright

# Configuration
CLASH_SOCKS5_PROXY = "socks5://127.0.0.1:7897"
HEADLESS = True  # Set to False to see the browser


async def fetch_google_news(brand: str, keyword: str):
    """
    Fetch Google News for a single brand using Playwright through Clash VPN.

    Args:
        brand: Brand name (e.g., "Nike")
        keyword: Search keyword (e.g., "Nike OR Nike Inc")

    Returns:
        List of news items with title, link, source, time
    """
    url = f"https://news.google.com/search?q={keyword.replace(' ', '%20')}&hl=en-US&gl=US&ceid=US:en"

    print(f"🚀 Starting fetch for {brand}...")
    print(f"🔗 URL: {url}")

    news_items = []

    async with async_playwright() as p:
        # Launch browser with proxy
        browser = await p.chromium.launch(
            headless=HEADLESS,
            proxy={
                "server": CLASH_SOCKS5_PROXY,
            }
        )

        print(f"🌐 Browser launched with proxy: {CLASH_SOCKS5_PROXY}")

        # Create new page
        page = await browser.new_page()

        try:
            # Navigate to Google News
            print(f"⏳ Loading page...")
            await page.goto(url, timeout=60000, wait_until="networkidle")

            # Wait for news articles to load
            print(f"⏳ Waiting for articles...")
            await page.wait_for_load_state("networkidle")
            await asyncio.sleep(2)  # Extra wait for JS rendering

            # Extract articles using JavaScript evaluation
            print("⏳ Extracting articles...")

            articles_data = await page.evaluate("""() => {
                var results = [];
                var seenTitles = new Set();

                // Google News uses ./read/ format for article links
                var links = document.querySelectorAll("a[href^='./read/']");

                for (var j = 0; j < links.length; j++) {
                    var link = links[j];
                    var title = link.textContent ? link.textContent.trim() : '';
                    var href = link.getAttribute('href');

                    // Filter: must have title and href, and be an actual article
                    if (!title || !href || title.length < 15) continue;
                    if (seenTitles.has(title)) continue; // Skip duplicates
                    seenTitles.add(title);

                    // Look for time and source by traversing up DOM
                    var time = '';
                    var source = '';
                    var parent = link.parentElement;

                    for (var i = 0; i < 10 && parent; i++) {
                        // Look for time element
                        if (!time) {
                            var timeElem = parent.querySelector('time');
                            if (timeElem) {
                                time = timeElem.getAttribute('datetime') || timeElem.textContent;
                            }
                        }
                        // Look for source
                        if (!source) {
                            // 1. Image alt text (news outlet logo)
                            var img = parent.querySelector('img[alt]');
                            if (img) {
                                var alt = img.getAttribute('alt');
                                if (alt && alt.length > 1 && alt.length < 50) {
                                    source = alt;
                                }
                            }
                            // 2. Look for source in div/span text patterns
                            if (!source) {
                                var spans = parent.querySelectorAll('div, span');
                                for (var k = 0; k < spans.length && !source; k++) {
                                    var spanText = spans[k].textContent ? spans[k].textContent.trim() : '';
                                    if (spanText && spanText.length > 1 && spanText.length < 35) {
                                        if (title.indexOf(spanText) === -1 && spanText.indexOf('...') === -1) {
                                            if (/^[A-Z]/.test(spanText) || spanText.indexOf('.') > 0 || spanText.indexOf('News') >= 0) {
                                                source = spanText;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        parent = parent.parentElement;
                    }

                    // Clean up source - remove "More" suffix if present
                    if (source) {
                        source = source.replace(/More$/, '').trim();
                    }

                    results.push({
                        title: title,
                        link: href.startsWith('./') ? 'https://news.google.com' + href.substring(1) : href,
                        source: source || 'Unknown',
                        time: time || ''
                    });
                }
                return results;
            }""")

            print(f"✅ Found {len(articles_data)} articles")

            for idx, article in enumerate(articles_data[:10], 1):  # Limit to 10 articles
                try:
                    news_items.append({
                        "title": article['title'],
                        "link": article['link'],
                        "source": article['source'],
                        "time": article['time'],
                    })
                    print(f"  📰 [{idx}] {article['title'][:60]}... ({article['source']})")
                except Exception as e:
                    print(f"  ⚠️ Error parsing article: {e}")
                    continue

        except Exception as e:
            print(f"❌ Error fetching {brand}: {e}")

        finally:
            await browser.close()
            print(f"🔒 Browser closed")

    return news_items


async def main():
    """Test fetching news for Nike."""
    brand = "Nike"
    keyword = "Nike OR \"Nike Inc\""

    print("=" * 60)
    print(f"🧪 Testing Playwright Fetch for {brand}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    news = await fetch_google_news(brand, keyword)

    print("\n" + "=" * 60)
    print(f"📊 Summary: Fetched {len(news)} news items for {brand}")
    print("=" * 60)

    # Save to file for inspection
    if news:
        output_file = f"test_fetch_{brand.lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(news, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved to: {output_file}")


if __name__ == "__main__":
    # Check if Clash is running
    print("⚠️ Make sure Clash Verge is running and SOCKS5 proxy is enabled on port 7897")
    print("   Press Enter to continue...")
    input()

    asyncio.run(main())
