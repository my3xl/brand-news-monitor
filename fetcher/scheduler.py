#!/usr/bin/env python3
"""
Scheduler for brand news monitoring.
Schedules: 02:00 scraping, 08:00 email sending.
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, List
from dataclasses import asdict

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from kimi_client import KimiClient, NewsItem
from news_pipeline import NewsPipeline
from email_sender import EmailSender, EmailConfig


class NewsScheduler:
    """Scheduler for overnight news processing pipeline."""

    def __init__(
        self,
        redis_client=None,
        kimi_client: KimiClient = None,
        email_sender: EmailSender = None
    ):
        """Initialize scheduler with required components."""
        self.redis = redis_client
        self.kimi = kimi_client or KimiClient()
        self.email = email_sender or EmailSender()
        self.pipeline = NewsPipeline(self.kimi)

        self.scheduler = AsyncIOScheduler()

        # State storage
        self.last_scrape_results: Dict[str, List[NewsItem]] = {}
        self.scrape_timestamp: str = ""

    def _load_brands_from_redis(self) -> List[Dict]:
        """Load brand configuration from Redis."""
        # TODO: Implement Redis loading
        # For now, use sample data
        return [
            {"name": "Nike", "keywords": "Nike OR 'Nike Inc'", "emails": ["am_a@company.com"]},
            {"name": "Zara", "keywords": "Zara OR Inditex", "emails": ["am_b@company.com"]},
            {"name": "H&M", "keywords": "H&M OR Hennes Mauritz", "emails": ["am_c@company.com"]},
        ]

    def _load_source_config(self) -> Dict:
        """Load source configuration."""
        return {
            "type": "rss",
            "url_template": "https://news.google.com/rss/search?q={keyword}&hl=en-US&gl=US&ceid=US:en",
            "proxy_type": "socks5",
            "proxy_server": "127.0.0.1:7897",
            "max_articles": 50,
        }

    async def scrape_job(self):
        """
        Scheduled job: Scrape news for all brands.
        Runs at 02:00 daily.
        """
        print(f"\n{'='*60}")
        print(f"🌙 Scrape Job Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")

        # Load configuration
        brands = self._load_brands_from_redis()
        source_config = self._load_source_config()

        print(f"📋 Loaded {len(brands)} brands")
        print(f"🔧 Source: {source_config['type']} via {source_config['proxy_type']} proxy")

        # Run pipeline
        try:
            results = await self.pipeline.process_all_brands(
                brands_config=[{"name": b["name"], "keywords": b["keywords"]} for b in brands],
                rss_url_template=source_config["url_template"],
                proxy_type=source_config["proxy_type"],
                proxy_server=source_config["proxy_server"],
                max_articles=source_config["max_articles"],
                delay_between_brands=3.0
            )

            # Store results
            self.last_scrape_results = results
            self.scrape_timestamp = datetime.now().isoformat()

            # Save to file (also save to Redis in production)
            output_file = self.pipeline.save_results(results)

            # Save metadata
            metadata = {
                "timestamp": self.scrape_timestamp,
                "brands_count": len(brands),
                "articles_count": sum(len(v) for v in results.values()),
                "output_file": output_file
            }
            with open("last_scrape_metadata.json", "w") as f:
                json.dump(metadata, f, indent=2)

            print(f"\n✅ Scrape job completed")
            print(f"💾 Results saved to: {output_file}")

        except Exception as e:
            print(f"❌ Scrape job failed: {e}")
            # TODO: Send alert notification
            raise

    async def email_job(self):
        """
        Scheduled job: Send email reports.
        Runs at 08:00 daily.
        """
        print(f"\n{'='*60}")
        print(f"☀️ Email Job Started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")

        # Load brands with email mapping
        brands = self._load_brands_from_redis()
        brand_emails = {b["name"]: b["emails"] for b in brands}

        # Check if we have fresh results
        if not self.last_scrape_results:
            # Try to load from file
            try:
                with open("last_scrape_metadata.json", "r") as f:
                    metadata = json.load(f)

                # Load results file
                results_file = metadata.get("output_file")
                if results_file and os.path.exists(results_file):
                    with open(results_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        # Convert back to NewsItem format
                        self.last_scrape_results = {
                            brand: [
                                NewsItem(
                                    title=item["title"],
                                    link=item["link"],
                                    source=item["source"],
                                    time=item["time"],
                                    summary=item.get("summary", ""),
                                    grade=item.get("grade", "C"),
                                    brand=item.get("brand", brand)
                                )
                                for item in items
                            ]
                            for brand, items in data.items()
                        }
                    print(f"📂 Loaded previous results: {results_file}")
                else:
                    print("⚠️ No scrape results available, skipping email")
                    return

            except Exception as e:
                print(f"❌ Failed to load previous results: {e}")
                return

        # Convert NewsItem to dict for email sender
        news_dict = {
            brand: [
                {
                    "title": item.title,
                    "link": item.link,
                    "source": item.source,
                    "time": item.time,
                    "summary": item.summary,
                    "grade": item.grade
                }
                for item in items
            ]
            for brand, items in self.last_scrape_results.items()
        }

        # Send emails
        results = self.email.send_batch_reports(
            brand_emails_mapping=brand_emails,
            all_news=news_dict,
            min_grade="C"  # Include A, B, C grades
        )

        # Summary
        success_count = sum(1 for v in results.values() if v)
        print(f"\n📊 Email Summary:")
        print(f"   Sent: {success_count}/{len(results)}")

        for brand, success in results.items():
            status = "✅" if success else "❌"
            print(f"   {status} {brand}")

    def setup_schedule(self):
        """Configure scheduled jobs."""
        timezone = os.environ.get("TZ", "Asia/Shanghai")

        # Scrape job: 02:00 daily
        self.scheduler.add_job(
            self.scrape_job,
            trigger=CronTrigger(hour=2, minute=0, timezone=timezone),
            id="scrape_job",
            name="Daily News Scraping",
            replace_existing=True
        )

        # Email job: 08:00 daily
        self.scheduler.add_job(
            self.email_job,
            trigger=CronTrigger(hour=8, minute=0, timezone=timezone),
            id="email_job",
            name="Daily Email Reports",
            replace_existing=True
        )

        print(f"📅 Schedule configured (timezone: {timezone}):")
        print(f"   02:00 - Scrape news")
        print(f"   08:00 - Send emails")

    def start(self):
        """Start the scheduler."""
        self.setup_schedule()
        self.scheduler.start()
        print(f"\n🚀 Scheduler started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("   Press Ctrl+C to exit\n")

        # Keep running
        try:
            asyncio.get_event_loop().run_forever()
        except (KeyboardInterrupt, SystemExit):
            self.stop()

    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        print("\n👋 Scheduler stopped")

    async def run_once(self, job_type: str = "both"):
        """
        Run jobs once immediately (for testing).

        Args:
            job_type: "scrape", "email", or "both"
        """
        if job_type in ("scrape", "both"):
            await self.scrape_job()

        if job_type in ("email", "both"):
            await self.email_job()


def main():
    """Main entry point."""
    import sys

    scheduler = NewsScheduler()

    # Check for command line arguments
    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "scrape":
            # Run scrape once
            print("🧪 Running scrape job once...")
            asyncio.run(scheduler.run_once("scrape"))

        elif command == "email":
            # Run email once
            print("🧪 Running email job once...")
            asyncio.run(scheduler.run_once("email"))

        elif command == "test":
            # Run both once
            print("🧪 Running full pipeline once...")
            asyncio.run(scheduler.run_once("both"))

        else:
            print(f"Unknown command: {command}")
            print("Usage: python scheduler.py [scrape|email|test]")
    else:
        # Start scheduler
        scheduler.start()


if __name__ == "__main__":
    main()
