'use strict';
const statusText=document.querySelector('#share-status');
let shareUrl,shareText,toastTimer;
const xShareUrl=new URL('./',location.href).href;
const shareTitle='Me｜日本酒タイプ診断';
function notify(text){clearTimeout(toastTimer);statusText.textContent=text;toastTimer=setTimeout(()=>{statusText.textContent='';},4000);}

function text(selector,value){document.querySelector(selector).textContent=value;}
function showEmpty(message){document.documentElement.classList.remove('result-loading');document.querySelector('#loading').hidden=true;document.querySelector('#empty').hidden=false;if(message)text('#empty-message',message);}
async function render(code,result){
 const type=typeData[code],sake=sakeRecommendation[code];
 text('#type-code',code+' タイプ');text('#type-name',type.name);
 text('#type-summary',result?result.axes.map(axis=>axis.winnerLabel.split('・')[0]).join(' × '):'あなたの日常を彩る、日本酒パーソナリティ');
 const image=document.querySelector('#character-image');image.dataset.src='images/'+type.imageFileName;image.alt=type.name+'のキャラクター';
 text('#personality-text',type.personality);text('#food-text',type.foodPreference);
 for(const food of type.favoriteFoods){const li=document.createElement('li');li.textContent=food;document.querySelector('#favorite-foods').append(li);}
 text('#sake-brand',sake.brandName);text('#sake-brewery',sake.brewery);text('#sake-area',sake.area);document.querySelector('#sake-area').hidden=code==='EPDS';
 document.querySelector('#sake-links').hidden=code!=='EPDS';
 text('#sake-status',code==='EPDS'?'このタイプのおすすめ':'銘柄は選定中です');
 if(result){
  for(const [index,axis] of result.axes.entries()){
   const card=document.createElement('div');
   card.className='axis-score';
   const label=document.createElement('span');label.className='axis-label';label.textContent=axis.label;
   const ring=document.createElement('div');ring.className='ring';ring.style.setProperty('--percent',axis.percent);if(index%2)ring.style.setProperty('--ring-color','#77c879');
   const center=document.createElement('div');center.className='ring-center';
   const percent=document.createElement('strong');percent.textContent=axis.percent+'%';
   const winner=document.createElement('small');winner.textContent=axis.winner;
   center.append(percent,winner);ring.append(center);
   const caption=document.createElement('p');caption.className='axis-value';caption.textContent=axis.winnerLabel;
   const icon=document.createElement('span');icon.className='score-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="'+['96 680 45 45','259 680 45 45','425 680 45 45','584 680 45 45'][index]+'"><image data-src="result-design.png" width="724" height="2172"/></svg>';
   card.append(icon,label,ring,caption);document.querySelector('#axis-scores').append(card);
  }
 }else{
  text('#page-title','タイプ紹介');document.querySelector('#scores-panel').hidden=true;document.querySelector('#profile-note').hidden=false;
 }
 shareUrl=new URL('result.html',location.href);shareUrl.searchParams.set('type',code);shareUrl=shareUrl.href;
 shareText='〼Me | 日本酒パーソナリティ診断「'+type.name+'（'+code+'）」';
 const intent=new URL('https://twitter.com/intent/tweet');intent.searchParams.set('text',shareText);intent.searchParams.set('url',xShareUrl);document.querySelector('#x-share').href=intent.href;document.querySelector('#x-compose').href=intent.href;
 document.title='Me｜'+(result?'診断結果':'タイプ紹介');
 document.querySelector('#loading').hidden=true;document.querySelector('#result-content').hidden=false;
 await revealResultContent();
 ensureSharedImage().catch(()=>{});
}
async function init(){
 const code=new URLSearchParams(location.search).get('type');
 if(code!==null){if(Object.hasOwn(typeData,code))await render(code,null);else showEmpty('このタイプは見つかりませんでした。診断からお試しください。');return;}
 try{
  const raw=sessionStorage.getItem('me-diagnosis-answers-v1');if(!raw){showEmpty();return;}
  const response=await fetch('data/questions.json');if(!response.ok)throw new Error('Questions unavailable');
  const result=DiagnosisScoring.calculate(await response.json(),JSON.parse(raw));
  if(!Object.hasOwn(typeData,result.type))throw new Error('Unknown type');
  await render(result.type,result);
 }catch{showEmpty('結果を読み込めませんでした。ページを再読み込みするか、診断からもう一度お試しください。');}
}
let sharedImageFile, sharedImageUrl, sharedImagePromise, sharing=false;
function ensureSharedImage(){
 if(sharedImageFile)return Promise.resolve();
 if(!sharedImagePromise)sharedImagePromise=prepareSharedImage().catch(error=>{sharedImagePromise=null;throw error;});
 return sharedImagePromise;
}
const instagramDialog=document.querySelector('#instagram-dialog');
const instagramStatus=document.querySelector('#instagram-status');
async function prepareSharedImage(){
 const image=document.querySelector('#character-image');
 await image.decode();
 if(document.fonts)await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#BDE0D8';ctx.fillRect(0,0,1080,1080);
 ctx.fillStyle='#fff';ctx.fillRect(40,40,1000,1000);
 ctx.textAlign='center';ctx.fillStyle='#182C57';ctx.font='700 42px "Zen Maru Gothic",sans-serif';
 ctx.fillText('〼Me | 日本酒パーソナリティ診断',540,125,900);
 ctx.fillStyle='#e65d95';ctx.font='700 48px "Zen Maru Gothic",sans-serif';
 ctx.fillText(document.querySelector('#type-code').textContent,540,215);
 const scale=Math.min(650/image.naturalWidth,530/image.naturalHeight);
 const w=image.naturalWidth*scale,h=image.naturalHeight*scale;
 ctx.drawImage(image,(1080-w)/2,260+(530-h)/2,w,h);
 ctx.fillStyle='#182C57';ctx.font='700 52px "Zen Maru Gothic",sans-serif';
 ctx.fillText(document.querySelector('#type-name').textContent,540,875,900);
 ctx.font='28px "Zen Maru Gothic",sans-serif';ctx.fillText('あなたに合う一杯、きっと見つかる。',540,970);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Image unavailable')),'image/png'));
 sharedImageFile=new File([blob],'me-'+new URL(shareUrl).searchParams.get('type')+'.png',{type:'image/png'});
 sharedImageUrl=URL.createObjectURL(blob);
 for(const network of ['instagram','x']){
  const preview=document.querySelector('#'+network+'-preview');preview.src=sharedImageUrl;preview.hidden=false;
  const download=document.querySelector('#'+network+'-download');download.href=sharedImageUrl;download.download=sharedImageFile.name;download.hidden=false;
  document.querySelector('#'+network+'-native').hidden=!(navigator.share&&navigator.canShare&&navigator.canShare({files:[sharedImageFile]}));
 }
}
function showShareFallback(network,message){
 if(network==='instagram')document.querySelector('#instagram-caption').value=shareText+'\n'+shareUrl+'\n#Me診断 #日本酒';
 document.querySelector('#'+network+'-status').textContent=message;
 const dialog=document.querySelector('#'+network+'-dialog');
 if(!dialog.open)dialog.showModal();
}
async function shareDirect(network){
 if(sharing)return;
 sharing=true;
 try{
  if(!sharedImageFile){notify('共有画像を準備しています…');await ensureSharedImage();}
  const data=network==='x'?{files:[sharedImageFile],text:shareText,url:xShareUrl}:{files:[sharedImageFile]};
  if(!navigator.share||!navigator.canShare||!navigator.canShare({files:[sharedImageFile]})){
   showShareFallback(network,'この端末では画像を直接共有できません。画像を保存して投稿してください。');return;
  }
  clearTimeout(toastTimer);statusText.textContent='';
  await navigator.share(data);
 }catch(error){
  if(error.name!=='AbortError')showShareFallback(network,sharedImageFile?'共有メニューを開けませんでした。下の共有ボタンをもう一度押すか、画像を保存して投稿してください。':'画像を準備できませんでした。もう一度共有ボタンを押してください。');
 }finally{
  clearTimeout(toastTimer);statusText.textContent='';sharing=false;
 }
}
for(const network of ['x','instagram']){
 document.querySelector('#'+network+'-share').addEventListener('click',event=>{event.preventDefault();return shareDirect(network);});
 document.querySelector('#'+network+'-native').addEventListener('click',()=>shareDirect(network));
}

