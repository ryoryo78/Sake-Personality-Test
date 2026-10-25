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
 text('#sake-brand',sake.brandName.replace(' ','\n'));text('#sake-brewery',sake.brewery);text('#sake-description',sake.description);text('#sake-address',sake.address);text('#sake-access',sake.access);
 const productImages={"EPFC":"01_EPFC.jpg","EPFS":"02_EPFS.jpg","EPDC":"03_EPDC.jpg","EPDS":"04_EPDS.jpg","EAFC":"05_EAFC.jpg","EAFS":"06_EAFS.jpg","EADC":"07_EADC.jpg","EADS":"08_EADS.jpg","IPFC":"09_IPFC.jpg","IPFS":"10_IPFS.jpg","IPDC":"11_IPDC.jpg","IPDS":"12_IPDS.jpg","IAFC":"13_IAFC.jpg","IAFS":"14_IAFS.jpg","IADC":"15_IADC.jpg","IADS":"16_IADS.jpg"};
 const productImage=document.querySelector('#sake-image');productImage.dataset.src='assets/products/'+productImages[code];productImage.alt=sake.brandName+'の商品画像';
 document.querySelector('#sake-official').href=sake.officialUrl;
 document.querySelector('#sake-links').hidden=false;
 text('#sake-status','このタイプのおすすめ');
 const tags={"EPFC":["甘酸っぱい","ジューシー","地元の米と水"],"EPFS":["微発泡","フレッシュ","多彩な味わい"],"EPDC":["辛口","キレのよい後味","魚料理と"],"EPDS":["華やかな香り","すっきり","初めてにも"],"EAFC":["淡麗辛口","料理に合う","冷酒でも燗でも"],"EAFS":["フルーティ","華やかな香り","洋梨のよう"],"EADC":["お米のコク","やさしい酸味","自然栽培米"],"EADS":["繊細な香り","上品","やわらかな水"],"IPFC":["落ち着いた旨み","冷酒でも燗でも","寒造り"],"IPFS":["すっきり","クセが少ない","初めてにも"],"IPDC":["深い旨み","じっくり熟成","燗で楽しむ"],"IPDS":["酸味","複雑な旨み","自然派"],"IAFC":["穏やか","やさしい味わい","晩酌に"],"IAFS":["しっかりした酸","旨み","燗で楽しむ"],"IADC":["濃い旨み","酸味","チーズと"],"IADS":["甘酸っぱい","軽やか","低アルコール"]};
 const tagList=document.querySelector('#sake-tags');tagList.replaceChildren();
 for(const label of tags[code]){const item=document.createElement('li');item.textContent='#'+label;tagList.append(item);}
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
   const caption=document.createElement('p');caption.className='axis-value';const parts=axis.winnerLabel.split('・');for(const [partIndex,part] of parts.entries()){const line=document.createElement('span');line.textContent=part+(partIndex<parts.length-1?'・':'');caption.append(line);}
   card.append(label,ring,caption);document.querySelector('#axis-scores').append(card);
  }
 }else{
  text('#page-title','タイプ紹介');document.querySelector('#scores-panel').hidden=true;document.querySelector('#profile-note').hidden=false;
  text('.retry-link','診断をする');document.querySelector('.share-panel').hidden=true;document.querySelector('.characters-return-link').hidden=false;
 }
 shareUrl=new URL('result.html',location.href);shareUrl.searchParams.set('type',code);shareUrl=shareUrl.href;
 shareText='〼Me | 日本酒パーソナリティ診断「'+type.name+'（'+code+'）」';
 const intent=new URL('https://twitter.com/intent/tweet');intent.searchParams.set('text',shareText);intent.searchParams.set('url',xShareUrl);document.querySelector('#x-share').href=intent.href;document.querySelector('#x-compose').href=intent.href;
 document.title='Me｜'+(result?'診断結果':'タイプ紹介');
 document.querySelector('#loading').hidden=true;document.querySelector('#result-content').hidden=false;
 await revealResultContent();
 if(result)ensureSharedImage().catch(()=>{});
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
 await Promise.all(['assets/backgrounds/characters-design-182c57.svg','assets/backgrounds/design-clean-cta.png'].map(loadResultImage));
 document.documentElement.classList.add('result-background-ready');
 await resultPaint();
 await init();
}
startResult();
