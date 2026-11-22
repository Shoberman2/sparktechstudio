# The gold river behind every page (public/home/river.*), from a real photograph instead of a generated render.
# A NASA astronaut photograph of a river in sunglint (public domain) is toned into the site's black and gold with a gradient
# map: the land falls to near-black, the sunlit water becomes the gold river. Nothing is painted in.
#
#   python3 -I scripts/scenes/river.py <photo.jpg> <out-dir> [rotate-degrees] [crop x,y,w,h as fractions]
#
# Writes river.jpg (3200 wide), river.webp (2400 wide, about 45 KB) and river-1200.webp (phones, a 900x1500 portrait crop, about 30 KB).
import subprocess, sys, os
from PIL import Image, ImageFilter
import numpy as np

src, out = sys.argv[1], sys.argv[2]
rot = int(sys.argv[3]) if len(sys.argv) > 3 else 0
crop = [float(v) for v in sys.argv[4].split(',')] if len(sys.argv) > 4 else None

im = Image.open(src).convert('RGB')
if rot: im = im.rotate(rot, expand=True)
if crop:
    W, H = im.size; x, y, w, h = crop
    im = im.crop((int(x * W), int(y * H), int((x + w) * W), int((y + h) * H)))

a = np.asarray(im).astype(np.float32) / 255
lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
lo, hi = np.percentile(lum, 1), np.percentile(lum, 99.85)
t = np.clip((lum - lo) / (hi - lo), 0, 1) ** 2.2          # crush the land, keep the water bright

# black → bronze → a muted gold, kept low so white text and the gold buttons stay the brightest things on the page.
# #0a0a09 is the page.
stops = [(0.00, (10, 10, 9)), (0.22, (17, 14, 9)), (0.48, (52, 38, 13)), (0.72, (112, 82, 24)), (0.88, (160, 120, 38)), (1.00, (204, 158, 62))]
xs = np.array([s[0] for s in stops], dtype=np.float32)
rgb = np.stack([np.interp(t, xs, np.array([s[1][c] for s in stops], dtype=np.float32)) for c in range(3)], axis=-1)
img = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))

os.makedirs(out, exist_ok=True)
def save(i, path, w, q):
    i = i.resize((w, round(i.height * w / i.width)), Image.LANCZOS)
    if path.endswith('.jpg'):
        i.save(path, quality=q, optimize=True, progressive=True)
    else:
        tmp = path + '.png'; i.save(tmp)
        subprocess.run(['cwebp', '-quiet', '-q', str(q), '-m', '6', tmp, '-o', path], check=True); os.remove(tmp)

# Desktop: 16:9 from the center
W, H = img.size
dh = min(H, round(W * 9 / 16)); dw = round(dh * 16 / 9)
desk = img.crop(((W - dw) // 2, (H - dh) // 2, (W - dw) // 2 + dw, (H - dh) // 2 + dh))
save(desk, os.path.join(out, 'river.jpg'), min(3200, desk.width), 84)
save(desk, os.path.join(out, 'river.webp'), min(2400, desk.width), 60)
# Phones: 3:5 portrait from the center
ph = H; pw = min(W, round(ph * 3 / 5))
phone = img.crop(((W - pw) // 2, 0, (W - pw) // 2 + pw, ph))
save(phone, os.path.join(out, 'river-1200.webp'), 900, 60)   # the name predates this; 900 wide is plenty for a dim ground
print('wrote', out, desk.size, phone.size)
