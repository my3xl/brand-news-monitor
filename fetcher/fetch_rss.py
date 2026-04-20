#!/usr/bin/env python3
"""
RSS-based news fetcher with SOCKS5/HTTP proxy support.
Fetches news for a single brand via RSS feeds.
"""

import asyncio
import json
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Optional
import requests


async def fetch_rss_news(
    brand: str,
    keyword: str,
    rss_url: str,
    proxy_type: Optional[str] = None,
    proxy_server: Optional[str] = None,
    max_articles: int = 10,
) -> List[Dict]:
    """
    Fetch news via RSS feed through optional proxy.

    Args:
        brand: Brand name (e.g., "Nike")
        keyword: Search keyword (used in URL template)
        rss_url: RSS feed URL with {keyword} placeholder
        proxy_type: "socks5", "http", or None
        proxy_server: Proxy server address (e.g., "127.0.0.1:7897")
        max_articles: Maximum number of articles to fetch

    Returns:
        List of news items with title, link, source, time
    """
    # Replace keyword placeholder in URL
    url = rss_url.replace("{keyword}", keyword.replace(' ', '+'))

    print(f"🚀 Starting RSS fetch for {brand}...")
    print(f"🔗 URL: {url}")

    # Configure proxy if provided
    proxies = None
    if proxy_type and proxy_server and proxy_type != "none":
        if proxy_type == "socks5":
            # Use socks5h:// for remote DNS resolution through proxy
            proxy_url = f"socks5h://{proxy_server}"
        elif proxy_type == "http":
            proxy_url = f"http://{proxy_server}"
        else:
            proxy_url = None

        if proxy_url:
            proxies = {
                "http": proxy_url,
                "https": proxy_url,
            }
            print(f"🌐 Proxy: {proxy_url}")

    news_items = []

    try:
        print("⏳ Fetching RSS feed...")

        # Run requests in thread pool (since it's blocking)
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: requests.get(
                url,
                proxies=proxies,
                timeout=30,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/rss+xml, application/xml, text/xml, */*",
                },
            ),
        )

        response.raise_for_status()
        print(f"✅ Status: {response.status_code}, Content: {len(response.text)} bytes")

        # Parse XML
        root = ET.fromstring(response.content)

        # Handle RSS 2.0 format
        items = root.findall(".//item")
        if not items:
            # Handle Atom format
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            items = root.findall(".//atom:entry", ns)
            is_atom = True
        else:
            is_atom = False

        print(f"✅ Found {len(items)} articles in RSS feed")

        for idx, item in enumerate(items[:max_articles], 1):
            try:
                if is_atom:
                    # Atom format
                    title = item.find("atom:title", ns)
                    link = item.find("atom:link", ns)
                    published = item.find("atom:published", ns)
                    source = item.find("atom:source/atom:title", ns)

                    title_text = title.text if title is not None else ""
                    link_href = link.get("href") if link is not None else ""
                    time_text = published.text if published is not None else ""
                    source_text = source.text if source is not None else "Unknown"
                else:
                    # RSS 2.0 format
                    title = item.find("title")
                    link = item.find("link")
                    pub_date = item.find("pubDate")
                    source_elem = item.find("source")

                    title_text = title.text if title is not None else ""
                    link_text = link.text if link is not None else ""
                    time_text = pub_date.text if pub_date is not None else ""

                    # Try to extract source from source element or URL
                    if source_elem is not None:
                        source_text = source_elem.text
                    else:
                        # Extract domain from link as fallback
                        from urllib.parse import urlparse
                        try:
                            domain = urlparse(link_text).netloc
                            source_text = domain.replace("www.", "") if domain else "Unknown"
                        except:
                            source_text = "Unknown"

                    link_href = link_text

                if title_text and link_href:
                    news_items.append({
                        "title": title_text.strip(),
                        "link": link_href,
                        "source": source_text if source_text else "Unknown",
                        "time": time_text,
                    })
                    print(f"  📰 [{idx}] {title_text[:60]}... ({source_text})")

            except Exception as e:
                print(f"  ⚠️ Error parsing RSS item: {e}")
                continue

    except requests.exceptions.ProxyError as e:
        print(f"❌ Proxy error: {e}")
        print("   Make sure Clash Verge is running on port 7897")
    except requests.exceptions.Timeout:
        print("❌ Timeout - proxy may not be working")
    except Exception as e:
        print(f"❌ Error fetching RSS: {e}")

    return news_items


async def main():
    """Test fetching news for Nike via RSS."""
    brand = "Nike"
    keyword = "Nike"

    # Google News RSS URL
    rss_url = "https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en"

    print("=" * 60)
    print(f"🧪 Testing RSS Fetch for {brand}")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    news = await fetch_rss_news(
        brand=brand,
        keyword=keyword,
        rss_url=rss_url,
        proxy_type="socks5",
        proxy_server="127.0.0.1:7897",
        max_articles=10,
    )

    print("\n" + "=" * 60)
    print(f"📊 Summary: Fetched {len(news)} news items for {brand}")
    print("=" * 60)

    # Save to file for inspection
    if news:
        output_file = f"test_rss_{brand.lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(news, f, ensure_ascii=False, indent=2)
        print(f"💾 Saved to: {output_file}")


if __name__ == "__main__":
    print("⚠️ Make sure Clash Verge is running and SOCKS5 proxy is enabled on port 7897")
    print("   Press Enter to continue...")
    input()

    asyncio.run(main())
