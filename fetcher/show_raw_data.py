#!/usr/bin/env python3
"""
Show raw vs processed data for BONOBOS fetch.
"""

import asyncio
import os
import json

os.environ["KIMI_API_KEY"] = "sk-kimi-FoFm43vXrSMoxx9rL64dHcnUiL2GOgqIXeJdVUKhS8zNnwqoMlJLMSdpCTIB0jwp"

from fetch_rss import fetch_rss_news

async def main():
    print("=" * 70)
    print("📥 RAW DATA: First 50 articles from RSS (before any processing)")
    print("=" * 70)
    
    raw_news = await fetch_rss_news(
        brand="BONOBOS",
        keyword="BONOBOS",
        rss_url="https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
        proxy_type="socks5",
        proxy_server="127.0.0.1:7897",
        max_articles=50,
    )
    
    print(f"\n📊 Total raw articles fetched: {len(raw_news)}\n")
    
    # Save raw data
    with open("bonobos_raw_50.json", "w", encoding="utf-8") as f:
        json.dump(raw_news, f, ensure_ascii=False, indent=2)
    
    print("🔴 RAW DATA (all 50 articles):")
    print("-" * 70)
    
    for i, item in enumerate(raw_news, 1):
        print(f"\n{i}. {item['title']}")
        print(f"   Source: {item['source']}")
        print(f"   Time: {item['time']}")
        print(f"   Link: {item['link'][:60]}...")
        
        # Mark if it's clothing brand or ape
        title_lower = item['title'].lower()
        if any(word in title_lower for word in ['trousers', 'shirt', 'menswear', 'clothing', 'fashion', 'nordstrom', 'black friday', 'sale', 'co-founder', 'founder']):
            print(f"   ✅ CATEGORY: Clothing Brand")
        elif any(word in title_lower for word in ['ape', 'chimp', 'primate', 'zoo', 'wildlife', 'species', 'evolution', 'research', 'study', 'scientist']):
            print(f"   ❌ CATEGORY: Animal/Ape")
        else:
            print(f"   ⚠️  CATEGORY: Unclear")
    
    print("\n" + "=" * 70)
    print(f"💾 Raw data saved to: bonobos_raw_50.json")
    print("=" * 70)
    
    # Count categories
    clothing = 0
    ape = 0
    unclear = 0
    
    for item in raw_news:
        title_lower = item['title'].lower()
        if any(word in title_lower for word in ['trousers', 'shirt', 'menswear', 'clothing', 'fashion', 'nordstrom', 'black friday', 'sale', 'co-founder', 'founder']):
            clothing += 1
        elif any(word in title_lower for word in ['ape', 'chimp', 'primate', 'zoo', 'wildlife', 'species', 'evolution', 'research', 'study', 'scientist']):
            ape += 1
        else:
            unclear += 1
    
    print(f"\n📈 CATEGORY BREAKDOWN:")
    print(f"   Clothing Brand: {clothing}")
    print(f"   Animal/Ape:     {ape}")
    print(f"   Unclear:        {unclear}")

if __name__ == "__main__":
    asyncio.run(main())
