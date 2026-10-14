/* Fixed-sample open coding for entry topics, student behavior and intent signals. */
((root)=>{
'use strict';
const DATA=root.DINO_SAMPLED_CONVERSATION_ANALYSIS,D=root.DINO_DATA,A=root.DINO_ENTRY_ANALYSIS;
if(!DATA||!D)return;
const entryStates=new Map(),transcriptCache=new Map();
let activeModal=null,lastTrigger=null;
const FIXED_OPENING_POOL={
 welcome:[
  `Hi! I'm Dino. Say hello!`,
  `Hi there! Can you say "Hi, Dino"?`,
  `Hey! I'm Dino. Let's talk!`,
  `Hello! I'm here to play and chat.`
 ],
 topics:[
  [`What's your favorite color?`,'颜色'],
  [`Do you like cats or dogs?`,'动物'],
  [`Can you roar like a dinosaur?`,'恐龙／动物'],
  [`Let's count to five together!`,'数字'],
  [`What food do you like?`,'食物'],
  [`Are you happy today?`,'情绪'],
  [`Story or game? You choose!`,'故事／游戏'],
  [`Let's go to space! Say "rocket"!`,'太空'],
  [`What animal do you like?`,'动物'],
  [`Can you say a magic word?`,'想象／语言'],
  [`Red or blue? Pick one!`,'颜色'],
  [`Can you clap and say "hello"?`,'动作／问候']
 ]
};
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt=value=>new Intl.NumberFormat('zh-CN').format(value||0);
const pct=(value,total)=>total?`${(value/total*100).toFixed(1)}%`:'—';
const countryNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
const countryName=code=>code==='未记录'?code:`${countryNames?.of(code)||code} · ${code}`;
const hash=value=>Math.imul((Number(value)||0)+1,2654435761)>>>0;
const REVIEW_STATES={
 review_participation_only:{label:'仅见承接，未见明确功能诉求',definition:'可以看出在回应对话，但不足以说明希望 Dino 承担什么功能。'},
 review_insufficient:{label:'信息不足，暂不判定',definition:'只有开场、含混转写或指代不明的片段；不等于学生没有需求。'}
};
const isReviewKey=key=>Object.hasOwn(REVIEW_STATES,key);
const matches=(row,axis,key)=>axis==='intents'&&isReviewKey(key)?row.intentReview?.status===key.slice(7):row[axis].includes(key);
function stateFor(entry){if(!entryStates.has(entry))entryStates.set(entry,{level:'all',age:'all',country:'all',active:{topics:'',behaviors:'',intents:''},evidenceBatch:{topics:0,behaviors:0,intents:0}});return entryStates.get(entry)}
function filtered(entry){const state=stateFor(entry);return DATA.samples[entry].filter(row=>(state.level==='all'||row.level===state.level)&&(state.age==='all'||row.age===state.age)&&(state.country==='all'||row.country===state.country))}
function defs(entry,axis){return axis==='topics'||axis==='behaviors'?DATA.codebooks[axis][entry]:{...DATA.codebooks[axis],...REVIEW_STATES}}
function categories(entry,axis,rows){return Object.entries(defs(entry,axis)||{}).map(([key,definition])=>({key,...definition,count:rows.filter(row=>row[axis].includes(key)).length})).filter(item=>item.count).sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'zh-CN'))}
function diverseEvidence(rows,axis,key,batch=0){
 const candidates=rows.filter(row=>matches(row,axis,key)&&row.quotes?.[axis]?.[key]).sort((a,b)=>hash(a.sid)-hash(b.sid)),ordered=[],seen=new Set();
 for(const row of candidates){const profile=`${row.level}|${row.age}|${row.country}`;if(!seen.has(profile)){ordered.push(row);seen.add(profile)}}
 for(const row of candidates)if(!ordered.includes(row))ordered.push(row);
 const limit=Math.min(10,ordered.length);if(!limit)return [];
 const start=ordered.length>limit?(Math.max(0,batch)*limit)%ordered.length:0;
 return Array.from({length:limit},(_,index)=>ordered[(start+index)%ordered.length]);
}
function filterOptions(entry){
 const sample=DATA.samples[entry],state=stateFor(entry),levels=['1','2','3','4'].filter(value=>sample.some(row=>row.level===value)),ages=D.dimensions.ageBands.filter(value=>sample.some(row=>row.age===value)),countries=D.dimensions.countries.filter(value=>sample.some(row=>row.country===value));
 const options=(values,current,labeler=value=>value)=>`<option value="all" ${current==='all'?'selected':''}>全部</option>${values.map(value=>`<option value="${esc(value)}" ${current===value?'selected':''}>${esc(labeler(value))}</option>`).join('')}`;
 return{levels:options(levels,state.level,value=>`Level ${value}`),ages:options(ages,state.age,value=>value==='未记录'?value:`${value} 岁`),countries:options(countries,state.country,countryName)};
}
function filterBar(entry,prefix,rows){
 const state=stateFor(entry),o=filterOptions(entry),reset=state.level==='all'&&state.age==='all'&&state.country==='all';
 return `<section class="sample-study-filters" aria-label="${esc(entry)} 抽样分析筛选"><div><b>筛选抽样 Session</b><p>同步更新占比与文本证据</p></div><label><span>Level</span><select data-sample-filter="level">${o.levels}</select></label><label><span>年龄区间</span><select data-sample-filter="age">${o.ages}</select></label><label><span>国家／地区</span><select data-sample-filter="country">${o.countries}</select></label><button type="button" data-sample-reset ${reset?'disabled':''}>重置</button><p class="sample-study-scope" role="status">${state.level==='all'?'全部 Level':`Level ${esc(state.level)}`} · ${state.age==='all'?'全部年龄':`${esc(state.age)} 岁`} · ${state.country==='all'?'全部国家／地区':esc(countryName(state.country))} · 当前分母 <b>${fmt(rows.length)}</b> 个抽样 Session</p></section>`;
}
function evidenceCard(row,entry,axis,key,index){
 const quote=row.quotes[axis][key]||{},translated=String(quote.translation||'').trim();
 const snippet=axis==='intents'&&quote.context?.length?`<div class="sample-review-context">${quote.context.map(m=>`<div class="${m.messageIndex===quote.messageIndex?'anchor':''}"><small>${m.role==='user'?'CHILD':'DINO'} · ${esc(m.timestamp)} 北京时间</small><p dir="auto">${esc(m.original)}</p>${m.translation?`<p class="sample-review-en" dir="auto">English translation: ${esc(m.translation)}</p>`:''}</div>`).join('')}</div>`:`<blockquote dir="auto">“${esc(quote.original)}”</blockquote>${translated?`<div class="sample-study-translation"><b>English translation</b><p>“${esc(translated)}”</p></div>`:''}`;
 const rationale=axis==='intents'&&row.intentReview?`<p class="sample-review-rationale"><b>会话复核说明</b>${esc(row.intentReview.rationale)}</p>`:'';
 return `<article class="sample-study-evidence-card"><span>${String(index+1).padStart(2,'0')}</span><div><div class="sample-study-evidence-meta"><b>Level ${esc(row.level)}</b><small>${esc(row.age)} 岁 · ${esc(countryName(row.country))} · ${esc(quote.timestamp||row.date)} 北京时间</small></div>${rationale}${snippet}</div><button type="button" data-sample-transcript="${row.sid}" data-sample-entry="${entry}" data-sample-axis="${axis}" data-sample-key="${key}">查看完整原文 <i>↗</i></button></article>`;
}
function intentReviewOverview(rows,active){
 const coded=rows.filter(row=>row.intentReview?.status==='coded').length;
 return `<aside class="sample-review-overview"><div><span>CONTEXT REVIEW / 2026-10-13</span><p>先读完整上下文，再归纳诉求。AI 已复核本入口固定样本，保留既有人工更正。</p><small>当前筛选：${coded} / ${rows.length} 段有可识别诉求。其余仍在分母内；以下是证据状态，不是意图类别。</small></div><div>${Object.entries(REVIEW_STATES).map(([key,def])=>`<button type="button" data-sample-category="${key}" data-sample-axis="intents" aria-pressed="${active===key}" class="${active===key?'active':''}" ${rows.some(row=>matches(row,'intents',key))?'':'disabled'}><b>${esc(def.label)}</b><span>${rows.filter(row=>matches(row,'intents',key)).length} / ${rows.length}</span></button>`).join('')}</div></aside>`;
}
function openingPoolComparison(entry){
 return `<aside class="sample-study-opening-pool" aria-label="${esc(entry)} 固定首句池与话题分析数据边界"><header><div><span>DATA BOUNDARY / PRODUCT MECHANISM</span><h4>缺失的 Dino 首句，可能已经决定了学生接下来谈什么</h4></div><strong>共用首句池 · 16 条</strong></header><div class="sample-study-opening-alert"><b>如何阅读话题比例</b><p>HOME 与 EXPLORE 的 chat history 不包含 Dino 的首句话。因此当前“话题分析”只能说明：<em>学生可见回复中出现了什么话题</em>；不能据此判断话题一定由学生主动发起。以下固定池本身已覆盖颜色、动物、数字、食物、情绪、故事、游戏和太空等主题，学生的首个回答可能是在承接一条未记录的引导语。</p></div><div class="sample-study-opening-columns"><section><div><b>未聊过时</b><span>4 条欢迎语</span></div><ol>${FIXED_OPENING_POOL.welcome.map(line=>`<li><q>${esc(line)}</q></li>`).join('')}</ol></section><section><div><b>当前会话聊过后</b><span>12 条话题引导</span></div><ol>${FIXED_OPENING_POOL.topics.map(([line,tag])=>`<li><q>${esc(line)}</q><small>${esc(tag)}</small></li>`).join('')}</ol></section></div><footer><p><b>选择规则：</b>首次随机取一条；发生新一轮对话后，下次展示会随机换一条并避免连续重复。“聊过”只记录在当前会话，切 Tab 或切前后台不会换句。</p><p><b>两个例外：</b>首页外层 Dino 气泡有任务引导时可能展示任务文案；课后口语练习单独固定为 <q>It's time to chat! Are you ready?</q></p><p><b>分析限制：</b>当前无法为单个 Session 还原实际展示了哪条首句，因此这里只做产品机制对照，不从比例中扣除或反推固定池贡献。</p></footer></aside>`;
}
function axisPanel(entry,axis,number,title,deck,rows){
 const state=stateFor(entry),list=categories(entry,axis,rows);
 const reviewOptions=axis==='intents'?Object.entries(REVIEW_STATES).map(([key,def])=>({key,...def,count:rows.filter(row=>matches(row,axis,key)).length})).filter(item=>item.count):[],choices=[...list,...reviewOptions];
 if(!rows.length||!choices.length)return `<article class="sample-study-axis"><div class="sample-study-axis-head"><span>${number}</span><div><h3>${title}</h3><p>${deck}</p></div></div><p class="sample-study-empty">当前筛选下没有可展示的命中样本。</p></article>`;
 if(!choices.some(item=>item.key===state.active[axis]))state.active[axis]=choices[0].key;
 const active=choices.find(item=>item.key===state.active[axis]),evidence=diverseEvidence(rows,axis,active.key,state.evidenceBatch[axis]),canRotate=active.count>10;
 const scopeNote=axis==='intents'?'<b>SESSION 出现率</b><small>分子：命中 Session · 分母：抽样 Session</small>':'<b>SESSION 口径</b><small>多标签，合计可超过 100%</small>';
 return `<article class="sample-study-axis" data-sample-axis-panel="${axis}"><div class="sample-study-axis-head"><span>${number}</span><div><h3>${title}</h3><p>${deck}</p></div><aside>${scopeNote}</aside></div>${axis==='intents'?intentReviewOverview(rows,active.key):''}<div class="sample-study-ranking">${list.map((item,index)=>`<button type="button" data-sample-category="${item.key}" data-sample-axis="${axis}" class="${item.key===active.key?'active':''}" aria-pressed="${item.key===active.key}"><span>${String(index+1).padStart(2,'0')}</span><div><b>${esc(item.label)}</b><small>${esc(item.definition)}</small><i style="--sample-rate:${rows.length?item.count/rows.length*100:0}%"></i></div><strong>${pct(item.count,rows.length)}<small>${fmt(item.count)} / ${fmt(rows.length)}</small></strong></button>`).join('')}</div>${axis==='topics'?openingPoolComparison(entry):''}${axis==='intents'&&active.boundary?`<p class="sample-review-boundary"><b>分类边界</b>${esc(active.boundary)}</p>`:''}<section class="sample-study-evidence"><header><div><span>TEXT EVIDENCE</span><h4>${esc(active.label)}</h4></div><aside class="sample-study-evidence-tools"><p>当前筛选下的匿名原文证据；每批最多 10 条。</p><button type="button" data-sample-evidence-next="${axis}" ${canRotate?'':'disabled'} aria-label="换一批${esc(active.label)}文本证据">换一批 <i>↻</i></button></aside></header><div>${evidence.length?evidence.map((row,index)=>evidenceCard(row,entry,axis,active.key,index)).join(''):'<p class="sample-study-empty">当前筛选下暂无可展示证据。</p>'}</div></section></article>`;
}
function intentCalculationDetails(entry,rows){
 const leading=categories(entry,'intents',rows)[0],total=DATA.samples[entry].length,dates=DATA.samples[entry].map(row=>row.date).sort();
 const unresolved=rows.filter(row=>!row.intents.length).length;
 const example=leading?`<p class="sample-intent-example"><b>当前示例：</b>${esc(leading.label)} = ${fmt(leading.count)} 个命中 Session ÷ ${fmt(rows.length)} 个抽样 Session = <strong>${pct(leading.count,rows.length)}</strong></p>`:'<p class="sample-intent-example">当前筛选下没有已确认的意图；证据不足不等于没有需求。</p>';
 return `<details class="sample-study-method sample-intent-calculation"><summary><span>查看取数与计算规则</span><i aria-hidden="true">+</i></summary><div><div class="sample-intent-rule-grid"><section><span>01 / 取数对象</span><b>保留原有固定样本</b><p>${esc(entry)} 按 Level 1–4 分层，每级 40 个，共 ${total} 个 Session。样本日期 ${esc(dates[0])} 至 ${esc(dates.at(-1))}；阅读的是完整已记录会话，不只读取命中单句。</p></section><section><span>02 / 分子</span><b>有上下文证据的 Session 数</b><p>每类独立去重，同一意图在一段对话中重复出现只计 1 次。明确受邀选择也可计入，因此出现率不等于自发发起率。</p></section><section><span>03 / 分母</span><b>当前筛选下全部抽样 Session</b><p>包含未判定及仅见承接的 ${unresolved} 段，不删去这些样本抬高比例。仅本区 Level、年龄、国家筛选改变分子与分母；顶部日期筛选不改变这批固定样本。</p></section><section><span>04 / 多意图</span><b>同一个 Session 可以同时命中多类</b><p>例如“跟随课后练习”与“自我表达与倾诉”同时出现；各意图比例之和可以超过 100%。证据状态单独展示，不混进意图排名。</p></section></div><p class="sample-intent-formula"><b>计算公式</b><code>意图 Session 出现率 = 命中该意图的 Session 数 ÷ 当前抽样 Session 数</code></p>${example}<p><b>归纳过程：</b>${esc(DATA.meta.intentReviewMethod)}</p><p><b>范围与限制：</b>${esc(DATA.meta.limits)}</p><p><b>首句缺失：</b>HOME／EXPLORE 没有记录 Dino 固定池首句，不能仅凭第一条短答反推学生主动意图。原文未提供音频核验，含混片段不强行解释。</p><p><b>注意：</b>这不是“命中消息数 ÷ 所有消息数”，也不是全量入口的概率。它描述本次抽样的可观察意图信号，仍可继续人工更正；目前没有置信区间或总体加权估计。</p></div></details>`;
}
function bind(target,entry,rerender){
 const state=stateFor(entry);
 target.querySelectorAll('[data-sample-filter]').forEach(select=>select.addEventListener('change',()=>{state[select.dataset.sampleFilter]=select.value;state.active={topics:'',behaviors:'',intents:''};state.evidenceBatch={topics:0,behaviors:0,intents:0};rerender()}));
 target.querySelector('[data-sample-reset]')?.addEventListener('click',()=>{state.level=state.age=state.country='all';state.active={topics:'',behaviors:'',intents:''};state.evidenceBatch={topics:0,behaviors:0,intents:0};rerender()});
 target.querySelectorAll('[data-sample-category]').forEach(button=>button.addEventListener('click',()=>{state.active[button.dataset.sampleAxis]=button.dataset.sampleCategory;state.evidenceBatch[button.dataset.sampleAxis]=0;rerender()}));
 target.querySelectorAll('[data-sample-evidence-next]').forEach(button=>button.addEventListener('click',()=>{state.evidenceBatch[button.dataset.sampleEvidenceNext]+=1;rerender()}));
 target.querySelectorAll('[data-sample-transcript]').forEach(button=>button.addEventListener('click',()=>openTranscript(button.dataset.sampleTranscript,button.dataset.sampleEntry,button.dataset.sampleAxis,button.dataset.sampleKey,button)));
}
function renderEntryStudy(entry){
 const section=document.querySelector('#sampledConversationAnalysisSection'),target=document.querySelector('#sampledConversationAnalysis');if(!section||!target)return;
 section.classList.remove('hidden');section.setAttribute('aria-hidden','false');
 const rows=filtered(entry),total=DATA.samples[entry].length;
 target.innerHTML=`<div class="sample-study-hero"><div><p class="eyebrow">OPEN CODING / FIXED SAMPLE</p><h3>${entry} 里，孩子在聊什么、怎么互动、想得到什么？</h3><p>${esc(DATA.meta.sampleMethod)}</p></div><div><strong>${fmt(rows.length)}</strong><span>当前筛选样本</span><small>入口固定样本 ${fmt(total)} 段</small></div></div>${filterBar(entry,'entry',rows)}${axisPanel(entry,'topics','04A','话题分析','从可见的学生回复中归纳话题；由于 Dino 首句未进入 chat history，比例不代表全部由学生主动发起。',rows)}${axisPanel(entry,'behaviors','04B','学生行为分析',entry==='HOME'?'参考 POST_CLASS 的观察维度，但重新从 HOME 样本归纳孩子如何承接首页引导、表达偏好与主动发起互动。':'参考 POST_CLASS 的观察维度，但重新从 EXPLORE 样本归纳孩子如何选题、追问与发起探索活动。',rows)}${axisPanel(entry,'intents','04C','学生意图分析','逐段结合上下文归纳：希望 Dino 做什么；不由单句或关键词自动命中。',rows)}${intentCalculationDetails(entry,rows)}<details class="sample-study-method"><summary>抽样、百分比与意图解读</summary><div><p><b>抽样：</b>${esc(DATA.meta.sampleMethod)}</p><p><b>分母：</b>${esc(DATA.meta.denominator)}</p><p><b>行为口径：</b>POST_CLASS 只作为观察框架参考；HOME 与 EXPLORE 分别依据自己的固定样本开放编码，因此分类数量、名称与占比不要求一致。</p><p><b>首句边界：</b>HOME 与 EXPLORE 的 chat history 不含 Dino 首句话；“简短承接”只描述首条可见学生消息的形式，不能还原当时具体看到了哪条开场文案。</p><p><b>限制：</b>${esc(DATA.meta.limits)}</p></div></details>`;
 bind(target,entry,()=>renderEntryStudy(entry));
}
function renderPostIntent(){
 const target=document.querySelector('#postClassStudentIntent');if(!target)return;
 const entry='POST_CLASS',rows=filtered(entry);
 target.innerHTML=`<div class="sample-study-post-intro"><p>重新阅读 POST_CLASS 完整已记录上下文：区分课内回应与学生额外提出的诉求，允许一个 Session 同时包含多个意图。</p><strong>${fmt(rows.length)}<small>当前筛选样本</small></strong></div>${filterBar(entry,'post',rows)}${axisPanel(entry,'intents','01','意图与期望角色','每种意图独立统计 Session 出现率；同一个 Session 可以同时命中“跟随课后练习”、“自由聊天与陪伴”等多个意图。',rows)}${intentCalculationDetails(entry,rows)}`;
 bind(target,entry,renderPostIntent);
}
function closeTranscript(){if(!activeModal)return;activeModal.remove();activeModal=null;document.body.classList.remove('sample-study-modal-open');if(lastTrigger?.isConnected)lastTrigger.focus();lastTrigger=null}
function transcript(sid){const bucket=Math.floor(Number(sid)/128);if(!transcriptCache.has(bucket)){const fingerprint=A?.sourceFingerprint||'1';transcriptCache.set(bucket,fetch(`analysis/transcripts/${bucket}.json?v=${fingerprint}&view=sample-study-1`).then(response=>{if(!response.ok)throw new Error('原文加载失败');return response.json()}).catch(error=>{transcriptCache.delete(bucket);throw error}))}return transcriptCache.get(bucket).then(data=>root.DinoDialogueTranslations?.session(data[sid])||data[sid])}
function messageHtml(message,index,highlight=false){const child=message.role==='user',translation=String(message.translation||'').trim(),timestamp=message.timestamp||message.date||'';return `<article class="sample-study-message ${child?'child':'dino'}${highlight?' review-anchor':''}"><div><b>${child?'CHILD':'DINO'}</b><span>${String(index+1).padStart(2,'0')}</span><time datetime="${esc(timestamp.replace(' ','T'))}">${esc(timestamp)} <i>北京时间</i></time></div><p dir="auto">${esc(message.text)||'（空文本）'}</p>${translation?`<aside><b>English translation</b><p>${esc(translation)}</p></aside>`:''}</article>`}
async function openTranscript(sid,entry,axis,key,trigger){
 closeTranscript();lastTrigger=trigger;
 try{
  const session=await transcript(sid),row=DATA.samples[entry].find(item=>String(item.sid)===String(sid)),definition=defs(entry,axis)[key];if(!session||!row||!definition)return;
  const translated=session.messages.some(message=>String(message.translation||'').trim()),first=session.messages.find(message=>message.timestamp)?.timestamp||row.date;
  const shell=document.createElement('div');shell.className='sample-study-modal-shell';shell.innerHTML=`<div class="sample-study-modal-mask" data-sample-modal-close></div><aside class="sample-study-modal" role="dialog" aria-modal="true" aria-labelledby="sampleStudyModalTitle"><header><div><p class="eyebrow">FULL CONVERSATION / ${entry} / Level ${esc(row.level)}</p><h2 id="sampleStudyModalTitle">${esc(definition.label)}</h2><p>${esc(row.age)} 岁 · ${esc(countryName(row.country))} · ${esc(first)} 北京时间 · ${session.messages.length} 条消息</p></div><button type="button" data-sample-modal-close aria-label="关闭完整原对话">×</button></header>${translated?'<div class="sample-study-language-note"><b>EN</b><span>原文完整保留；英文为辅助译文，含混转写不据此补全含义。</span></div>':''}${entry==='HOME'||entry==='EXPLORE'?'<div class="sample-study-source-gap"><b>GAP</b><span>数据源不记录 Dino 的首条固定引导；以下原文从首条已记录消息开始，开头的学生回答可能是在承接首句池。</span></div>':''}<div class="sample-study-time-note"><b>TIME</b><span>每条 original 显示数据源的日期与时间，已统一转换为北京时间。</span></div><div class="sample-study-transcript">${axis==='intents'&&row.intentReview?`<div class="sample-review-drawer-note"><b>完整会话复核 · AI 判断，可人工更正</b><p>${esc(row.intentReview.rationale)}</p><small>本段标签：${row.intents.map(k=>esc(DATA.codebooks.intents[k].label)).join('、')||esc(definition.label)}。以下标亮选中类别的证据位置。</small></div>`:''}${session.messages.map((m,i)=>messageHtml(m,i,axis==='intents'&&row.quotes.intents[key]?.messageIndex===i)).join('')}</div><footer><span>完整对话按原始消息顺序展示，不展示用户或 Session 标识。</span><button type="button" data-sample-modal-close>关闭</button></footer></aside>`;
  document.body.append(shell);activeModal=shell;document.body.classList.add('sample-study-modal-open');shell.querySelectorAll('[data-sample-modal-close]').forEach(button=>button.addEventListener('click',closeTranscript));shell.querySelector('.sample-study-modal>header button').focus();
 }catch(_){if(lastTrigger?.isConnected){lastTrigger.textContent='原文暂时无法加载';lastTrigger.disabled=true}}
}
function render(state){
 const entrySection=document.querySelector('#sampledConversationAnalysisSection'),target=document.querySelector('#sampledConversationAnalysis'),visible=state.page==='entry';
 if(!visible){entrySection?.classList.add('hidden');closeTranscript();return}
 const entry=D.dimensions.entries[state.entry];
 if(state.entry<2)renderEntryStudy(entry);else{entrySection?.classList.add('hidden');if(target)target.innerHTML='';renderPostIntent()}
}
root.DinoSampledConversationAnalysis={render,categories,diverseEvidence};
if(typeof document!=='undefined'){
 document.addEventListener('dino:render',event=>render(event.detail));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')closeTranscript()});
}
})(typeof window==='undefined'?globalThis:window);
