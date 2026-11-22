"""Install-in-place example for a separate company runtime; sends only to MockProvider."""
import argparse
import json
from pathlib import Path
import sys

# Let the example run directly from a source checkout before the package is
# published or installed into a company's own environment.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from rsei.outreach import OutreachStore


def install_company_config(store, config):
    if config.get("permissions", {}).get("live_email") is not False:
        raise ValueError("Synthetic integration refuses live email permission")
    company=config["company_id"]
    store.create_company(company,config["company_name"],config["sender"],config["timezone"],config["daily_cap"],config.get("brand_id","sparktech"))
    for item in config["icps"]:
        store.add_icp(company,item["id"],item["name"],item["signals"],item["problem"])
    for item in config["sources"]:
        store.add_source(company,item["id"],item["origin"],item["fact"],item["reviewer"])
    for item in config["prospects"]:
        store.add_prospect(company,item["id"],item["email"],item["name"],item["icp_id"],item["signals"])
    for item in config["campaigns"]:
        store.add_campaign(company,item["id"],item["name"],item["icp_id"],item["source_id"],item["category"],item["daily_cap"],
                           item["window_start"],item["window_end"],item["steps"])
    return company


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db",required=True,help="Private 0600 company-local SQLite database")
    parser.add_argument("--config",default=str(Path(__file__).with_name("company.json")))
    args=parser.parse_args()
    store=OutreachStore(args.db)
    config=json.loads(Path(args.config).read_text())
    company=install_company_config(store,config)
    print(json.dumps({"company_id":company,"status":"configured_local_sandbox","live_enabled":False,
                      "next_steps":["review drafts", "approve the campaign", "approve each message", "schedule and run the local mock worker"]},indent=2))


if __name__=="__main__": main()
