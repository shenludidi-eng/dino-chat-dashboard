/* Unified bad-case archive: automatic rule candidates plus browser-local manual records. */
((root)=>{
'use strict';
const D=root.DINO_DATA;if(!D)return;
const $=selector=>document.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt=value=>new Intl.NumberFormat('zh-CN').format(value||0);
const STORAGE_KEY='dino.badCaseLibrary.manual.v1',PAGE_SIZE=20;
const curatedRecords=[{
 id:'review-post-class-20261009-repeated-question',source:'review',date:'2026-10-09',entry:2,round:9,
 profile:{age:'9-12',level:'3',country:'VN'},
 title:'同一 Session 内反复提问同一问题',
 issueType:'会话记忆／问题去重',
 tags:['重复相同问题'],
 otherTags:['忽略用户已确认答案','上下文未保持','对话推进受阻'],
 note:'孩子在 Round 2、3、5 已三次明确说明今天是 Friday，Dino 仍反复询问今天是星期几；“一周有几天”也在 Round 3 与 Round 6 重复出现。重复提问没有利用本 Session 已获得的答案，造成对话原地循环。',
 transcript:[
  {role:'child',index:1,time:'21:51:31',text:"Yes, I'm ready."},
  {role:'dino',index:2,time:'21:51:31',text:'Hi! I’m Dino. What day is it today for you?',repeat:true},
  {role:'child',index:3,time:'21:51:42',text:"It's Friday.",evidence:true},
  {role:'dino',index:4,time:'21:51:42',text:'Oh, Friday! Nice. Is today Sunday, Monday, or Tuesday for you?',repeat:true},
  {role:'child',index:5,time:'21:51:54',text:"No, it's Friday.",evidence:true},
  {role:'dino',index:6,time:'21:51:54',text:'Oh, Friday is a fun day. How many days are there in a week?',repeat:true},
  {role:'child',index:7,time:'21:52:05',text:"It's half seven day."},
  {role:'dino',index:8,time:'21:52:05',text:'Oh, that sounds funny. Is today Monday or Tuesday for you?',repeat:true},
  {role:'child',index:9,time:'21:52:19',text:'Hi I want today. And today is Friday.',evidence:true},
  {role:'dino',index:10,time:'21:52:19',text:'Friday is a nice day. Is tomorrow Monday or Tuesday?'},
  {role:'child',index:11,time:'21:52:37',text:'Monday for Tuesday.'},
  {role:'dino',index:12,time:'21:52:37',text:'Oh, Monday or Tuesday sounds tricky. How many days are there in a week?',repeat:true},
  {role:'child',index:13,time:'21:52:49',text:'7.'},
  {role:'dino',index:14,time:'21:52:49',text:'Great, seven days is right. Is Tuesday a day you know well?'},
  {role:'child',index:15,time:'21:52:59',text:'Guests have eat.'},
  {role:'dino',index:16,time:'21:52:59',text:'That sounds funny. What do you like to eat on Sunday?'},
  {role:'child',index:17,time:'21:53:13',text:'I can. Beautiful fruit.'},
  {role:'dino',index:18,time:'21:53:13',text:'That sounds lovely. Goodbye!'}
 ]
}];
const sessionUser=new Map(D.sessionRows.map(row=>[row[2],row[1]]));
const countryNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
const countryName=code=>code==='未记录'?code:`${countryNames?.of(code)||code} · ${code}`;
const evidenceMap=new Map();
Object.entries(D.badEvidence||{}).forEach(([tag,items])=>items.forEach(item=>{
 const key=[item.date,item.entry,item.round,item.profileUser].join('|');
 if(!evidenceMap.has(key))evidenceMap.set(key,{...item,tags:[]});
 evidenceMap.get(key).tags.push(tag);
}));
function profile(user){
 const indexes=D.userProfiles?.[user];
 return indexes?{age:D.dimensions.ageBands[indexes[0]]||'未记录',level:D.dimensions.levels[indexes[1]]||'未记录',country:D.dimensions.countries[indexes[2]]||'未记录'}:{age:'未记录',level:'未记录',country:'未记录'};
}
const automaticRecords=D.aiRows.filter(row=>row[8]).map((row,index)=>{
 const user=sessionUser.get(row[2]),date=D.dimensions.dates[row[0]],tags=D.dimensions.badCases.filter((_,tagIndex)=>row[9+tagIndex]);
 return{id:`ai-${index}`,source:'ai',date,entry:row[1],round:row[3],profile:profile(user),tags,otherTags:['自动规则命中','待人工复核'],note:'由现有自动识别规则生成的候选记录，需结合完整上下文人工复核。',evidence:evidenceMap.get([date,row[1],row[3],user].join('|'))||null};
}).sort((a,b)=>b.date.localeCompare(a.date)||b.round-a.round);
let manualRecords=loadManual(),page=1;
const filters={source:'all',entry:'all',age:'all',level:'all',country:'all',tag:'all',query:''};
function loadManual(){try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(value)?value:[]}catch(_){return[]}}
function saveManual(){localStorage.setItem(STORAGE_KEY,JSON.stringify(manualRecords))}
function allRecords(){return [...curatedRecords,...manualRecords,...automaticRecords]}
function option(value,label=value){return `<option value="${esc(value)}">${esc(label)}</option>`}
function options(values,labeler=value=>value){return `<option value="all">全部</option>${values.map(value=>option(value,labeler(value))).join('')}`}
function matches(record){
 if(filters.source!=='all'&&record.source!==filters.source)return false;
 if(filters.entry!=='all'&&String(record.entry)!==filters.entry)return false;
 if(filters.age!=='all'&&record.profile.age!==filters.age)return false;
 if(filters.level!=='all'&&record.profile.level!==filters.level)return false;
 if(filters.country!=='all'&&record.profile.country!==filters.country)return false;
 if(filters.tag!=='all'&&![...record.tags,...record.otherTags].includes(filters.tag))return false;
 const haystack=[record.title,record.issueType,record.note,record.profile.age,record.profile.level,record.profile.country,D.dimensions.entries[record.entry],...record.tags,...record.otherTags].join(' ').toLowerCase();
 return !filters.query||haystack.includes(filters.query);
}
function sourceBadge(record){if(record.source==='ai')return '<span class="bad-case-source ai"><i></i>AI 自动识别</span>';if(record.source==='review')return '<span class="bad-case-source review"><i></i>人工精选</span>';return '<span class="bad-case-source manual"><i></i>人工录入</span>'}
function profileTags(record){return `<div class="bad-case-profile"><span><small>年龄</small>${esc(record.profile.age)}${record.profile.age==='未记录'?'':' 岁'}</span><span><small>LEVEL</small>${record.profile.level==='未记录'?'未记录':`Level ${esc(record.profile.level)}`}</span><span><small>国家</small>${esc(countryName(record.profile.country))}</span></div>`}
function recordRow(record,index){
 const issueType=record.issueType||record.tags[0]||'其他 Bad case';
 return `<article class="bad-case-record${record.source==='review'?' is-curated':''}"><div class="bad-case-record-index">${String((page-1)*PAGE_SIZE+index+1).padStart(3,'0')}</div><div class="bad-case-record-main"><div class="bad-case-record-top">${sourceBadge(record)}<time datetime="${esc(record.date)}">${esc(record.date)}${record.round?` · ${esc(record.round)} 轮`:''}</time><span class="bad-case-entry">${esc(D.dimensions.entries[record.entry])}</span></div><h3>${esc(record.title||record.tags[0]||'其他 Bad case')}</h3><p>${esc(record.note)}</p><div class="bad-case-taxonomy"><div><small>问题类型</small><strong>${esc(issueType)}</strong></div><div><small>标签</small><div class="bad-case-tags">${record.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}${record.otherTags.map(tag=>`<span class="other">${esc(tag)}</span>`).join('')}</div></div></div></div>${profileTags(record)}<button type="button" data-bad-case-detail="${esc(record.id)}">${record.transcript?'展开原对话':'查看记录'} <i>↗</i></button></article>`;
}
function render(){
 const target=$('#badCaseLibrary');if(!target)return;
 const records=allRecords(),visible=records.filter(matches),pages=Math.max(1,Math.ceil(visible.length/PAGE_SIZE));page=Math.min(page,pages);const slice=visible.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
 const aiCount=records.filter(record=>record.source==='ai').length,reviewCount=records.filter(record=>record.source==='review').length,manualCount=records.filter(record=>record.source==='manual').length;
 target.innerHTML=`<section class="bad-case-overview"><article><span>ALL RECORDS</span><strong>${fmt(records.length)}</strong><small>三类来源统一归档</small></article><article><span>AI 自动识别</span><strong>${fmt(aiCount)}</strong><small>规则候选 · 待人工复核</small></article><article><span>人工精选</span><strong>${fmt(reviewCount)}</strong><small>已核对标签与完整原对话</small></article><article><span>人工录入</span><strong>${fmt(manualCount)}</strong><small>当前浏览器本地记录</small></article></section>
 <section id="badCaseFilterSection" class="bad-case-controls"><div class="bad-case-controls-head"><div><span>LIBRARY CONTROLS</span><h3>筛选与记录</h3><p>用户画像、入口和其他标签会同时作用于下方记录。</p></div><button type="button" id="badCaseAdd">＋ 人工录入</button></div><div class="bad-case-filter-grid"><label class="search"><span>搜索</span><input type="search" data-bad-filter="query" value="${esc(filters.query)}" placeholder="搜索问题、标签或画像"></label><label><span>来源</span><select data-bad-filter="source">${options(['ai','review','manual'],value=>({ai:'AI 自动识别',review:'人工精选',manual:'人工录入'}[value]))}</select></label><label><span>入口</span><select data-bad-filter="entry">${options(['0','1','2'],value=>D.dimensions.entries[+value])}</select></label><label><span>年龄</span><select data-bad-filter="age">${options(D.dimensions.ageBands,value=>value==='未记录'?value:`${value} 岁`)}</select></label><label><span>Level</span><select data-bad-filter="level">${options(D.dimensions.levels,value=>value==='未记录'?value:`Level ${value}`)}</select></label><label><span>国家／地区</span><select data-bad-filter="country">${options(D.dimensions.countries,countryName)}</select></label><label><span>其他标签</span><select data-bad-filter="tag">${options([...D.dimensions.badCases,'忽略用户已确认答案','上下文未保持','对话推进受阻','自动规则命中','待人工复核'])}</select></label><button type="button" id="badCaseReset">重置筛选</button></div><p class="bad-case-method"><b>AI 自动识别：</b>当前承接已有规则命中结果，一条对话可同时拥有多个问题标签；候选不等于最终定性。<b>人工精选：</b>已核对问题类型、标签与完整原对话。<b>人工录入：</b>保存在当前浏览器，适合补录自动规则未覆盖的案例。</p></section>
 <section id="badCaseRecordsSection" class="bad-case-records"><header><div><span>CASE REGISTER</span><h3>全部记录</h3></div><p>当前显示 <b>${fmt(visible.length)}</b> 条 · 第 ${page} / ${pages} 页</p></header><div class="bad-case-record-list">${slice.length?slice.map(recordRow).join(''):'<div class="bad-case-empty"><b>当前筛选下没有记录</b><span>可重置筛选，或人工录入一条新的 bad case。</span></div>'}</div><footer><button type="button" data-bad-page="prev" ${page===1?'disabled':''}>← 上一页</button><span>${page} / ${pages}</span><button type="button" data-bad-page="next" ${page===pages?'disabled':''}>下一页 →</button></footer></section>`;
 target.querySelectorAll('[data-bad-filter]').forEach(control=>{control.value=filters[control.dataset.badFilter];control.addEventListener(control.tagName==='INPUT'?'input':'change',()=>{filters[control.dataset.badFilter]=control.value.trim().toLowerCase();page=1;render()})});
 $('#badCaseReset').onclick=()=>{Object.assign(filters,{source:'all',entry:'all',age:'all',level:'all',country:'all',tag:'all',query:''});page=1;render()};
 $('#badCaseAdd').onclick=openManual;
 target.querySelectorAll('[data-bad-page]').forEach(button=>button.onclick=()=>{page+=button.dataset.badPage==='next'?1:-1;render();$('#badCaseRecordsSection').scrollIntoView({block:'start'})});
 target.querySelectorAll('[data-bad-case-detail]').forEach(button=>button.onclick=()=>openDetail(records.find(record=>record.id===button.dataset.badCaseDetail)));
}
function fillManualForm(){
 const form=$('#badCaseManualForm');if(!form||form.dataset.ready)return;form.dataset.ready='true';
 form.elements.date.min=D.meta.dateStart;form.elements.date.max=D.meta.dateEnd;form.elements.date.value=D.meta.dateEnd;
 form.elements.entry.innerHTML=D.dimensions.entries.map((value,index)=>option(index,value)).join('');
 form.elements.age.innerHTML=D.dimensions.ageBands.map(value=>option(value,value==='未记录'?value:`${value} 岁`)).join('');
 form.elements.level.innerHTML=D.dimensions.levels.map(value=>option(value,value==='未记录'?value:`Level ${value}`)).join('');
 form.elements.country.innerHTML=D.dimensions.countries.map(value=>option(value,countryName(value))).join('');
 form.elements.caseType.innerHTML=D.dimensions.badCases.map(value=>option(value)).join('')+option('其他 Bad case');
 form.addEventListener('submit',event=>{event.preventDefault();const values=Object.fromEntries(new FormData(form));const otherTags=String(values.otherTags||'').split(/[,，]/).map(value=>value.trim()).filter(Boolean);manualRecords.unshift({id:`manual-${Date.now()}`,source:'manual',date:values.date,entry:+values.entry,round:null,profile:{age:values.age,level:values.level,country:values.country},tags:[values.caseType],otherTags,note:values.note.trim(),transcript:values.transcript.trim(),createdAt:new Date().toISOString()});saveManual();form.reset();form.elements.date.value=D.meta.dateEnd;$('#badCaseManualDialog').close();page=1;render()});
 document.querySelectorAll('[data-bad-case-close]').forEach(button=>button.onclick=()=>button.closest('dialog').close());
}
function openManual(){fillManualForm();$('#badCaseManualDialog').showModal()}
function dialogueEnglish(text,existing){const value=root.DinoDialogueTranslations?.get(text,existing)||existing;return value?`<div class="translation" lang="en">${esc(value)}</div>`:''}
function detailEvidence(record){
 if(Array.isArray(record.transcript))return `<div class="bad-case-full-transcript">${record.transcript.map(message=>`<article class="${message.role}${message.repeat?' is-repeat':''}${message.evidence?' is-evidence':''}"><header><b>${message.role==='dino'?'DINO':'CHILD'}</b><span>${String(message.index).padStart(2,'0')}</span><time>${esc(record.date)} ${esc(message.time)} · 北京时间</time>${message.repeat?'<em>重复提问证据</em>':''}${message.evidence?'<em>用户已明确回答</em>':''}</header><p dir="auto">${esc(message.text)}</p>${dialogueEnglish(message.text,message.translation)}</article>`).join('')}</div>`;
 if(record.source==='manual')return record.transcript?`<pre class="bad-case-transcript">${esc(record.transcript)}</pre>`:'<p class="bad-case-no-evidence">本条人工记录没有附 original transcript。</p>';
 const item=record.evidence;if(!item)return '<p class="bad-case-no-evidence">该自动候选已进入记录库，但当前页面数据未附完整 transcript。需要回查原始会话后再完成复核。</p>';
 return `<div class="bad-case-excerpt"><div><b>CHILD</b><p dir="auto">${esc(item.user)}</p>${item.user_en?`<small>English translation · ${esc(item.user_en)}</small>`:''}</div><div class="dino"><b>DINO</b><p dir="auto">${esc(item.dino)}</p>${item.dino_en?`<small>English translation · ${esc(item.dino_en)}</small>`:''}</div></div>`;
}
function openDetail(record){if(!record)return;const target=$('#badCaseDetail');const issueType=record.issueType||record.tags[0]||'其他 Bad case';target.innerHTML=`<header><div><p class="eyebrow">BAD CASE RECORD</p><h2 id="badCaseDetailTitle">${esc(record.title||record.tags[0]||'其他 Bad case')}</h2><p>${sourceBadge(record)} · ${esc(D.dimensions.entries[record.entry])} · ${esc(record.date)}${record.round?` · ${esc(record.round)} 轮`:''}</p></div><button type="button" data-bad-detail-close aria-label="关闭">×</button></header><section><h3>问题类型与标签</h3><div class="bad-case-issue-type"><small>问题类型</small><strong>${esc(issueType)}</strong></div><div class="bad-case-tags">${record.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}${record.otherTags.map(tag=>`<span class="other">${esc(tag)}</span>`).join('')}</div></section><section><h3>用户信息</h3>${profileTags(record)}</section><section><h3>记录说明</h3><p>${esc(record.note)}</p></section><section><h3>${record.transcript?'完整原对话':'Original transcript / 文本证据'}</h3>${detailEvidence(record)}</section><footer><span>${record.source==='ai'?'AI 候选需要人工结合完整上下文复核。':record.source==='review'?'人工精选案例已核对标签与完整上下文。':'人工录入记录保存在当前浏览器。'}</span><button type="button" data-bad-detail-close>关闭</button></footer>`;target.querySelectorAll('[data-bad-detail-close]').forEach(button=>button.onclick=()=>$('#badCaseDetailDialog').close());$('#badCaseDetailDialog').showModal()}
function handlePage(state){const active=state.page==='badcases';if(!active){$('#badCaseDetailDialog')?.open&&$('#badCaseDetailDialog').close();return}fillManualForm();render()}
document.addEventListener('dino:render',event=>handlePage(event.detail||{}));
root.DinoBadCaseLibrary={render,automaticRecords};
})(typeof window==='undefined'?globalThis:window);
