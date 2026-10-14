/* Independent entry analyses. All counts and evidence use the same filtered rows. */
(()=>{
'use strict';
const A=window.DINO_ENTRY_ANALYSIS,D=window.DINO_DATA;
if(!A||!D)return;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>new Intl.NumberFormat('zh-CN').format(n),pct=(n,d)=>d?`${(100*n/d).toFixed(1)}%`:'—';
const unitNames={sessions:'Session',messages:'条消息',users:'位孩子'};
let state,rows=[],metric='sessions',query='',epoch=0,activeEvidence=null;
const transcriptCache=new Map();
const regionNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
const countryName=code=>!code||code==='未记录'?'未记录':`${regionNames?.of(code)||code} · ${code}`;
function profileScope(){return `${state.level==='all'?'全部级别':D.dimensions.levels[state.level]==='未记录'?'级别未记录':`Level ${D.dimensions.levels[state.level]}`} · ${state.country==='all'?'全部国家／地区':countryName(D.dimensions.countries[state.country])}`}
function dimensionFilters(mode){
 const side=mode==='dino'?'Dino 侧':'孩子侧';
 const select=(key,label,values,labeler)=>`<label for="${mode}-${key}-filter">${label}<select id="${mode}-${key}-filter" data-profile-filter="${key}" aria-label="${side}${label}"><option value="all" ${state[key]==='all'?'selected':''}>全部${label}</option>${values.map((v,i)=>`<option value="${i}" ${state[key]===String(i)?'selected':''}>${esc(labeler(v))}</option>`).join('')}</select></label>`;
 return `<section class="analysis-profile-filters" aria-label="${side}观察人群"><div class="profile-filter-heading"><b>选择观察人群</b><span>与顶部筛选同步 · 作用于本页所有分析</span></div><div class="profile-filter-controls">${select('level','级别',D.dimensions.levels,v=>v==='未记录'?v:`Level ${v}`)}${select('country','国家／地区',D.dimensions.countries,countryName)}<button type="button" data-profile-reset ${state.level==='all'&&state.country==='all'?'disabled':''}>重置级别与国家</button></div><p class="profile-filter-scope" role="status">当前：${esc(profileScope())}。日期和年龄条件继续生效。</p><p class="profile-filter-note">按用户当前画像筛选；国家／地区来自最近设备记录，不代表国籍或对话发生地。</p></section>`;
}
function count(rr,m=metric){return m==='messages'?rr.length:new Set(rr.map(r=>r[m==='sessions'?2:1])).size}
function roleRows(gi){return rows.filter(r=>r[12]===(A.entries[state.entry].groups[gi].role==='assistant'?0:1))}
function selected(rr,gi,ti){return rr.filter(r=>ti<0?!r[5+gi]:Boolean(r[5+gi]&(1<<ti)))}
function tagStats(gi){const rr=roleRows(gi),g=A.entries[state.entry].groups[gi];return g.tags.map((t,i)=>({...t,i,hits:selected(rr,gi,i)})).map(t=>({...t,value:count(t.hits)})).sort((a,b)=>b.value-a.value)}
function filters(r){const p=D.userProfiles[r[1]];return r[0]>=state.start&&r[0]<=state.end&&['age','level','country'].every((k,i)=>state[k]==='all'||p?.[i]===Number(state[k]))}
function unitNote(gi){const role=A.entries[state.entry].groups[gi].role==='assistant'?'Dino':'孩子';return metric==='sessions'?`分母：有${role}消息的 Session`:(metric==='users'?(role==='Dino'?'分母：当前与 Dino 有对话的孩子（去重人数）：':'分母：当前有表达的孩子（去重人数）：'):`分母：${role}消息`)}
function toolbar(){const dino=state.tab==='dino';const note=metric==='users'?(dino?'统计有多少孩子的对话中出现过该 Dino 行为／主题。同一孩子遇到多次也只计 1 人；不代表孩子喜欢或回应有效。':'统计有多少孩子出现过该表达。同一孩子多次表达也只计 1 人。'):metric==='sessions'?'同一 Session 中出现多次，只计 1 个 Session。':'按对应角色的消息条数计数，同一孩子可贡献多条消息。';return `<div class="analysis-toolbar"><div class="analysis-metric-control"><span class="metric-caption">统计口径</span><div class="metric-switch" aria-label="分析统计口径">${Object.keys(unitNames).map(k=>`<button type="button" data-ametric="${k}" aria-pressed="${metric===k}" class="${metric===k?'active':''}">${k==='messages'?'消息':k==='users'?(dino?'覆盖孩子数':'用户'):'Session'}</button>`).join('')}</div></div><label class="analysis-search"><span>查找本入口分类</span><input type="search" id="entryCategorySearch" value="${esc(query)}" placeholder="主题、行为或方向…"></label></div><p class="analysis-metric-note">${note}</p>`}
function intro(mode){const config=A.entries[state.entry],dino=mode==='dino',gis=dino?[0,1]:[2,3,4,5],rr=rows.filter(r=>r[12]===(dino?0:1));
 const top=tagStats(dino?0:3).find(t=>t.value),theme=tagStats(dino?1:2).find(t=>t.value);
 return `<div class="analysis-lead" style="--entry-accent:${config.color}"><div><p class="eyebrow">${config.entry} / ${dino?'DINO CONVERSATION':'CHILD EXPRESSION'} · 规则探索</p><h3>${dino?'Dino 在带着聊什么？':'孩子在说什么、怎样参与？'}</h3><p>${esc(config.subtitle)}。${dino?'方向与主题允许多标签。':'话题、表达行为、明确偏好和帮助信号分别观察。'}</p><div class="analysis-scope">${gis.map(i=>`<span>${esc(config.groups[i].title.split('：').pop())}</span>`).join('')}</div></div><div class="scan-stat"><strong>${fmt(rr.length)}</strong><span>${dino?'Dino':'孩子'}消息已扫描</span><small>${fmt(count(rr,'sessions'))} Session · ${fmt(count(rr,'users'))} 位用户</small></div></div>
 <div class="analysis-findings"><p><b>当前筛选观察</b> ${rr.length?`「${esc(top?.label||'暂无命中分类')}」是${dino?'方向':'表达行为'}中命中最多的一项${top?`（${fmt(top.value)} / ${fmt(count(rr))} ${unitNames[metric]}，${pct(top.value,count(rr))}）`:''}；主题线索中「${esc(theme?.label||'暂无命中主题')}」最多。`:'没有符合筛选条件的消息。'}</p><p>这里只比较本入口已识别分类；未归类文本可能包含其他模式。${metric==='sessions'?'同一 Session 出现多次只计一次。':''}分类可重叠，占比之和可超过 100%。</p></div>`;
}
function panel(gi){const g=A.entries[state.entry].groups[gi],rr=roleRows(gi),denom=count(rr),stats=tagStats(gi).filter(t=>!query||t.label.toLowerCase().includes(query.toLowerCase())),matched=rr.filter(r=>r[5+gi]),unmatched=rr.filter(r=>!r[5+gi]);
 return `<article class="panel analysis-panel"><div class="panel-head"><div><span class="index">${String(gi+1).padStart(2,'0')}</span><h3>${esc(g.title)}</h3></div><span class="unit">${unitNote(gi)} ${fmt(denom)}</span></div><p class="analysis-description">${esc(g.note)}</p><div class="analysis-bars">${stats.length?stats.map(t=>`<button type="button" class="analysis-bar" data-agi="${gi}" data-ati="${t.i}" ${!t.value?'disabled':''}><span>${esc(t.label)}</span><strong>${pct(t.value,denom)}</strong><i><b style="width:${denom?Math.min(100,t.value/denom*100):0}%"></b></i><small>${fmt(t.value)} / ${fmt(denom)} ${unitNames[metric]}<span>查看原文 ↗</span></small></button>`).join(''):'<p class="empty-note">没有匹配的分类。</p>'}</div><div class="coverage-strip"><span>规则命中 ${fmt(matched.length)} / ${fmt(rr.length)} 条消息 · ${pct(matched.length,rr.length)}</span><button type="button" data-agi="${gi}" data-ati="-1" ${!unmatched.length?'disabled':''}>未归类 ${fmt(unmatched.length)} 条 ↗</button></div></article>`;
}
function method(){return `<details class="analysis-method"><summary>分析口径与覆盖范围</summary><p>${esc(A.meta.method)}</p><p>本次仅整理 ${A.meta.dateStart} 至 ${A.meta.dateEnd} 的当前看板数据，三个入口共 ${fmt(A.meta.messages)} 条消息。未合并较早 CSV，也未使用当前 Prompt 解释历史行为。</p><p>词组匹配主要覆盖英语及部分中文和其他语言显式表达。主题是提及线索，不代表完整语义或偏好。非英语线索不能确定母语；未检出非英语也不代表一定是英语。短答、拒绝、情绪和参与次数不用于推断孩子的能力或人格。</p><p>多标签统计中，Session 分母为当前入口和筛选内至少有一条对应角色消息的 Session；用户分母为对应去重用户。各分类的消息数、Session 数和用户数均独立去重。未归类只表示本版规则未命中。</p><p>日期按源记录日期，尚无当地时区。年龄、Level 和地区是当前画像。首条 Dino 开场缺失时显示“上文缺失”；没有后续消息不作失败判断。原文保留语音识别噪声，仅遮盖邮箱和长号码。</p></details>`}
function languagePanel(){const rr=rows.filter(r=>r[12]===1);return `<article class="panel language-observed"><div class="panel-head"><h3>语言表达线索</h3><span class="unit">文字线索 · 与求助分开</span></div><div class="language-observed-grid">${A.meta.languageLabels.map((l,i)=>{const subset=rr.filter(r=>r[11]===i);return `<button type="button" data-alanguage="${i}" ${!subset.length?'disabled':''}><strong>${pct(count(subset),count(rr))}</strong><span>${esc(l)}</span><small>${fmt(count(subset))} / ${fmt(count(rr))} ${unitNames[metric]} ↗</small></button>`}).join('')}</div><p class="micro-note">不能只凭文字区分英语、罗马字转写和所有拉丁字母语言。混合表达包含在“非英语线索”中，语言未确认部分不强行归为英语。</p></article>`}
function relationships(){
 const byPos=new Map(rows.map(r=>[`${r[2]}:${r[4]}`,r])),combos=new Map(),config=A.entries[state.entry];
 for(const ai of rows){if(ai[12]!==0)continue;const user=byPos.get(`${ai[2]}:${ai[4]-1}`);if(!user||user[12]!==1)continue;
  config.groups[3].tags.forEach((ut,ui)=>{if(!(user[8]&(1<<ui)))return;config.groups[0].tags.forEach((dt,ti)=>{if(!(ai[5]&(1<<ti)))return;const key=`${ui}:${ti}`;if(!combos.has(key))combos.set(key,{ui,ti,user:ut.label,dino:dt.label,hits:[]});combos.get(key).hits.push(ai)})});
 }
 return [...combos.values()].map(c=>({...c,value:count(c.hits)})).sort((a,b)=>b.value-a.value).slice(0,6);
}
function relationsPanel(){const combos=relationships();return `<article class="panel relation-panel"><div class="panel-head"><h3>孩子表达之后，Dino 接着做了什么</h3><span class="unit">本入口共现组合 · Top 6</span></div><p class="analysis-description">仅连接同一 Session 中紧邻的“孩子 → Dino”，并同时满足日期筛选。按 ${unitNames[metric]} 计数；不评价承接质量，也不解释因果。</p><div class="relation-list">${combos.map(c=>`<button type="button" data-apair="${c.ui}:${c.ti}"><span>${esc(c.user)}</span><i>→</i><span>${esc(c.dino)}</span><b>${fmt(c.value)} <small>${unitNames[metric]}</small></b></button>`).join('')||'<p class="empty-note">当前筛选没有命中组合。</p>'}</div></article>`}
function bind(root){
 root.querySelectorAll('[data-profile-filter]').forEach(el=>el.onchange=()=>document.dispatchEvent(new CustomEvent('dino:profile-filter',{detail:{[el.dataset.profileFilter]:el.value}})));
 root.querySelectorAll('[data-profile-reset]').forEach(el=>el.onclick=()=>document.dispatchEvent(new CustomEvent('dino:profile-filter',{detail:{level:'all',country:'all'}})));
 root.querySelectorAll('[data-agi]').forEach(el=>el.onclick=()=>showGroup(+el.dataset.agi,+el.dataset.ati));
 root.querySelectorAll('[data-ametric]').forEach(el=>el.onclick=()=>{metric=el.dataset.ametric;render()});
 root.querySelectorAll('[data-alanguage]').forEach(el=>el.onclick=()=>{const i=+el.dataset.alanguage;openEvidence(A.meta.languageLabels[i],rows.filter(r=>r[12]===1&&r[11]===i),'语言按文字线索识别，可能包含混合表达。')});
 root.querySelectorAll('[data-apair]').forEach(el=>el.onclick=()=>{const c=relationships().find(c=>`${c.ui}:${c.ti}`===el.dataset.apair);if(c)openEvidence(`${c.user} → ${c.dino}`,c.hits,'孩子表达与紧邻 Dino 回应共同命中；不判断好坏。')});
 const search=root.querySelector('#entryCategorySearch');if(search)search.oninput=e=>{query=e.target.value;const start=e.target.selectionStart;render();const next=root.querySelector('#entryCategorySearch');next.focus();try{next.setSelectionRange(start,start)}catch(_){}};
}
function showGroup(gi,ti){const g=A.entries[state.entry].groups[gi];openEvidence(ti<0?`${g.title} · 未归类`:g.tags[ti].label,selected(roleRows(gi),gi,ti),g.note,gi,ti)}
function render(){
 if(!state||state.page!=='entry')return;
 if(state.tab==='sessions'||state.tab==='rounds'){renderLegacy();return}
 const mode=state.tab==='children'?'children':'dino',root=$(mode==='dino'?'#dinoAnalysis':'#childAnalysis'),gis=mode==='dino'?[0,1]:[2,3,4,5];
 root.style.setProperty('--entry-accent',A.entries[state.entry].color);
 root.innerHTML=dimensionFilters(mode)+intro(mode)+toolbar()+`<div class="analysis-grid">${gis.map(panel).join('')}</div>`+(mode==='children'?languagePanel():'')+relationsPanel()+method();bind(root);
}
function renderLegacy(){
 const config=A.entries[state.entry],gi=3;
 if(state.tab==='sessions'){
  const rr=roleRows(gi),denom=count(rr,'sessions');$('#sessionBehavior').innerHTML=tagStats(gi).map(t=>`<button type="button" class="analysis-bar" data-agi="${gi}" data-ati="${t.i}"><span>${esc(t.label)}</span><strong>${pct(count(t.hits,'sessions'),denom)}</strong><i><b style="width:${denom?count(t.hits,'sessions')/denom*100:0}%"></b></i></button>`).join('');bind($('#sessionBehavior'));
  if(state.entry===2)$('#postClassStatus p').textContent='当前已接入用户当前 Level 和实际轮次，但缺少每个 Session 的目标轮次，因此暂不推算完成状态。';
 }else{
  [3,5].forEach((g,idx)=>{const root=$(idx?'#roundDifficulty':'#roundBehavior'),rr=roleRows(g),max=Math.min(12,Math.max(1,...rr.map(r=>r[3])));let html=`<div class="entry-round-grid" style="--round-cols:${max}"><span>本入口分类</span>${Array.from({length:max},(_,i)=>`<span>R${i+1}</span>`).join('')}`;
   config.groups[g].tags.forEach((t,ti)=>{html+=`<span>${esc(t.label)}</span>`;for(let n=1;n<=max;n++){const at=rr.filter(r=>r[3]===n),hit=selected(at,g,ti),den=count(at,'sessions'),num=count(hit,'sessions');html+=`<button type="button" data-rgroup="${g}" data-rtag="${ti}" data-rnum="${n}" ${!num?'disabled':''} style="--cell:${den?Math.min(.75,num/den):0}" title="${num} / ${den} 个在此轮有孩子消息的 Session">${pct(num,den)}</button>`}});
   root.innerHTML=html+'</div>';root.closest('.panel').querySelector('h3').textContent=idx?`${config.entry} · Round × 帮助信号`:`${config.entry} · Round × 孩子表达`;root.closest('.panel').querySelector('.unit').textContent='分母：此轮有孩子消息的 Session · 展示前12轮';
   root.querySelectorAll('[data-rgroup]').forEach(el=>el.onclick=()=>{const g=+el.dataset.rgroup,t=+el.dataset.rtag,n=+el.dataset.rnum;openEvidence(`R${n} · ${config.groups[g].tags[t].label}`,selected(roleRows(g).filter(r=>r[3]===n),g,t),config.groups[g].note,g,t)});
  });
 }
}
function profile(user){const p=D.userProfiles[user]||[];return [D.dimensions.ageBands[p[0]]||'年龄未记录',D.dimensions.levels[p[1]]==='未记录'?'Level 未记录':`Level ${D.dimensions.levels[p[1]]||'未记录'}`,countryName(D.dimensions.countries[p[2]])].join(' · ')}
async function transcript(sid){const bucket=Math.floor(sid/128);if(!transcriptCache.has(bucket)){const promise=fetch(`analysis/transcripts/${bucket}.json?v=${A.sourceFingerprint}`).then(r=>{if(!r.ok)throw new Error('原文暂时无法加载');return r.json()}).catch(e=>{transcriptCache.delete(bucket);throw e});transcriptCache.set(bucket,promise)}const value=(await transcriptCache.get(bucket))[sid];return window.DinoDialogueTranslations?.session(value)||value}
function openEvidence(title,hits,note,gi=null,ti=null){
 const ordered=[...hits].sort((a,b)=>b[0]-a[0]||a[2]-b[2]||a[4]-b[4]);
 // One initial hit per session, without removing any hit from statistics.
 const seen=new Set(),seenUsers=new Set(),firstUsers=[],rest=[];for(const r of ordered){if(!seen.has(r[2])){seen.add(r[2]);if(!seenUsers.has(r[1])){seenUsers.add(r[1]);firstUsers.push(r)}else rest.push(r)}}
 const representatives=[...firstUsers,...rest];
 activeEvidence={title,hits,representatives,page:0,note,gi,ti,entry:state.entry,token:++epoch};
 $('#drawerTitle').textContent=title;$('#evidenceDrawer').classList.add('open');$('#drawerMask').classList.add('open');$('#evidenceDrawer').setAttribute('aria-hidden','false');
 $('#evidenceDrawer .drawer-note').textContent='内部原文 · 保留 ASR 噪声；已匹配的英文译文附在下方，缺少的明确标记“译文待补”。不展示技术标识。';
 loadEvidence();
}
function utterance(m,highlight=false){const translation=m.translation?`<div class="translation">${esc(m.translation)}</div>`:m.language===1?'<div class="translation pending">译文待补 · 原文完整保留</div>':'';return `<div class="context-message ${m.role==='user'?'user':'assistant'} ${highlight?'focused':''}"><div class="message-label">${m.role==='user'?'CHILD':'DINO'} <small>R${m.round||'开场'} · ${esc(m.date)}</small>${highlight?'<b>当前命中</b>':''}</div><p dir="auto">${esc(m.text)||'（空文本，不推断为沉默）'}</p>${translation}</div>`}
function evidenceHtml(session,r,index,view){const ms=session.messages,pos=r[4],start=Math.max(0,pos-2),end=Math.min(ms.length,pos+3),g=view.gi===null?null:A.entries[view.entry].groups[view.gi],tag=g&&view.ti>=0?g.tags[view.ti]:null;
 let cue='';if(tag?.pattern){try{cue=ms[pos].text.match(new RegExp(tag.pattern,'i'))?.[0]||''}catch(_){}}
 const sameHits=view.hits.filter(x=>x[2]===r[2]).length;
 return `<article class="analysis-evidence"><div class="evidence-top"><b>片段 ${index+1}</b><span>${A.entries[view.entry].entry}</span><span>本 Session ${sameHits} 条命中</span></div><div class="evidence-profile">${esc(profile(r[1]))}</div>${cue?`<p class="match-cue">文本线索：<q>${esc(cue)}</q></p>`:''}${start===0&&ms[0]?.role==='user'?'<p class="micro-note">首条 Dino 开场未包含在导出中。</p>':''}${ms.slice(start,end).map((m,i)=>utterance(m,start+i===pos)).join('')}<details class="full-transcript"><summary>查看完整 Session · ${ms.length} 条消息</summary>${ms.map((m,i)=>utterance(m,i===pos)).join('')}</details></article>`;
}
async function loadEvidence(){const view=activeEvidence,token=view.token,perPage=3,start=view.page*perPage,batch=view.representatives.slice(start,start+perPage);
 $('#drawerMeta').textContent=`${profileScope()}。${fmt(view.hits.length)} 条命中 · ${fmt(view.representatives.length)} Session · ${fmt(count(view.hits,'users'))} 位用户。${view.note} 每个 Session 先展示一条命中，优先不同用户的近期 Session；完整上下文可能跨出所选日期。`;
 $('#drawerList').innerHTML='<p class="empty-note" role="status">正在加载对应原始上下文…</p>';
 try{const results=await Promise.all(batch.map(r=>transcript(r[2])));if(epoch!==token||activeEvidence!==view)return;
  $('#drawerList').innerHTML=results.map((s,i)=>evidenceHtml(s,batch[i],start+i,view)).join('')+`<div class="evidence-pagination"><button type="button" id="evidencePrev" ${view.page===0?'disabled':''}>上一页</button><span>${view.page+1} / ${Math.max(1,Math.ceil(view.representatives.length/perPage))}</span><button type="button" id="evidenceNext" ${start+perPage>=view.representatives.length?'disabled':''}>下一页</button></div>`;
  $('#evidencePrev').onclick=()=>{view.page--;loadEvidence()};$('#evidenceNext').onclick=()=>{view.page++;loadEvidence()};
 }catch(error){if(epoch===token){$('#drawerList').innerHTML='<p class="empty-note">原文加载失败。请检查本地服务后重试。</p><button id="evidenceRetry" type="button">重试</button>';$('#evidenceRetry').onclick=loadEvidence}}
}
document.addEventListener('dino:render',event=>{epoch++;activeEvidence=null;const next=event.detail;if(!state||next.entry!==state.entry)query='';state=next;if(next.page!=='entry'||next.entry===2){rows=[];return}rows=A.records[state.entry].filter(filters);render()});
// Read-only hooks for data integrity and denominator checks.
window.DinoEntryAnalysis={getSnapshot:()=>({state:{...state},metric,rows:rows.length,entry:A.entries[state?.entry||0].entry}),count,selected};
})();
