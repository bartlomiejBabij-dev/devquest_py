"""Generate DevQuest's simple original app icon without external image assets."""
from PIL import Image, ImageDraw, ImageFont

size = 1024
image = Image.new("RGB", (size, size), "#0D1024")
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((90, 90, 934, 934), radius=185, fill="#1C2040", outline="#FFD17A", width=22)
draw.ellipse((233, 206, 791, 764), fill="#302A57", outline="#B69CFF", width=18)
draw.polygon([(512, 224), (690, 570), (512, 726), (334, 570)], fill="#FFD17A")
draw.polygon([(512, 302), (620, 542), (512, 647), (404, 542)], fill="#FF9D6C")
draw.ellipse((466, 472, 558, 564), fill="#FFF3CA")
font = ImageFont.truetype("arialbd.ttf", 100)
draw.text((512, 841), "DQ", anchor="mm", font=font, fill="#F8F2E9")
image.save("assets/images/devquest-icon.png")
