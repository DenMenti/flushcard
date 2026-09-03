# flushcard

Biglietto da visita digitale, una cartella per persona.

    app.js  app.css  qr.js   ← codice condiviso, non si tocca
    denis/  card.json card.png index.html   ← una cartella per collega

Nuovo collega: copia `denis/card.json`, compila i campi, prepara la foto (PNG quadrato con angoli arrotondati), poi

    python3 nuovo.py marco marco.json marco.png

e carica la cartella `marco/`. La card è su `https://<host>/flushcard/marco/`. QR e vCard si generano da soli dal `card.json`.

Hosting: sono file statici, vanno su qualsiasi server; serve solo HTTPS (per "aggiungi a Home" e il pulsante "invia contatto").

## Apple Wallet
`wallet/crea_pass.py` genera il `.pkpass` dal `card.json`. Richiede un account Apple Developer (99$/anno, uno per l'azienda): istruzioni in testa al file. Il pass va poi linkato dalla card (basta aggiungere `{"testo":"wallet","url":"denis.pkpass"}` in `link`) o inviato via AirDrop/mail.

## "Widget" QR senza app nativa
Su iPhone: screenshot del retro con il QR → app Comandi → nuovo comando "Mostra QR" con l'azione *Quick Look* sull'immagine → aggiungi il widget Comandi alla Home o alla schermata di blocco. Un tap e il QR compare, anche a telefono bloccato. Su Android: widget "Foto" con l'immagine del QR.
