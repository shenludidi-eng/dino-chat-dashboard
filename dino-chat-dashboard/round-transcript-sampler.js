/* Entry-scoped transcript sampling by coarse conversation-depth bands. */
((root)=>{
'use strict';
const bands=[
 {label:'≤2 轮',test:n=>Number.isFinite(n)&&n<=2},
 {label:'3–5 轮',test:n=>n>=3&&n<=5},
 {label:'6–10 轮',test:n=>n>=6&&n<=10},
 {label:'11–20 轮',test:n=>n>=11&&n<=20},
 {label:'21+ 轮',test:n=>n>=21},
];
const sampleSize=3,batchSize=12,maxScanned=72,states=new Map(),transcriptCache=new Map();
let activeModal=null,lastModalTrigger=null;
// Sessions whose detected local-language messages all have reviewed English translations.
const translatedLocalSessions=new Set([1787,2154,3228,7310,10078,11866,12108,12531,12536,13177]);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt=value=>new Intl.NumberFormat('zh-CN').format(value||0);
const pct=(value,total)=>total?`${(value/total*100).toFixed(1)}%`:'—';
const bandIndex=rounds=>bands.findIndex(band=>band.test(rounds));
const firstTimestamp=session=>session?.messages?.find(message=>message.timestamp)?.timestamp||session?.messages?.[0]?.date||'';
const requiresTranslation=message=>[1,2].includes(message?.language)&&String(message?.text||'').trim();
const translationSafe=session=>Boolean(session?.messages?.length)&&session.messages.every(message=>!requiresTranslation(message)||String(message.translation||'').trim());
const hash=value=>Math.imul((Number(value)||0)+1,2654435761)>>>0;
const ordered=rows=>[...rows].sort((a,b)=>Number(translatedLocalSessions.has(b[2]))-Number(translatedLocalSessions.has(a[2]))||hash(a[2])-hash(b[2])||b[3]-a[3]);
function transcript(sessionId){
 const bucket=Math.floor(sessionId/128);
 if(!transcriptCache.has(bucket)){
  const fingerprint=root.DINO_ENTRY_ANALYSIS?.sourceFingerprint||'1';
  const request=fetch(`analysis/transcripts/${bucket}.json?v=${fingerprint}&view=all-entry-time-1`).then(response=>{if(!response.ok)throw new Error('原始对话加载失败');return response.json()}).catch(error=>{transcriptCache.delete(bucket);throw error});
  transcriptCache.set(bucket,request);
 }
 return transcriptCache.get(bucket).then(data=>root.DinoDialogueTranslations?.session(data[sessionId])||data[sessionId]);
}
function countryName(index){
 const code=root.DINO_DATA.dimensions.countries[index];
 if(code==='未记录')return code;
 try{return `${new Intl.DisplayNames(['zh-CN'],{type:'region'}).of(code)||code} · ${code}`}catch(_){return code}
}
function profileLabel(row){
 const data=root.DINO_DATA,profile=data.userProfiles[row[1]]||[],level=data.dimensions.levels[profile[1]]||'未记录';
 return `${level==='未记录'?'Level 未记录':`Level ${level}`} · ${countryName(profile[2])}`;
}
function messageHtml(message,index){
 const child=message.role==='user',translation=String(message.translation||'').trim();
 const timestamp=message.timestamp||message.date||'',dateTime=timestamp.replace(' ','T');
 return `<article class="round-sample-message ${child?'child':'dino'}"><div><b>${child?'CHILD':'DINO'}</b><span>${String(index+1).padStart(2,'0')}</span><small>${message.round?`R${message.round}`:'开场'} · <time${dateTime?` datetime="${esc(dateTime)}"`:''}>${esc(timestamp)}${message.timestamp?' <em>北京时间</em>':''}</time></small></div><p class="round-sample-original" dir="auto">${esc(message.text)||'（空文本）'}</p>${translation?`<div class="round-sample-translation"><b>English translation</b><p>${esc(translation)}</p></div>`:''}</article>`;
}
function sampleHtml(item,index){
 const {row,session}=item,rounds=row[5],timestamp=firstTimestamp(session)||root.DINO_DATA.dimensions.dates[row[3]];
 const previewMessage=session.messages.find(message=>message.role==='user'&&String(message.text||'').trim())||session.messages[0],preview=previewMessage?.text||'展开查看完整对话';
 return `<article class="round-sample-card"><span>${String(index+1).padStart(2,'0')}</span><div><b>匿名样本 ${String(index+1).padStart(2,'0')}</b><small>${esc(profileLabel(row))} · ${esc(timestamp)}${session.messages.some(message=>message.timestamp)?' 北京时间':''}</small><p dir="auto">${esc(preview)}</p>${previewMessage?.translation?`<div class="round-sample-translation"><b>English translation</b><p>${esc(previewMessage.translation)}</p></div>`:''}</div><strong>${rounds} 轮</strong><button type="button" data-round-sample-open="${index}">查看完整原文 <i>↗</i></button></article>`;
}
function closeTranscript(){
 if(!activeModal)return;
 activeModal.remove();activeModal=null;document.body.classList.remove('round-sample-modal-open');document.removeEventListener('keydown',onModalKeydown);
 if(lastModalTrigger?.isConnected)lastModalTrigger.focus();lastModalTrigger=null;
}
function onModalKeydown(event){if(event.key==='Escape')closeTranscript()}
function openTranscript(item,index,trigger){
 closeTranscript();lastModalTrigger=trigger;
 const {row,session}=item,timestamp=firstTimestamp(session)||root.DINO_DATA.dimensions.dates[row[3]],translated=session.messages.some(message=>String(message.translation||'').trim()),entry=root.DINO_DATA.dimensions.entries[row[0]];
 const shell=document.createElement('div');shell.className='round-sample-modal-shell';
 const hasTimestamp=session.messages.some(message=>message.timestamp);
 shell.innerHTML=`<div class="round-sample-modal-mask" data-round-sample-close></div><aside class="round-sample-modal" role="dialog" aria-modal="true" aria-labelledby="roundSampleModalTitle"><header><div><p class="eyebrow">FULL CONVERSATION / ${esc(profileLabel(row))}</p><h2 id="roundSampleModalTitle">匿名样本 ${String(index+1).padStart(2,'0')}</h2><p>${esc(entry)} · ${esc(timestamp)}${hasTimestamp?' 北京时间':''} · ${row[5]} 轮 · ${session.messages.length} 条消息</p></div><button type="button" data-round-sample-close aria-label="关闭完整原对话">×</button></header>${translated?'<div class="round-sample-language-note"><b>EN</b><span>原文完整保留；英文为辅助译文，含混转写不据此补全含义。</span></div>':''}${hasTimestamp?'<div class="round-sample-time-note"><b>TIME</b><span>每条原文显示数据源的日期与时间，已统一转换为北京时间。</span></div>':''}<div class="round-sample-transcript">${session.messages.map(messageHtml).join('')}</div><footer><span>完整对话按原始消息顺序展示</span><button type="button" data-round-sample-close>关闭</button></footer></aside>`;
 document.body.append(shell);activeModal=shell;document.body.classList.add('round-sample-modal-open');document.addEventListener('keydown',onModalKeydown);
 shell.querySelectorAll('[data-round-sample-close]').forEach(button=>button.addEventListener('click',closeTranscript));shell.querySelector('.round-sample-modal>header button').focus();
}
async function findSamples(rows,page,token){
 const list=ordered(rows),start=list.length?(page*17)%list.length:0,rotated=[...list.slice(start),...list.slice(0,start)],safe=[];
 for(let offset=0;offset<Math.min(rotated.length,maxScanned)&&safe.length<sampleSize;offset+=batchSize){
  const batch=rotated.slice(offset,offset+batchSize),loaded=await Promise.all(batch.map(row=>transcript(row[2]).then(session=>({row,session})).catch(()=>null)));
  if(token.cancelled)return [];
  safe.push(...loaded.filter(item=>item&&translationSafe(item.session)));
 }
 return safe.slice(0,sampleSize);
}
function shell(context,state){
 const target=document.querySelector('#roundTranscriptSamples');if(!target)return null;
 const groups=bands.map(()=>[]);context.sessions.forEach(row=>{const index=bandIndex(row[5]);if(index>=0)groups[index].push(row)});
 if(!groups[state.band]?.length)state.band=Math.max(0,groups.findIndex(group=>group.length));
 target.innerHTML=`<div class="round-sample-head"><div><span class="index">03D</span><h3>按轮次档位抽样对话</h3><p>从当前入口与筛选范围内抽取完整 original transcript；不展示用户或 Session 标识。</p></div><span class="unit">每次最多 3 段</span></div><div class="round-sample-bands" role="group" aria-label="选择抽样轮次档位">${bands.map((band,index)=>`<button type="button" data-round-sample-band="${index}" class="${state.band===index?'active':''}" aria-pressed="${state.band===index}" ${groups[index].length?'':'disabled'}><span>${band.label}</span><strong>${pct(groups[index].length,context.sessions.length)}</strong><small>${fmt(groups[index].length)} Session</small></button>`).join('')}</div><div class="round-sample-scope"><p>${esc(context.scopeKey)} · 当前档位 ${fmt(groups[state.band].length)} 个 Session</p><button type="button" id="roundSampleNext" ${groups[state.band].length>sampleSize?'':'disabled'}>换一批样本 ↻</button></div><div id="roundSampleResults" class="round-sample-results" aria-live="polite"><p class="round-sample-loading">正在读取匿名原始对话…</p></div>`;
 target.querySelectorAll('[data-round-sample-band]').forEach(button=>button.addEventListener('click',()=>{state.band=Number(button.dataset.roundSampleBand);state.page=0;refresh(context,state)}));
 target.querySelector('#roundSampleNext').onclick=()=>{state.page++;refresh(context,state)};
 return{target,rows:groups[state.band]};
}
async function refresh(context,state){
 if(state.token)state.token.cancelled=true;
 const token={cancelled:false};state.token=token;
 const view=shell(context,state);if(!view)return;
 try{
  const samples=await findSamples(view.rows,state.page,token);if(token.cancelled)return;
  const results=view.target.querySelector('#roundSampleResults');if(!results)return;
  results.innerHTML=samples.length?samples.map(sampleHtml).join(''):`<p class="round-sample-empty">当前档位没有可安全展示的样本。为保证本地语原文后都附有英文翻译，缺少译文的对话不会进入抽样展示。</p>`;
  results.querySelectorAll('[data-round-sample-open]').forEach(button=>button.addEventListener('click',()=>openTranscript(samples[Number(button.dataset.roundSampleOpen)],Number(button.dataset.roundSampleOpen),button)));
  if(samples.length&&samples.length<sampleSize)results.insertAdjacentHTML('beforeend',`<p class="round-sample-empty">当前筛选下仅找到 ${samples.length} 段译文完整的可展示样本。</p>`);
 }catch(_){if(!token.cancelled){const results=view.target.querySelector('#roundSampleResults');if(results)results.innerHTML='<p class="round-sample-empty">原始对话暂时加载失败，请稍后重试。</p>'}}
}
function render(context){
 closeTranscript();
 const signature=`${context.entry}|${context.scopeKey}`;
 let state=states.get(context.entry);
 if(!state){state={band:0,page:0,signature:'',token:null};states.set(context.entry,state)}
 if(state.signature!==signature){state.page=0;state.signature=signature}
 refresh(context,state);
}
root.DinoRoundTranscriptSampler={render,bands,bandIndex,translationSafe,firstTimestamp};
})(typeof window!=='undefined'?window:globalThis);