document.querySelector('#instagram-copy').addEventListener('click',async()=>{
 const caption=document.querySelector('#instagram-caption');
 try{await navigator.clipboard.writeText(caption.value);instagramStatus.textContent='投稿文をコピーしました。Instagramに貼り付けてください。';}
 catch{caption.focus();caption.select();instagramStatus.textContent='投稿文を選択しました。コピーしてInstagramに貼り付けてください。';}
});

document.querySelectorAll('.read-more').forEach(button=>button.addEventListener('click',()=>{
 const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));document.getElementById(button.getAttribute('aria-controls')).classList.toggle('expanded',open);button.textContent=open?'閉じる':'続きを読む';
}));
// Background resources are decoded before any content image requests begin.
const resultImageLoads=new Map();
function loadResultImage(src){
 if(!resultImageLoads.has(src)){
  const image=new Image();
  image.src=src;
  resultImageLoads.set(src,image.decode().catch(()=>{}));
 }
 return resultImageLoads.get(src);
}
const resultPaint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
async function revealResultContent(){
 for(const section of document.querySelector('#result-content').children){
  if(section.hidden)continue;
  for(const image of section.querySelectorAll('[data-src]')){
   const src=image.dataset.src;
   if(image.tagName.toLowerCase()==='img'){
    image.src=src;
    try{await image.decode();}catch{}
   }else{
    await loadResultImage(src);
    image.setAttribute('href',src);
   }
  }
  section.classList.add('result-section-ready');
  await resultPaint();
 }
 document.documentElement.classList.remove('result-loading');
}
async function startResult(){
 await Promise.all(['characters-design-182c57.svg','design-clean-cta.png'].map(loadResultImage));
 document.documentElement.classList.add('result-background-ready');
 await resultPaint();
 await init();
}
startResult();
