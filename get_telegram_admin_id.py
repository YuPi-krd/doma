#!/usr/bin/env python3
"""Read recent /start messages to identify the trusted Telegram user and chat."""

import json
import os
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
if not BOT_TOKEN:
    sys.exit("Set TELEGRAM_BOT_TOKEN in your local environment first.")

url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?allowed_updates=%5B%22message%22%5D"
request = Request(url, headers={"Accept": "application/json"})

try:
    with urlopen(request, timeout=15) as response:
        result = json.loads(response.read().decode("utf-8"))
except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
    sys.exit(
        f"Could not retrieve updates: {type(exc).__name__}. "
        "Make sure a webhook has not been registered yet."
    )

if not result.get("ok"):
    sys.exit("Telegram getUpdates failed. Make sure the bot token is valid and no webhook is active.")

updates = result.get("result") or []
matches = []
for update in updates:
    message = update.get("message") or {}
    user = message.get("from") or {}
    chat = message.get("chat") or {}
    text = message.get("text") or ""
    if text.startswith("/start") and user.get("id") is not None and chat.get("id") is not None:
        matches.append((user, chat))

if not matches:
    sys.exit("No /start message found. Open the bot in Telegram, press Start, then run this script again.")

user, chat = matches[-1]
print("Use these values in Render Environment:")
print(f"TELEGRAM_ADMIN_USER_ID={user['id']}")
print(f"TELEGRAM_ADMIN_CHAT_ID={chat['id']}")
print("Do not publish these identifiers unnecessarily.")
