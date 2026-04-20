#!/usr/bin/env python3
"""
Kimi Coding API client for news processing.
Uses Anthropic-style API format via https://api.kimi.com/coding/v1/messages
Supports: embedding (fallback to other methods), chat (for summary and grading).
"""

import os
import json
import requests
from typing import List, Dict, Optional, Literal
from dataclasses import dataclass
from datetime import datetime


@dataclass
class NewsItem:
    """News item structure for AI processing."""
    title: str
    link: str
    source: str
    time: str
    summary: str = ""
    grade: Literal["A", "B", "C", "D"] = "C"
    embedding: Optional[List[float]] = None
    brand: str = ""


class KimiClient:
    """Kimi Coding API client for news processing pipeline.

    Kimi Coding uses Anthropic-style API format via /coding/v1/messages endpoint.
    Note: Kimi Coding does not provide embeddings; we use fallback deduplication methods.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        api_url: Optional[str] = None,
        model: Optional[str] = None
    ):
        """Initialize Kimi Coding client with API key.

        Args:
            api_key: Kimi Coding API key (defaults to KIMI_API_KEY env var)
            api_url: API endpoint URL (defaults to Kimi Coding URL)
            model: Model name (defaults to kimi-k2.5)
        """
        self.api_key = api_key or os.environ.get("KIMI_API_KEY")
        if not self.api_key:
            raise ValueError("KIMI_API_KEY not provided or set in environment")

        # Kimi Coding uses Anthropic-style API endpoint
        self.api_url = api_url or os.environ.get("KIMI_API_URL") or "https://api.kimi.com/coding/v1/messages"
        self.model = model or os.environ.get("KIMI_MODEL") or "kimi-k2.5"

        print(f"🤖 Kimi Coding client initialized")
        print(f"   API URL: {self.api_url}")
        print(f"   Model: {self.model}")

    def _call_api(self, messages: List[Dict], max_tokens: int = 1000, temperature: float = 0.3) -> str:
        """Make API call to Kimi Coding endpoint."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        response = requests.post(self.api_url, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()

        # Parse Anthropic-style response
        if "content" in result and len(result["content"]) > 0:
            return result["content"][0]["text"]
        elif "choices" in result:
            return result["choices"][0]["message"]["content"]
        else:
            return str(result)

    def title_similarity(self, title1: str, title2: str) -> float:
        """Calculate title similarity using Jaccard coefficient."""
        from difflib import SequenceMatcher

        # Normalize titles
        t1 = title1.lower().strip()
        t2 = title2.lower().strip()

        # Use sequence matcher for overall similarity
        seq_sim = SequenceMatcher(None, t1, t2).ratio()

        # Use word overlap for semantic similarity
        words1 = set(t1.split())
        words2 = set(t2.split())

        if not words1 or not words2:
            return 0.0

        # Jaccard similarity
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        word_sim = intersection / union if union > 0 else 0.0

        # Combined score (weighted average)
        return 0.4 * seq_sim + 0.6 * word_sim

    async def find_duplicates(
        self,
        news_items: List[NewsItem],
        similarity_threshold: float = 0.75
    ) -> List[NewsItem]:
        """
        Find and remove duplicate news based on title similarity.
        (Kimi Coding doesn't provide embeddings, so we use text-based methods)

        Args:
            news_items: List of news items
            similarity_threshold: Similarity above which items are considered duplicates

        Returns:
            Filtered list of unique news items
        """
        if not news_items:
            return []

        # Greedy clustering based on title similarity
        unique_items = []
        duplicate_count = 0

        for item in news_items:
            is_duplicate = False

            for unique in unique_items:
                sim = self.title_similarity(item.title, unique.title)
                if sim >= similarity_threshold:
                    is_duplicate = True
                    duplicate_count += 1
                    # Keep the one with more complete info
                    if len(item.title) > len(unique.title):
                        unique_items[unique_items.index(unique)] = item
                    break

            if not is_duplicate:
                unique_items.append(item)

        print(f"📊 Deduplication: {len(news_items)} → {len(unique_items)} (removed {duplicate_count})")
        return unique_items

    async def process_news_batch(
        self,
        news_items: List[NewsItem],
        brand: str,
        brand_keywords: str,
        use_content: bool = False
    ) -> List[NewsItem]:
        """
        Process a batch of news: generate summaries and assign ABCD grades.

        Args:
            news_items: List of news items to process
            brand: Brand name (e.g., "Nike")
            brand_keywords: Search keywords used (e.g., "Nike OR 'Nike Inc'")
            use_content: Whether to use article content (if available)

        Returns:
            Processed news items with summary and grade
        """
        if not news_items:
            return []

        # Prepare batch input
        news_json = []
        for i, item in enumerate(news_items):
            article_data = {
                "index": i,
                "title": item.title,
                "source": item.source,
                "link": item.link,
                "time": item.time
            }
            # Include content if available and requested
            if use_content and hasattr(item, 'content') and item.content:
                article_data["content"] = item.content[:3000]  # Limit content length
            news_json.append(article_data)

        # Build prompt based on whether content is available
        if use_content and any(hasattr(item, 'content') and item.content for item in news_items):
            content_section = "Article content is provided for better analysis."
            data_format = "Each article includes: title, source, and content (truncated to 3000 chars)"
        else:
            content_section = "Analyzing based on title only."
            data_format = "Each article includes: title and source"

        prompt = f"""You are a fashion brand news analyst. Process the following {len(news_items)} news articles about {brand}.

Brand: {brand}
Keywords used: {brand_keywords}
{content_section}
{data_format}

News articles:
```json
{json.dumps(news_json, ensure_ascii=False, indent=2)}
```

For each article, provide:
1. **summary**: A 100-200 character Chinese summary based on {'content and ' if use_content else ''}title, capturing key information about {brand}
2. **grade**: Assign A/B/C/D based on relevance to {brand} as a clothing/apparel brand:
   - **A**: Highly relevant - {brand}'s apparel supply chain, manufacturing, sustainability, business strategy, executive interviews
   - **B**: Relevant - product launches, sales/promotions, retail partnerships, brand campaigns
   - **C**: Weakly relevant - general fashion industry news mentioning {brand}, celebrity wearing {brand}
   - **D**: Not relevant - {'if content shows it' if use_content else 'if it'}'s about animals, unrelated topics, or other companies with similar names (filter these out)

Important: If the article is about the bonobo ape (animal) and NOT the clothing brand BONOBOS, grade it D.

Return ONLY a JSON array in this exact format:
[
  {{"index": 0, "summary": "...", "grade": "A"}},
  {{"index": 1, "summary": "...", "grade": "B"}},
  ...
]

Be concise and accurate. Skip any articles graded D."""

        try:
            content = self._call_api(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional fashion industry news analyst. Provide concise, accurate summaries and strict grading based on apparel industry relevance. Output must be valid JSON."
                    },
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )

            # Extract JSON from response (may be wrapped in markdown code blocks)
            json_str = content
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].strip()

            result = json.loads(json_str)

            # Handle both direct array and wrapped object
            if isinstance(result, list):
                processed_results = result
            elif isinstance(result, dict) and "results" in result:
                processed_results = result["results"]
            else:
                # Try to find any array in the response
                for key, value in result.items():
                    if isinstance(value, list):
                        processed_results = value
                        break
                else:
                    processed_results = []

            # Update news items with results
            processed_items = []
            for r in processed_results:
                idx = r.get("index", 0)
                if idx < len(news_items):
                    item = news_items[idx]
                    item.summary = r.get("summary", "")
                    item.grade = r.get("grade", "C")
                    if item.grade != "D":  # Exclude D-graded items
                        processed_items.append(item)

            # Log grade distribution
            grade_counts = {}
            for item in processed_items:
                grade_counts[item.grade] = grade_counts.get(item.grade, 0) + 1
            print(f"📊 Grades: {grade_counts}")

            return processed_items

        except Exception as e:
            print(f"❌ Error processing batch: {e}")
            # Return original items with empty summaries as fallback
            return news_items

    async def estimate_cost(
        self,
        num_articles: int,
        avg_title_length: int = 50,
        avg_summary_length: int = 150
    ) -> Dict[str, float]:
        """
        Estimate daily cost for processing news.

        Kimi Coding pricing (as of 2024):
        - Input: ~0.01元/1K tokens
        - Output: ~0.03元/1K tokens

        Args:
            num_articles: Total number of articles
            avg_title_length: Average characters per title
            avg_summary_length: Average characters per generated summary

        Returns:
            Cost breakdown in RMB
        """
        # Token estimation: ~1.5 tokens per Chinese character, ~0.75 per English
        # Chat: ~512 tokens input (batch of 10 articles), ~150 tokens output

        batches = num_articles / 10
        input_tokens_per_batch = 512
        output_tokens_per_batch = 150

        total_input_tokens = batches * input_tokens_per_batch
        total_output_tokens = batches * output_tokens_per_batch

        # Pricing (approximate, in RMB)
        input_cost_per_1k = 0.01
        output_cost_per_1k = 0.03

        input_cost = (total_input_tokens / 1000) * input_cost_per_1k
        output_cost = (total_output_tokens / 1000) * output_cost_per_1k

        total_cost = input_cost + output_cost

        return {
            "input_cost": round(input_cost, 2),
            "output_cost": round(output_cost, 2),
            "total_cost": round(total_cost, 2),
            "cost_per_article": round(total_cost / num_articles, 4),
            "estimated_daily": round(total_cost, 2)
        }


