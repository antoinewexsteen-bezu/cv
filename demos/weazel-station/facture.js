if(location.pathname.toLowerCase().includes('/public/')){const nativeFetch=window.fetch.bind(window);window.fetch=(url,options)=>nativeFetch(typeof url==='string'&&url.startsWith('/api/')?`api.php/${url.slice(5)}`:url,options);}
let products = [];
let discounts = [];
let lines = [];
let activeCategory='Tous';
let signatureData = '';
let currentInvoiceNumber = null;
const DRAFT_KEY='weazel-invoice-draft-v1';
const SIGNATURE_KEY='weazel-invoice-signature-v1';
const $ = (selector) => document.querySelector(selector);
const money = (value) => `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} $`;
const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
};
const frenchDate = (value) => {
  const [year,month,day] = value.split('-');
  return `${day}/${month}/${year}`;
};

function lineTotal(line) {if(line.product.volumePricing){const packs=Math.floor(line.quantity/5),remainder=line.quantity%5;return packs*8500000+remainder*2000000}return line.product.price*line.quantity}
function totals() {
  const subtotal = lines.reduce((sum,line) => sum + lineTotal(line), 0);
  const percent = Number($('#discount').value);
  const discount = subtotal * percent / 100;
  return { subtotal, percent, discount, total:subtotal-discount };
}
function saveDraft(){try{localStorage.setItem(DRAFT_KEY,JSON.stringify({clientName:$('#client-name').value,clientCompany:$('#client-company').value,invoiceDate:$('#invoice-date').value,paymentDate:$('#payment-date').value,paymentMethod:$('#payment-method').value,discount:$('#discount').value,lines:lines.map(line=>({productId:line.product.id,quantity:line.quantity}))}))}catch(error){console.warn('Brouillon non enregistré',error)}}
function restoreDraft(){try{const draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(!draft)return false;$('#client-name').value=draft.clientName||'';$('#client-company').value=draft.clientCompany||'';$('#invoice-date').value=draft.invoiceDate||localDate();$('#payment-date').value=draft.paymentDate||localDate();$('#payment-method').value=['Espèce','Facture personnel','Facture entreprise'].includes(draft.paymentMethod)?draft.paymentMethod:'Espèce';$('#discount').value=Math.max(0,Math.min(100,Number(draft.discount)||0));lines=(draft.lines||[]).map(saved=>({product:products.find(product=>product.id===saved.productId),quantity:Math.max(1,Number(saved.quantity)||1)})).filter(line=>line.product);return true}catch(error){localStorage.removeItem(DRAFT_KEY);return false}}
function renderSignature(){if(signatureData)$('#signature-preview').innerHTML=`<img src="${signatureData}" alt="Signature enregistrée">`;else $('#signature-preview').textContent='Aperçu de la signature'}
function restoreSignature(){try{signatureData=localStorage.getItem(SIGNATURE_KEY)||''}catch{signatureData=''}renderSignature()}
function saveSignature(){try{localStorage.setItem(SIGNATURE_KEY,signatureData);return localStorage.getItem(SIGNATURE_KEY)===signatureData}catch(error){console.warn('Signature non enregistrée',error);return false}}
function clearDraft(){lines=[];$('#invoice-form').reset();$('#invoice-date').value=localDate();$('#payment-date').value=localDate();$('#payment-method').value='Espèce';$('#discount').value=0;renderSignature();renderLines();localStorage.removeItem(DRAFT_KEY)}
function populateProducts() {const categories=['Tous',...new Set(products.map(product=>product.category))];$('#category-filters').innerHTML=categories.map(category=>`<button type="button" data-category="${category}" class="${category===activeCategory?'active':''}">${category}</button>`).join('');renderCatalog()}
function renderCatalog(){const search=$('#product-search').value.trim().toLocaleLowerCase('fr'),icons={Annonces:'A',Options:'+',Panneaux:'P',Articles:'R',Photos:'S',Vidéos:'V',Cartes:'C'};const visible=products.filter(product=>(activeCategory==='Tous'||product.category===activeCategory)&&product.name.toLocaleLowerCase('fr').includes(search));$('#product-catalog').innerHTML=visible.map(product=>`<article class="cashier-product"><div class="product-top"><i>${icons[product.category]||'W'}</i><span>${product.category}</span></div><strong>${product.name}</strong><div class="product-bottom"><b>${money(product.price)}</b><button type="button" data-add-product="${product.id}" aria-label="Ajouter ${product.name}">Ajouter</button></div>${product.volumePricing?'<small>Pack de 5 : 8 500 000 $</small>':''}</article>`).join('')||'<p class="empty-lines">Aucune prestation trouvée.</p>'}
function renderLines() {
  $('#line-list').innerHTML = lines.length ? lines.map((line,index) => `
    <div class="line-item"><div><strong>${line.product.name}</strong><small>${line.product.volumePricing&&line.quantity>=5?'Tarif pack appliqué':money(line.product.price)+' l’unité'}</small></div><div class="quantity-control"><button type="button" data-decrease="${index}">−</button><strong>${line.quantity}</strong><button type="button" data-increase="${index}">+</button></div><span class="line-price">${money(lineTotal(line))}</span><button class="remove-line" type="button" data-remove="${index}" aria-label="Retirer cet article">×</button></div>`).join('') : '<p class="empty-lines">Votre panier est vide. Ajoutez une prestation ci-dessus.</p>';
  const result = totals();
  $('#subtotal').textContent = money(result.subtotal);
  $('#discount-label').textContent = `Réduction (${result.percent} %)`;
  $('#discount-amount').textContent = `− ${money(result.discount)}`;
  $('#grand-total').textContent = money(result.total);
  saveDraft();
}
async function loadInvoiceNumber() {
  try {
    const response = await fetch('/api/invoices/next', { cache:'no-store' });
    const data = await response.json();
    currentInvoiceNumber = data.number;
    $('#invoice-number').textContent = `N° ${currentInvoiceNumber}`;
  } catch { $('#invoice-number').textContent = 'N° indisponible'; currentInvoiceNumber = null; }
}
async function loadProducts() {
  const response = await fetch('/api/products', { cache:'no-store' });
  const data = await response.json();
  products = data.products || [];
  discounts = data.discounts || [];
  $('#discount-preset').innerHTML = discounts.map((discount) => `<option value="${discount.percent}">${discount.label} · ${discount.percent} %</option>`).join('');
}
function loadImage(dataUrl) {
  return new Promise((resolve,reject) => { const image=new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=dataUrl; });
}
async function prepareSignature(dataUrl) {
  const image=await loadImage(dataUrl),maxWidth=700,maxHeight=260,ratio=Math.min(1,maxWidth/image.width,maxHeight/image.height);
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/png');
}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=2) {
  const words=text.split(' '); let line=''; let row=0;
  for (const word of words) {
    const test=line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line,x,y+row*lineHeight); line=word; row++; if(row>=maxLines-1) break; }
    else line=test;
  }
  ctx.fillText(line,x,y+row*lineHeight);
}
async function issueInvoiceNumber() {
  if (!currentInvoiceNumber) throw new Error('Le compteur de factures est indisponible. Rechargez la page.');
  const result = totals();
  const response = await fetch('/api/invoices/issue',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ expected:currentInvoiceNumber, clientName:$('#client-name').value, clientCompany:$('#client-company').value, total:result.total })});
  if(!response.ok) throw new Error('Numéro de facture indisponible.');
  return (await response.json()).number;
}
async function generateInvoice(number) {
  const W=1400,H=1980, canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H);
  const logo=await loadImage('weazel-news-logo.png'); ctx.drawImage(logo,70,55,430,220);
  ctx.fillStyle='#050505'; ctx.font='300 112px Arial'; ctx.fillText('Facture.',760,185);
  ctx.fillStyle='#626262'; ctx.font='25px Arial'; ctx.fillText('1 Bld Del Perro South, ROCKFORD HILLS',840,225);
  ctx.font='bold 31px Arial'; ctx.fillStyle='#090909';
  ctx.fillText('Client(s) :',150,405); ctx.fillText('Représentant l’entité :',150,505);
  ctx.fillText('Facture N°',720,405); ctx.fillText('Date',720,505);
  ctx.font='29px Arial'; ctx.fillText($('#client-name').value,150,450); ctx.fillText($('#client-company').value,150,550);
  ctx.fillText(String(number),720,450); ctx.fillText(frenchDate($('#invoice-date').value),720,550);
  const columns=[{x:150,label:'Produit'},{x:560,label:'Quantité'},{x:755,label:'Prix unitaire'},{x:1090,label:'Total'}];
  ctx.strokeStyle='#050505'; ctx.lineWidth=6; ctx.beginPath();ctx.moveTo(120,715);ctx.lineTo(1280,715);ctx.stroke();
  ctx.font='27px Arial'; columns.forEach(c=>ctx.fillText(c.label,c.x,700));
  let y=785; ctx.font='23px Arial';
  for(const line of lines) {
    wrapText(ctx,line.product.name,135,y,390,27,2); ctx.fillText(String(line.quantity),610,y);
    ctx.fillText(line.product.volumePricing&&line.quantity>=5?'Tarif pack':money(line.product.price),755,y); ctx.textAlign='right';ctx.fillText(money(lineTotal(line)),1260,y);ctx.textAlign='left'; y+=75;
  }
  const result=totals(); ctx.strokeStyle='#111';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(120,1320);ctx.lineTo(1280,1320);ctx.stroke();
  ctx.font='bold 29px Arial'; ctx.fillText('Sous-total',690,1380);ctx.textAlign='right';ctx.fillText(money(result.subtotal),1230,1380);
  ctx.textAlign='left';ctx.fillText(`Réduction (${result.percent} %)`,690,1425);ctx.textAlign='right';ctx.fillText(`− ${money(result.discount)}`,1230,1425);
  ctx.textAlign='left';ctx.font='bold 34px Arial';ctx.fillText('Total (en $)',690,1480);ctx.textAlign='right';ctx.fillText(money(result.total),1230,1480);
  ctx.textAlign='left';ctx.font='bold 27px Arial';ctx.fillText('Date de paiement',690,1530);ctx.font='26px Arial';ctx.fillText(frenchDate($('#payment-date').value),1000,1530);
  ctx.font='bold 27px Arial';ctx.fillText('Modalité de paiement',690,1580);ctx.font='25px Arial';ctx.fillText($('#payment-method').value,1000,1580);
  ctx.save();ctx.translate(660,1110);ctx.rotate(-Math.PI/4);ctx.globalAlpha=.13;ctx.fillStyle='#e1261c';ctx.font='80px Arial';ctx.fillText('FACTURE ACQUITTÉE',-300,0);ctx.restore();
  const signature=await loadImage(signatureData); const ratio=Math.min(260/signature.width,100/signature.height);ctx.drawImage(signature,900,1660,signature.width*ratio,signature.height*ratio);
  ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(880,1760);ctx.lineTo(1220,1760);ctx.stroke();
  ctx.fillStyle='#111';ctx.font='31px Arial';ctx.fillText('Merci de votre achat et de votre confiance !',145,1740);
  ctx.font='italic bold 14px Arial';ctx.textAlign='center';
  wrapText(ctx,'Weazel News vous informe que toute publication achetée reste soumise à l’actualité en cours ainsi qu’à la disponibilité de nos équipes. Le paiement garantit la réalisation du service, mais pas une date fixe de parution. En cas de non-publication immédiate, celle-ci sera automatiquement reportée. Aucun remboursement ne pourra être exigé.',700,1885,1180,18,3);
  ctx.drawImage(logo,1190,1810,150,85);
  return canvas;
}

