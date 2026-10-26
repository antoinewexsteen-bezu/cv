const archivePanels = { panoramique:'Building panoramique', 'zone-industrielle':'Magasins Populaires', 'batiment-construction':'Bâtiment en Construction', 'parking-rouge':'Parking Rouge' };
const el = id => document.getElementById(id);
let archiveItems = [], archiveType = 'announcement', archivePanel = 'panoramique', uploading = false;
const safe = value => { const span = document.createElement('span'); span.textContent = value || ''; return span.innerHTML; };
function imageLink(value) { try { const url = new URL(value); return url.protocol === 'https:' && ['i.ibb.co','ibb.co','imgbb.com'].includes(url.hostname) ? url.href : ''; } catch { return ''; } }
function drawArchives() {
  el('archive-panels').hidden = archiveType !== 'panel';
  document.querySelectorAll('[data-type]').forEach(button => button.setAttribute('aria-selected', button.dataset.type === archiveType));
  document.querySelectorAll('[data-panel]').forEach(button => button.setAttribute('aria-selected', button.dataset.panel === archivePanel));
  const query = el('archive-search').value.toLocaleLowerCase('fr');
  const filtered = archiveItems.filter(item => item.type === archiveType && (archiveType !== 'panel' || item.panel === archivePanel) && `${item.company} ${item.title} ${item.subtitle}`.toLocaleLowerCase('fr').includes(query));
  el('archive-count').textContent = `${filtered.length} archive${filtered.length === 1 ? '' : 's'}`;
  const companies = [...new Set(filtered.map(item => item.company))].sort((a,b) => a.localeCompare(b, 'fr'));
  el('archive-list').innerHTML = companies.length ? companies.map(company => `<section class="archive-company"><h2>${safe(company)}</h2>${filtered.filter(item => item.company === company).map(item => {
    const url = imageLink(item.imageUrl), direct = url && new URL(url).hostname === 'i.ibb.co';
    return `<article class="archive-item" data-id="${safe(item.id)}">${direct ? `<img src="${safe(url)}" alt="${safe(item.title)}" loading="lazy">` : '<div></div>'}<div><h3>${safe(item.title)}</h3><p>${safe(item.subtitle)}</p><p>${safe(item.text)}</p>${url ? `<a href="${safe(url)}" target="_blank" rel="noopener noreferrer">${safe(url)}</a>` : ''}</div><div class="archive-item-actions"><button type="button" class="icon-button" data-action="copy" title="Copier tout" aria-label="Copier tout"><i data-lucide="copy"></i></button><button type="button" class="icon-button" data-action="edit" title="Modifier" aria-label="Modifier"><i data-lucide="pencil"></i></button></div></article>`;
  }).join('')}</section>`).join('') : '<p>Aucune archive dans cette catégorie.</p>';
  window.lucide?.createIcons();
}
async function loadArchives() { try { archiveItems = await PublicationContent.reload(); el('archive-error').textContent = ''; drawArchives(); } catch (error) { el('archive-error').textContent = error.message; } }
function updateArchiveCategory() { el('archive-panel-field').hidden = el('archive-type').value !== 'panel'; }
function showImage() { const url = imageLink(el('archive-imageUrl').value), preview = el('archive-image-preview'); preview.hidden = !url || new URL(url).hostname !== 'i.ibb.co'; if (!preview.hidden) preview.src = url; else preview.removeAttribute('src'); }
function openArchive(item) {
  el('archive-form').reset(); el('archive-id').value = item?.id || '';
  el('archive-type').value = item?.type || archiveType; el('archive-panel').value = item?.panel || archivePanel;
  for (const key of ['company','title','subtitle','text','imageUrl']) el(`archive-${key}`).value = item?.[key] || '';
  el('archive-form-error').textContent = ''; el('upload-status').textContent = ''; el('delete-archive').hidden = !item;
  el('archive-modal-title').textContent = item ? 'Modifier l’archive' : 'Nouvelle archive';
  updateArchiveCategory(); showImage(); el('archive-modal').showModal();
}
for (const [key,label] of Object.entries(archivePanels)) {
  const button = document.createElement('button'); button.type = 'button'; button.dataset.panel = key; button.textContent = label; button.setAttribute('role','tab');
  button.addEventListener('click', () => { archivePanel = key; drawArchives(); }); el('archive-panels').append(button);
  el('archive-panel').add(new Option(label, key));
}
document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => { archiveType = button.dataset.type; drawArchives(); }));
el('archive-search').addEventListener('input', drawArchives);
el('new-archive').addEventListener('click', () => openArchive());
el('archive-type').addEventListener('change', updateArchiveCategory);
el('archive-imageUrl').addEventListener('input', showImage);
el('archive-image-preview').addEventListener('error', event => event.target.hidden = true);
document.querySelectorAll('.archive-close').forEach(button => button.addEventListener('click', () => { if (!uploading) el('archive-modal').close(); }));
el('archive-modal').addEventListener('cancel', event => { if (uploading) event.preventDefault(); });
el('archive-list').addEventListener('click', event => {
  const button = event.target.closest('[data-action]'); if (!button) return;
  const item = archiveItems.find(item => item.id === button.closest('[data-id]').dataset.id); if (!item) return;
  if (button.dataset.action === 'edit') openArchive(item);
  else PublicationContent.copy([item.title,item.subtitle,item.text,item.imageUrl].filter(Boolean).join('\n\n'), button).then(ok => { el('archive-status').textContent = ok ? 'Contenu copié.' : 'Copie impossible.'; });
});
el('archive-file').addEventListener('change', async () => {
  const file = el('archive-file').files[0]; if (!file) return;
  if (!['image/jpeg','image/png','image/gif','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { el('upload-status').textContent = 'Choisissez une image JPG, PNG, GIF ou WebP de 10 Mo maximum.'; return; }
  uploading = true; el('archive-form').querySelector('[type=submit]').disabled = true; el('delete-archive').disabled = true; el('archive-file').disabled = true; el('upload-status').textContent = 'Envoi de l’image…';
  try {
    const response = await fetch('/api/images/upload', { method:'POST', headers:{ 'content-type':file.type }, body:file });
    const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Envoi impossible.');
    el('archive-imageUrl').value = result.imageUrl; showImage(); el('upload-status').textContent = 'Image envoyée.';
  } catch (error) { el('upload-status').textContent = error.message; }
  finally { uploading = false; el('archive-form').querySelector('[type=submit]').disabled = false; el('delete-archive').disabled = false; el('archive-file').disabled = false; el('archive-file').value = ''; }
});
el('archive-form').addEventListener('submit', async event => {
  event.preventDefault(); if (uploading) return;
  const id = el('archive-id').value, button = el('archive-form').querySelector('[type=submit]');
  const body = { type:el('archive-type').value, panel:el('archive-panel').value };
  for (const key of ['company','title','subtitle','text','imageUrl']) body[key] = el(`archive-${key}`).value;
  button.disabled = true;
  try { await PublicationContent.request(id ? `/api/archives/${encodeURIComponent(id)}` : '/api/archives', { method:id ? 'PUT' : 'POST', body }); el('archive-modal').close(); await loadArchives(); }
  catch (error) { el('archive-form-error').textContent = error.message; }
  finally { button.disabled = false; }
});
el('delete-archive').addEventListener('click', async () => {
  if (uploading || !confirm('Supprimer cette archive ? Les créneaux existants conservent leur contenu.')) return;
  try { await PublicationContent.request(`/api/archives/${encodeURIComponent(el('archive-id').value)}`, { method:'DELETE' }); el('archive-modal').close(); await loadArchives(); }
  catch (error) { el('archive-form-error').textContent = error.message; }
});
const archiveStream = new EventSource('/api/stream'); archiveStream.addEventListener('update', loadArchives);
loadArchives();
