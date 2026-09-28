/* Realce V25 — visualizador 3D leve com camadas por área e escala de imagem. */
(()=>{
const viewer=document.getElementById('produto3dViewer'); if(!viewer)return;
const q=new URLSearchParams(location.search).get('produto')||'camiseta';
const key=q.toLowerCase();
const product=key.includes('caneca')?'mug':key.includes('garrafa')?'bottle':key.includes('camiseta')?'shirt':key.includes('almofada')?'pillow':key.includes('capa')?'phone':key.includes('caderno')?'notebook':key.includes('ecobag')?'ecobag':key.includes('bolsa')?'tote':'tote';
const areasByProduct={
 shirt:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Costas',face:'back',zone:'main'}],
 mug:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Verso',face:'back',zone:'main'},{id:'bottom',label:'Parte inferior',face:'front',zone:'bottom'}],
 bottle:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Verso',face:'back',zone:'main'}],
 phone:[{id:'phone-back',label:'Traseira da capa',face:'front',zone:'main'},{id:'phone-lower',label:'Parte inferior da traseira',face:'front',zone:'lower'}],
 notebook:[{id:'front',label:'Capa',face:'front',zone:'main'},{id:'back',label:'Contracapa',face:'back',zone:'main'}],
 ecobag:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Verso',face:'back',zone:'main'}],
 tote:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Verso',face:'back',zone:'main'}],
 pillow:[{id:'front',label:'Frente',face:'front',zone:'main'},{id:'back',label:'Verso',face:'back',zone:'main'}]
};
const areas=areasByProduct[product]||areasByProduct.tote;
const defaultArea=areas[0].id;
let color='#ffffff',detail='none',detailColor='#168bbd',yaw=-18,pitch=10,zoom=1;
let phrase='',phraseColor='#0d5278',phraseX=0,phraseY=35,phraseFont='Arial, sans-serif',phraseWeight=500,phraseSize=20,phraseArea=defaultArea;
window.REALCE_IMAGE_LAYERS=window.REALCE_IMAGE_LAYERS?.length?window.REALCE_IMAGE_LAYERS:[{url:'',name:'',x:0,y:0,scale:1,area:defaultArea}];
const stage=document.createElement('div');stage.className='produto3d-object';viewer.appendChild(stage);
const hint=document.createElement('div');hint.className='produto3d-hint';hint.textContent=window.matchMedia('(max-width:700px)').matches?'Arraste de lado para girar':'Arraste para girar · roda para zoom';viewer.appendChild(hint);

function shade(hex,n){let h=hex.replace('#','');if(h.length===3)h=[...h].map(x=>x+x).join('');let v=parseInt(h,16),r=(v>>16)+n,g=((v>>8)&255)+n,b=(v&255)+n;return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('')}
function cleanText(v){return String(v||'').replace(/[<>&]/g,'')}
function attr(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;')}
function areaInfo(id){return areas.find(a=>a.id===id)||areas[0]}
function pattern(){const c=detailColor;if(detail==='stripes')return `<pattern id="pat" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><rect width="8" height="28" fill="${c}" opacity=".72"/></pattern>`;if(detail==='dots')return `<pattern id="pat" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="5" fill="${c}" opacity=".76"/></pattern>`;if(detail==='waves')return `<pattern id="pat" width="60" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 Q15 0 30 15 T60 15" fill="none" stroke="${c}" stroke-width="4" opacity=".72"/></pattern>`;let glyph=detail==='flowers'?'✿':'❧';return `<pattern id="pat" width="54" height="54" patternUnits="userSpaceOnUse"><text x="10" y="34" font-size="26" fill="${c}">${glyph}</text></pattern>`}

function resolveZone(base,meta){
 if(meta.zone==='bottom'&&base.bottom)return {...base.bottom,zone:'bottom'};
 if(meta.zone==='lower')return {ix:base.ix,iy:base.iy+70,iw:base.iw,ih:Math.max(52,base.ih*.72),tx:base.tx,ty:base.ty+62,clip:base.clip,textScale:.86,zone:'lower'};
 return {...base,textScale:1,zone:'main'};
}
function imageMarkup(layer,zone){
 if(!layer?.url)return '';
 const clip=zone.clip?` clip-path="url(#${zone.clip})"`:'';
 const scale=Math.max(.25,Math.min(2,+layer.scale||1));
 const w=zone.iw*scale,h=zone.ih*scale;
 const x=zone.ix+(zone.iw-w)/2+(+layer.x||0);
 const y=zone.iy+(zone.ih-h)/2+(+layer.y||0);
 return `<image href="${attr(layer.url)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"${clip}/>`;
}
function textMarkup(o,zone){
 if(!o?.text)return '';
 const clip=zone.clip?` clip-path="url(#${zone.clip})"`:'';
 const fs=Math.max(8,(+o.size||18)*(zone.textScale||1));
 return `<text x="${zone.tx+(+o.x||0)}" y="${zone.ty+(+o.y||0)}" text-anchor="middle" font-size="${fs}" font-family="${attr(o.font||'Arial, sans-serif')}" font-weight="${+o.weight||500}" fill="${attr(o.color||'#0d5278')}"${clip}>${cleanText(o.text)}</text>`;
}
function design(face,base){
 const images=(window.REALCE_IMAGE_LAYERS||[]).map(layer=>({layer,meta:areaInfo(layer.area)})).filter(x=>x.meta.face===face&&x.layer.url).map(x=>imageMarkup(x.layer,resolveZone(base,x.meta))).join('');
 const textLayers=[{text:phrase,font:phraseFont,color:phraseColor,x:phraseX,y:phraseY,weight:phraseWeight,size:phraseSize,area:phraseArea},...(window.REALCE_EXTRA_TEXTS||[])];
 const texts=textLayers.map(layer=>({layer,meta:areaInfo(layer.area||defaultArea)})).filter(x=>x.meta.face===face&&x.layer.text).map(x=>textMarkup(x.layer,resolveZone(base,x.meta))).join('');
 return images+texts;
}
function detailFill(face){return face==='front'&&detail!=='none'?'url(#pat)':'transparent'}
function defsPattern(face){return face==='front'&&detail!=='none'?pattern():''}

function mug(face){
 const base={ix:292,iy:210,iw:116,ih:105,tx:350,ty:315,clip:'print',bottom:{ix:320,iy:365,iw:60,ih:34,tx:350,ty:370,clip:'bottomPrint',textScale:.58}};
 return `<svg viewBox="0 0 700 520"><defs>${defsPattern(face)}<linearGradient id="body" x1="0" x2="1"><stop stop-color="${shade(color,-28)}"/><stop offset=".2" stop-color="${color}"/><stop offset=".72" stop-color="${color}"/><stop offset="1" stop-color="${shade(color,-38)}"/></linearGradient><clipPath id="print"><path d="M205 145 Q350 120 495 145 L480 390 Q350 420 220 390Z"/></clipPath><clipPath id="bottomPrint"><ellipse cx="350" cy="390" rx="112" ry="24"/></clipPath></defs><ellipse cx="350" cy="420" rx="190" ry="28" fill="#132d39" opacity=".25"/><path d="M480 185 C610 160 625 350 500 360" fill="none" stroke="${shade(color,-32)}" stroke-width="58"/><path d="M490 205 C565 190 575 315 500 330" fill="none" stroke="#405965" stroke-width="20"/><path d="M205 145 Q350 120 495 145 L480 390 Q350 420 220 390Z" fill="url(#body)" stroke="#9db0b8" stroke-width="3"/><path d="M205 145 Q350 102 495 145 Q350 194 205 145Z" fill="${shade(color,-20)}" stroke="#b8c6cb" stroke-width="3"/><ellipse cx="350" cy="146" rx="118" ry="31" fill="#243b45"/><ellipse cx="350" cy="151" rx="98" ry="21" fill="#172a32"/><path d="M205 145 Q350 120 495 145 L480 390 Q350 420 220 390Z" fill="${detailFill(face)}" clip-path="url(#print)"/>${design(face,base)}<ellipse cx="350" cy="390" rx="130" ry="27" fill="${shade(color,-34)}" opacity=".28" pointer-events="none"/></svg>`;
}
function bottle(face){
 const base={ix:305,iy:215,iw:90,ih:95,tx:350,ty:310,clip:'print'};
 return `<svg viewBox="0 0 700 520"><defs>${defsPattern(face)}<linearGradient id="b" x1="0" x2="1"><stop stop-color="${shade(color,-35)}"/><stop offset=".25" stop-color="${color}"/><stop offset=".72" stop-color="${color}"/><stop offset="1" stop-color="${shade(color,-45)}"/></linearGradient><clipPath id="print"><rect x="275" y="150" width="150" height="245" rx="45"/></clipPath></defs><ellipse cx="350" cy="438" rx="100" ry="20" fill="#17303b" opacity=".25"/><rect x="270" y="130" width="160" height="285" rx="68" fill="url(#b)"/><path d="M300 130 L315 80 H385 L400 130" fill="${shade(color,-20)}"/><rect x="310" y="55" width="80" height="45" rx="10" fill="#aebbc0"/><rect x="275" y="150" width="150" height="245" rx="45" fill="${detailFill(face)}"/>${design(face,base)}<ellipse cx="350" cy="412" rx="66" ry="16" fill="${shade(color,-40)}"/></svg>`;
}
function phone(face){
 const base={ix:305,iy:220,iw:90,ih:100,tx:350,ty:320,clip:'print'};
 return `<svg viewBox="0 0 700 520"><defs>${defsPattern(face)}<linearGradient id="ph" x1="0" x2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${shade(color,-34)}"/></linearGradient><clipPath id="print"><rect x="270" y="82" width="160" height="356" rx="34"/></clipPath><mask id="phoneMask"><rect width="700" height="520" fill="black"/><rect x="270" y="82" width="160" height="356" rx="34" fill="white"/><rect x="286" y="101" width="67" height="82" rx="17" fill="black"/></mask></defs><ellipse cx="350" cy="462" rx="105" ry="20" fill="#17303b" opacity=".22"/><path d="M430 96 L449 108 L449 424 L430 438Z" fill="${shade(color,-46)}"/><rect x="270" y="82" width="160" height="356" rx="34" fill="url(#ph)" stroke="#8fa6b0" stroke-width="4" mask="url(#phoneMask)"/><rect x="270" y="82" width="160" height="356" rx="34" fill="${detailFill(face)}" mask="url(#phoneMask)"/><rect x="283" y="98" width="73" height="88" rx="20" fill="${shade(color,-22)}" stroke="#78909a" stroke-width="3"/><circle cx="305" cy="122" r="12" fill="#182a32"/><circle cx="335" cy="122" r="12" fill="#182a32"/><circle cx="305" cy="153" r="12" fill="#182a32"/><circle cx="337" cy="154" r="6" fill="#d5e0e4"/><circle cx="337" cy="154" r="3" fill="#879aa2"/>${design(face,base)}</svg>`;
}
function box(kind,face){
 let w=kind==='notebook'?250:kind==='pillow'?310:330,h=kind==='notebook'?350:kind==='pillow'?300:300,x=(700-w)/2,y=(500-h)/2;
 let extra=kind==='tote'||kind==='ecobag'?`<path d="M285 ${y+20} Q285 40 350 40 Q415 40 415 ${y+20}" fill="none" stroke="${shade(color,-20)}" stroke-width="18"/>`:'';
 const base={ix:x+w*.32,iy:y+h*.30,iw:w*.36,ih:h*.32,tx:x+w*.5,ty:y+h*.62,clip:'print'};
 return `<svg viewBox="0 0 700 520"><defs>${defsPattern(face)}<linearGradient id="bx"><stop stop-color="${color}"/><stop offset="1" stop-color="${shade(color,-30)}"/></linearGradient><clipPath id="print"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${kind==='pillow'?45:18}"/></clipPath></defs><ellipse cx="350" cy="${y+h+35}" rx="${w*.48}" ry="22" fill="#17303b" opacity=".22"/>${extra}<polygon points="${x+w},${y+18} ${x+w+38},${y+2} ${x+w+38},${y+h-16} ${x+w},${y+h}" fill="${shade(color,-38)}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${kind==='pillow'?45:18}" fill="url(#bx)" stroke="#91a7b0" stroke-width="3"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${kind==='pillow'?45:18}" fill="${detailFill(face)}"/>${design(face,base)}</svg>`;
}
function shirt(face){
 const base={ix:305,iy:190,iw:90,ih:105,tx:350,ty:295,clip:'print'};
 return `<svg viewBox="0 0 700 520"><defs>${defsPattern(face)}<linearGradient id="s"><stop stop-color="${color}"/><stop offset="1" stop-color="${shade(color,-28)}"/></linearGradient><clipPath id="print"><path d="M255 105 L300 75 Q350 110 400 75 L445 105 530 165 470 230 435 205 435 430 265 430 265 205 230 230 170 165Z"/></clipPath></defs><ellipse cx="350" cy="448" rx="155" ry="20" fill="#17303b" opacity=".22"/><path d="M255 105 L300 75 Q350 110 400 75 L445 105 530 165 470 230 435 205 435 430 265 430 265 205 230 230 170 165Z" fill="url(#s)" stroke="#9cafb6" stroke-width="3"/>${face==='front'?`<path d="M305 82 Q350 145 395 82" fill="none" stroke="${shade(color,-30)}" stroke-width="12"/>`:''}<path d="M255 105 L300 75 Q350 110 400 75 L445 105 530 165 470 230 435 205 435 430 265 430 265 205 230 230 170 165Z" fill="${detailFill(face)}" clip-path="url(#print)"/>${design(face,base)}</svg>`;
}
function productSvg(face='front'){return product==='mug'?mug(face):product==='bottle'?bottle(face):product==='shirt'?shirt(face):product==='phone'?phone(face):box(product,face)}
function render(){const front=productSvg('front'),back=productSvg('back');stage.innerHTML=`<div class="produto3d-face produto3d-face--front">${front}</div><div class="produto3d-face produto3d-face--back" aria-hidden="true">${back}</div>`;stage.style.transform=`perspective(900px) rotateX(${pitch}deg) rotateY(${yaw}deg) scale(${zoom})`}
function focusArea(id){const a=areaInfo(id);yaw=a.face==='back'?180:0;pitch=a.zone==='bottom'?38:8;zoom=1;render()}

let drag=false,lx=0,ly=0;
viewer.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;viewer.setPointerCapture(e.pointerId)});
viewer.addEventListener('pointermove',e=>{if(!drag)return;yaw+=(e.clientX-lx)*.45;pitch=Math.max(-60,Math.min(60,pitch-(e.clientY-ly)*.35));lx=e.clientX;ly=e.clientY;render()});
viewer.addEventListener('pointerup',()=>drag=false);viewer.addEventListener('pointercancel',()=>drag=false);
viewer.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.4,zoom+(e.deltaY<0?.07:-.07)));render()},{passive:false});
document.querySelectorAll('.cor').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.hex||'#fff';document.querySelectorAll('.cor').forEach(x=>x.classList.remove('active'));b.classList.add('active');const cp=document.getElementById('corLivre');if(cp)cp.value=color;const cv=document.getElementById('corLivreValor');if(cv)cv.textContent=color;render()}));
const corLivre=document.getElementById('corLivre');if(corLivre)corLivre.addEventListener('input',e=>{color=e.target.value;document.querySelectorAll('.cor').forEach(x=>x.classList.remove('active'));const cv=document.getElementById('corLivreValor');if(cv)cv.textContent=color;render()});
const frase=document.getElementById('frase');if(frase)frase.addEventListener('input',e=>{phrase=e.target.value;render()});
const fraseCor=document.getElementById('fraseCor');if(fraseCor)fraseCor.addEventListener('input',e=>{phraseColor=e.target.value;render()});
const frasePeso=document.getElementById('frasePeso');if(frasePeso)frasePeso.addEventListener('input',e=>{phraseWeight=Number(e.target.value)||500;render()});
const fraseXEl=document.getElementById('fraseX');if(fraseXEl)fraseXEl.addEventListener('input',e=>{phraseX=Number(e.target.value)||0;render()});
const fraseYEl=document.getElementById('fraseY');if(fraseYEl)fraseYEl.addEventListener('input',e=>{phraseY=Number(e.target.value)||0;render()});
const fraseTamanho=document.getElementById('fraseTamanho');if(fraseTamanho)fraseTamanho.addEventListener('input',e=>{phraseSize=Number(e.target.value)||20;render()});
const opts=document.getElementById('detalhes3dOpcoes');if(opts)opts.addEventListener('click',e=>{let b=e.target.closest('[data-detail]');if(!b)return;opts.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');detail=b.dataset.detail;render()});
const dc=document.getElementById('detalhe3dCor');if(dc)dc.addEventListener('input',e=>{detailColor=e.target.value;render()});
[['vistaFrente',0,8],['vistaLado',78,5],['vistaCostas',180,8],['centralizar3d',-18,10]].forEach(([id,y,p])=>{let b=document.getElementById(id);if(b)b.addEventListener('click',()=>{yaw=y;pitch=p;zoom=1;render()})});
async function ensureFont(font){if(!document.fonts)return;try{await document.fonts.load(`400 32px ${font}`,'Realce')}catch(_){}}
function setImageLayers(layers){const arr=layers||[];arr.forEach(o=>{o.area=o.area||defaultArea;o.x=+o.x||0;o.y=+o.y||0;o.scale=Math.max(.25,Math.min(2,+o.scale||1))});if(!arr.length)arr.push({url:'',name:'',x:0,y:0,scale:1,area:defaultArea});window.REALCE_IMAGE_LAYERS=arr;render()}
function getCurrentSvg(){const n=((yaw%360)+360)%360;return stage.querySelector(n>90&&n<270?'.produto3d-face--back svg':'.produto3d-face--front svg')}
window.Realce3D={
 render,stage,
 getAreas:()=>areas.map(a=>({id:a.id,label:a.label})),
 focusArea,
 setPrimaryFont:async(font)=>{phraseFont=font;await ensureFont(font);render()},
 loadFont:async(font)=>{await ensureFont(font);render()},
 setPrimaryTextArea:id=>{phraseArea=areaInfo(id).id;render()},
 getPrimaryTextArea:()=>phraseArea,
 setImageLayers,
 getCurrentSvg,
 getTexts:()=>[{text:phrase,font:phraseFont,color:phraseColor,x:phraseX,y:phraseY,weight:phraseWeight,size:phraseSize,area:phraseArea},...(window.REALCE_EXTRA_TEXTS||[])]
};
if(document.fonts?.ready)document.fonts.ready.then(render);
render();
})();
