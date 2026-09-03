#!/usr/bin/env python3
"""Crea la card di un collega:  python3 nuovo.py marco marco.json marco.png
La cartella marco/ sarà raggiungibile su .../flushcard/marco/"""
import sys, shutil, pathlib
nome, js, png = sys.argv[1:4]
d = pathlib.Path(nome); d.mkdir(exist_ok=True)
shutil.copy(js, d / 'card.json'); shutil.copy(png, d / 'card.png')
shutil.copy('denis/index.html', d / 'index.html')
print(f'ok → {d}/  (carica la cartella su GitHub, poi apri .../flushcard/{nome}/)')
