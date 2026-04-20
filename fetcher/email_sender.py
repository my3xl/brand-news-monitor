#!/usr/bin/env python3
"""
Email sender module for brand news monitoring.
Sends HTML email reports to brand managers.
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class EmailConfig:
    """Email configuration."""
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    use_tls: bool = True
    from_name: str = "Brand News Monitor"
    from_email: str = ""


class EmailSender:
    """Email sender for news reports."""

    def __init__(self, config: EmailConfig = None):
        """Initialize email sender with config."""
        if config is None:
            config = self._load_config_from_env()
        self.config = config

        if not self.config.from_email:
            self.config.from_email = self.config.smtp_user

    def _load_config_from_env(self) -> EmailConfig:
        """Load email config from environment variables."""
        required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD"]
        missing = [v for v in required if not os.environ.get(v)]
        if missing:
            raise ValueError(f"Missing environment variables: {missing}")

        return EmailConfig(
            smtp_host=os.environ["SMTP_HOST"],
            smtp_port=int(os.environ.get("SMTP_PORT", "587")),
            smtp_user=os.environ["SMTP_USER"],
            smtp_password=os.environ["SMTP_PASSWORD"],
            use_tls=os.environ.get("SMTP_USE_TLS", "true").lower() == "true",
            from_name=os.environ.get("SMTP_FROM_NAME", "Brand News Monitor"),
            from_email=os.environ.get("SMTP_FROM_EMAIL", os.environ["SMTP_USER"])
        )

    def _generate_html_report(
        self,
        brand: str,
        news_items: List[Dict],
        report_date: str = None
    ) -> str:
        """Generate HTML email report for a brand."""
        if report_date is None:
            report_date = datetime.now().strftime("%Y年%m月%d日")

        # Grade color mapping
        grade_colors = {
            "A": "#dc2626",  # Red - high priority
            "B": "#ea580c",  # Orange
            "C": "#16a34a",  # Green
        }

        # Build news items HTML
        items_html = ""
        for item in news_items:
            grade = item.get("grade", "C")
            color = grade_colors.get(grade, "#6b7280")
            summary = item.get("summary", "")

            items_html += f"""
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 16px; vertical-align: top; width: 40px;">
                    <span style="background: {color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                        {grade}
                    </span>
                </td>
                <td style="padding: 16px; vertical-align: top;">
                    <a href="{item['link']}" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 16px;">
                        {item['title']}
                    </a>
                    <p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                        {summary}
                    </p>
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
                        {item.get('source', 'Unknown')} · {item.get('time', '')}
                    </p>
                </td>
            </tr>
            """

        # Grade legend
        grade_legend = ""
        if any(item.get("grade") == "A" for item in news_items):
            grade_legend += '<span style="color: #dc2626;">■</span> A: 高度相关 '
        if any(item.get("grade") == "B" for item in news_items):
            grade_legend += '<span style="color: #ea580c;">■</span> B: 相关 '
        if any(item.get("grade") == "C" for item in news_items):
            grade_legend += '<span style="color: #16a34a;">■</span> C: 弱相关'

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{brand} 品牌新闻日报</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                                {brand} 品牌新闻日报
                            </h1>
                            <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                {report_date} · {len(news_items)} 条新闻
                            </p>
                        </td>
                    </tr>

                    <!-- Grade Legend -->
                    <tr>
                        <td style="padding: 16px 24px; background: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #6b7280;">
                                {grade_legend}
                            </p>
                        </td>
                    </tr>

                    <!-- News Items -->
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                {items_html}
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                本邮件由品牌新闻监控系统自动发送<br>
                                如有问题请联系技术团队
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""
        return html

    def send_news_report(
        self,
        to_emails: List[str],
        brand: str,
        news_items: List[Dict],
        report_date: str = None
    ) -> bool:
        """
        Send news report email.

        Args:
            to_emails: List of recipient email addresses
            brand: Brand name
            news_items: List of processed news items
            report_date: Report date string

        Returns:
            True if sent successfully
        """
        if not news_items:
            print(f"⚠️ No news to send for {brand}")
            return False

        # Generate HTML content
        html_content = self._generate_html_report(brand, news_items, report_date)

        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[{brand}] 品牌新闻日报 - {datetime.now().strftime('%m月%d日')}"
        msg["From"] = f"{self.config.from_name} <{self.config.from_email}>"
        msg["To"] = ", ".join(to_emails)

        # Attach HTML part
        html_part = MIMEText(html_content, "html", "utf-8")
        msg.attach(html_part)

        # Send email
        try:
            with smtplib.SMTP(self.config.smtp_host, self.config.smtp_port) as server:
                if self.config.use_tls:
                    server.starttls()
                server.login(self.config.smtp_user, self.config.smtp_password)
                server.sendmail(
                    self.config.from_email,
                    to_emails,
                    msg.as_string()
                )

            print(f"✅ Email sent to {', '.join(to_emails)} ({len(news_items)} items)")
            return True

        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False

    def send_batch_reports(
        self,
        brand_emails_mapping: Dict[str, List[str]],
        all_news: Dict[str, List[Dict]],
        min_grade: str = "C"
    ) -> Dict[str, bool]:
        """
        Send reports to multiple brands.

        Args:
            brand_emails_mapping: Brand name -> list of email addresses
            all_news: Brand name -> list of news items
            min_grade: Minimum grade to include (A/B/C)

        Returns:
            Dict of brand -> success status
        """
        # Grade priority
        grade_priority = {"A": 3, "B": 2, "C": 1, "D": 0}
        min_priority = grade_priority.get(min_grade, 1)

        results = {}

        for brand, emails in brand_emails_mapping.items():
            news = all_news.get(brand, [])

            # Filter by grade
            filtered = [
                item for item in news
                if grade_priority.get(item.get("grade", "C"), 0) >= min_priority
            ]

            # Sort by grade (A first)
            filtered.sort(
                key=lambda x: grade_priority.get(x.get("grade", "C"), 0),
                reverse=True
            )

            print(f"\n📧 Sending report for {brand}...")
            success = self.send_news_report(emails, brand, filtered)
            results[brand] = success

        return results


# Test function
def test_email_sender():
    """Test email sender with sample data."""
    sender = EmailSender()

    # Sample news data
    sample_news = [
        {
            "title": "Nike 推出全新可持续制造流程",
            "link": "https://example.com/1",
            "source": "WWD",
            "time": "2024-01-15",
            "summary": "Nike 在越南工厂推出新的环保制造工艺，预计将减少30%的碳排放。这是该品牌可持续发展战略的重要一步。",
            "grade": "A"
        },
        {
            "title": "Nike Q4 财报超预期",
            "link": "https://example.com/2",
            "source": "Reuters",
            "time": "2024-01-14",
            "summary": "Nike 第四季度营收增长12%，主要受数字渠道和亚太市场驱动。",
            "grade": "B"
        },
        {
            "title": "某明星在红毯上穿着 Nike 新款",
            "link": "https://example.com/3",
            "source": "TMZ",
            "time": "2024-01-13",
            "summary": "好莱坞明星在电影节上展示 Nike 最新联名款运动鞋。",
            "grade": "C"
        },
    ]

    # Send test email
    sender.send_news_report(
        to_emails=["test@example.com"],  # Replace with actual email
        brand="Nike",
        news_items=sample_news
    )


if __name__ == "__main__":
    print("⚠️ Set these environment variables:")
    print("   SMTP_HOST=smtp.example.com")
    print("   SMTP_PORT=587")
    print("   SMTP_USER=your@email.com")
    print("   SMTP_PASSWORD=your_password")
    print("   SMTP_FROM_NAME=Brand News Monitor")
    print("\n   Press Enter to run test...")
    input()

    test_email_sender()