# Test function
async def test_kimi_client():
    """Test Kimi client with sample data."""
    import getpass
    import asyncio

    # Get API key from user input or environment
    api_key = os.environ.get("KIMI_API_KEY")
    if not api_key:
        print("Please enter your Kimi API key:")
        print("(You can also set KIMI_API_KEY environment variable)")
        api_key = getpass.getpass("API Key: ")

    # Initialize client with explicit API key
    client = KimiClient(api_key=api_key)

    # Test cost estimation
    cost = await client.estimate_cost(10000)
    print(f"\n💰 Estimated cost for 10,000 articles:")
    print(f"   Input: ¥{cost['input_cost']}")
    print(f"   Output: ¥{cost['output_cost']}")
    print(f"   Total: ¥{cost['total_cost']}")
    print(f"   Per article: ¥{cost['cost_per_article']}")

    # Test with sample news
    sample_news = [
        NewsItem(
            title="Nike reports strong Q4 earnings driven by digital sales growth",
            link="https://example.com/1",
            source="Reuters",
            time="2024-01-15",
            brand="Nike"
        ),
        NewsItem(
            title="Nike unveils new sustainable manufacturing process in Vietnam",
            link="https://example.com/2",
            source="WWD",
            time="2024-01-15",
            brand="Nike"
        ),
        NewsItem(
            title="Nike reports strong Q4 results with digital growth",  # Similar to first
            link="https://example.com/3",
            source="Bloomberg",
            time="2024-01-15",
            brand="Nike"
        ),
        NewsItem(
            title="Celebrity spotted wearing Nike shoes at movie premiere",  # Weak relevance
            link="https://example.com/4",
            source="TMZ",
            time="2024-01-15",
            brand="Nike"
        ),
    ]

    print("\n🧪 Testing title-based deduplication...")

    # Check similarity
    sim = client.title_similarity(sample_news[0].title, sample_news[2].title)
    print(f"   Article 1 vs 3 similarity: {sim:.3f}")

    # Deduplicate
    unique_news = await client.find_duplicates(sample_news, similarity_threshold=0.75)
    print(f"   After dedup: {len(unique_news)} articles")

    # Test batch processing
    print("\n🧪 Testing batch processing...")
    processed = await client.process_news_batch(
        unique_news,
        brand="Nike",
        brand_keywords="Nike OR 'Nike Inc'"
    )

    print(f"\n📰 Processed {len(processed)} articles:")
    for item in processed:
        print(f"   [{item.grade}] {item.title[:50]}...")
        print(f"      摘要: {item.summary[:60]}...")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_kimi_client())
