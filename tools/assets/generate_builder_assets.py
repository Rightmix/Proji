#!/usr/bin/env python3
"""
PROJI Stage 4 PROTOTYPE asset generator.

Renders the 15 bowl-builder ingredient layers (+ 15 card thumbnails) as aligned,
transparent WebP images on one shared overhead canvas. These are PROCEDURAL
PROTOTYPE ILLUSTRATIONS — not food photography and not final production assets.
They exist so the layered renderer, animations and alignment rules can be built and
tested before the approved hybrid photography/AI-assisted asset library (D-008) exists.

Deterministic: fixed seeds -> identical output on every run.
Usage: python3 tools/assets/generate_builder_assets.py
Requires: Pillow (with WebP), numpy.
"""
from __future__ import annotations

import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 560  # layer canvas (px) == bowl interior diameter
SS = 2  # supersampling factor
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "assets", "bowl-builder")
C = S * SS // 2  # centre in supersampled px


def canvas(size: int = S * SS) -> Image.Image:
    return Image.new("RGBA", (size, size), (0, 0, 0, 0))


def finish(img: Image.Image, size: int = S) -> Image.Image:
    return img.resize((size, size), Image.LANCZOS)


def shadow(img: Image.Image, blur: int = 10, offset: tuple[int, int] = (6, 10), strength: int = 120) -> Image.Image:
    """Soft contact shadow under the opaque parts of `img`."""
    a = img.split()[3].point(lambda v: min(255, v) * strength // 255)
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(a)
    sh = sh.filter(ImageFilter.GaussianBlur(blur * SS))
    out = canvas(img.size[0])
    out.alpha_composite(sh, (offset[0] * SS, offset[1] * SS))
    out.alpha_composite(img)
    return out


def noise_tint(img: Image.Image, amount: float, seed: int) -> Image.Image:
    rng = np.random.default_rng(seed)
    arr = np.asarray(img).astype(np.float32)
    n = rng.normal(0, amount, arr.shape[:2])[..., None]
    arr[..., :3] = np.clip(arr[..., :3] + n, 0, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def polar(r: float, deg: float) -> tuple[float, float]:
    t = math.radians(deg)
    return C + r * math.cos(t), C + r * math.sin(t)


# ---------------------------------------------------------------- bases
BASES = {
    "brown-rice-kanji": dict(liquid=(214, 196, 166), grain=(198, 168, 128), hi=(236, 222, 196), n=2600, gl=(9, 4)),
    "millet-kanji": dict(liquid=(222, 204, 150), grain=(214, 178, 92), hi=(240, 222, 160), n=4200, gl=(5, 5)),
    "red-rice-kanji": dict(liquid=(206, 166, 154), grain=(168, 96, 86), hi=(226, 190, 178), n=2600, gl=(9, 4)),
}


def base_layer(key: str, seed: int) -> Image.Image:
    p = BASES[key]
    rng = random.Random(seed)
    img = canvas()
    d = ImageDraw.Draw(img)
    R = int(C * 0.985)
    d.ellipse((C - R, C - R, C + R, C + R), fill=p["liquid"] + (255,))
    gw, gh = p["gl"]
    for _ in range(p["n"]):
        r = R * math.sqrt(rng.random()) * 0.97
        x, y = polar(r, rng.uniform(0, 360))
        w, h = gw * SS * rng.uniform(0.8, 1.2), gh * SS * rng.uniform(0.8, 1.2)
        g = Image.new("RGBA", (int(w * 2) + 4, int(w * 2) + 4), (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        cx = g.size[0] / 2
        col = p["grain"] if rng.random() < 0.6 else p["hi"]
        jitter = rng.randint(-12, 12)
        col = tuple(max(0, min(255, c + jitter)) for c in col) + (235,)
        gd.ellipse((cx - w / 2, cx - h / 2, cx + w / 2, cx + h / 2), fill=col)
        gd.ellipse((cx - w / 4, cx - h / 2 + 1, cx + w / 6, cx - h / 8), fill=p["hi"] + (160,))
        g = g.rotate(rng.uniform(0, 180), resample=Image.BICUBIC)
        img.alpha_composite(g, (int(x - g.size[0] / 2), int(y - g.size[1] / 2)))
    img = img.filter(ImageFilter.GaussianBlur(0.6 * SS))
    # rim shading so the base sits inside the bowl
    yy, xx = np.mgrid[0 : S * SS, 0 : S * SS]
    dist = np.sqrt((xx - C) ** 2 + (yy - C) ** 2) / R
    arr = np.asarray(img).astype(np.float32)
    shade = np.clip((dist - 0.78) / 0.22, 0, 1) ** 1.6 * 0.45
    arr[..., :3] *= (1 - shade)[..., None]
    arr[..., 3] = np.where(dist <= 1, arr[..., 3], 0)
    return finish(noise_tint(Image.fromarray(arr.astype(np.uint8), "RGBA"), 6, seed))


# ---------------------------------------------------------------- proteins
def clip(piece: Image.Image, draw_mask) -> Image.Image:
    """Keep only the part of `piece` inside the shape drawn by `draw_mask`."""
    m = Image.new("L", piece.size, 0)
    draw_mask(ImageDraw.Draw(m))
    a = np.minimum(np.asarray(piece.split()[3]), np.asarray(m))
    piece.putalpha(Image.fromarray(a))
    return piece


def fish(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    for i, (dx, dy) in enumerate([(-0.07, -0.09), (0.08, 0.1)]):
        piece = canvas()
        d = ImageDraw.Draw(piece)
        w, h = 0.6 * C, 0.24 * C
        box = (C - w, C - h, C + w, C + h)
        d.rounded_rectangle(box, radius=int(h * 0.9), fill=(196, 120, 52, 255))
        d.rounded_rectangle((C - w + 10, C - h + 10, C + w - 10, C + h - 10), radius=int(h * 0.8), fill=(214, 146, 70, 255))
        for k in range(6):  # grill marks
            x0 = C - w * 0.8 + k * w * 0.32
            d.line((x0, C - h, x0 + h * 1.1, C + h), fill=(70, 38, 18, 230), width=int(7 * SS))
        for _ in range(160):  # spice specks
            x, y = rng.uniform(C - w, C + w), rng.uniform(C - h * 0.8, C + h * 0.8)
            d.ellipse((x, y, x + 3 * SS, y + 3 * SS), fill=(110, 50, 20, 200))
        piece = clip(piece, lambda md: md.rounded_rectangle(box, radius=int(h * 0.9), fill=255))
        piece = piece.filter(ImageFilter.GaussianBlur(0.8 * SS)).rotate(-28 + i * 6, resample=Image.BICUBIC)
        img.alpha_composite(piece, (int(dx * C * 2), int(dy * C * 2)))
    return finish(shadow(noise_tint(img, 7, seed)))


def chicken(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    for i in range(4):
        piece = canvas()
        d = ImageDraw.Draw(piece)
        w, h = 0.17 * C, 0.46 * C
        d.ellipse((C - w, C - h, C + w, C + h), fill=(170, 110, 64, 255))
        d.ellipse((C - w + 11, C - h + 11, C + w - 11, C + h - 11), fill=(234, 204, 172, 255))
        for _ in range(26):
            y = rng.uniform(C - h, C + h)
            d.line((C - w, y, C + w, y + rng.uniform(-6, 6)), fill=(150, 90, 55, 90), width=SS * 2)
        for _ in range(90):  # cracked black pepper
            x, y = rng.uniform(C - w, C + w), rng.uniform(C - h, C + h)
            s = rng.uniform(2, 5) * SS
            d.ellipse((x, y, x + s, y + s), fill=(28, 24, 20, 235))
        piece = clip(piece, lambda md: md.ellipse((C - w, C - h, C + w, C + h), fill=255))
        piece = piece.filter(ImageFilter.GaussianBlur(0.7 * SS)).rotate(-40 + i * 9, resample=Image.BICUBIC)
        img.alpha_composite(piece, (int((i - 1.5) * 0.2 * C), int((i - 1.5) * 0.06 * C)))
    return finish(shadow(noise_tint(img, 6, seed)))


def soya(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    d = ImageDraw.Draw(img)
    for _ in range(15):
        r = C * 0.36 * math.sqrt(rng.random())
        x, y = polar(r, rng.uniform(0, 360))
        pts = []
        rad = rng.uniform(0.1, 0.135) * C
        for k in range(9):
            a = k / 9 * 2 * math.pi
            rr = rad * rng.uniform(0.75, 1.15)
            pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
        d.polygon(pts, fill=(122, 72, 36, 255))
        d.ellipse((x - rad * 0.55, y - rad * 0.6, x + rad * 0.2, y - rad * 0.05), fill=(170, 112, 62, 220))
        for _ in range(14):
            px, py = x + rng.uniform(-rad, rad) * 0.7, y + rng.uniform(-rad, rad) * 0.7
            d.ellipse((px, py, px + 3 * SS, py + 3 * SS), fill=(70, 38, 18, 200))
    img = img.filter(ImageFilter.GaussianBlur(1.0 * SS))
    return finish(shadow(noise_tint(img, 8, seed)))


def egg(seed: int) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    for dx, rot in [(-0.15, -18), (0.15, 14)]:
        piece = canvas()
        pd = ImageDraw.Draw(piece)
        w, h = 0.22 * C, 0.31 * C
        pd.ellipse((C - w, C - h, C + w, C + h), fill=(250, 248, 240, 255))
        pd.ellipse((C - w * 0.58, C - h * 0.5, C + w * 0.58, C + h * 0.5), fill=(240, 176, 40, 255))
        pd.ellipse((C - w * 0.35, C - h * 0.32, C + w * 0.05, C - h * 0.02), fill=(252, 206, 90, 200))
        piece = piece.rotate(rot, resample=Image.BICUBIC)
        img.alpha_composite(piece, (int(dx * C * 2), 0))
    del d
    img = img.filter(ImageFilter.GaussianBlur(0.8 * SS))
    return finish(shadow(noise_tint(img, 4, seed)))


PROTEINS = {
    "kerala-grilled-fish": fish,
    "pepper-chicken": chicken,
    "roasted-soya-chunks": soya,
    "boiled-egg": egg,
}


# ---------------------------------------------------------------- flavours (drawn in the top arc; slot 2 is rotated 180deg by the renderer)
FLAVOURS = {
    "kerala-coconut-sauce": dict(col=(246, 240, 224, 245), hi=(255, 255, 250, 200), bits=None),
    "spicy-chilli-oil": dict(col=(196, 52, 22, 205), hi=(255, 140, 90, 150), bits=(90, 20, 10, 230)),
    "herb-mint-sauce": dict(col=(86, 146, 66, 240), hi=(160, 210, 130, 170), bits=(40, 90, 30, 220)),
    "garlic-tadka": dict(col=(214, 162, 58, 215), hi=(250, 220, 140, 170), bits=(245, 236, 210, 240)),
}


def flavour_layer(key: str, seed: int) -> Image.Image:
    p = FLAVOURS[key]
    rng = random.Random(seed)
    img = canvas()
    d = ImageDraw.Draw(img)
    pts = []
    for k in range(120):
        a = 205 + k * (130 / 119)
        r = C * (0.64 + 0.05 * math.sin(k / 13 + seed) + 0.015 * math.sin(k / 4.1 + seed))
        pts.append(polar(r, a))
    width = int(22 * SS)
    d.line(pts, fill=p["col"], width=width, joint="curve")
    for x, y in pts[::30]:  # small pools
        rr = rng.uniform(14, 22) * SS
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=p["col"])
    d.line([(x - 3 * SS, y - 3 * SS) for x, y in pts], fill=p["hi"], width=int(4 * SS), joint="curve")
    if p["bits"]:
        for x, y in pts[::3]:
            bx, by = x + rng.uniform(-9, 9) * SS, y + rng.uniform(-9, 9) * SS
            s = rng.uniform(2, 4) * SS
            d.ellipse((bx, by, bx + s, by + s), fill=p["bits"])
    img = img.filter(ImageFilter.GaussianBlur(1.0 * SS))
    return finish(shadow(img, blur=4, offset=(2, 3), strength=70))


# ---------------------------------------------------------------- toppings (sector centred at -90deg; renderer rotates per slot)
def scatter_points(rng: random.Random, n: int, spread: float = 38) -> list[tuple[float, float, float]]:
    out = []
    for _ in range(n):
        a = -90 + rng.uniform(-spread, spread)
        r = C * rng.uniform(0.6, 0.88)
        x, y = polar(r, a)
        out.append((x, y, rng.uniform(0, 360)))
    return out


def peanuts(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    for x, y, rot in scatter_points(rng, 24):
        g = canvas(60 * SS)
        gd = ImageDraw.Draw(g)
        gd.ellipse((10 * SS, 18 * SS, 50 * SS, 42 * SS), fill=(196, 140, 80, 255))
        gd.ellipse((16 * SS, 21 * SS, 34 * SS, 30 * SS), fill=(226, 180, 120, 220))
        gd.line((30 * SS, 19 * SS, 30 * SS, 41 * SS), fill=(140, 90, 44, 200), width=2 * SS)
        g = g.rotate(rot, resample=Image.BICUBIC).resize((82 * SS, 82 * SS), Image.LANCZOS)
        img.alpha_composite(g, (int(x - 41 * SS), int(y - 41 * SS)))
    return finish(shadow(noise_tint(img, 6, seed), blur=4, offset=(2, 4)))


def shallots(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    d = ImageDraw.Draw(img)
    for x, y, rot in scatter_points(rng, 80):
        r = rng.uniform(14, 28) * SS
        start = rng.uniform(0, 360)
        col = rng.choice([(150, 70, 24, 245), (186, 98, 36, 245), (120, 52, 18, 245)])
        d.arc((x - r, y - r * 0.6, x + r, y + r * 0.6), start, start + rng.uniform(120, 260), fill=col, width=int(4 * SS))
    img = img.filter(ImageFilter.GaussianBlur(0.5 * SS))
    return finish(shadow(img, blur=3, offset=(2, 3), strength=90))


def herbs(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    for x, y, rot in scatter_points(rng, 20):
        g = canvas(70 * SS)
        gd = ImageDraw.Draw(g)
        col = rng.choice([(58, 120, 44, 255), (74, 142, 52, 255), (46, 100, 38, 255)])
        gd.ellipse((12 * SS, 24 * SS, 58 * SS, 46 * SS), fill=col)
        gd.line((12 * SS, 35 * SS, 58 * SS, 35 * SS), fill=(140, 190, 110, 200), width=2 * SS)
        g = g.rotate(rot, resample=Image.BICUBIC).resize((94 * SS, 94 * SS), Image.LANCZOS)
        img.alpha_composite(g, (int(x - 47 * SS), int(y - 47 * SS)))
    return finish(shadow(noise_tint(img, 5, seed), blur=3, offset=(2, 3)))


def pickled(seed: int) -> Image.Image:
    rng = random.Random(seed)
    img = canvas()
    for x, y, rot in scatter_points(rng, 22):
        g = canvas(70 * SS)
        gd = ImageDraw.Draw(g)
        col = rng.choice([(236, 110, 34, 255), (232, 98, 26, 255), (184, 38, 96, 255)])
        gd.rounded_rectangle((8 * SS, 30 * SS, 62 * SS, 40 * SS), radius=4 * SS, fill=col)
        gd.line((12 * SS, 32 * SS, 56 * SS, 32 * SS), fill=(255, 210, 170, 140), width=2 * SS)
        g = g.rotate(rot, resample=Image.BICUBIC).resize((94 * SS, 94 * SS), Image.LANCZOS)
        img.alpha_composite(g, (int(x - 47 * SS), int(y - 47 * SS)))
    return finish(shadow(img, blur=3, offset=(2, 3)))


TOPPINGS = {
    "roasted-peanuts": peanuts,
    "crispy-shallots": shallots,
    "fresh-herbs": herbs,
    "pickled-vegetables": pickled,
}


# ---------------------------------------------------------------- thumbnails
T = 112


def thumb(layer: Image.Image, crop: tuple[float, float, float, float], bg=(236, 233, 227, 255), ring=None) -> Image.Image:
    t = Image.new("RGBA", (T * 2, T * 2), (0, 0, 0, 0))
    m = Image.new("L", t.size, 0)
    ImageDraw.Draw(m).ellipse((0, 0, T * 2 - 1, T * 2 - 1), fill=255)
    bgimg = Image.new("RGBA", t.size, bg)
    if ring:
        ImageDraw.Draw(bgimg).ellipse((6, 6, T * 2 - 7, T * 2 - 7), fill=ring)
    x0, y0, x1, y1 = (int(v * S) for v in crop)
    part = layer.crop((x0, y0, x1, y1)).resize(t.size, Image.LANCZOS)
    bgimg.alpha_composite(part)
    t.paste(bgimg, (0, 0), m)
    return t.resize((T, T), Image.LANCZOS)


def ramekin(key: str) -> Image.Image:
    p = FLAVOURS[key]
    img = Image.new("RGBA", (T * 2, T * 2), (236, 233, 227, 255))
    d = ImageDraw.Draw(img)
    d.ellipse((24, 24, T * 2 - 24, T * 2 - 24), fill=(40, 40, 40, 255))
    d.ellipse((40, 40, T * 2 - 40, T * 2 - 40), fill=p["col"][:3] + (255,))
    d.ellipse((64, 56, 120, 96), fill=p["hi"])
    m = Image.new("L", img.size, 0)
    ImageDraw.Draw(m).ellipse((0, 0, T * 2 - 1, T * 2 - 1), fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out.resize((T, T), Image.LANCZOS)


def save(img: Image.Image, rel: str, q: int) -> None:
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=q, method=6)
    print(f"{rel}: {os.path.getsize(path) / 1024:.1f} KB")


def main() -> None:
    for i, key in enumerate(BASES):
        layer = base_layer(key, 100 + i)
        save(layer, f"bases/{key}.webp", 72)
        save(thumb(layer, (0.2, 0.2, 0.8, 0.8), ring=(24, 24, 24, 255)), f"thumbnails/base.{key}.webp", 80)
    for i, (key, fn) in enumerate(PROTEINS.items()):
        layer = fn(200 + i)
        save(layer, f"proteins/{key}.webp", 76)
        save(thumb(layer, (0.18, 0.18, 0.82, 0.82)), f"thumbnails/protein.{key}.webp", 80)
    for i, key in enumerate(FLAVOURS):
        save(flavour_layer(key, 300 + i), f"flavours/{key}.webp", 76)
        save(ramekin(key), f"thumbnails/flavour.{key}.webp", 80)
    for i, (key, fn) in enumerate(TOPPINGS.items()):
        layer = fn(400 + i)
        save(layer, f"toppings/{key}.webp", 76)
        save(thumb(layer, (0.3, 0.0, 0.7, 0.4)), f"thumbnails/topping.{key}.webp", 80)


if __name__ == "__main__":
    main()
