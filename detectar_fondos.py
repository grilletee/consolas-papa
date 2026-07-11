"""
Detecta automaticamente que imagenes de images/ tienen fondo SOLIDO
(necesitan pasar por remove_background) vs cuales ya tienen fondo
transparente de verdad.

Logica: revisa el canal alfa (transparencia) de las 4 esquinas de cada
imagen. Si las esquinas son completamente opacas (alfa alto), asumimos
fondo solido. Si son transparentes (alfa bajo/cero), ya esta resuelta.

Para archivos .jpg (que no soportan transparencia en absoluto), se
marcan directamente como "fondo solido" sin necesidad de analizar pixeles.
"""
import os
from PIL import Image

CARPETA = "images"
UMBRAL_ALFA = 200  # por encima de esto, consideramos "opaco" (fondo solido)
MARGEN_ESQUINA = 10  # pixeles desde el borde a revisar

def revisar_imagen(ruta):
    try:
        img = Image.open(ruta)
    except Exception as e:
        return f"ERROR al abrir: {e}"

    ext = ruta.rsplit('.', 1)[-1].lower()
    if ext in ('jpg', 'jpeg'):
        # JPG no soporta canal alfa - por definicion no puede tener fondo transparente
        return "FONDO SOLIDO (formato JPG, sin canal alfa posible)"

    if img.mode != 'RGBA':
        return f"FONDO SOLIDO (modo {img.mode}, sin canal alfa)"

    ancho, alto = img.size
    esquinas = [
        (MARGEN_ESQUINA, MARGEN_ESQUINA),
        (ancho - MARGEN_ESQUINA, MARGEN_ESQUINA),
        (MARGEN_ESQUINA, alto - MARGEN_ESQUINA),
        (ancho - MARGEN_ESQUINA, alto - MARGEN_ESQUINA),
    ]

    alfas = []
    for (x, y) in esquinas:
        x = max(0, min(x, ancho - 1))
        y = max(0, min(y, alto - 1))
        pixel = img.getpixel((x, y))
        alfas.append(pixel[3])  # canal alfa

    alfa_promedio = sum(alfas) / len(alfas)

    if alfa_promedio >= UMBRAL_ALFA:
        return f"FONDO SOLIDO (alfa promedio en esquinas: {alfa_promedio:.0f}/255)"
    else:
        return f"OK - ya transparente (alfa promedio en esquinas: {alfa_promedio:.0f}/255)"


def main():
    if not os.path.isdir(CARPETA):
        print(f"No encuentro la carpeta '{CARPETA}'. Ejecuta este script desde la raiz de tu proyecto (consolas-papa/).")
        return

    archivos = sorted(os.listdir(CARPETA))
    necesitan_higgsfield = []
    ya_estan_bien = []

    for nombre in archivos:
        ruta = os.path.join(CARPETA, nombre)
        if not os.path.isfile(ruta):
            continue
        resultado = revisar_imagen(ruta)
        print(f"{nombre:40s} -> {resultado}")
        if "FONDO SOLIDO" in resultado:
            necesitan_higgsfield.append(nombre)
        elif "OK" in resultado:
            ya_estan_bien.append(nombre)

    print()
    print("=" * 60)
    print(f"Total revisadas: {len(archivos)}")
    print(f"Ya transparentes (no necesitan nada): {len(ya_estan_bien)}")
    print(f"Necesitan quitar fondo: {len(necesitan_higgsfield)}")
    print()
    if necesitan_higgsfield:
        print("Lista para pasar a Higgsfield:")
        for n in necesitan_higgsfield:
            print(f"  - {n}")


if __name__ == "__main__":
    main()
