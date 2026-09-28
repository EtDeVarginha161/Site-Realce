/* Realce V25 — camadas de texto/imagem com áreas e redimensionamento independente. */
(()=>{
const $=id=>document.getElementById(id);
window.REALCE_EXTRA_TEXTS=window.REALCE_EXTRA_TEXTS||[];
window.REALCE_IMAGE_LAYERS=window.REALCE_IMAGE_LAYERS||[];
const MAX_EXTRAS=5;
const MAX_IMAGES=5;
const fonts=[
 ['Arial','Arial, sans-serif'],['Georgia','Georgia, serif'],['Times New Roman',"'Times New Roman', serif"],
 ['Verdana','Verdana, sans-serif'],['Trebuchet MS',"'Trebuchet MS', sans-serif"],['Quintessential',"'Quintessential', cursive"],
 ['Grand Hotel',"'Grand Hotel', cursive"],['Shrikhand',"'Shrikhand', cursive"],['Lethal Slime',"'Lethal Slime', 'Creepster', fantasy"],
 ['Megadeth',"'Megadeth', sans-serif"],['Graffonti',"'graffonti .3d.drop.', 'Brush Script MT', cursive"],['Pork\'s',"'Porkys', 'Bowlby One SC', fantasy"]
];
const fontOptions=fonts.map(([name,value])=>`<option value="${value.replace(/"/g,'&quot;')}">${name}</option>`).join('');
const areas=window.Realce3D?.getAreas?.()||[{id:'front',label:'Frente'}];
const defaultArea=areas[0]?.id||'front';
function esc(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function areaOptions(selected=defaultArea){return areas.map(a=>`<option value="${esc(a.id)}"${a.id===selected?' selected':''}>${esc(a.label)}</option>`).join('')}
function focusArea(id){window.Realce3D?.focusArea?.(id)}

/* ---------- texto principal e textos extras ---------- */
function initPrimaryTextArea(){
 const sel=$('fraseArea'); if(!sel)return;
 sel.innerHTML=areaOptions(window.Realce3D?.getPrimaryTextArea?.()||defaultArea);
 sel.addEventListener('change',e=>{window.Realce3D?.setPrimaryTextArea?.(e.target.value);focusArea(e.target.value)});
}
function drawExtras(){
 const c=$('textosExtras');if(!c)return;
 c.innerHTML=window.REALCE_EXTRA_TEXTS.map((o,i)=>`<div class="texto-dinamico" data-i="${i}">
   <div class="texto-dinamico-topo"><strong>Texto ${i+2}</strong><button type="button" data-remove="${i}">Remover</button></div>
   <input class="input" data-k="text" value="${esc(o.text)}" placeholder="Digite outro texto">
   <div class="nome-personalizacao-controles">
     <label class="label">Fonte<select class="input fonte-personalizada" data-k="font">${fontOptions}</select></label>
     <label class="label">Área do produto<select class="input area-personalizacao" data-k="area">${areaOptions(o.area||defaultArea)}</select></label>
     <label class="label">Cor das letras <input type="color" data-k="color" value="${o.color}"></label>
     <label class="label">Posição horizontal <input type="range" data-k="x" min="-100" max="100" value="${o.x}"></label>
     <label class="label">Posição vertical <input type="range" data-k="y" min="-80" max="160" value="${o.y}"></label>
     <label class="label">Grossura da letra <input type="range" data-k="weight" min="300" max="900" step="100" value="${o.weight}"></label>
     <label class="label">Tamanho da letra <input type="range" data-k="size" min="12" max="48" value="${o.size}"></label>
   </div>
 </div>`).join('');
 c.querySelectorAll('.texto-dinamico').forEach((el,i)=>{const sel=el.querySelector('[data-k="font"]');if(sel)sel.value=window.REALCE_EXTRA_TEXTS[i].font;});
 const add=$('adicionarTexto');if(add){add.disabled=window.REALCE_EXTRA_TEXTS.length>=MAX_EXTRAS;add.textContent=add.disabled?'Limite de 5 textos extras atingido':'＋ Adicionar texto'}
}
$('fraseFonte')?.addEventListener('change',e=>{window.Realce3D?.setPrimaryFont?.(e.target.value)});
$('adicionarTexto')?.addEventListener('click',()=>{
 if(window.REALCE_EXTRA_TEXTS.length>=MAX_EXTRAS)return;
 window.REALCE_EXTRA_TEXTS.push({text:'',font:'Arial, sans-serif',color:'#0d5278',x:0,y:72+window.REALCE_EXTRA_TEXTS.length*28,weight:500,size:18,area:defaultArea});
 drawExtras();window.Realce3D?.render();
 setTimeout(()=>document.querySelector(`.texto-dinamico[data-i="${window.REALCE_EXTRA_TEXTS.length-1}"] input[data-k="text"]`)?.focus(),0);
});
$('textosExtras')?.addEventListener('input',e=>{
 const box=e.target.closest('.texto-dinamico');if(!box)return;const i=+box.dataset.i,k=e.target.dataset.k;if(!k)return;
 window.REALCE_EXTRA_TEXTS[i][k]=['x','y','weight','size'].includes(k)?+e.target.value:e.target.value;
 if(k==='font')window.Realce3D?.loadFont?.(e.target.value);else window.Realce3D?.render();
});
$('textosExtras')?.addEventListener('change',e=>{
 if(e.target.matches('[data-k="font"]'))e.target.dispatchEvent(new Event('input',{bubbles:true}));
 if(e.target.matches('[data-k="area"]')){const box=e.target.closest('.texto-dinamico');if(!box)return;const i=+box.dataset.i;window.REALCE_EXTRA_TEXTS[i].area=e.target.value;focusArea(e.target.value);window.Realce3D?.render()}
});
$('textosExtras')?.addEventListener('click',e=>{const i=e.target.dataset.remove;if(i===undefined)return;window.REALCE_EXTRA_TEXTS.splice(+i,1);drawExtras();window.Realce3D?.render()});

/* ---------- imagens: imagem principal + até 4 adicionais ---------- */
function ensurePrimaryImage(){
 if(!window.REALCE_IMAGE_LAYERS.length)window.REALCE_IMAGE_LAYERS.push({url:'',name:'',x:0,y:0,scale:1,area:defaultArea});
 const p=window.REALCE_IMAGE_LAYERS[0];
 if(!p.area)p.area=defaultArea;
 if(!Number.isFinite(+p.scale)||+p.scale<=0)p.scale=1;
 return p;
}
function syncImages(){window.Realce3D?.setImageLayers?.(window.REALCE_IMAGE_LAYERS)}
function initPrimaryImageControls(){
 const p=ensurePrimaryImage(),area=$('imagemArea'),x=$('imagemX'),y=$('imagemY'),scale=$('imagemEscala');
 if(area){area.innerHTML=areaOptions(p.area);area.value=p.area;area.addEventListener('change',e=>{p.area=e.target.value;syncImages();focusArea(p.area)})}
 if(x)x.addEventListener('input',e=>{p.x=+e.target.value||0;syncImages()});
 if(y)y.addEventListener('input',e=>{p.y=+e.target.value||0;syncImages()});
 if(scale){scale.value=Math.round((+p.scale||1)*100);scale.addEventListener('input',e=>{p.scale=Math.max(.25,Math.min(2,+e.target.value/100||1));syncImages()});}
 const input=$('arquivo');
 input?.addEventListener('change',()=>{const f=input.files?.[0];if(f)readImage(f,p,()=>syncImages())});
 $('uploadBox')?.addEventListener('drop',e=>{const f=e.dataTransfer?.files?.[0];if(f)readImage(f,p,()=>syncImages())});
}
function readImage(file,layer,done){
 if(!file)return;
 const allowed=['image/png','image/jpeg','image/svg+xml'];
 if(!allowed.includes(file.type))return;
 const r=new FileReader();
 r.onload=()=>{layer.url=r.result;layer.name=file.name;done?.()};
 r.readAsDataURL(file);
}
function drawExtraImages(){
 const c=$('imagensExtras');if(!c)return;
 const extras=window.REALCE_IMAGE_LAYERS.slice(1);
 c.innerHTML=extras.map((o,i)=>`<div class="imagem-dinamica" data-i="${i+1}">
   <div class="texto-dinamico-topo"><strong>Imagem ${i+2}</strong><button type="button" data-remove-image="${i+1}">Remover</button></div>
   <label class="upload upload-extra" for="arquivoExtra${i+1}"><span class="upload-icon">↥</span><strong>${o.name?esc(o.name):'Escolher imagem'}</strong><small>PNG, JPG, JPEG ou SVG</small></label>
   <input type="file" id="arquivoExtra${i+1}" data-file-image="${i+1}" accept=".png,.jpg,.jpeg,.svg" hidden>
   <div class="imagem-personalizacao-controles">
     <label class="label">Área do produto<select class="input area-personalizacao" data-image-k="area">${areaOptions(o.area||defaultArea)}</select></label>
     <label class="label">Posição horizontal <input type="range" data-image-k="x" min="-120" max="120" value="${o.x||0}"></label>
     <label class="label">Posição vertical <input type="range" data-image-k="y" min="-100" max="120" value="${o.y||0}"></label>
     <label class="label">Tamanho da imagem <input type="range" data-image-k="scale" min="25" max="200" value="${Math.round((+o.scale||1)*100)}"></label>
   </div>
 </div>`).join('');
 const add=$('adicionarImagem');if(add){add.disabled=window.REALCE_IMAGE_LAYERS.length>=MAX_IMAGES;add.textContent=add.disabled?'Limite de 5 imagens atingido':'＋ Adicionar outra imagem'}
}
$('adicionarImagem')?.addEventListener('click',()=>{
 ensurePrimaryImage(); if(window.REALCE_IMAGE_LAYERS.length>=MAX_IMAGES)return;
 window.REALCE_IMAGE_LAYERS.push({url:'',name:'',x:0,y:0,scale:1,area:defaultArea});drawExtraImages();syncImages();
});
$('imagensExtras')?.addEventListener('input',e=>{
 const box=e.target.closest('.imagem-dinamica');if(!box)return;const i=+box.dataset.i,k=e.target.dataset.imageK;if(!k)return;
 window.REALCE_IMAGE_LAYERS[i][k]=k==='scale'?Math.max(.25,Math.min(2,+e.target.value/100||1)):['x','y'].includes(k)?+e.target.value:e.target.value;syncImages();
});
$('imagensExtras')?.addEventListener('change',e=>{
 const box=e.target.closest('.imagem-dinamica');if(!box)return;const i=+box.dataset.i;
 if(e.target.matches('[data-file-image]')){const f=e.target.files?.[0];if(f)readImage(f,window.REALCE_IMAGE_LAYERS[i],()=>{drawExtraImages();syncImages()})}
 if(e.target.matches('[data-image-k="area"]')){window.REALCE_IMAGE_LAYERS[i].area=e.target.value;focusArea(e.target.value);syncImages()}
});
$('imagensExtras')?.addEventListener('click',e=>{const i=e.target.dataset.removeImage;if(i===undefined)return;window.REALCE_IMAGE_LAYERS.splice(+i,1);drawExtraImages();syncImages()});

/* ---------- opções específicas do produto ---------- */
const key=(new URLSearchParams(location.search).get('produto')||'camiseta').toLowerCase();
const fields=key.includes('camiseta')?[['Modelagem',['Tradicional','Baby look','Oversized']],['Tecido',['Algodão','Dry fit','Poliéster']]]:key.includes('caderno')?[['Tipo de capa',['Capa dura','Capa flexível']],['Acabamento',['Fosco','Brilho','Soft touch']]]:key.includes('garrafa')?[['Acabamento',['Fosco','Brilho','Metálico']],['Tipo de tampa',['Rosca','Esportiva']]]:key.includes('capa')?[['Acabamento',['Fosco','Brilho','Transparente']],['Proteção',['Padrão','Reforçada']]]:key.includes('ecobag')||key.includes('bolsa')?[['Material',['Algodão cru','Algodão colorido']],['Alça',['Curta','Longa']]]:key.includes('caneca')?[['Acabamento',['Branco brilhante','Fosco']],['Interior',['Branco','Colorido']]]:key.includes('almofada')?[['Tecido',['Poliéster','Veludo']],['Acabamento',['Com enchimento','Somente capa']]]:[['Acabamento',['Padrão','Premium']]];
const oc=$('opcoesEspecificasConteudo');if(oc)oc.innerHTML=fields.map(f=>`<label class="label">${f[0]}<select class="input opcao-produto" data-label="${f[0]}">${f[1].map(x=>`<option>${x}</option>`).join('')}</select></label>`).join('');

/* ---------- baixar a face que está sendo visualizada ---------- */
$('baixarPrevia')?.addEventListener('click',()=>{
 const svg=window.Realce3D?.getCurrentSvg?.()||window.Realce3D?.stage?.querySelector('svg');if(!svg)return alert('Prévia 3D ainda não disponível.');
 const clone=svg.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
 const data=new XMLSerializer().serializeToString(clone),blob=new Blob([data],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();
 img.onload=()=>{const c=document.createElement('canvas');c.width=1400;c.height=1040;const ctx=c.getContext('2d');ctx.fillStyle='#f4f8fa';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);const a=document.createElement('a');a.download='previa-realce-personalizacao.png';a.href=c.toDataURL('image/png',1);a.click()};img.src=url;
});

initPrimaryTextArea();
initPrimaryImageControls();
drawExtras();
drawExtraImages();
syncImages();
})();
