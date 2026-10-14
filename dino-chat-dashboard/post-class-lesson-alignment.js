((root)=>{
'use strict';
const DATA=root.DINO_POST_CLASS_LESSON_ALIGNMENT;
function summarize(data=DATA){
 const s=data.summary,m=data.meta,centered=s.aligned+s.related;
 return{...s,centered,assessable:m.assessable,centeredRate:m.assessable?centered/m.assessable:0,coverageRate:m.populationSessions?m.withSelectedContent/m.populationSessions:0};
}
root.DinoPostClassLessonAlignment={summarize};
if(typeof document==='undefined'||!DATA)return;
let activeVerdict='all',lastState=null;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt=value=>new Intl.NumberFormat('zh-CN').format(value||0);
const pct=(value,total)=>total?`${(value/total*100).toFixed(1)}%`:'—';
const labels={aligned:'明确围绕课程',related:'相关延展',drifted:'明显偏离',insufficient:'证据不足'};
const notes={aligned:'主问题持续来自 selected_content',related:'从本课向同类日常场景展开',drifted:'主线转向无关内容且未回归',insufficient:'有效往返不足以判断展开'};
const levels=['L1','L2','L3','L4'];
const translationOf=message=>typeof message?.[2]==='string'&&message[2].trim()?message[2]:'';
const timestampOf=message=>typeof message?.[3]==='string'&&message[3].trim()?message[3]:'';
const transcriptMessage=(message,index)=>`<article class="${message[0]}"><div><span>${message[0]==='dino'?'Dino':'Child'}</span>${timestampOf(message)?`<time datetime="${esc(timestampOf(message).replace(' ','T'))}">${esc(timestampOf(message))} <b>北京时间</b></time>`:''}<i>${String(index+1).padStart(2,'0')}</i></div><p class="transcript-original" dir="auto">${esc(message[1])}</p>${translationOf(message)?`<div class="transcript-english"><b>English translation</b><p>${esc(translationOf(message))}</p></div>`:''}</article>`;
function closeTranscript(){
 const shell=document.querySelector('.lesson-transcript-shell');
 if(shell)shell.remove();
 document.body.classList.remove('lesson-transcript-open');
}
function openTranscript(id){
 const item=DATA.evidence.find(row=>row.id===id);
 if(!item)return;
 closeTranscript();
 const translated=item.conversation.some(translationOf);
 const shell=document.createElement('div');
 shell.className='lesson-transcript-shell';
 shell.innerHTML=`<div class="lesson-transcript-mask" data-transcript-close></div><aside class="lesson-transcript" role="dialog" aria-modal="true" aria-labelledby="lessonTranscriptTitle"><header><div><p class="eyebrow">FULL CONVERSATION / ${esc(item.level)}</p><h2 id="lessonTranscriptTitle">${esc(item.lesson)}</h2><p>${esc(item.lessonType)} · ${esc(labels[item.verdict])} · ${item.conversation.length} 条消息</p></div><button type="button" data-transcript-close aria-label="关闭完整原对话">×</button></header>${translated?'<div class="lesson-transcript-translation"><b>EN</b><span>原文完整保留；英文辅助译文列于下方，含混转写需结合原文复核。</span></div>':''}<div class="lesson-transcript-time"><b>TIME</b><span>每条 original 显示数据源的日期与时间，已统一转换为北京时间。</span></div><div class="lesson-transcript-list">${item.conversation.map(transcriptMessage).join('')}</div><footer><span>完整对话按原始消息顺序展示</span><button type="button" data-transcript-close>关闭</button></footer></aside>`;
 document.body.appendChild(shell);
 document.body.classList.add('lesson-transcript-open');
 shell.querySelectorAll('[data-transcript-close]').forEach(button=>button.addEventListener('click',closeTranscript));
 shell.querySelector('.lesson-transcript>header button').focus();
}
function render(state){
 lastState=state;
 const chapter=document.querySelector('#postClassConversationAnalysisSection'),section=document.querySelector('#postClassLessonAlignmentSection'),target=document.querySelector('#postClassLessonAlignment');
 if(!chapter||!section||!target)return;
 const visible=state.page==='entry'&&state.entry===2;
 chapter.classList.toggle('hidden',!visible);
 section.classList.toggle('hidden',!visible);
 if(!visible){closeTranscript();return;}
 const sum=summarize(),sample=DATA.meta.sampleSize;
 const outcomes=['aligned','related','drifted','insufficient'];
 const evidence=DATA.evidence.filter(item=>activeVerdict==='all'||item.verdict===activeVerdict);
 target.innerHTML=`
 <div class="lesson-alignment-hero"><div><p class="eyebrow">SELECTED CONTENT / SAMPLE AUDIT</p><h3>课程关联抽样结果</h3><p>用生产会话当时保存的 <code>knowledge_points_json</code> 作为 selected_content 快照，与完整对话逐段对照。</p></div><div class="lesson-alignment-score"><span>可判断样本中</span><strong>${pct(sum.centered,sum.assessable)}</strong><b>围绕课程或合理延展</b><small>${fmt(sum.centered)} / ${fmt(sum.assessable)} 段；固定抽样，非全量推断</small></div></div>
 <div class="lesson-alignment-outcomes">${outcomes.map(key=>`<button type="button" data-lesson-verdict="${key}" class="${activeVerdict===key?'active':''}" aria-pressed="${activeVerdict===key}"><i></i><span>${labels[key]}</span><strong>${fmt(DATA.summary[key])}</strong><small>${pct(DATA.summary[key],sample)} · ${notes[key]}</small></button>`).join('')}</div>
 <div class="lesson-alignment-coverage"><div><span>selected_content 可用覆盖</span><strong>${pct(DATA.meta.withSelectedContent,DATA.meta.populationSessions)}</strong><small>${fmt(DATA.meta.withSelectedContent)} / ${fmt(DATA.meta.populationSessions)} 个 Session</small></div><div class="lesson-coverage-track" aria-hidden="true"><i style="--coverage:${sum.coverageRate*100}%"></i></div><p>${fmt(DATA.meta.withoutSelectedContent)} 个 Session 的课程快照未记录，本次不对它们做课程关联判断，也不当作“偏离课程”。</p></div>
 <article class="panel lesson-level-panel"><div class="panel-head"><div><span class="index">PC-A</span><h3>按 Level 看抽样结果</h3></div><span class="unit">围绕课程 = 明确围绕 + 相关延展</span></div><div class="lesson-level-table" role="table" aria-label="POST_CLASS 各 Level 课程关联抽样结果"><div class="lesson-level-row head" role="row"><span>Level</span><span>抽样</span><span>可判断</span><span>围绕课程</span><span>明显偏离</span></div>${DATA.byLevel.map(row=>{const assessable=row.sample-row.insufficient,centered=row.aligned+row.related;return`<div class="lesson-level-row" role="row"><b>${row.level}</b><span>${row.sample}</span><span>${assessable}</span><span><strong>${pct(centered,assessable)}</strong><i style="--level-rate:${assessable?centered/assessable*100:0}%"></i></span><span>${row.drifted}</span></div>`}).join('')}</div></article>
 <article class="panel lesson-evidence-panel"><div class="panel-head"><div><span class="index">PC-B</span><h3>对照证据</h3></div><div class="lesson-evidence-switch"><button type="button" data-lesson-verdict="all" class="${activeVerdict==='all'?'active':''}">全部案例</button><span>${evidence.length} 个代表样本</span></div></div><nav class="lesson-level-index" aria-label="按 Level 浏览对照证据">${levels.map(level=>`<a href="#lessonEvidence${level}"><span>${level.replace('L','Level ')}</span><b>${evidence.filter(item=>item.level===level).length}</b></a>`).join('')}</nav><div class="lesson-evidence-groups">${levels.map(level=>{const items=evidence.filter(item=>item.level===level);return`<section class="lesson-evidence-group ${items.length?'':'empty'}" id="lessonEvidence${level}"><header><span>${level.replace('L','LEVEL ')}</span><i></i><small>${items.length} 个案例</small></header>${items.length?`<div class="lesson-evidence-grid">${items.map(item=>`<article class="lesson-evidence ${item.verdict}"><div><span>${esc(item.lessonType)}</span><b>${esc(labels[item.verdict])}</b></div><h4>${esc(item.lesson)}</h4><dl><dt>SELECTED CONTENT</dt><dd>${esc(item.selected)}</dd><dt>实际对话主线</dt><dd>${esc(item.observed)}</dd></dl><blockquote>${esc(item.excerpt)}</blockquote><button type="button" class="lesson-transcript-trigger" data-transcript-id="${esc(item.id)}"><span>查看原对话</span><i aria-hidden="true">↗</i><small>${item.conversation.length} 条消息</small></button></article>`).join('')}</div>`:'<p class="lesson-level-empty">当前筛选下暂无该 Level 的代表案例。</p>'}</section>`}).join('')}</div></article>
 <details class="lesson-alignment-method"><summary>抽样与判定口径</summary><div><p><b>抽样：</b>${esc(DATA.meta.sampling)}本次 n=${sample}，其中 ${DATA.meta.assessable} 段具备足够往返可以判断展开。</p><p><b>课程事实：</b>${esc(DATA.meta.source)}。课程内容是对话素材，不是必须逐项覆盖的任务清单。</p>${Object.entries(DATA.definitions).map(([key,value])=>`<p><b>${esc(labels[key])}：</b>${esc(value)}</p>`).join('')}<p><b>限制：</b>这是固定样本的定性审核，不是全量自动标注，不随页面顶部筛选变化，也不用来判断学习效果。</p></div></details>`;
 target.querySelectorAll('[data-lesson-verdict]').forEach(button=>button.addEventListener('click',()=>{closeTranscript();activeVerdict=button.dataset.lessonVerdict;render(lastState)}));
 target.querySelectorAll('[data-transcript-id]').forEach(button=>button.addEventListener('click',()=>openTranscript(button.dataset.transcriptId)));
}
document.addEventListener('dino:render',event=>render(event.detail));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeTranscript()});
})(typeof window==='undefined'?globalThis:window);
