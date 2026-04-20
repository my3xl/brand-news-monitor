#!/usr/bin/env python3
"""
News processing pipeline: fetch → dedup (URL → title → embedding) → AI process → store.
"""

import asyncio
import hashlib
import json
from typing import List, Dict, Set, Tuple
from datetime import datetime
from dataclasses import asdict

from kimi_client import KimiClient, NewsItem
from fetch_rss import fetch_rss_news


class NewsPipeline:
    """Complete news processing pipeline for brand monitoring."""

    def __init__(self, kimi_client: KimiClient = None):
        """Initialize pipeline with optional Kimi client."""
        self.kimi = kimi_client or KimiClient()

        # Tracking for deduplication
        self.seen_urls: Set[str] = set()
        self.seen_titles: Set[str] = set()

    def url_dedup(self, items: List[NewsItem]) -> List[NewsItem]:
        """
        Stage 1: Remove exact URL duplicates.
        Fast, no AI needed.
        """
        unique = []
        for item in items:
            url_hash = hashlib.md5(item.link.encode()).hexdigest()
            if url_hash not in self.seen_urls:
                self.seen_urls.add(url_hash)
                unique.append(item)

        print(f"🔗 URL dedup: {len(items)} → {len(unique)}")
        return unique

    def title_dedup(self, items: List[NewsItem], similarity_threshold: float = 0.9) -> List[NewsItem]:
        """
        Stage 2: Remove similar titles using simple string similarity.
        Uses normalized Levenshtein distance - fast for eliminating obvious duplicates.
        """
        from difflib import SequenceMatcher

        def normalize(title: str) -> str:
            return title.lower().strip().replace(" ", "")

        unique = []
        for item in items:
            norm_title = normalize(item.title)
            is_dup = False

            for seen_title in self.seen_titles:
                sim = SequenceMatcher(None, norm_title, seen_title).ratio()
                if sim >= similarity_threshold:
                    is_dup = True
                    break

            if not is_dup:
                self.seen_titles.add(norm_title)
                unique.append(item)

        print(f"📝 Title dedup: {len(items)} → {len(unique)}")
        return unique

    async def embedding_dedup(
        self,
        items: List[NewsItem],
        threshold: float = 0.85
    ) -> List[NewsItem]:
        """
        Stage 3: Semantic deduplication using embeddings.
        Most accurate but requires API calls.
        """
        return await self.kimi.find_duplicates(items, threshold)

    async def process_brand_news(
        self,
        brand: str,
        keywords: str,
        rss_url: str,
        proxy_type: str = "socks5",
        proxy_server: str = "127.0.0.1:7897",
        max_articles: int = 50,
    ) -> List[NewsItem]:
        """
        Process news for a single brand through the complete pipeline.

        Args:
            brand: Brand name
            keywords: Search keywords
            rss_url: RSS feed URL template
            proxy_type: Proxy type (socks5/http/none)
            proxy_server: Proxy server (host:port)
            max_articles: Max articles to fetch per brand

        Returns:
            Processed news items with summary and grade
        """
        print(f"\n{'='*60}")
        print(f"🚀 Processing: {brand}")
        print(f"{'='*60}")

        # Step 1: Fetch
        print("\n📥 Step 1: Fetching news...")
        raw_news = await fetch_rss_news(
            brand=brand,
            keyword=keywords,
            rss_url=rss_url,
            proxy_type=proxy_type,
            proxy_server=proxy_server,
            max_articles=max_articles
        )

        if not raw_news:
            print(f"⚠️ No news fetched for {brand}")
            return []

        # Convert to NewsItem
        items = [
            NewsItem(
                title=n["title"],
                link=n["link"],
                source=n["source"],
                time=n["time"],
                brand=brand
            )
            for n in raw_news
        ]

        # Step 2: URL deduplication
        print("\n🔍 Step 2: URL deduplication...")
        items = self.url_dedup(items)

        # Step 3: Title deduplication
        print("\n🔍 Step 3: Title deduplication...")
        items = self.title_dedup(items)

        # Step 4: Embedding deduplication (semantic)
        print("\n🔍 Step 4: Semantic deduplication...")
        items = await self.embedding_dedup(items, threshold=0.85)

        # Step 5: AI processing (summary + grading)
        print("\n🤖 Step 5: AI processing (summary + grading)...")
        # Process in batches of 10
        processed = []
        batch_size = 10

        for i in range(0, len(items), batch_size):
            batch = items[i:i + batch_size]
            print(f"   Processing batch {i//batch_size + 1}/{(len(items)-1)//batch_size + 1}...")
            batch_result = await self.kimi.process_news_batch(
                batch, brand, keywords
            )
            processed.extend(batch_result)

        print(f"\n✅ Completed {brand}: {len(processed)} articles")

        # Grade distribution
        grade_counts = {}
        for item in processed:
            grade_counts[item.grade] = grade_counts.get(item.grade, 0) + 1
        print(f"   Grades: {grade_counts}")

        return processed

    async def process_all_brands(
        self,
        brands_config: List[Dict],
        rss_url_template: str = "https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
        proxy_type: str = "socks5",
        proxy_server: str = "127.0.0.1:7897",
        max_articles: int = 50,
        delay_between_brands: float = 3.0
    ) -> Dict[str, List[NewsItem]]:
        """
        Process news for multiple brands sequentially (with delay).

        Args:
            brands_config: List of {name, keywords} dicts
            rss_url_template: RSS URL with {keyword} placeholder
            proxy_type: Proxy type
            proxy_server: Proxy server
            max_articles: Max per brand
            delay_between_brands: Delay in seconds between brands

        Returns:
            Dict mapping brand name to processed news list
        """
        results = {}
        total_start = datetime.now()

        print(f"\n🎯 Processing {len(brands_config)} brands")
        print(f"   Max articles per brand: {max_articles}")
        print(f"   Delay between brands: {delay_between_brands}s")

        for idx, brand_config in enumerate(brands_config, 1):
            brand = brand_config["name"]
            keywords = brand_config["keywords"]

            try:
                news = await self.process_brand_news(
                    brand=brand,
                    keywords=keywords,
                    rss_url=rss_url_template,
                    proxy_type=proxy_type,
                    proxy_server=proxy_server,
                    max_articles=max_articles
                )
                results[brand] = news

                # Delay between brands (except last one)
                if idx < len(brands_config):
                    print(f"\n⏳ Waiting {delay_between_brands}s before next brand...")
                    await asyncio.sleep(delay_between_brands)

            except Exception as e:
                print(f"❌ Error processing {brand}: {e}")
                results[brand] = []

        total_time = (datetime.now() - total_start).total_seconds()
        total_articles = sum(len(v) for v in results.values())

        print(f"\n{'='*60}")
        print(f"📊 Pipeline Complete")
        print(f"   Brands: {len(brands_config)}")
        print(f"   Total articles: {total_articles}")
        print(f"   Time: {total_time:.1f}s ({total_time/60:.1f} min)")
        print(f"{'='*60}")

        return results

    def save_results(
        self,
        results: Dict[str, List[NewsItem]],
        output_file: str = None
    ) -> str:
        """
        Save processed results to JSON file.

        Args:
            results: Brand -> news items mapping
            output_file: Output file path (auto-generated if None)

        Returns:
            Path to saved file
        """
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"news_results_{timestamp}.json"

        # Convert to serializable format
        serializable = {}
        for brand, items in results.items():
            serializable[brand] = [
                {
                    "title": item.title,
                    "link": item.link,
                    "source": item.source,
                    "time": item.time,
                    "summary": item.summary,
                    "grade": item.grade,
                    "brand": item.brand
                }
                for item in items
            ]

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(serializable, f, ensure_ascii=False, indent=2)

        print(f"💾 Saved to: {output_file}")
        return output_file


# Test function
async def test_pipeline():
    """Test the complete pipeline."""
    # Sample brand configs (in production, read from Redis)
    brands = [
        {"name": "Nike", "keywords": "Nike OR 'Nike Inc'"},
        {"name": "Zara", "keywords": "Zara OR Inditex"},
    ]

    pipeline = NewsPipeline()

    # Estimate cost
    cost = await pipeline.kimi.estimate_cost(len(brands) * 50)
    print(f"💰 Estimated cost for {len(brands)} brands (~{len(brands)*50} articles):")
    print(f"   ¥{cost['total_cost']}")
    print(f"   Per article: ¥{cost['cost_per_article']}")

    # Run pipeline
    results = await pipeline.process_all_brands(
        brands_config=brands,
        max_articles=10,  # Test with 10 per brand
        delay_between_brands=2.0
    )

    # Save results
    pipeline.save_results(results)


if __name__ == "__main__":
    print("⚠️ Make sure Clash Verge is running on port 7897")
    print("⚠️ Make sure KIMI_API_KEY is set in environment")
    print("   Press Enter to continue...")
    input()

    asyncio.run(test_pipeline())
