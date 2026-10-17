'use strict';
(() => {
  const routes=[['index.html','トップページ'],['diagnosis.html','診断する'],['result.html','診断結果'],['characters.html','キャラクター一覧']];
  const current=location.pathname.split('/').filter(Boolean).pop()||'index.html';
  const frame=document.createElement('div');frame.className='site-navigation';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='site-menu-toggle';toggle.setAttribute('aria-label','メニューを開く');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','site-menu');
  toggle.innerHTML='<span></span><span></span><span></span>';
  const nav=document.createElement('nav');nav.id='site-menu';nav.className='site-menu';nav.hidden=true;nav.setAttribute('aria-label','ページ間の移動');
  for(const [href,label]of routes){const link=document.createElement('a');link.href=href;link.textContent=label;if(current.replace(/\.html$/,'')===href.replace(/\.html$/,''))link.setAttribute('aria-current','page');nav.append(link);}
  frame.append(toggle,nav);document.body.append(frame);
  function close(restoreFocus=false){nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','メニューを開く');if(restoreFocus)toggle.focus();}
  toggle.addEventListener('click',()=>{if(!nav.hidden){close();return;}nav.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','メニューを閉じる');});
  document.addEventListener('click',event=>{if(!frame.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!nav.hidden){event.preventDefault();close(true);}});
  frame.addEventListener('focusout',event=>{if(event.relatedTarget&&!frame.contains(event.relatedTarget))close();});
  window.addEventListener('pageshow',()=>close());
})();
