"""Tenant-selected, accessible email skins with plaintext counterparts."""
from html import escape


THEMES = {
    "sparktech": {"name": "SparkTech Studio", "project": "", "ink": "#26241f", "paper": "#f5f4f1", "accent": "#b8860b", "sender": "SparkTech Studio"},
    # LEED's checked-in mark is monochrome; don't invent a separate palette.
    "leed-sherlock": {"name": "Sherlock", "project": "A project by SparkTech Studio", "ink": "#171717", "paper": "#ffffff", "accent": "#171717", "sender": "SparkTech Studio"},
    # Navy is taken directly from the local Ballot Watch favicon asset.
    "ballotwatch": {"name": "Ballot Watch", "project": "A project by SparkTech Studio", "ink": "#0f1f3a", "paper": "#f5f7fb", "accent": "#5276a5", "sender": "SparkTech Studio"},
    # UTern palette values match its read-only landing-v5 CSS; Bob/Bluebird is
    # represented with the existing blue-to-lilac accent tones.
    "utern-bluebird": {"name": "UTern", "project": "Bluebird", "ink": "#1a1a18", "paper": "#faf8f4", "accent": "#3b82f6", "sender": "UTern"},
}


def render_email(brand_id, subject, body, sender_name=None):
    """Return both MIME-ready text and self-contained, no-remote-asset HTML."""
    if brand_id not in THEMES:
        raise ValueError("Unknown email brand; configure an explicit company theme")
    if not isinstance(subject, str) or not subject.strip() or not isinstance(body, str) or not body.strip():
        raise ValueError("Subject and body are required")
    theme = THEMES[brand_id]
    sender = (sender_name or theme["sender"]).strip()
    if not sender:
        raise ValueError("Sender label is required")
    # Plain text remains the canonical reviewed content. Brand marks below are
    # short supplied identities, not invented names, titles, links or claims.
    lines = [body.rstrip(), "", sender]
    if theme["project"]:
        lines.append(theme["project"])
    text = "\n".join(lines)
    escaped_subject = escape(subject, quote=True)
    escaped_body = escape(body).replace("\n", "<br>\n")
    signature = f'<strong style="color:{theme["ink"]}">{escape(theme["name"])}</strong>'
    project = f'<div style="margin-top:4px;color:#626262;font-size:13px">{escape(theme["project"])}</div>' if theme["project"] else ""
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>{escaped_subject}</title></head>
<body style="margin:0;background:{theme["paper"]};color:{theme["ink"]};font-family:Arial,Helvetica,sans-serif;line-height:1.6">
<div style="max-width:600px;margin:0 auto;padding:28px 18px"><div style="height:4px;background:{theme["accent"]};border-radius:2px 2px 0 0"></div>
<main style="background:#ffffff;padding:28px 26px;border:1px solid #e5e5e5;border-top:0"><h1 style="font-size:20px;line-height:1.3;margin:0 0 20px;color:{theme["ink"]}">{escaped_subject}</h1>
<div style="font-size:16px;color:{theme["ink"]}">{escaped_body}</div><div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e5e5">{signature}{project}</div></main>
<div style="padding:12px 4px;color:#626262;font-size:12px">Sent by {escape(sender)}</div></div></body></html>'''
    return {"brand_id": brand_id, "subject": subject, "text": text, "html": html, "sender_name": sender}
