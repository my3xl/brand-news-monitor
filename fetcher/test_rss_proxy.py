#!/usr/bin/env python3
"""
Test RSS fetching with SOCKS5 proxy
"""

import requests
from datetime import datetime

# Configuration
CLASH_SOCKS5_PROXY = "socks5://127.0.0.1:7897"
RSS_URL = "https://news.google.com/rss/search?q=Nike&hl=en-US&gl=US&ceid=US:en"

def fetch_rss_with_proxy():
    """Fetch RSS through SOCKS5 proxy"""
    print("=" * 60)
    print("🧪 Testing RSS with SOCKS5 Proxy")
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Configure SOCKS5 proxy with remote DNS resolution
    # Use socks5h:// to force DNS resolution through the proxy
    proxies = {
        "http": "socks5h://127.0.0.1:7897",
        "https": "socks5h://127.0.0.1:7897",
    }

    print(f"\n🔗 URL: {RSS_URL}")
    print(f"🌐 Proxy: socks5h://127.0.0.1:7897 (DNS through proxy)")

    try:
        print("\n⏳ Fetching RSS...")
        response = requests.get(
            RSS_URL,
            proxies=proxies,
            timeout=30,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )

        print(f"✅ Status: {response.status_code}")
        print(f"📄 Content-Type: {response.headers.get('Content-Type', 'unknown')}")
        print(f"📊 Content length: {len(response.text)} bytes")

        # Check if it's valid RSS
        if "<rss" in response.text or "<feed" in response.text:
            print("✅ Valid RSS/Atom feed detected")

            # Extract some item titles
            import xml.etree.ElementTree as ET
            try:
                root = ET.fromstring(response.content)
                # Handle RSS 2.0
                items = root.findall(".//item")
                if not items:
                    # Handle Atom
                    items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

                print(f"\n📰 Found {len(items)} articles:")
                for i, item in enumerate(items[:5], 1):
                    title = item.find("title")
                    if title is not None:
                        print(f"  {i}. {title.text[:60]}...")
            except Exception as e:
                print(f"⚠️ XML parse error: {e}")

            # Save for inspection
            output_file = f"test_rss_nike_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xml"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(response.text)
            print(f"\n💾 Saved to: {output_file}")

            return True
        else:
            print("❌ Not a valid RSS feed")
            print(f"Preview: {response.text[:500]}")
            return False

    except requests.exceptions.ProxyError as e:
        print(f"❌ Proxy error: {e}")
        print("   Make sure Clash Verge is running on port 7897")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout - proxy may not be working")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("⚠️ Make sure Clash Verge is running and SOCKS5 proxy is enabled on port 7897")
    print("   Press Enter to continue...")
    input()

    success = fetch_rss_with_proxy()

    print("\n" + "=" * 60)
    if success:
        print("✅ RSS with SOCKS5 proxy: WORKING")
    else:
        print("❌ RSS with SOCKS5 proxy: FAILED")
    print("=" * 60)
