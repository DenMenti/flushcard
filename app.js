// flushcard — legge card.json nella cartella corrente e costruisce la pagina.
(async () => {
  const c = await (await fetch('card.json')).json();
  const nome = `${c.nome} ${c.cognome}`, a = c.indirizzo || {};
  const vcf = ['BEGIN:VCARD','VERSION:3.0',`N:${c.cognome};${c.nome};;;`,`FN:${nome}`,
    c.azienda && `ORG:${c.azienda}`, c.ruolo && `TITLE:${c.ruolo}`,
    c.cellulare && `TEL;TYPE=CELL:${c.cellulare}`, c.telefono && `TEL;TYPE=WORK:${c.telefono}`,
    c.email && `EMAIL;TYPE=WORK:${c.email}`,
    c.indirizzo && `ADR;TYPE=WORK:;;${a.via};${a.citta};${a.provincia};${a.cap};${a.paese}`,
    c.sito && `URL:${c.sito}`,'END:VCARD'].filter(Boolean).join('\n');

  document.title = `${nome} · flushdesign`;
  document.head.insertAdjacentHTML('beforeend', `<meta name="apple-mobile-web-app-title" content="${c.nome}">
    <link rel="manifest" href='data:application/manifest+json,${encodeURIComponent(JSON.stringify(
      {name:nome, short_name:c.nome, start_url:location.pathname, display:'standalone', background_color:'#fff', theme_color:'#fff',
       icons:[{src:new URL('card.png',location).href, sizes:'827x827', type:'image/png'}]}))}'>`);

  const qr = qrcode(0, 'M'); qr.addData(vcf); qr.make();
  const n = qr.getModuleCount(), cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) cells.push(`M${x} ${y}h1v1h-1z`);
  const qrSvg = `<svg viewBox="0 0 ${n} ${n}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><path fill="#fff" d="${cells.join('')}"/></svg>`;

  document.body.innerHTML = `
    <div class="card" role="button" tabindex="0" aria-label="Foto: tocca per il QR con il contatto"><div>
      <div class="face"><img src="card.png" alt="${nome}"></div>
      <div class="face back"><div class="qrbox">${qrSvg}</div></div>
    </div></div>
    <hr style="margin-top:9vw">
    <p class="who">${nome}<br>${c.ruolo || ''}</p>
    <hr>
    <nav class="links">
      ${c.link.map(l => `<a href="${l.url}" target="_blank" rel="noopener" ${l.app ? `data-app="${l.app}"` : ''}>${l.testo}</a>`).join('')}
      <a href="#" id="share">invia contatto</a>
    </nav>
    <footer><b>flushdesign</b><div class="dots"><i></i><i></i><i></i><i></i><i></i><i></i></div></footer>`;

  const card = document.querySelector('.card');
  card.onclick = () => card.classList.toggle('flipped');
  card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } };

  // pulsanti: prima il negativo (220ms), poi l'azione
  for (const el of document.querySelectorAll('.links a')) el.onclick = e => {
    e.preventDefault(); el.classList.add('on');
    setTimeout(() => { el.classList.remove('on'); go(el); }, 220);
  };
  function go(el) {
    if (el.id === 'share') return share();
    if (!el.dataset.app) return window.open(el.href, '_blank');
    location.href = el.dataset.app;   // app se installata, altrimenti il sito
    setTimeout(() => { if (!document.hidden) window.open(el.href, '_blank'); }, 450); // <1s dal tap o iOS lo blocca
  }
  async function share() {
    const f = new File([vcf], `${nome}.vcf`, { type: 'text/vcard' });
    if (navigator.canShare?.({ files: [f] })) return navigator.share({ files: [f], title: nome, text: location.href });
    if (navigator.share) return navigator.share({ title: nome, url: location.href });
    location.href = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcf);
  }
})();
