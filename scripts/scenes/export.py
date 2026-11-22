# Export one 3200x2160 scene capture to the three files the reel loads: 1600x1080 JPEG, 1600 WebP and 900 WebP.
# With 'portrait', export a 2160x2700 capture to <name>-m.webp (1080x1350) for phones.
import subprocess, sys
from PIL import Image

src, base = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
if len(sys.argv) > 3 and sys.argv[3] == 'portrait':
    # Phones: one 1080x1350 WebP, <name>-m.webp
    tmp = base + '-tmp.png'
    im.resize((1080, 1350), Image.LANCZOS).save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', '80', '-m', '6', tmp, '-o', base + '-m.webp'], check=True)
    import os; os.remove(tmp)
    sys.exit(0)
full = im.resize((1600, 1080), Image.LANCZOS)
full.save(base + '.jpg', quality=86, optimize=True, progressive=True)
small = im.resize((900, 608), Image.LANCZOS)
tmp = base + '-tmp.png'
for img, out, q in ((full, base + '.webp', 84), (small, base + '-900.webp', 82)):
    img.save(tmp)
    subprocess.run(['cwebp', '-quiet', '-q', str(q), '-m', '6', tmp, '-o', out], check=True)
import os
os.remove(tmp)
