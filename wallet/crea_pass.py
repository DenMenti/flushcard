#!/usr/bin/env python3
"""Genera un pass Apple Wallet (.pkpass) da una cartella collega.
    python3 wallet/crea_pass.py denis
Servono (una tantum, account Apple Developer):
  wallet/pass.pem  wallet/key.pem   ← certificato Pass Type ID esportato da Keychain (openssl pkcs12 -in Certificates.p12 -clcerts -nokeys -out pass.pem / -nocerts -nodes -out key.pem)
  wallet/wwdr.pem                   ← Apple WWDR G4, da https://www.apple.com/certificateauthority/
  TEAM_ID e PASS_TYPE_ID qui sotto.
"""
import sys, json, hashlib, pathlib, subprocess, zipfile, io
from PIL import Image
TEAM_ID, PASS_TYPE_ID = 'XXXXXXXXXX', 'pass.it.flushdesign.card'

who = pathlib.Path(sys.argv[1]); c = json.loads((who/'card.json').read_text()); W = pathlib.Path(__file__).parent
nome = f"{c['nome']} {c['cognome']}"
vcf = f"BEGIN:VCARD\nVERSION:3.0\nN:{c['cognome']};{c['nome']};;;\nFN:{nome}\nORG:{c.get('azienda','')}\nTITLE:{c.get('ruolo','')}\nTEL;TYPE=CELL:{c.get('cellulare','')}\nEMAIL:{c.get('email','')}\nURL:{c.get('sito','')}\nEND:VCARD"

pass_json = {
  "formatVersion": 1, "passTypeIdentifier": PASS_TYPE_ID, "teamIdentifier": TEAM_ID,
  "serialNumber": who.name, "organizationName": "flushdesign", "description": f"{nome} · flushdesign",
  "backgroundColor": "rgb(255,255,255)", "foregroundColor": "rgb(0,0,0)", "labelColor": "rgb(0,0,0)",
  "generic": {"primaryFields": [{"key": "n", "value": nome}], "secondaryFields": [{"key": "r", "value": c.get('ruolo','')}]},
  "barcodes": [{"format": "PKBarcodeFormatQR", "message": vcf, "messageEncoding": "iso-8859-1"}]
}
files = {'pass.json': json.dumps(pass_json, ensure_ascii=False).encode()}
img = Image.open(who/'card.png').convert('RGBA')
for name, size in (('icon', 29), ('icon@2x', 58), ('icon@3x', 87), ('thumbnail', 90), ('thumbnail@2x', 180)):
    b = io.BytesIO(); img.resize((size, size)).save(b, 'PNG'); files[name + '.png'] = b.getvalue()
files['manifest.json'] = json.dumps({k: hashlib.sha1(v).hexdigest() for k, v in files.items()}).encode()
(W/'manifest.json').write_bytes(files['manifest.json'])
subprocess.run(['openssl', 'smime', '-binary', '-sign', '-certfile', W/'wwdr.pem', '-signer', W/'pass.pem', '-inkey', W/'key.pem',
                '-in', W/'manifest.json', '-out', W/'signature', '-outform', 'DER'], check=True)
files['signature'] = (W/'signature').read_bytes()
with zipfile.ZipFile(who/f'{who.name}.pkpass', 'w', zipfile.ZIP_DEFLATED) as z:
    for k, v in files.items(): z.writestr(k, v)
print(f"ok → {who}/{who.name}.pkpass  (mettilo online e linkalo, oppure invialo via AirDrop/mail)")
