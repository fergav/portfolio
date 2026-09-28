"""Genera imágenes de relleno PROVISORIAS.

Crea:
  - src/assets/og-provisorio.png (imagen Open Graph provisoria)

Requiere Python 3 + Pillow. Uso:  python3 scripts/generar-placeholders.py
(Los proyectos ya usan imágenes reales; este script no los toca.)
"""

import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FUENTE_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FUENTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def texto_centrado(img, texto, tam, ancho_max_chars, color=(255, 255, 255)):
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype(FUENTE_BOLD, tam)
    lineas = textwrap.wrap(texto, ancho_max_chars) or [texto]
    alto_linea = int(tam * 1.25)
    y = (img.height - alto_linea * len(lineas)) // 2
    for linea in lineas:
        w = d.textlength(linea, font=f)
        x = (img.width - w) // 2
        d.text((x + 3, y + 3), linea, font=f, fill=(0, 0, 0))
        d.text((x, y), linea, font=f, fill=color)
        y += alto_linea


def rayado(w, h, c1, c2, paso):
    img = Image.new("RGB", (w, h), c1)
    d = ImageDraw.Draw(img)
    for x in range(-h, w, paso * 2):
        d.polygon([(x, h), (x + paso, h), (x + paso + h, 0), (x + h, 0)], fill=c2)
    return img


def generar_og():
    w, h = 1200, 630
    img = rayado(w, h, (122, 122, 122), (144, 144, 144), 30)
    texto_centrado(img, "fergav", 160, 20, color=(192, 254, 105))
    ImageDraw.Draw(img).text((w // 2, h - 40), "OG PROVISORIA",
                             font=ImageFont.truetype(FUENTE_BOLD, 36),
                             fill=(255, 0, 170), anchor="ms")
    img.save(RAIZ / "src/assets/og-provisorio.png")
    print("✓ og")


if __name__ == "__main__":
    generar_og()
