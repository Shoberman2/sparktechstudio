"""Write safe local text/HTML previews for all built-in company email themes."""
import argparse
from pathlib import Path

from .email_themes import THEMES, render_email


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out",required=True,help="Directory to create for local synthetic previews")
    args=parser.parse_args(argv)
    out=Path(args.out).expanduser()
    out.mkdir(parents=True,exist_ok=False)
    subject="A short introduction"
    body="Hello,\n\nThis is a synthetic preview of the configured company email theme.\n\nWould a short conversation be useful?"
    for brand in THEMES:
        rendered=render_email(brand,subject,body)
        (out/f"{brand}.html").write_text(rendered["html"]+"\n",encoding="utf-8")
        (out/f"{brand}.txt").write_text(rendered["text"]+"\n",encoding="utf-8")
    print(f"Wrote {len(THEMES)*2} offline previews to {out}")


if __name__=="__main__": main()
