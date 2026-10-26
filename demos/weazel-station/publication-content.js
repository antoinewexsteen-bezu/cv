if (location.pathname.toLowerCase().includes('/public/')) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (url, options) => originalFetch(typeof url === 'string' && url.startsWith('/api/') ? `api.php/${url.slice(5)}` : url, options);
  window.EventSource = class { constructor() {} addEventListener() {} };
}
const PublicationContent = (() => {
  const fields = { title:'Titre', subtitle:'Sous-titre', text:'Texte', imageUrl:'Lien image imgbb' };
  let archives = [];
  const mounted = new Map();
  async function request(url, options = {}) {
    const response = await fetch(url, { ...options, headers:{ 'content-type':'application/json' }, body:options.body ? JSON.stringify(options.body) : undefined });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Action impossible.');
    return data;
  }
  async function copy(value, button) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const input = document.createElement('textarea');
        input.value = value; input.style.position = 'fixed'; input.style.opacity = '0';
        (button.closest('dialog') || document.body).append(input); input.select();
        const ok = document.execCommand('copy'); input.remove();
        if (!ok) throw new Error('Copie impossible');
      }
      button.title = 'Copié';
      button.closest('.publication-content')?.querySelector('[role=status]')?.replaceChildren('Copié dans le presse-papiers.');
      return true;
    } catch { button.closest('.publication-content')?.querySelector('[role=status]')?.replaceChildren('Copie impossible. Sélectionnez le texte pour le copier.'); return false; }
  }
  function get(prefix) {
    const result = { archiveId:document.getElementById(`${prefix}-archive`).value };
    for (const key of Object.keys(fields)) result[key] = document.getElementById(`${prefix}-${key}`).value;
    return result;
  }
  function options(prefix) {
    const entry = mounted.get(prefix), select = document.getElementById(`${prefix}-archive`), selected = select.value;
    select.replaceChildren(new Option('Sans archive', ''));
    archives.filter(item => item.type === entry.type && (entry.type !== 'panel' || item.panel === entry.panel())).forEach(item => select.add(new Option(`${item.company} · ${item.title}`, item.id)));
    if (selected && !Array.from(select.options).some(option => option.value === selected)) select.add(new Option('Archive conservée dans ce créneau', selected));
    select.value = selected;
  }
  function set(prefix, item = {}) {
    const select = document.getElementById(`${prefix}-archive`);
    select.value = '';
    if (item.archiveId && !Array.from(select.options).some(option => option.value === item.archiveId)) select.add(new Option('Archive conservée dans ce créneau', item.archiveId));
    select.value = item.archiveId || '';
    for (const key of Object.keys(fields)) document.getElementById(`${prefix}-${key}`).value = item[key] || '';
    document.querySelector(`#${prefix}-content [role=status]`).textContent = '';
    preview(prefix);
  }
  function preview(prefix) {
    const image = document.getElementById(`${prefix}-preview`), url = document.getElementById(`${prefix}-imageUrl`).value;
    image.hidden = true;
    try { const parsed = new URL(url); if (parsed.protocol === 'https:' && parsed.hostname === 'i.ibb.co') { image.src = parsed.href; image.hidden = false; } else image.removeAttribute('src'); } catch { image.removeAttribute('src'); }
  }
  function mount(form, prefix, type, company, panel = () => null) {
    const section = document.createElement('section');
    section.id = `${prefix}-content`; section.className = 'publication-content';
    section.innerHTML = `<label>Archive<select id="${prefix}-archive"><option value="">Sans archive</option></select></label><div class="content-fields">${Object.entries(fields).map(([key,label]) => `<label>${label}<div class="copy-field">${key === 'text' ? `<textarea id="${prefix}-${key}" maxlength="8000" rows="4"></textarea>` : `<input id="${prefix}-${key}" type="${key === 'imageUrl' ? 'url' : 'text'}" maxlength="${key === 'title' ? 140 : key === 'subtitle' ? 300 : 2048}">`}<button type="button" data-copy="${key}" class="icon-button" title="Copier ${label.toLowerCase()}" aria-label="Copier ${label.toLowerCase()}"><i data-lucide="copy"></i></button></div></label>`).join('')}</div><img id="${prefix}-preview" class="archive-preview" alt="Visuel de la publication" hidden><button type="button" data-copy="all" class="text-button"><i data-lucide="copy"></i> Copier tout</button><p role="status" aria-live="polite"></p>`;
    form.querySelector('.form-grid').after(section);
    mounted.set(prefix, { type, panel });
    document.getElementById(`${prefix}-archive`).addEventListener('change', event => {
      const item = archives.find(item => item.id === event.target.value);
      if (item) { set(prefix, { ...item, archiveId:item.id }); company.value = item.company; }
    });
    section.addEventListener('click', event => {
      const button = event.target.closest('[data-copy]'); if (!button) return;
      const data = get(prefix);
      copy(button.dataset.copy === 'all' ? Object.keys(fields).map(key => data[key]).filter(Boolean).join('\n\n') : data[button.dataset.copy], button);
    });
    document.getElementById(`${prefix}-imageUrl`).addEventListener('input', () => preview(prefix));
    document.getElementById(`${prefix}-preview`).addEventListener('error', event => event.target.hidden = true);
    window.lucide?.createIcons();
  }
  async function reload() {
    archives = await request('/api/archives');
    for (const prefix of mounted.keys()) options(prefix);
    return archives;
  }
  return { request, copy, get, set, mount, reload, options };
})();
