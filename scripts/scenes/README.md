# Reel scenes

The nine pictures in the home page reel (`public/home/fx/<name>.jpg`, `.webp`, `-900.webp`) are rendered from these HTML scenes. Each one is real UI (Google, ChatGPT, Messages, Safari, a code editor, an orders app) drawn at true iPhone 16 Pro and MacBook Pro 14" sizes, so every word is sharp. They replaced the generated photographs on 2026-11-22 (founder: "make them look less AI").

| Scene | Shows |
| --- | --- |
| `seo.html` | Google on an iPhone, "bakery near me", the example bakery first |
| `aeo.html` | ChatGPT naming the example bakery, its site as the source |
| `design.html` | The bakery's dated site in an old browser beside the new one on a MacBook and an iPhone |
| `build.html` | The site's code in an editor, the production deploy in the terminal, the live site on an iPhone |
| `maintain.html` | The order page down with a server error, then back up with a message that it is fixed |
| `features.html` | The owner asks for gift cards in Messages; the gift card page is live |
| `agents.html` | A customer texts at 9:14 PM and the bakery's AI agent takes a cake order |
| `apps.html` | The bakery's orders app with an AI summary of the morning |
| `startups.html` | The live UTern, Leed and BallotWatch sites |

Maple & Rye Bakery, its customers and its prices are examples, not a client. `scene.js` holds the iPhone hardware and the bakery's site; `scene.css` the devices; `msgs.css` iOS Messages.

## Render

```sh
scripts/scenes/render.sh            # all nine
scripts/scenes/render.sh seo aeo    # some
```

It opens each scene in gstack's headless browser at 1600x1080 @2x and writes the three files per scene. Needs `~/.claude/skills/gstack/browse/dist/browse`, python3 with Pillow, and `cwebp` (`brew install webp`).

## Sources

Photographs in `photos/` are public domain (CC0), found through Openverse, no attribution required:

| File | Source |
| --- | --- |
| `croissant-tray.jpg` | StockSnap 8GMCKXR6GE, "Croissant Bread" |
| `sourdough-board.jpg` | StockSnap XXNL0MZLOR, "Baking Bread" |
| `pastry-tray.jpg` | StockSnap 39640NOOXH, "Bread Display" |
| `chocolate-cake.jpg` | StockSnap XTNRPGQBYL, "Chocolate Cake" |
| `croissant-breakfast.jpg` | StockSnap 8179612CB8, "Pastries Breakfast" |

`photos/google.svg` is the Google logo from Wikimedia Commons, shown only as part of a Google results page.

`real/` holds captures of the live UTern, Leed and BallotWatch home pages at iPhone size (393x852 @3x), taken 2026-11-22. Recapture them when those sites change.

## The gold river

`public/home/river.jpg`, `river.webp` and `river-1200.webp` (phones) are a real photograph, not a render: NASA astronaut photograph ISS043-E-101700, "View of Peru", a river in sunglint (public domain, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:ISS043-E-101700_-_View_of_Peru.jpg)). `river.py` turns it to flow down the page and tones it black and gold with a gradient map, kept dim so text stays readable:

```sh
python3 -I scripts/scenes/river.py ISS043-E-101700_-_View_of_Peru.jpg public/home 90
```
