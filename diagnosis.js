'use strict';
const form=document.querySelector('#diagnosis');
const groups=[...form.querySelectorAll('.question')];
const total=groups.length;
const progress=document.querySelector('.progress');
const feedback=document.querySelector('#feedback');
const answerKey='me-diagnosis-answers-v1';
const answerValues=['agree','somewhat_agree','somewhat_disagree','disagree'];
const answers=Object.create(null);
const hasAnswer=group=>answerValues.includes(answers[group.dataset.questionId]);
function updateProgress(){
 const count=groups.filter(hasAnswer).length;
 progress.setAttribute('aria-valuenow',count);
 progress.setAttribute('aria-valuetext',count+' / '+total+'問 回答済み');
 progress.firstElementChild.style.width=(count/total*100)+'%';
 document.querySelector('#progress-text').textContent=count+' / '+total+'問 回答済み';
 groups.forEach(group=>{if(hasAnswer(group))group.querySelector('.question-error').textContent='';});
 feedback.textContent='';
}
form.addEventListener('change',updateProgress);
window.addEventListener('pageshow',updateProgress);
form.addEventListener('submit',event=>{
 event.preventDefault();
 const missing=groups.find(group=>!hasAnswer(group));
 if(missing){
  const message='回答を選択してください！';
  missing.querySelector('.question-error').textContent=message;feedback.textContent=message;
  missing.querySelector('.answer-slider').focus({preventScroll:true});missing.scrollIntoView({behavior:'smooth',block:'center'});return;
 }
 try { sessionStorage.setItem(answerKey,JSON.stringify(answers)); }
 catch { feedback.textContent='回答を一時保存できませんでした。ブラウザーのストレージ設定を確認して、もう一度お試しください。';return; }
 window.location.assign('result.html');
});
try {
 if(new URLSearchParams(location.search).has('restart')){
  sessionStorage.removeItem(answerKey);history.replaceState(null,'',location.pathname);
 } else {
  const saved=JSON.parse(sessionStorage.getItem(answerKey)||'null');
  if(saved && typeof saved==='object')for(const group of groups){
   const id=group.dataset.questionId;
   if(answerValues.includes(saved[id]))answers[id]=saved[id];
  }
 }
} catch { /* Answering remains available if session storage cannot be read. */ }
const sliderLabels=['当てはまる','やや当てはまる','あまり当てはまらない','当てはまらない'];
for(const group of groups){

 const control=document.createElement('div');control.className='slider-control';
 const range=document.createElement('input');range.type='range';range.className='answer-slider';range.min='0';range.max='3';range.step='any';range.value='1.5';
 const legend=group.querySelector('legend');legend.id=group.id+'-label';range.setAttribute('aria-labelledby',legend.id);
 const stops=document.createElement('div');stops.className='slider-stops';
 sliderLabels.forEach((label,index)=>{const text=document.createElement('span');text.textContent=(index===0||index===3)?label:(index===1?'←':'→');if(index===1||index===2)text.setAttribute('aria-hidden','true');stops.append(text);});
 function sync(){const index=answerValues.indexOf(answers[group.dataset.questionId]);control.classList.toggle('unanswered',index<0);range.step=index<0?'any':'1';range.value=String(index<0?1.5:index);range.style.setProperty('--thumb-color',(index<0?groups.indexOf(group)%2===1:index>=2)?'#529b47':'#e65d95');range.setAttribute('aria-valuetext',index<0?'未回答':sliderLabels[index]);}
 function choose(index){if(!Number.isInteger(index)||index<0||index>=answerValues.length)return;answers[group.dataset.questionId]=answerValues[index];sync();updateProgress();}
 range.addEventListener('input',()=>choose(Math.round(Number(range.value))));
 range.addEventListener('pointerup',()=>choose(Math.round(Number(range.value))));
 range.addEventListener('keyup',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End',' '].includes(event.key))choose(Math.round(Number(range.value)));});
 window.addEventListener('pageshow',sync);
 control.append(range,stops);group.insertBefore(control,group.querySelector('.question-error'));sync();
}
updateProgress();
