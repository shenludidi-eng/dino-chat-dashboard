((root)=>{
'use strict';
const DATA=root.DINO_POST_CLASS_STUDENT_BEHAVIOR;
if(!DATA)return;
const order=['confusion','localLanguage','earlyExit','refusal','asksQuestion','elaboration'];
const countryNames={AE:'阿联酋',AU:'澳大利亚',BN:'文莱',BR:'巴西',CN:'中国',ID:'印度尼西亚',JP:'日本',KR:'韩国',MM:'缅甸',MY:'马来西亚',SA:'沙特阿拉伯',SG:'新加坡',TH:'泰国',VN:'越南','未记录':'未记录'};
let activeWeek='all',activeLevel='all',activeCountry='all',lastState=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const pct=(value,total)=>total?`${(value/total*100).toFixed(1)}%`:'—';
const caseMap=new Map(DATA.cases.map(item=>[item.id,item]));
const translationOf=message=>typeof message?.[2]==='string'&&message[2].trim()?message[2]:'';
const transcriptMessage=(message,index)=>`<article class="${message[0]}"><div><span>${message[0]==='dino'?'Dino':'Child'}</span><i>${String(index+1).padStart(2,'0')}</i></div><p class="transcript-original" dir="auto">${esc(message[1])}</p>${translationOf(message)?`<div class="transcript-english"><b>English translation</b><p>${esc(translationOf(message))}</p></div>`:''}</article>`;
const evidenceHit=row=>{
 const needle=row.hit.toLocaleLowerCase();
 const message=row.case?.conversation.find(item=>{
  const translation=translationOf(item).toLocaleLowerCase(),original=item[1].toLocaleLowerCase();
  return translation===needle||original===needle||translation.includes(needle);
 });
 return{original:message?.[1]||row.hit,translation:translationOf(message)};
};
function closeTranscript(){
 const shell=document.querySelector('.student-behavior-transcript-shell');
 if(shell)shell.remove();
 if(!document.querySelector('.lesson-transcript-shell'))document.body.classList.remove('lesson-transcript-open');
}
function openTranscript(caseId,behaviorKey){
 const item=caseMap.get(caseId),definition=DATA.definitions[behaviorKey];
 if(!item||!definition)return;
 closeTranscript();
 const translated=item.conversation.some(translationOf);
 const shell=document.createElement('div');
 shell.className='lesson-transcript-shell student-behavior-transcript-shell';
 shell.innerHTML=`<div class="lesson-transcript-mask" data-student-transcript-close></div><aside class="lesson-transcript" role="dialog" aria-modal="true" aria-labelledby="studentTranscriptTitle"><header><div><p class="eyebrow">HIT TRANSCRIPT / ${esc(item.level)} · ${esc(item.country)}</p><h2 id="studentTranscriptTitle">${esc(definition.label)}</h2><p>${esc(item.lesson)} · ${item.conversation.length} 条消息</p></div><button type="button" data-student-transcript-close aria-label="关闭完整原对话">×</button></header>${translated?'<div class="lesson-transcript-translation"><b>EN</b><span>原文完整保留；英文辅助译文列于下方，含混转写需结合原文复核。</span></div>':''}<div class="lesson-transcript-list">${item.conversation.map(transcriptMessage).join('')}</div><footer><span>完整对话按原始消息顺序展示</span><button type="button" data-student-transcript-close>关闭</button></footer></aside>`;
 document.body.appendChild(shell);
 document.body.classList.add('lesson-transcript-open');
 shell.querySelectorAll('[data-student-transcript-close]').forEach(button=>button.addEventListener('click',closeTranscript));
 shell.querySelector('.lesson-transcript>header button').focus();
}
const weekLabel=value=>{
 const start=new Date(`${value}T00:00:00Z`),end=new Date(start);
 end.setUTCDate(end.getUTCDate()+6);
 const md=date=>`${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
 return`${md(start)}—${md(end)}`;
};
function matches(item){return(activeWeek==='all'||item.week===activeWeek)&&(activeLevel==='all'||item.level===activeLevel)&&(activeCountry==='all'||item.country===activeCountry)}
function render(state){
 lastState=state;
 const target=document.querySelector('#postClassStudentBehavior');
 if(!target)return;
 const visible=state.page==='entry'&&state.entry===2;
 if(!visible){closeTranscript();target.innerHTML='';return;}
 const sample=DATA.sample.filter(matches);
 const rankedKeys=[...order].sort((a,b)=>{
  const difference=sample.filter(item=>item.flags[b]).length-sample.filter(item=>item.flags[a]).length;
  return difference||order.indexOf(a)-order.indexOf(b);
 });
 const weekOptions=DATA.weeks.map(week=>`<option value="${week}" ${activeWeek===week?'selected':''}>${weekLabel(week)}</option>`).join('');
 const countryOptions=DATA.countries.map(code=>`<option value="${esc(code)}" ${activeCountry===code?'selected':''}>${esc(countryNames[code]||code)} · ${esc(code)}</option>`).join('');
 target.innerHTML=`
 <div class="student-behavior-intro"><div><p>${esc(DATA.meta.method)}</p><small>${esc(DATA.meta.evidencePolicy)}</small></div><div><strong>${sample.length}</strong><span>当前筛选样本</span><small>固定抽样 · 可多重命中</small></div></div>
 <section class="student-behavior-overview" aria-labelledby="studentBehaviorOverviewTitle"><div class="student-behavior-subhead"><span>01</span><div><h4 id="studentBehaviorOverviewTitle">行为总览</h4><p>每种行为在当前筛选抽样 Session 中的出现比例</p></div><aside><b>SESSION 口径</b><small>同一 Session 的同一种行为只计 1 次</small></aside></div>
 <div class="student-behavior-filters" aria-label="学生行为分析筛选"><div><b>筛选行为占比</b><p>筛选同步更新下方对照证据。</p></div><label><span>统计周</span><select id="studentBehaviorWeek"><option value="all">全部统计周</option>${weekOptions}</select></label><label><span>Level</span><select id="studentBehaviorLevel"><option value="all">全部 Level</option>${['L1','L2','L3','L4'].map(level=>`<option value="${level}" ${activeLevel===level?'selected':''}>Level ${level.slice(1)}</option>`).join('')}</select></label><label><span>国家／地区</span><select id="studentBehaviorCountry"><option value="all">全部国家／地区</option>${countryOptions}</select></label><button type="button" id="studentBehaviorReset" ${activeWeek==='all'&&activeLevel==='all'&&activeCountry==='all'?'disabled':''}>重置</button><p>${activeWeek==='all'?'全部统计周':weekLabel(activeWeek)} · ${activeLevel==='all'?'全部 Level':`Level ${activeLevel.slice(1)}`} · ${activeCountry==='all'?'全部国家／地区':`${countryNames[activeCountry]||activeCountry} · ${activeCountry}`} · 分母 ${sample.length} 个抽样 Session</p></div>
 <div class="student-behavior-overview-list">${rankedKeys.map((key,index)=>{
  const definition=DATA.definitions[key],hits=sample.filter(item=>item.flags[key]),rate=sample.length?hits.length/sample.length:0;
  return`<article><span>${String(index+1).padStart(2,'0')}</span><div><h5>${esc(definition.label)}</h5><p>${esc(definition.definition)}</p></div><div class="student-behavior-overview-track" aria-label="${esc(definition.label)}：${pct(hits.length,sample.length)}"><i style="--behavior-rate:${rate*100}%"></i></div><div class="student-behavior-overview-rate"><strong>${pct(hits.length,sample.length)}</strong><small>${hits.length} / ${sample.length} Session</small></div></article>`;
 }).join('')}</div><p class="student-behavior-denominator"><b>为什么用 Session：</b>这里判断一段对话是否出现某种学生行为。若用消息数，同一学生重复表达会被多次累计，无法回答“多少段对话出现了该行为”。</p></section>
 <section class="student-behavior-evidence" aria-labelledby="studentBehaviorEvidenceTitle"><div class="student-behavior-subhead"><span>02</span><div><h4 id="studentBehaviorEvidenceTitle">对照证据</h4><p>只列出命中行为的 transcript；可展开查看完整上下文</p></div></div><div class="student-behavior-list">${rankedKeys.map((key,index)=>{
  const definition=DATA.definitions[key],hits=sample.filter(item=>item.flags[key]),rate=sample.length?hits.length/sample.length:0;
  const evidence=DATA.evidence[key].map(row=>({...row,case:caseMap.get(row.caseId)})).filter(row=>row.case&&matches(row.case));
  return`<section class="student-behavior-section" data-behavior="${key}"><header><span>${String(index+1).padStart(2,'0')}</span><div><h4>${esc(definition.label)}</h4><p>${esc(definition.definition)}</p></div><div class="student-behavior-rate"><strong>${hits.length}</strong><b>个命中 Session</b><small>${pct(hits.length,sample.length)} · ${esc(definition.short)}</small></div></header><div class="student-evidence-list">${evidence.length?evidence.map((row,evidenceIndex)=>{const hit=evidenceHit(row);return`<article><span>${String(evidenceIndex+1).padStart(2,'0')}</span><div class="student-evidence-meta"><b>${esc(row.case.level)}</b><small>${esc(countryNames[row.case.country]||row.case.country)} · ${esc(row.case.country)}</small></div><div class="student-evidence-copy"><p dir="auto">“${esc(hit.original)}”</p>${hit.translation?`<div class="student-evidence-translation"><b>English translation</b><p>“${esc(hit.translation)}”</p></div>`:''}<small>${weekLabel(row.case.week)} · ${esc(row.case.lesson)}</small></div><button type="button" data-student-transcript="${esc(row.caseId)}" data-student-behavior="${key}">查看全文 <i>↗</i></button></article>`}).join(''):`<p class="student-evidence-empty">当前筛选下暂无已选取的代表证据${hits.length?`；样本仍有 ${hits.length} 个命中。`:'。'}</p>`}</div></section>`;
 }).join('')}</div></section>
 <details class="student-behavior-method"><summary>抽样与行为界定</summary><div><p><b>抽样：</b>${esc(DATA.meta.method)}</p>${order.map(key=>`<p><b>${esc(DATA.definitions[key].label)}：</b>${esc(DATA.definitions[key].definition)}</p>`).join('')}<p><b>限制：</b>百分比只描述固定抽样内部的命中情况，不外推为全部 POST_CLASS 对话比例；国家来自用户最近设备记录，不代表国籍或对话发生地。</p></div></details>`;
 const week=document.querySelector('#studentBehaviorWeek'),level=document.querySelector('#studentBehaviorLevel'),country=document.querySelector('#studentBehaviorCountry'),reset=document.querySelector('#studentBehaviorReset');
 week.addEventListener('change',()=>{activeWeek=week.value;render(lastState)});
 level.addEventListener('change',()=>{activeLevel=level.value;render(lastState)});
 country.addEventListener('change',()=>{activeCountry=country.value;render(lastState)});
 reset.addEventListener('click',()=>{activeWeek='all';activeLevel='all';activeCountry='all';render(lastState)});
 target.querySelectorAll('[data-student-transcript]').forEach(button=>button.addEventListener('click',()=>openTranscript(button.dataset.studentTranscript,button.dataset.studentBehavior)));
}
root.DinoPostClassStudentBehavior={render};
if(typeof document!=='undefined'){
 document.addEventListener('dino:render',event=>render(event.detail));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeTranscript()});
}
})(typeof window==='undefined'?globalThis:window);
