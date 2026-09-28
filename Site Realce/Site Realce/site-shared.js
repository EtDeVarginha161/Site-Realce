(function(){
  const btn=document.getElementById('siteMenuToggle');
  const nav=document.getElementById('siteMobileNav');
  if(btn&&nav){
    btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false');}));
  }
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.site-desktop-nav a,.site-mobile-nav a').forEach(a=>{const href=(a.getAttribute('href')||'').split('#')[0].toLowerCase();if(href===current)a.classList.add('is-active');});
})();