$('#product-search').addEventListener('input',renderCatalog);
$('#category-filters').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;activeCategory=button.dataset.category;populateProducts()});
$('#product-catalog').addEventListener('click',event=>{const button=event.target.closest('[data-add-product]');if(!button)return;const product=products.find(item=>item.id===button.dataset.addProduct),existing=lines.find(line=>line.product.id===product.id);if(existing)existing.quantity+=1;else lines.push({product,quantity:1});renderLines()});
$('#line-list').addEventListener('click',event=>{const remove=event.target.closest('[data-remove]'),increase=event.target.closest('[data-increase]'),decrease=event.target.closest('[data-decrease]');if(remove)lines.splice(Number(remove.dataset.remove),1);else if(increase)lines[Number(increase.dataset.increase)].quantity+=1;else if(decrease){const line=lines[Number(decrease.dataset.decrease)];line.quantity-=1;if(line.quantity<=0)lines.splice(Number(decrease.dataset.decrease),1)}else return;renderLines()});
$('#discount').addEventListener('input',()=>{$('#discount').value=Math.max(0,Math.min(100,Number($('#discount').value)||0));renderLines()});
$('#discount-preset').addEventListener('change',()=>{$('#discount').value=$('#discount-preset').value;renderLines()});
['client-name','client-company','invoice-date','payment-date','payment-method'].forEach(id=>$('#'+id).addEventListener('input',saveDraft));
$('#signature').addEventListener('change',(event)=>{
  const file=event.target.files[0];if(!file)return;const reader=new FileReader();
  reader.onload=async()=>{const message=$('#form-message');message.textContent='';try{signatureData=await prepareSignature(reader.result);renderSignature();if(!saveSignature())message.textContent='Signature chargée, mais le navigateur ne peut pas la garder en mémoire.';}catch{message.textContent='Impossible de lire cette image de signature.';}};reader.readAsDataURL(file);
});
$('#invoice-form').addEventListener('submit',async(event)=>{
  event.preventDefault(); const message=$('#form-message'); message.textContent='';
  if(!lines.length){message.textContent='Ajoutez au moins un article.';return;}
  if(!signatureData){message.textContent='Ajoutez l’image de la signature du vendeur.';return;}
  const button=$('#download-invoice');button.disabled=true;button.textContent='Génération…';
  try {
    const number=await issueInvoiceNumber(); const canvas=await generateInvoice(number);
    const link=document.createElement('a');link.download=`FACTURE-WEAZEL-NEWS-${number}.png`;link.href=canvas.toDataURL('image/png');link.click();
    clearDraft();message.textContent=`Facture N° ${number} téléchargée.`;await loadInvoiceNumber();
  } catch(error){message.textContent=error.message||'La facture n’a pas pu être générée.';}
  finally{button.disabled=false;button.textContent='Télécharger la facture PNG';}
});
async function init(){await loadProducts();$('#invoice-date').value=localDate();$('#payment-date').value=localDate();restoreDraft();restoreSignature();populateProducts();renderLines();loadInvoiceNumber()}
init().catch(()=>{$('#form-message').textContent='Impossible de charger les produits.'});
