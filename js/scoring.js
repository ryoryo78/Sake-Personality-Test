'use strict';
/** Pure scoring: stable question IDs are used, never their display positions. */
const DiagnosisScoring = (() => {
  const axes = [
    { left:'E', right:'I', label:'環境', leftLabel:'社交・外食派', rightLabel:'内省・自炊派', priorityId:1, priorityNumber:15 },
    { left:'P', right:'A', label:'行動', leftLabel:'計画・管理派', rightLabel:'衝動・刺激派', priorityId:9, priorityNumber:17 },
    { left:'F', right:'D', label:'アプローチ', leftLabel:'効率・タイパ派', rightLabel:'こだわり・美的派', priorityId:17, priorityNumber:3 },
    { left:'C', right:'S', label:'バイタル', leftLabel:'安定・タフ派', rightLabel:'繊細・ケア派', priorityId:28, priorityNumber:24 }
  ];
  const choices = { agree:['agreeType',2], somewhat_agree:['agreeType',1], somewhat_disagree:['disagreeType',1], disagree:['disagreeType',2] };
  function calculate(questions, answers) {
    if (!Array.isArray(questions) || questions.length!==32 || new Set(questions.map(q=>q.id)).size!==32) throw new Error('質問データが正しくありません。');
    if (!answers || typeof answers!=='object' || Object.keys(answers).length!==32) throw new Error('32問すべてに回答してください。');
    const scores = {E:0,I:0,P:0,A:0,F:0,D:0,C:0,S:0};
    for (const question of questions) {
      const choice=Object.hasOwn(choices,answers[question.id]) ? choices[answers[question.id]] : null;
      const axis=axes.find(a=>[a.left,a.right].includes(question.agreeType)&&[a.left,a.right].includes(question.disagreeType));
      if (!choice || !axis || question.agreeType===question.disagreeType) throw new Error('回答データが正しくありません。');
      scores[question[choice[0]]]+=choice[1];
    }
    const results=axes.map(axis=>{
      if(questions.filter(q=>q.agreeType===axis.left||q.agreeType===axis.right).length!==8) throw new Error('各軸には8問が必要です。');
      const leftScore=scores[axis.left],rightScore=scores[axis.right],tied=leftScore===rightScore;
      const priority=questions.find(q=>q.id===axis.priorityId);
      if(!priority || ![axis.left,axis.right].includes(priority.agreeType))throw new Error('優先設問が正しくありません。');
      const winner=tied ? priority[choices[answers[priority.id]][0]] : leftScore>rightScore?axis.left:axis.right;
      return {...axis,leftScore,rightScore,tied,winner,winnerLabel:winner===axis.left?axis.leftLabel:axis.rightLabel,percent:Math.round(scores[winner]/(leftScore+rightScore)*100)};
    });
    return {type:results.map(axis=>axis.winner).join(''),scores,axes:results};
  }
  return {calculate};
})();
