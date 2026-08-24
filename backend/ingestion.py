import os
import sys
import json
import logging
from datetime import datetime
import pytz
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingestion")

KST = pytz.timezone("Asia/Seoul")
CNN_ENDPOINT = "https://production.dataviz.cnn.io/index/fearandgreed/graphdata"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}


def fetch_cnn_fear_and_greed():
    try:
        response = requests.get(CNN_ENDPOINT, headers=HEADERS, timeout=10)
        response.raise_for_status()
        payload = response.json()
    except Exception as e:
        logger.error(f"Upstream fetch failed: {e}")
        return None

    fng = payload.get("fear_and_greed")
    if not fng or "score" not in fng:
        logger.error("Malformed payload: Missing fear_and_greed root or score field")
        return None

    raw_ts = fng.get("timestamp")
    dt_kst = datetime.now(KST)
    if raw_ts:
        try:
            dt_parsed = datetime.fromisoformat(raw_ts.replace("Z", "+00:00"))
            dt_kst = dt_parsed.astimezone(KST)
        except Exception:
            pass

    # Anchor to KST calendar date for idempotency
    kst_date_str = dt_kst.strftime("%Y-%m-%d")

    return {
        "date": kst_date_str,
        "data_type": "fear_and_greed",
        "score": round(float(fng["score"]), 2),
        "rating": fng.get("rating", "neutral"),
        "unit": "0-100 scale",
        "raw_timestamp": raw_ts,
        "source_name": "CNN Business Markets",
        "raw_payload": payload
    }


def upsert_to_supabase(record):
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        logger.info("SUPABASE_URL/KEY not configured. Running in standalone local mode.")
        output_file = os.path.join(os.path.dirname(__file__), "latest_snapshot.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(record, f, indent=2, ensure_ascii=False)
        logger.info(f"Snapshot written locally to {output_file}")
        return True

    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        # Idempotent upsert on composite unique constraint (date, data_type)
        res = supabase.table("daily_market_snapshots").upsert(
            record,
            on_conflict="date, data_type"
        ).execute()
        logger.info(f"Successfully upserted record to Supabase: {res}")
        return True
    except Exception as e:
        logger.error(f"Supabase upsert failure: {e}")
        return False


def main():
    logger.info("Starting Daily Ingestion Pipeline (Timezone: Asia/Seoul)...")
    record = fetch_cnn_fear_and_greed()
    if not record:
        sys.exit(1)

    logger.info(f"Fetched score: {record['score']} ({record['rating']}) for KST Date: {record['date']}")
    success = upsert_to_supabase(record)
    if not success:
        sys.exit(1)
    logger.info("Ingestion completed successfully.")


if __name__ == "__main__":
    main()
