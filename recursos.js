(() => {
  const nav = document.createElement('button');
  nav.textContent = 'Recursos reales';
  document.querySelector('.nav').append(nav);

  const view = document.createElement('section');
  view.className = 'view';
  view.id = 'resources';
  view.innerHTML = `<div class="panel">
    <h2>Recursos reales</h2>
    <p>Complementa las actividades con ejemplos reales, audio y definiciones. Estas fuentes no sustituyen la ruta: la enriquecen cuando quieres ir más allá.</p>
    <h3>Ejemplos reales · Tatoeba</h3>
    <p>Busca una palabra o expresión para encontrar frases en inglés y sus traducciones cuando estén disponibles.</p>
    <div class="answers"><input id="tatoeba-query" placeholder="Ej.: travel, could you, although" style="padding:9px;border:1px solid #102834;min-width:250px"><button class="btn" id="tatoeba-search">Buscar ejemplos</button></div>
    <p id="tatoeba-result">Aún no has realizado una búsqueda.</p>
    <h3>Audio de pronunciación</h3>
    <p>Usa las voces instaladas en el dispositivo para escuchar una frase. Elige una voz inglesa cuando esté disponible.</p>
    <div class="answers"><input id="speech-text" value="Could you repeat that, please?" style="padding:9px;border:1px solid #102834;min-width:250px"><button class="btn" id="speak-resource">Escuchar</button></div>
    <p id="voice-status"></p>
    <h3>Diccionario · Free Dictionary API</h3>
    <p>Consulta definiciones, categoría gramatical, pronunciación, ejemplos y sinónimos sin registro ni clave.</p>
    <div class="answers"><input id="dictionary-word" placeholder="Palabra en inglés"><button class="btn" id="dictionary-search">Buscar definición</button></div>
    <p id="dictionary-result">Busca una palabra para consultar el diccionario.</p>
  </div>`;
  document.querySelector('main').append(view);
  const $ = s => document.querySelector(s);
  const display = (target, text) => { $(target).textContent = text; };
  const textOf = item => item?.text || item?.sentence?.text || item?.sentence_text || '';
  const translationOf = item => {
    const set = item?.translations || item?.sentence?.translations || [];
    const candidate = set.find(x => (x.lang || x.lang_tag || '').startsWith('spa')) || set[0];
    return candidate?.text || candidate?.sentence?.text || '';
  };

  nav.onclick = () => {
    document.querySelectorAll('.nav button').forEach(x => x.classList.toggle('active', x === nav));
    document.querySelectorAll('.view').forEach(x => x.classList.toggle('show', x === view));
    $('#crumb').textContent = 'Recursos reales';
  };
  $('#speak-resource').onclick = () => {
    const utterance = new SpeechSynthesisUtterance($('#speech-text').value.trim());
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith('en'));
    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US'; speechSynthesis.cancel(); speechSynthesis.speak(utterance);
    display('#voice-status', voice ? 'Usando: ' + voice.name + '.' : 'Usando la voz predeterminada del navegador.');
  };
  $('#tatoeba-search').onclick = async () => {
    const query = $('#tatoeba-query').value.trim();
    if (!query) return display('#tatoeba-result', 'Escribe una palabra o expresión para buscar.');
    display('#tatoeba-result', 'Buscando ejemplos reales…');
    try {
      const url = 'https://api.tatoeba.org/v1/sentences?lang=eng&text=' + encodeURIComponent(query) + '&limit=5';
      const response = await fetch(url);
      if (!response.ok) throw new Error('No disponible');
      const payload = await response.json();
      const items = payload.data || payload.results || payload;
      const examples = Array.isArray(items) ? items.map(x => {
        const en = textOf(x), es = translationOf(x);
        return en ? '• ' + en + (es ? ' — ' + es : '') : '';
      }).filter(Boolean) : [];
      display('#tatoeba-result', examples.length ? examples.join('\n') : 'No se encontraron ejemplos para esa búsqueda.');
    } catch {
      display('#tatoeba-result', 'Tatoeba no respondió desde este navegador. Comprueba la conexión o prueba otra búsqueda.');
    }
  };
  $('#dictionary-search').onclick = async () => {
    const word = $('#dictionary-word').value.trim();
    if (!word) return display('#dictionary-result', 'Escribe una palabra en inglés.');
    display('#dictionary-result', 'Buscando definición…');
    try {
      const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
      if (!response.ok) throw new Error('No encontrada');
      const [entry] = await response.json();
      const meaning = entry.meanings?.[0], definition = meaning?.definitions?.[0];
      const phonetic = entry.phonetic || entry.phonetics?.find(x => x.text)?.text || 'sin transcripción';
      const synonyms = (meaning?.synonyms || []).slice(0, 5).join(', ');
      display('#dictionary-result', entry.word + ' · ' + phonetic + ' · ' + (meaning?.partOfSpeech || '') + ': ' + (definition?.definition || 'Sin definición disponible.') + (definition?.example ? ' Ejemplo: “' + definition.example + '”' : '') + (synonyms ? ' Sinónimos: ' + synonyms + '.' : ''));
    } catch { display('#dictionary-result', 'No se encontró esa palabra o el diccionario no respondió.'); }
  };
})();
