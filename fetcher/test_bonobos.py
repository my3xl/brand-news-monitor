#!/usr/bin/env python3
"""
Test script for BONOBOS news fetch + AI processing.
"""

import asyncio
import os
import json
from datetime import datetime

# Set API key
os.environ["KIMI_API_KEY"] = "sk-kimi-FoFm43vXrSMoxx9rL64dHcnUiL2GOgqIXeJdVUKhS8zNnwqoMlJLMSdpCTIB0jwp"

from kimi_client import KimiClient, NewsItem
from news_pipeline import NewsPipeline

async def main():
    print("=" * 70)
    print("🚀 BONOBOS News Fetch + AI Processing Test")
    print("=" * 70)
    
    # Initialize pipeline
    pipeline = NewsPipeline()
    
    # Test cost estimation
    cost = await pipeline.kimi.estimate_cost(50)
    print(f"\n💰 Estimated cost for 50 articles:")
    print(f"   Total: ¥{cost['total_cost']}")
    
    print("\n⏳ Starting fetch from Google News US...")
    
    # Fetch BONOBOS news
    brand_config = {"name": "BONOBOS", "keywords": "BONOBOS"}
    
    results = await pipeline.process_all_brands(
        brands_config=[brand_config],
        rss_url_template="https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
        proxy_type="socks5",
        proxy_server="127.0.0.1:7897",
        max_articles=50,
        delay_between_brands=2.0
    )
    
    # Save results
    output_file = pipeline.save_results(results)
    
    # Print summary
    bonobos_news = results.get("BONOBOS", [])
    print(f"\n📊 Results Summary:")
    print(f"   Total articles: {len(bonobos_news)}")
    
    # Grade distribution
    grade_counts = {}
    for item in bonobos_news:
        grade_counts[item.grade] = grade_counts.get(item.grade, 0) + 1
    print(f"   Grades: {grade_counts}")
    
    # Show first 5 articles
    print(f"\n📰 Top 5 Articles:")
    for i, item in enumerate(bonobos_news[:5], 1):
        print(f"\n   {i}. [{item.grade}] {item.title}")
        print(f"      摘要: {item.summary[:80]}...")
        print(f"      来源: {item.source} | {item.time}")
    
    print(f"\n💾 Full results saved to: {output_file}")
    
    return results

if __name__ == "__main__":
    print("⚠️  Make sure Clash Verge is running on port 7897")
    print("     Press Ctrl+C to cancel, or wait 3 seconds to continue...")
    import time
    time.sleep(3)
    
    results = asyncio.run(main())
