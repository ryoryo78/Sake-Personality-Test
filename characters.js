'use strict';
const characters=['EADC','EADS','EAFC','EAFS','EPDC','EPDS','EPFC','EPFS','IADC','IADS','IAFC','IAFS','IPDC','IPDS','IPFC','IPFS'].map(code=>typeData[code]);
const rows=[9.75,19.58,29.84,40.34,51.12,62.01,73.14,84.03];
const heights=[9.4,9.8,10,10.2,10.4,10.5,10.5,10.8];
const detail=document.querySelector('#character-detail');
let activeCard;
characters.forEach(({code,name,personality:description,imageFileName},index)=>{
 const button=document.createElement('button');
 button.className='hotspot character-card';button.type='button';
 button.dataset.tone=(Math.floor(index/2)+index%2)%2===0?'pink':'green';
 const picture=document.createElement('span');picture.className='character-picture';
 const image=document.createElement('img');image.src='images/'+imageFileName;image.alt='';image.decoding='async';
 picture.append(image);
 const copy=document.createElement('span');copy.className='character-copy';
 const title=document.createElement('strong');title.textContent=name;
 const arrow=document.createElement('span');arrow.className='character-arrow';arrow.setAttribute('aria-hidden','true');
 const chevron=document.createElement('span');arrow.append(chevron);
 copy.append(title,arrow);button.append(picture,copy);
 button.style.left=index%2?'51.2%':'2.7%';button.style.top=rows[Math.floor(index/2)]+'%';button.style.height=heights[Math.floor(index/2)]+'%';
 button.setAttribute('aria-label',name+' 詳しく見る');
 button.addEventListener('click',()=>{
  const portrait=document.querySelector('#character-detail-image');
  portrait.src='images/'+imageFileName;portrait.alt=name+'のキャラクター';
  detail.querySelector('.start-link').href='result.html?type='+encodeURIComponent(code);
  activeCard=button;document.querySelector('#character-name').textContent=name;document.querySelector('#character-description').textContent=description;detail.showModal();
 });
 document.querySelector('#character-cards').append(button);
});
for(const selector of ['.close','.back'])document.querySelector(selector).addEventListener('click',()=>detail.close());
detail.addEventListener('close',()=>activeCard?.focus());

