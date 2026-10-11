"""Compose DevQuest's launcher and splash assets from its original emblem.

The emblem is an original transparent PNG in assets/images. Run this script with
Pillow when the app icon assets need to be regenerated.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "images"
SIZE = 1024
RESAMPLE = Image.Resampling.LANCZOS


def centered_emblem(emblem: Image.Image, width: int, height: int, y: int) -> Image.Image:
    artwork = emblem.copy()
    artwork.thumbnail((width, height), RESAMPLE)
    layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    layer.alpha_composite(artwork, ((SIZE - artwork.width) // 2, y))
    return layer


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for name in ("georgiab.ttf", "DejaVuSerif-Bold.ttf", "arialbd.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    raise RuntimeError("A serif bold TrueType font is needed to build the splash asset")


def main() -> None:
    emblem = Image.open(IMAGES / "devquest-emblem.png").convert("RGBA")
    # Ignore isolated faint pixels so the artwork has a stable visual center.
    alpha = emblem.getchannel("A")
    bounds = alpha.point(lambda value: 255 if value > 16 else 0).getbbox()
    if bounds is None:
        raise ValueError("DevQuest emblem has no visible pixels")
    emblem = emblem.crop(bounds)

    # Legacy and iOS launcher icon: opaque square; the OS provides its own mask.
    launcher = Image.new("RGBA", (SIZE, SIZE), "#0D1024")
    glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((165, 135, 859, 875), fill=(91, 62, 148, 120))
    launcher.alpha_composite(glow.filter(ImageFilter.GaussianBlur(105)))
    launcher.alpha_composite(centered_emblem(emblem, 820, 820, 112))
    launcher_rgb = launcher.convert("RGB")
    launcher_rgb.save(IMAGES / "devquest-icon-v2.png", optimize=True)
    launcher_rgb.resize((48, 48), RESAMPLE).save(IMAGES / "devquest-favicon.png", optimize=True)

    # Android masks the outer third of adaptive artwork on some launchers.
    # Keep the entire symbol in the center 66% safe area.
    adaptive = centered_emblem(emblem, 540, 586, 219)
    adaptive.save(IMAGES / "devquest-adaptive-foreground.png", optimize=True)

    # Splash art has its own composition and a clear wordmark, separate from
    # the launcher icon. Expo draws its transparent PNG over backgroundColor.
    splash = centered_emblem(emblem, 615, 666, 48)
    draw = ImageDraw.Draw(splash)
    font = load_font(112)
    title = "DEVQUEST"
    box = draw.textbbox((0, 0), title, font=font, stroke_width=0)
    x = (SIZE - (box[2] - box[0])) // 2
    y = 762
    draw.text((x, y + 8), title, font=font, fill="#1E1538", stroke_width=3, stroke_fill="#1E1538")
    draw.text((x, y), title, font=font, fill="#FFD17A", stroke_width=2, stroke_fill="#6D4A24")
    splash.save(IMAGES / "devquest-splash.png", optimize=True)


if __name__ == "__main__":
    main()
