/* Portfolio adapter: all application requests stay in this browser. */
(() => {
 const key='aw-weazel-demo-v1';
 const monday=new Date();monday.setDate(monday.getDate()-((monday.getDay()+6)%7));monday.setHours(16,0,0,0);
 const initial={events:[{id:'demo-1',type:'announcement',company:'Studio Horizon',start:monday.toISOString(),status:'created',color:'#7399e6',title:'Une nouvelle adresse à découvrir',text:'Annonce fictive de démonstration.',imageUrl:''},{id:'demo-2',type:'announcement',company:'Garage Atlas',start:new Date(+monday+86400000+3600000).toISOString(),status:'programmed',color:'#78bcb4',title:'Portes ouvertes',text:'Présentation fictive du garage.',imageUrl:''}],archives:[{id:'archive-1',type:'announcement',company:'Studio Horizon',title:'Une nouvelle adresse à découvrir',subtitle:'Annonce de démonstration',text:'Studio Horizon vous accueille pour une présentation de ses activités. Contenu fictif pour le portfolio.',imageUrl:''}],invoice:10050};
 let state=initial;try{state=JSON.parse(sessionStorage.getItem(key))||initial}catch{}
 const save=()=>{try{sessionStorage.setItem(key,JSON.stringify(state))}catch{}};
 window.fetch=async(url,options={})=>{
  const raw=String(url);const path=raw.replace(/^https?:\/\/[^/]+/,'').split('?')[0];const method=(options.method||'GET').toUpperCase();let body={};try{body=typeof options.body==='string'?JSON.parse(options.body):(options.body||{})}catch{}
  let data={};let status=200;
  if(path==='/api/me') data={user:{username:'Visiteur du portfolio'},role:'viewer',owner:false};
  else if(path==='/api/events'||path.startsWith('/api/events/')){
   const id=decodeURIComponent(path.slice('/api/events/'.length));
   if(method==='GET') data=state.events;
   else if(method==='POST'){data={...body,id:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2)};state.events.push(data)}
   else if(method==='DELETE'){state.events=state.events.filter(e=>e.id!==id);data={ok:true}}
   else{const item=state.events.find(e=>e.id===id);if(item){Object.assign(item,body);data=item}else{status=404;data={error:'Élément de démonstration introuvable.'}}}save();
  }else if(path==='/api/archives'||path.startsWith('/api/archives/')){
   const id=decodeURIComponent(path.slice('/api/archives/'.length));
   if(method==='GET')data=state.archives;
   else if(method==='POST'){data={...body,id:'archive-'+Date.now()};state.archives.push(data)}
   else if(method==='DELETE'){state.archives=state.archives.filter(e=>e.id!==id);data={ok:true}}
   else {const item=state.archives.find(e=>e.id===id);if(item){Object.assign(item,body);data=item}else{status=404;data={error:'Archive introuvable.'}}}save();
  }else if(path==='/api/products')data={products:[{id:'p1',name:'Annonce publicitaire · démo',category:'Annonces',price:2000000},{id:'p2',name:'Article de presse · démo',category:'Articles',price:3500000},{id:'p3',name:'Shooting photo · démo',category:'Photos',price:1500000}],discounts:[{label:'Aucune remise',percent:0},{label:'Démonstration',percent:10}]};
  else if(path==='/api/invoices/next')data={number:state.invoice};
  else if(path==='/api/invoices/issue'){data={number:state.invoice++};save()}
  else {status=400;data={error:'Fonction externe désactivée dans la démonstration du portfolio.'}}
  return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 };
 window.EventSource=class{constructor(){setTimeout(()=>this.onopen?.(),0)}addEventListener(){}close(){}};
 document.addEventListener('DOMContentLoaded',()=>{
  const username=document.querySelector('[data-user-name]');if(username)username.textContent='Visiteur · démo';
  const logout=document.querySelector('[data-logout]');if(logout){logout.textContent='Réinitialiser la démo';logout.addEventListener('click',()=>{try{sessionStorage.removeItem(key)}catch{}location.reload()})}
  const nav=document.querySelector('.main-nav');if(nav&&!nav.querySelector('[href="archives.html"]')){const a=document.createElement('a');a.href='archives.html';a.textContent='Archives';nav.append(a)}
 });
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(/^https?:|^\/auth|^\/api|^mailto:/.test(href)){e.preventDefault();alert('Lien externe désactivé dans la démonstration du portfolio.')}});
})();
