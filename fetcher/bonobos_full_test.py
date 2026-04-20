#!/usr/bin/env python3
"""
Full test for BONOBOS: Playwright fetch + AI processing with content.
"""

import asyncio
import os
import json
from datetime import datetime

# Set API key
os.environ["KIMI_API_KEY"] = "sk-kimi-FoFm43vXrSMoxx9rL64dHcnUiL2GOgqIXeJdVUKhS8zNnwqoMlJLMSdpCTIB0jwp"

from playwright_fetcher import PlaywrightNewsFetcher
from kimi_client import KimiClient, NewsItem


async def main():
    print("=" * 70)
    print("🚀 BONOBOS Full Content Test")
    print("   Playwright fetch → Content extraction → AI processing")
    print("=" * 70)

    # Initialize
    fetcher = PlaywrightNewsFetcher(
        proxy_server="127.0.0.1:7897",
        proxy_type="socks5"
    )
    kimi = KimiClient()

    try:
        print("\n⚠️  Make sure Clash Verge is running on port 7897")
        print("   This will open a visible Chrome browser")
        print("   Press Ctrl+C to cancel, or wait 5 seconds...")
        await asyncio.sleep(5)

        # Step 1: Fetch articles with content
        articles = await fetcher.fetch_brand_news(
            brand="BONOBOS",
            keyword="BONOBOS menswear clothing",
            max_articles=20,  # Test with 20 articles
            fetch_full_content=True
        )

        if not articles:
            print("❌ No articles fetched")
            return

        # Save raw articles
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_file = f"bonobos_raw_content_{timestamp}.json"
        fetcher.save_articles(articles, raw_file)

        # Step 2: AI processing with content
        print(f"\n🤖 Processing {len(articles)} articles with AI...")

        # Convert to NewsItem for Kimi client
        news_items = []
        for art in articles:
            item = NewsItem(
                title=art.title,
                link=art.link,
                source=art.source,
                time=art.time,
                brand=art.brand
            )
            # Add content as extra attribute
            item.content = art.content
            news_items.append(item)

        # Process in batches
        processed = []
        batch_size = 5

        for i in range(0, len(news_items), batch_size):
            batch = news_items[i:i + batch_size]
            print(f"\n   Processing batch {i//batch_size + 1}/{(len(news_items)-1)//batch_size + 1}...")

            batch_result = await kimi.process_news_batch(
                batch,
                brand="BONOBOS",
                brand_keywords="BONOBOS menswear clothing",
                use_content=True
            )
            processed.extend(batch_result)

        # Step 3: Save results
        result_data = {
            "brand": "BONOBOS",
            "timestamp": timestamp,
            "total_fetched": len(articles),
            "total_processed": len(processed),
            "articles": [
                {
                    "title": p.title,
                    "link": p.link,
                    "source": p.source,
                    "summary": p.summary,
                    "grade": p.grade,
                    "content_preview": p.content[:500] if hasattr(p, 'content') and p.content else ""
                }
                for p in processed
            ]
        }

        result_file = f"bonobos_processed_{timestamp}.json"
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)

        # Summary
        print(f"\n{'='*70}")
        print("📊 RESULTS SUMMARY")
        print(f"{'='*70}")
        print(f"Articles fetched: {len(articles)}")
        print(f"Articles after AI filter: {len(processed)}")

        grade_counts = {}
        for p in processed:
            grade_counts[p.grade] = grade_counts.get(p.grade, 0) + 1
        print(f"Grade distribution: {grade_counts}")

        print(f"\n📰 TOP RESULTS:")
        for i, p in enumerate(processed[:5], 1):
            print(f"\n{i}. [{p.grade}] {p.title}")
            print(f"   Summary: {p.summary}")
            print(f"   Source: {p.source}")

        print(f"\n💾 Files saved:")
        print(f"   Raw: {raw_file}")
        print(f"   Processed: {result_file}")

    finally:
        await fetcher.close()


if __name__ == "__main__":
    asyncio.run(main())
