# Email signature

SparkTech Studio signature for Spencer Hoberman: the site's spark mark plus
four lines of Helvetica, which is Apple Mail's own default. Neutral grays
throughout, no brand color in the text.

| File | Use |
|------|-----|
| `signature.html` | The signature. Image referenced locally, so a browser copy carries the actual pixels into Mail. **Start here.** |
| `signature-hosted.html` | Same block, mark loaded from `https://www.sparktechstudio.com/email-mark.png`. Only works after `public/email-mark.png` is deployed. |
| `sparktech-mark.png` | The spark mark, 256px transparent PNG rasterized from `public/logo.svg`. Renders at 54px. |

## Install in Apple Mail

1. Open `signature.html` in Safari:
   `open -a Safari signature/signature.html`
2. Cmd+A, then Cmd+C. The file contains only the signature, so this selects
   exactly the right block.
3. Mail → Settings → Signatures. Pick the account on the left, click **+**,
   name it `SparkTech`.
4. Select everything in the new signature's edit pane and paste over it with
   Cmd+Option+Shift+V (paste and match style is wrong here, use plain Cmd+V if
   the formatting drops).
5. Uncheck **Always match my default message font** at the bottom of the pane.
   The signature is already on Helvetica, so the family survives either way,
   but leaving it checked flattens the sizes and the gray.
6. Set it as the default in the **Choose Signature** dropdown for that account.

Send yourself a test. The mark should ride along as an embedded attachment,
which is why the local-image version is the default: recipients see it even
with remote images blocked.

## Notes

- Neutral grays only: name `#1a1a1a`, title `#767676`, email `#444444`,
  underline `#bbbbbb`, divider rule `#dddddd`. The gold mark is the only color
  in the block. The site's green and coral were tried and cut.
- A tagline line ("Advice that ships. Days, not weeks.") is in the HTML,
  commented out. Uncomment to run it under the contact lines.
- No phone or LinkedIn by request. Add them as sibling `<div>`s copying the
  email line's styling.
- Font stack is `'Helvetica Neue', Helvetica, Arial, sans-serif`. Helvetica is
  Apple Mail's default composing font, so the signature sits flush with the
  body copy above it. Windows clients land on Arial.
