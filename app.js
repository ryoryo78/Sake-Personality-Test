'use strict';
const panel = document.querySelector('#panel');
const content = document.querySelector('#panel-content');

let opener;
function detail(code) {
  const type=typeData[code];
  if(!type)return;
  opener=document.activeElement;
  content.replaceChildren();
  const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent='CHARACTERS';
  const image=document.createElement('img');image.className='detail-portrait';image.src='images/'+type.imageFileName;image.alt=type.name;
  const heading=document.createElement('h2');heading.id='panel-title';heading.textContent=type.name;heading.tabIndex=-1;
  const description=document.createElement('p');description.textContent=type.personality;
  const profile=document.createElement('a');profile.className='primary detail-profile';profile.href='result.html?type='+code;profile.textContent='詳しいタイプ紹介を見る';
  const all=document.createElement('a');all.className='back detail-profile';all.href='characters.html';all.textContent='タイプ一覧を見る';
  content.append(eyebrow,image,heading,description,profile,all);panel.showModal();heading.focus();
}
// Shuffle once per page load so each card keeps its matching details while reading.
const featuredTypes=Object.values(typeData);
for(let i=featuredTypes.length-1;i>0;i--){
 const j=Math.floor(Math.random()*(i+1));
 [featuredTypes[i],featuredTypes[j]]=[featuredTypes[j],featuredTypes[i]];
}
document.querySelectorAll('.characters [data-code]').forEach((button,index)=>{
 const type=featuredTypes[index];
 button.dataset.code=type.code;
 const summary=type.personality.split('。')[0]+'。';
 button.querySelector('strong').textContent=type.name;
 button.querySelector('.character-copy > span').textContent=summary;
 button.querySelector('img').src='images/'+type.imageFileName;
 button.setAttribute('aria-label',type.name+'。'+summary+'詳しく見る');
 button.addEventListener('click',()=>detail(type.code));
});
document.querySelector('.close').addEventListener('click',()=>panel.close());
panel.addEventListener('close',()=>opener?.focus());
panel.addEventListener('click',event=>{
 if(event.target===panel){const r=panel.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)panel.close();}
});

// One ordered reveal queue for features, followed by character cards.
const featureMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!featureMotion.matches && 'IntersectionObserver' in window) {
  const page = document.querySelector('.page');
  const masks = [25.7, 33, 40.3].map(top => {
    const mask = document.createElement('div');
    mask.className = 'feature-reveal-mask';
    mask.setAttribute('aria-hidden', 'true');
    mask.style.top = top + '%';
    const drawing = document.createElement('div');
    drawing.className = 'feature-slide-art';
    drawing.style.backgroundPosition = '0 -' + (top * 3) + 'cqw';
    drawing.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') mask.remove();
    });
    mask.append(drawing);
    page.append(mask);
    return mask;
  });
  const cards = [...document.querySelectorAll('.characters .character')];
  cards.forEach(card => card.classList.add('card-slide-ready'));
  const targets = [...masks, ...cards];
  let nextIndex = 0;
  let nextReveal = 0;
  const observer = new IntersectionObserver(entries => {
    const visibleIndices = entries.filter(entry => entry.isIntersecting)
      .map(entry => targets.indexOf(entry.target));
    const lastVisible = Math.max(-1, ...visibleIndices);
    // Include earlier cards even when a fast scroll skips over them.
    while (nextIndex <= lastVisible) {
      const target = targets[nextIndex];
      const now = performance.now();
      const delay = Math.max(0, nextReveal - now);
      const isFeature = nextIndex < masks.length;
      target.style.setProperty(isFeature ? '--reveal-delay' : '--card-delay', delay + 'ms');
      target.classList.add(isFeature ? 'is-revealed' : 'card-slide-visible');
      nextReveal = now + delay + 300;
      observer.unobserve(target);
      nextIndex++;
    }
  }, { threshold: .15 });
  targets.forEach(target => observer.observe(target));
  featureMotion.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      masks.forEach(mask => mask.remove());
      cards.forEach(card => card.classList.remove('card-slide-ready'));
    }
  });
}