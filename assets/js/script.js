'use strict';
const page = document.body.dataset.page;
document.querySelector(`[data-nav="${page}"]`)?.setAttribute('aria-current', 'page');
const menu = document.querySelector('.menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); document.querySelector('nav').classList.toggle('open', open); });
const dialog = document.getElementById('stage-dialog');
let stageTrigger;
function openStage(trigger) { stageTrigger = trigger || document.activeElement; if (!dialog.open) dialog.showModal(); }
function closeStage() { dialog.close(); try { sessionStorage.setItem('aw-stage-seen', '1'); } catch {} stageTrigger?.focus(); }
document.querySelectorAll('[data-stage]').forEach(b => b.addEventListener('click', () => openStage(b)));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeStage));
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeStage(); } });
dialog.addEventListener('cancel', () => { try { sessionStorage.setItem('aw-stage-seen', '1'); } catch {} });
try { if (!sessionStorage.getItem('aw-stage-seen') && page === 'home') setTimeout(() => openStage(), 2200); } catch { if (page === 'home') setTimeout(() => openStage(), 2200); }
document.querySelector('.hero-copy, .page-intro')?.classList.add('reveal');
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold: .08}); document.querySelectorAll('.section,.project-detail,.cta,.stage-banner').forEach(el => { el.classList.add('reveal-on-scroll'); observer.observe(el); }); }
document.getElementById('contact-form')?.addEventListener('submit', e => { e.preventDefault(); const data = new FormData(e.currentTarget); const body = `Bonjour Antoine,\n\n${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`; const link = `mailto:wexsteenbezuantoine@gmail.com?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(body)}`; const status = document.getElementById('form-status'); status.replaceChildren(document.createTextNode('Votre email est préparé. Si votre messagerie ne s’ouvre pas, ')); const a = document.createElement('a'); a.href = link; a.textContent = 'cliquez ici'; status.append(a, document.createTextNode(' ou écrivez directement à wexsteenbezuantoine@gmail.com.')); window.location.href = link; });
let aiDraft=false,aiApproved=false;
const aiExamples={cyber:'Protéger ses comptes commence par quelques réflexes : utiliser un mot de passe unique, activer l’authentification à deux facteurs et maintenir ses appareils à jour. La sécurité numérique se construit au quotidien.',ia:'L’intelligence artificielle peut aider à explorer des idées et à rédiger. Ses réponses peuvent aussi contenir des erreurs : vérifier les sources et conserver un regard critique reste essentiel.',digital:'Comprendre l’informatique, c’est mieux préparer les générations à venir. Apprendre à créer, à protéger ses données et à questionner les outils numériques contribue à une utilisation éclairée.'};
function resetAI(){aiDraft=false;aiApproved=false;const approve=document.getElementById('ai-approve'),publish=document.getElementById('ai-publish');if(!approve)return;approve.disabled=true;publish.disabled=true;document.getElementById('ai-state').textContent='Paramètres modifiés · rédaction à relancer';}
document.getElementById('ai-topic')?.addEventListener('change',resetAI);document.getElementById('ai-network')?.addEventListener('change',resetAI);
document.getElementById('ai-generate')?.addEventListener('click',()=>{const topic=document.getElementById('ai-topic').value;const network=document.getElementById('ai-network').value;document.getElementById('ai-post-network').textContent='APERÇU / '+network.toUpperCase();document.getElementById('ai-copy').textContent=aiExamples[topic]+(network==='Instagram'?'\n\n#Numérique #Technologie #Apprendre':network==='Facebook'?'\n\nEt vous, quels réflexes avez-vous adoptés ?':'\n\nUn sujet à partager et à discuter avec nos équipes.');document.getElementById('ai-state').textContent='Brouillon simulé · validation requise';aiDraft=true;aiApproved=false;document.getElementById('ai-approve').disabled=false;document.getElementById('ai-publish').disabled=true;});
document.getElementById('ai-approve')?.addEventListener('click',()=>{if(!aiDraft)return;aiApproved=true;document.getElementById('ai-state').textContent='Brouillon validé · prêt pour la simulation';document.getElementById('ai-approve').disabled=true;document.getElementById('ai-publish').disabled=false;});
document.getElementById('ai-publish')?.addEventListener('click',()=>{if(!aiApproved)return;document.getElementById('ai-state').textContent='Publication simulée ✓ · rien n’a été envoyé aux réseaux sociaux';document.getElementById('ai-publish').disabled=true;});
/* Galerie du carnet de développement Simpson RolePlay. */
const galleryDialog = document.getElementById('project-gallery');
const galleryButtons = [...document.querySelectorAll('[data-gallery-image]')];
let galleryIndex = 0;
let galleryTrigger;
function renderGallery() {
 const figure = galleryButtons[galleryIndex].closest('figure');
 const original = figure.querySelector('img');
 const image = document.getElementById('gallery-image');
 image.src = original.src; image.alt = original.alt;
 document.getElementById('gallery-caption').textContent = `${galleryIndex + 1} / ${galleryButtons.length} · ${figure.querySelector('h4').textContent}`;
}
function navigateGallery(offset) { galleryIndex = (galleryIndex + offset + galleryButtons.length) % galleryButtons.length; renderGallery(); }
galleryButtons.forEach((button, index) => button.addEventListener('click', () => { galleryIndex = index; galleryTrigger = button; renderGallery(); galleryDialog.showModal(); }));
document.getElementById('gallery-close')?.addEventListener('click', () => galleryDialog.close());
document.getElementById('gallery-prev')?.addEventListener('click', () => navigateGallery(-1));
document.getElementById('gallery-next')?.addEventListener('click', () => navigateGallery(1));
galleryDialog?.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); navigateGallery(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); navigateGallery(1); } });
galleryDialog?.addEventListener('close', () => galleryTrigger?.focus());
galleryDialog?.addEventListener('click', event => { if (event.target !== galleryDialog) return; const rect = galleryDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) galleryDialog.close(); });
