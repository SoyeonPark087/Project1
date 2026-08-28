(() => {
  'use strict';

  const STORAGE_KEY = 'habitGardenDataV2';
  const LEGACY_STORAGE_KEY = 'habitGardenDataV1';
  const DAY_NAMES = ['일','월','화','수','목','금','토'];
  const ICONS = ['💧','🏃','📚','🧘','💊','🌿','✍️','🍎','🧹','😴','🎧','☕','🪥','🎨','💪','🚲','🥗','🌙'];
  const COLORS = ['#4AA8FF','#36BFA8','#F7C948','#FF8A5B','#FF6B8A','#9B87F5','#7CCB69','#F59E0B','#06B6D4','#EC77C7'];
  const COLOR_MIGRATION = {
    '#D7E8F5':'#4AA8FF', '#DDE8C7':'#36BFA8', '#FBE6D7':'#FF8A5B',
    '#FFD86B':'#F7C948', '#F9C7A8':'#FF8A5B', '#E8D7F5':'#9B87F5'
  };

  const state = {
    data: loadData(),
    screen: 'today',
    selectedHabitId: null,
    calendarCursor: startOfMonth(new Date()),
    selectedDate: dateKey(new Date()),
    statsHabitId: 'all',
    detailReturnScreen: 'today',
    detailEditBaseline: null,
    searchQuery: ''
  };

  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  function uid(){ return (crypto.randomUUID ? crypto.randomUUID() : 'id-'+Date.now()+'-'+Math.random().toString(16).slice(2)); }
  function dateKey(d){ const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
  function parseDate(key){ const [y,m,d]=key.split('-').map(Number); return new Date(y,m-1,d); }
  function startOfMonth(d){ return new Date(d.getFullYear(),d.getMonth(),1); }
  function sameMonth(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth(); }
  function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
  function todayKey(){ return dateKey(new Date()); }
  function isoDate(value){ return String(value || '').slice(0,10); }
  function isScheduled(habit, key){ return Array.isArray(habit.repeatDays) && habit.repeatDays.includes(parseDate(key).getDay()); }
  function getLog(habitId, key){ return state.data.logs.find(l=>l.habitId===habitId && l.date===key); }
  function ensureLog(habitId,key){ let log=getLog(habitId,key); if(!log){ log={id:uid(),habitId,date:key,count:0,completed:false,updatedAt:new Date().toISOString()}; state.data.logs.push(log); } return log; }

  function normalizeData(input){
    const data = input && typeof input==='object' ? input : {};
    data.habits = Array.isArray(data.habits) ? data.habits : [];
    data.logs = Array.isArray(data.logs) ? data.logs : [];
    data.settings = data.settings && typeof data.settings==='object' ? data.settings : {globalReminder:true,theme:'warm'};
    if(typeof data.settings.globalReminder!=='boolean') data.settings.globalReminder=true;
    if(!['warm','night'].includes(data.settings.theme)) data.settings.theme='warm';

    data.habits.forEach(h=>{
      const now = new Date().toISOString();
      h.id = h.id || uid();
      h.name = String(h.name || '이름 없는 습관');
      h.icon = String(h.icon || '🌿');
      h.color = COLOR_MIGRATION[String(h.color || '').toUpperCase()] || h.color || COLORS[0];
      h.repeatDays = Array.isArray(h.repeatDays) && h.repeatDays.length ? h.repeatDays.map(Number).filter(n=>n>=0&&n<=6) : [0,1,2,3,4,5,6];
      h.targetCount = Math.max(1, Math.min(20, Number(h.targetCount) || 1));
      h.reminderTime = String(h.reminderTime || '');
      h.createdAt = h.createdAt || now;
      h.updatedAt = h.updatedAt || h.createdAt;
      h.status = h.status==='paused' ? 'paused' : 'active';

      if(!Array.isArray(h.statusHistory) || !h.statusHistory.length){
        h.statusHistory=[{status:'active',at:h.createdAt}];
        if(h.status==='paused'){
          const pauseAt = h.statusChangedAt || new Date().toISOString();
          h.statusHistory.push({status:'paused',at:pauseAt});
        }
      }
      h.statusHistory = h.statusHistory
        .filter(e=>e && (e.status==='active'||e.status==='paused') && e.at)
        .map(e=>({status:e.status,at:String(e.at)}))
        .sort((a,b)=>a.at.localeCompare(b.at));
      if(!h.statusHistory.length) h.statusHistory=[{status:'active',at:h.createdAt}];
    });

    const habitIds = new Set(data.habits.map(h=>h.id));
    data.logs = data.logs.filter(l=>l && habitIds.has(l.habitId) && /^\d{4}-\d{2}-\d{2}$/.test(l.date || '')).map(l=>({
      id:l.id||uid(), habitId:l.habitId, date:l.date,
      count:Math.max(0,Number(l.count)||0), completed:!!l.completed,
      updatedAt:l.updatedAt||new Date().toISOString()
    }));
    return data;
  }

  function loadData(){
    try{
      const current=localStorage.getItem(STORAGE_KEY);
      if(current) return normalizeData(JSON.parse(current));
      const legacy=localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacy){
        const migrated=normalizeData(JSON.parse(legacy));
        localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated));
        return migrated;
      }
    }catch(e){ console.warn('데이터 불러오기 실패',e); }
    return seedData();
  }

  function saveData(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }
    catch(e){ console.warn('데이터 저장 실패',e); toast('저장 공간을 사용할 수 없어요.'); }
  }

  function seedData(){
    const now=new Date().toISOString();
    const createdAt=dateKey(addDays(new Date(),-27))+'T00:00:00';
    const habits=[
      {id:uid(),name:'물 2L 마시기',icon:'💧',color:'#4AA8FF',repeatDays:[0,1,2,3,4,5,6],targetCount:1,reminderTime:'09:00',status:'active',createdAt,updatedAt:now,statusHistory:[{status:'active',at:createdAt}]},
      {id:uid(),name:'30분 산책하기',icon:'🏃',color:'#36BFA8',repeatDays:[1,2,3,4,5],targetCount:1,reminderTime:'18:30',status:'active',createdAt,updatedAt:now,statusHistory:[{status:'active',at:createdAt}]},
      {id:uid(),name:'책 20분 읽기',icon:'📚',color:'#FF8A5B',repeatDays:[0,1,2,3,4,5,6],targetCount:1,reminderTime:'22:00',status:'active',createdAt,updatedAt:now,statusHistory:[{status:'active',at:createdAt}]},
      {id:uid(),name:'영양제 챙기기',icon:'💊',color:'#F7C948',repeatDays:[0,1,2,3,4,5,6],targetCount:2,reminderTime:'08:00',status:'active',createdAt,updatedAt:now,statusHistory:[{status:'active',at:createdAt}]}
    ];
    const logs=[];
    for(let offset=27;offset>=0;offset--){
      const d=addDays(new Date(),-offset), key=dateKey(d);
      habits.forEach((h,idx)=>{
        if(!h.repeatDays.includes(d.getDay())) return;
        const completion=((offset+idx*3)%6!==0);
        const count=completion?h.targetCount:Math.min(h.targetCount-1,((offset+idx)%2));
        logs.push({id:uid(),habitId:h.id,date:key,count,completed:count>=h.targetCount,updatedAt:now});
      });
    }
    return normalizeData({habits,logs,settings:{globalReminder:true,theme:'warm'}});
  }

  function habitStatusOnDate(habit,key){
    if(key < isoDate(habit.createdAt)) return 'not-created';
    let status='active';
    const history=[...(habit.statusHistory||[])].sort((a,b)=>a.at.localeCompare(b.at));
    for(const event of history){
      if(isoDate(event.at)<=key) status=event.status;
      else break;
    }
    return status;
  }

  function habitAppliesOnDate(habit,key){
    return key>=isoDate(habit.createdAt) && habitStatusOnDate(habit,key)==='active' && isScheduled(habit,key);
  }

  function activeHabitsForDate(key){ return state.data.habits.filter(h=>habitAppliesOnDate(h,key)); }

  function navigate(screen, opts={}){
    const previousScreen=state.screen;
    if(screen==='detail') state.detailReturnScreen=opts.from || (previousScreen!=='detail' ? previousScreen : state.detailReturnScreen) || 'today';
    state.screen=screen;
    if(opts.habitId) state.selectedHabitId=opts.habitId;
    $$('.screen').forEach(s=>s.classList.toggle('active',s.dataset.screen===screen));
    $$('.bottom-nav button').forEach(b=>b.classList.toggle('active',b.dataset.nav===screen));
    const titles={today:['HABIT GARDEN','오늘'],add:['NEW HABIT','습관 추가'],detail:['MANAGE','습관 관리'],calendar:['HISTORY','캘린더'],stats:['INSIGHTS','통계'],settings:['MY GARDEN','설정']};
    $('#headerEyebrow').textContent=titles[screen][0];
    $('#headerTitle').textContent=titles[screen][1];
    $('#quickAddBtn').style.visibility=(screen==='add'||screen==='detail')?'hidden':'visible';
    render();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function render(){
    document.body.dataset.theme=state.data.settings.theme || 'warm';
    renderToday(); renderAddPickers(); renderDetail(); renderCalendar(); renderStats(); renderSettings();
  }

  function renderWeekStrip(){
    const root=$('#weekStrip');
    const now=new Date();
    const start=addDays(now,-now.getDay());
    root.innerHTML=Array.from({length:7},(_,i)=>{
      const d=addDays(start,i),key=dateKey(d);
      const hasDone=activeHabitsForDate(key).some(h=>getLog(h.id,key)?.completed);
      return `<button class="week-day ${key===todayKey()?'today':''} ${hasDone?'has-done':''}" data-week-date="${key}" type="button"><small>${DAY_NAMES[d.getDay()]}</small><strong>${d.getDate()}</strong></button>`;
    }).join('');
    $$('[data-week-date]',root).forEach(btn=>btn.onclick=()=>{
      state.selectedDate=btn.dataset.weekDate;
      const d=parseDate(state.selectedDate);
      state.calendarCursor=startOfMonth(d);
      navigate('calendar');
    });
  }

  function renderToday(){
    const key=todayKey(), d=new Date();
    $('#todayDate').textContent=`${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()} · ${DAY_NAMES[d.getDay()]}요일`;
    const allHabits=activeHabitsForDate(key);
    const completed=allHabits.filter(h=>getLog(h.id,key)?.completed).length;
    const rate=allHabits.length ? Math.round(completed/allHabits.length*100) : 0;
    $('#todayProgressText').textContent=`${rate}%`;
    $('#todayCountPill').textContent=`${completed}/${allHabits.length} 완료`;
    renderWeekStrip();

    const query=state.searchQuery.trim().toLowerCase();
    const habits=query ? allHabits.filter(h=>`${h.name} ${h.icon}`.toLowerCase().includes(query)) : allHabits;
    const search=$('#todaySearch');
    if(search && search.value!==state.searchQuery) search.value=state.searchQuery;
    $('#clearSearchBtn').classList.toggle('visible',!!state.searchQuery);
    $('#searchResultText').textContent=query ? `검색 결과 ${habits.length}개 / 오늘 ${allHabits.length}개` : '';

    const list=$('#habitList');
    if(!allHabits.length){
      list.innerHTML=`<div class="empty-state"><div class="emoji">🌤️</div><h3>오늘은 쉬어가는 날이에요</h3><p>새 습관을 만들거나 잠시 여유를 즐겨보세요.</p><button class="button primary" data-nav="add">새 습관 추가</button></div>`;
      bindNavButtons(list); return;
    }
    if(!habits.length){
      list.innerHTML=`<div class="empty-state"><div class="emoji">🔎</div><h3>검색 결과가 없어요</h3><p>다른 이름이나 이모지로 찾아보세요.</p></div>`;
      return;
    }
    list.innerHTML=habits.map(h=>habitCardHTML(h,key,true)).join('');
    bindHabitCardEvents(list,key);
  }

  function hexToRgba(hex,alpha=.18){
    const clean=String(hex||'').replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(clean)) return `rgba(74,168,255,${alpha})`;
    const n=parseInt(clean,16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
  function darkenHex(hex,factor=.68){
    const clean=String(hex||'').replace('#','');
    if(!/^[0-9a-f]{6}$/i.test(clean)) return '#2a79bd';
    const n=parseInt(clean,16),r=Math.max(0,Math.round(((n>>16)&255)*factor)),g=Math.max(0,Math.round(((n>>8)&255)*factor)),b=Math.max(0,Math.round((n&255)*factor));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }

  function sparkHTML(h,key){
    const end=parseDate(key);
    const cells=[];
    for(let i=27;i>=0;i--){
      const d=addDays(end,-i),k=dateKey(d),applies=habitAppliesOnDate(h,k),done=!!getLog(h.id,k)?.completed;
      const cls=done?'done':applies?'due':'off';
      cells.push(`<i class="spark ${cls}" title="${k}${done?' 완료':applies?' 예정':' 비활성'}"></i>`);
    }
    return cells.join('');
  }

  function habitCardHTML(h,key,interactive=true){
    const log=getLog(h.id,key)||{count:0,completed:false};
    const soft=hexToRgba(h.color,.18),deep=darkenHex(h.color,.64);
    const statusText=h.targetCount>1 ? `오늘 ${log.count}/${h.targetCount}회` : (log.completed?'오늘 완료':'오늘 1회');
    const mainControl=h.targetCount>1
      ? `<button class="mini-btn" data-count="-1" data-id="${h.id}" aria-label="횟수 감소">−</button><button class="check-btn ${log.completed?'done':''}" data-count="1" data-id="${h.id}" aria-label="횟수 증가">${log.count}/${h.targetCount}</button>`
      : `<button class="check-btn ${log.completed?'done':''}" data-toggle="${h.id}" aria-label="완료 상태 변경">${log.completed?'✓':'○'}</button>`;
    return `<article class="habit-card ${log.completed?'completed':''}" style="--habit-color:${h.color};--habit-soft:${soft};--habit-deep:${deep}">
      <div class="habit-card-top">
        <div class="habit-label"><div class="habit-icon">${escapeHTML(h.icon)}</div><div class="habit-copy"><h4>${escapeHTML(h.name)}</h4><p>${statusText}${h.reminderTime?` · ${escapeHTML(h.reminderTime)}`:''}</p></div></div>
        <div class="habit-actions">${mainControl}${interactive?`<button class="card-open" data-open="${h.id}" aria-label="습관 수정">⋯</button>`:''}</div>
      </div>
      <div class="habit-spark" aria-label="최근 4주 기록">${sparkHTML(h,key)}</div>
      <div class="habit-card-foot"><span>최근 4주 기록</span>${interactive?`<button data-open="${h.id}" type="button">수정하기 ›</button>`:'<span>날짜별 기록</span>'}</div>
    </article>`;
  }

  function bindHabitCardEvents(root,key){
    $$('[data-toggle]',root).forEach(btn=>btn.onclick=()=>toggleCompletion(btn.dataset.toggle,key));
    $$('[data-count]',root).forEach(btn=>btn.onclick=()=>changeCount(btn.dataset.id,key,Number(btn.dataset.count)));
    $$('[data-open]',root).forEach(btn=>btn.onclick=()=>navigate('detail',{habitId:btn.dataset.open,from:state.screen}));
  }

  function toggleCompletion(habitId,key){
    const h=state.data.habits.find(x=>x.id===habitId); if(!h || !habitAppliesOnDate(h,key)) return;
    const log=ensureLog(habitId,key);
    log.completed=!log.completed;
    log.count=log.completed?h.targetCount:0;
    log.updatedAt=new Date().toISOString();
    saveData(); render();
    toast(log.completed?'완료했어요! 작은 성공 +1 ✦':'완료를 취소했어요.');
  }

  function changeCount(habitId,key,delta){
    const h=state.data.habits.find(x=>x.id===habitId); if(!h || !habitAppliesOnDate(h,key)) return;
    const log=ensureLog(habitId,key);
    log.count=Math.max(0,Math.min(h.targetCount,log.count+delta));
    log.completed=log.count>=h.targetCount;
    log.updatedAt=new Date().toISOString();
    saveData(); render();
    if(log.completed) toast('목표 횟수를 채웠어요! ✦');
  }

  function currentAddIcon(){ return ($('#customEmoji').value.trim() || $('#iconPicker .selected')?.dataset.icon || ICONS[0]); }
  function currentAddColor(){
    const selected=$('#colorPicker .selected')?.dataset.color;
    return selected || $('#customColor').value || COLORS[0];
  }
  function updateAddPreview(){
    const root=$('#addPreview'); if(!root) return;
    const icon=currentAddIcon(),color=currentAddColor(),name=$('#habitName').value.trim()||'새로운 습관';
    root.style.background=hexToRgba(color,.14); root.style.borderColor=hexToRgba(color,.34);
    root.innerHTML=`<div class="preview-icon">${escapeHTML(icon)}</div><div><strong>${escapeHTML(name)}</strong><span>선택한 아이콘과 컬러 미리보기</span></div>`;
  }

  function renderAddPickers(){
    const iconRoot=$('#iconPicker');
    if(!iconRoot.children.length){
      iconRoot.innerHTML=ICONS.map((x,i)=>`<button type="button" class="chip ${i===0?'selected':''}" data-icon="${x}">${x}</button>`).join('');
      $('#colorPicker').innerHTML=COLORS.map((c,i)=>`<button type="button" class="color-chip ${i===0?'selected':''}" data-color="${c}" aria-label="색상 ${i+1}"><i style="background:${c}"></i></button>`).join('');
      $('#repeatDays').innerHTML=DAY_NAMES.map((n,i)=>`<button type="button" class="day-chip selected" data-day="${i}">${n}</button>`).join('');
      $$('[data-icon]',iconRoot).forEach(b=>b.onclick=()=>{ singleSelect(iconRoot,b); $('#customEmoji').value=''; updateAddPreview(); });
      $$('[data-color]',$('#colorPicker')).forEach(b=>b.onclick=()=>{ singleSelect($('#colorPicker'),b); $('#customColor').value=b.dataset.color; updateAddPreview(); });
      $$('[data-day]',$('#repeatDays')).forEach(b=>b.onclick=()=>b.classList.toggle('selected'));
      $('#customEmoji').oninput=()=>{ if($('#customEmoji').value.trim()) $$('.selected',iconRoot).forEach(x=>x.classList.remove('selected')); updateAddPreview(); };
      $('#customColor').oninput=()=>{ $$('.selected',$('#colorPicker')).forEach(x=>x.classList.remove('selected')); updateAddPreview(); };
    }
    updateAddPreview();
  }

  function singleSelect(root,btn){ $$('.selected',root).forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); }

  function resetAddForm(){
    $('#habitForm').reset(); $('#targetCount').value=1; $('#formError').textContent=''; $('#nameCount').textContent='0'; $('#customEmoji').value=''; $('#customColor').value=COLORS[0];
    const ip=$('#iconPicker'),cp=$('#colorPicker'),dp=$('#repeatDays');
    $$('.selected',ip).forEach(x=>x.classList.remove('selected')); ip.children[0]?.classList.add('selected');
    $$('.selected',cp).forEach(x=>x.classList.remove('selected')); cp.children[0]?.classList.add('selected');
    $$('[data-day]',dp).forEach(x=>x.classList.add('selected'));
    updateAddPreview();
  }

  function createHabitFromForm(){
    const name=$('#habitName').value.trim();
    const repeatDays=$$('#repeatDays .selected').map(b=>Number(b.dataset.day));
    const targetCount=Number($('#targetCount').value);
    if(!name){ $('#formError').textContent='습관 이름을 입력해주세요.'; return false; }
    if(!repeatDays.length){ $('#formError').textContent='반복 요일을 하나 이상 선택해주세요.'; return false; }
    if(!Number.isInteger(targetCount)||targetCount<1||targetCount>20){ $('#formError').textContent='목표 횟수는 1~20 사이로 입력해주세요.'; return false; }
    const now=new Date().toISOString();
    state.data.habits.push({id:uid(),name,icon:currentAddIcon(),color:currentAddColor(),repeatDays,targetCount,reminderTime:$('#reminderTime').value||'',status:'active',createdAt:now,updatedAt:now,statusHistory:[{status:'active',at:now}]});
    saveData(); resetAddForm(); toast('새 습관을 추가했어요 ✦'); navigate('today'); return true;
  }

  function detailSelectedIcon(){ return $('#editCustomEmoji')?.value.trim() || $('#editIcons .selected')?.dataset.value || '🌿'; }
  function detailSelectedColor(){ return $('#editColors .selected')?.dataset.value || $('#editCustomColor')?.value || COLORS[0]; }

  function detailFormSnapshot(){
    if(!$('#editName')) return null;
    return JSON.stringify({
      name:$('#editName').value.trim(), icon:detailSelectedIcon(), color:detailSelectedColor(),
      repeatDays:$$('#editDays .selected').map(b=>Number(b.dataset.value)).sort((a,b)=>a-b),
      targetCount:Number($('#editTarget').value), reminderTime:$('#editReminder').value||''
    });
  }

  function goBackFromDetail(){
    const current=detailFormSnapshot();
    if(current && state.detailEditBaseline && current!==state.detailEditBaseline && !confirm('변경사항을 저장하지 않고 나갈까요?')) return;
    const target=state.detailReturnScreen && state.detailReturnScreen!=='detail' ? state.detailReturnScreen : 'today';
    state.detailEditBaseline=null; navigate(target);
  }

  function renderDetail(){
    const root=$('#detailContent');
    const h=state.data.habits.find(x=>x.id===state.selectedHabitId);
    if(!h){ root.innerHTML=`<div class="empty-state"><div class="emoji">🍂</div><h3>선택된 습관이 없어요</h3><button class="button secondary" data-nav="today">오늘로 돌아가기</button></div>`; bindNavButtons(root); return; }
    const key=todayKey(), log=getLog(h.id,key)||{count:0,completed:false};
    const backLabels={today:'오늘의 습관',calendar:'캘린더',stats:'통계',settings:'설정'};
    const backLabel=backLabels[state.detailReturnScreen]||'이전 화면';
    const knownIcon=ICONS.includes(h.icon);
    root.innerHTML=`
      <button class="detail-back-button" id="detailBackBtn" type="button"><span aria-hidden="true">←</span>${backLabel}</button>
      <div class="detail-hero">
        <div class="detail-title"><div class="habit-icon" style="background:${hexToRgba(h.color,.18)}">${escapeHTML(h.icon)}</div><div><h2>${escapeHTML(h.name)}</h2><p>${h.status==='active'?'진행 중':'일시중지'} · 오늘 ${log.count}/${h.targetCount}</p></div></div>
        <div class="detail-actions"><button class="button primary" id="detailToggleToday" ${habitAppliesOnDate(h,key)?'':'disabled'}>${log.completed?'오늘 미완료로 변경':'오늘 완료로 변경'}</button><button class="button secondary" id="detailPause">${h.status==='active'?'일시중지':'다시 시작'}</button></div>
      </div>
      <div class="form-card detail-form"><p class="eyebrow">EDIT HABIT</p><h3 id="detail-heading">습관 정보 수정</h3>
        <label class="field"><span>습관 이름</span><input id="editName" maxlength="30" value="${escapeAttr(h.name)}"></label>
        <fieldset class="field"><legend>아이콘 이모지</legend><div class="chip-grid" id="editIcons">${ICONS.map(x=>`<button type="button" class="chip ${knownIcon&&x===h.icon?'selected':''}" data-value="${x}">${x}</button>`).join('')}</div><label class="custom-picker-row"><span>직접 입력</span><input id="editCustomEmoji" class="emoji-input" maxlength="8" value="${knownIcon?'':escapeAttr(h.icon)}" placeholder="예: 🎧"></label></fieldset>
        <fieldset class="field"><legend>항목 컬러</legend><div class="color-grid" id="editColors">${COLORS.map(c=>`<button type="button" class="color-chip ${c.toUpperCase()===String(h.color).toUpperCase()?'selected':''}" data-value="${c}"><i style="background:${c}"></i></button>`).join('')}</div><label class="custom-picker-row"><span>직접 색상</span><input id="editCustomColor" class="native-color" type="color" value="${escapeAttr(h.color)}"></label></fieldset>
        <fieldset class="field"><legend>반복 요일</legend><div class="day-grid" id="editDays">${DAY_NAMES.map((n,i)=>`<button type="button" class="day-chip ${h.repeatDays.includes(i)?'selected':''}" data-value="${i}">${n}</button>`).join('')}</div></fieldset>
        <div class="two-column"><label class="field"><span>하루 목표 횟수</span><input id="editTarget" type="number" min="1" max="20" value="${h.targetCount}"></label><label class="field"><span>알림 시간</span><input id="editReminder" type="time" value="${escapeAttr(h.reminderTime||'')}"></label></div>
        <p id="editError" class="form-error"></p><button class="button primary" id="saveEditBtn">수정 저장</button>
        <div class="danger-zone"><button class="button danger" id="deleteHabitBtn">이 습관과 기록 삭제</button></div>
      </div>`;

    state.detailEditBaseline=detailFormSnapshot();
    $('#detailBackBtn').onclick=goBackFromDetail;
    $('#detailToggleToday').onclick=()=>toggleCompletion(h.id,key);
    $('#detailPause').onclick=()=>toggleHabitPause(h.id);
    $$('#editIcons [data-value]').forEach(b=>b.onclick=()=>{singleSelect($('#editIcons'),b);$('#editCustomEmoji').value='';});
    $$('#editColors [data-value]').forEach(b=>b.onclick=()=>{singleSelect($('#editColors'),b);$('#editCustomColor').value=b.dataset.value;});
    $('#editCustomEmoji').oninput=()=>{if($('#editCustomEmoji').value.trim())$$('#editIcons .selected').forEach(x=>x.classList.remove('selected'));};
    $('#editCustomColor').oninput=()=>$$('#editColors .selected').forEach(x=>x.classList.remove('selected'));
    $$('#editDays [data-value]').forEach(b=>b.onclick=()=>b.classList.toggle('selected'));
    $('#saveEditBtn').onclick=()=>saveHabitEdit(h.id);
    $('#deleteHabitBtn').onclick=()=>deleteHabit(h.id);
  }

  function toggleHabitPause(id){
    const h=state.data.habits.find(x=>x.id===id); if(!h) return;
    const next=h.status==='active'?'paused':'active';
    const now=new Date().toISOString();
    h.status=next; h.statusChangedAt=now; h.updatedAt=now;
    h.statusHistory=Array.isArray(h.statusHistory)?h.statusHistory:[];
    h.statusHistory.push({status:next,at:now});
    h.statusHistory.sort((a,b)=>a.at.localeCompare(b.at));
    saveData(); render();
    toast(next==='active'?'습관을 다시 시작했어요 ✦':'오늘부터 일시중지했어요. 과거 기록은 유지돼요.');
  }

  function saveHabitEdit(id){
    const h=state.data.habits.find(x=>x.id===id); if(!h) return;
    const name=$('#editName').value.trim(),target=Number($('#editTarget').value),days=$$('#editDays .selected').map(b=>Number(b.dataset.value));
    if(!name){$('#editError').textContent='습관 이름을 입력해주세요.';return;}
    if(!days.length){$('#editError').textContent='반복 요일을 하나 이상 선택해주세요.';return;}
    if(!Number.isInteger(target)||target<1||target>20){$('#editError').textContent='목표 횟수는 1~20 사이여야 합니다.';return;}
    Object.assign(h,{name,targetCount:target,repeatDays:days,icon:detailSelectedIcon(),color:detailSelectedColor(),reminderTime:$('#editReminder').value||'',updatedAt:new Date().toISOString()});
    state.data.logs.filter(l=>l.habitId===id).forEach(l=>{l.completed=l.count>=target;});
    saveData(); render(); state.detailEditBaseline=detailFormSnapshot(); toast('습관 정보를 수정했어요 ✦');
  }

  function deleteHabit(id){
    const h=state.data.habits.find(x=>x.id===id); if(!h) return;
    if(!confirm('이 습관과 기록을 삭제할까요? 삭제한 데이터는 되돌릴 수 없어요.')) return;
    state.data.habits=state.data.habits.filter(x=>x.id!==id);
    state.data.logs=state.data.logs.filter(l=>l.habitId!==id);
    saveData(); state.selectedHabitId=null; toast('습관과 기록을 삭제했어요.'); navigate('today');
  }

  function daySummary(key){
    if(key>todayKey()) return null;
    const habits=activeHabitsForDate(key); if(!habits.length) return null;
    const completed=habits.filter(h=>getLog(h.id,key)?.completed).length;
    return {total:habits.length,completed,status:completed===habits.length?'complete':completed>0?'partial':'none'};
  }

  function renderCalendar(){
    const cursor=state.calendarCursor;
    $('#calendarTitle').textContent=`${cursor.getFullYear()}년 ${cursor.getMonth()+1}월`;
    const first=startOfMonth(cursor),start=addDays(first,-first.getDay());
    let html='';
    for(let i=0;i<42;i++){
      const d=addDays(start,i),key=dateKey(d),summary=daySummary(key);
      html+=`<button class="calendar-cell ${sameMonth(d,cursor)?'in-month':'dim'} ${key===state.selectedDate?'selected':''} ${key===todayKey()?'today':''}" data-date="${key}"><span>${d.getDate()}</span>${summary?`<i class="marker ${summary.status}"></i>`:''}</button>`;
    }
    $('#calendarGrid').innerHTML=html;
    $$('#calendarGrid [data-date]').forEach(b=>b.onclick=()=>{state.selectedDate=b.dataset.date;renderCalendar();});
    const d=parseDate(state.selectedDate); $('#selectedDateTitle').textContent=`${d.getMonth()+1}월 ${d.getDate()}일 ${DAY_NAMES[d.getDay()]}요일`;
    const habits=activeHabitsForDate(state.selectedDate),root=$('#calendarDayList');
    if(!habits.length){ root.innerHTML=`<div class="empty-state"><div class="emoji">🌙</div><h3>예정된 습관이 없어요</h3><p>생성 전이거나 일시중지/휴식일이에요.</p></div>`; }
    else { root.innerHTML=habits.map(h=>habitCardHTML(h,state.selectedDate,true)).join(''); bindHabitCardEvents(root,state.selectedDate); }
  }

  function statsFor(habitId){
    const habits=habitId==='all'?state.data.habits:state.data.habits.filter(h=>h.id===habitId);
    const now=new Date(),monthStart=new Date(now.getFullYear(),now.getMonth(),1);
    let scheduled=0,completed=0;
    for(let d=new Date(monthStart);d<=now;d=addDays(d,1)){
      const key=dateKey(d);
      habits.forEach(h=>{if(habitAppliesOnDate(h,key)){scheduled++;if(getLog(h.id,key)?.completed)completed++;}});
    }
    const total=state.data.logs.filter(l=>l.completed&&(habitId==='all'||l.habitId===habitId)).length;
    const streaks=habitId==='all'?aggregateStreak(habits):singleHabitStreak(habits[0]);
    return {rate:scheduled?Math.round(completed/scheduled*100):0,total,...streaks};
  }

  function singleHabitStreak(h){
    if(!h) return {current:0,best:0};
    let best=0,run=0,current=0;
    for(let d=parseDate(isoDate(h.createdAt));d<=new Date();d=addDays(d,1)){
      const key=dateKey(d); if(!habitAppliesOnDate(h,key)) continue;
      if(getLog(h.id,key)?.completed){run++;best=Math.max(best,run);current=run;} else {run=0;current=0;}
    }
    return {current,best};
  }

  function aggregateStreak(habits){
    if(!habits.length) return {current:0,best:0};
    const earliest=habits.reduce((min,h)=>isoDate(h.createdAt)<min?isoDate(h.createdAt):min,isoDate(habits[0].createdAt));
    let run=0,best=0,current=0;
    for(let d=parseDate(earliest);d<=new Date();d=addDays(d,1)){
      const key=dateKey(d),scheduled=habits.filter(h=>habitAppliesOnDate(h,key)); if(!scheduled.length) continue;
      const allDone=scheduled.every(h=>getLog(h.id,key)?.completed);
      if(allDone){run++;best=Math.max(best,run);current=run;}else{run=0;current=0;}
    }
    return {current,best};
  }

  function renderStats(){
    const select=$('#statsHabitFilter'),current=state.statsHabitId;
    select.innerHTML=`<option value="all">전체 습관</option>`+state.data.habits.map(h=>`<option value="${h.id}">${escapeHTML(h.icon)} ${escapeHTML(h.name)}</option>`).join('');
    if([...select.options].some(o=>o.value===current)) select.value=current; else state.statsHabitId='all';
    const s=statsFor(state.statsHabitId);
    $('#statRate').textContent=`${s.rate}%`; $('#statCurrent').textContent=`${s.current}일`; $('#statBest').textContent=`${s.best}일`; $('#statTotal').textContent=`${s.total}회`;
    const rows=[];
    for(let i=6;i>=0;i--){
      const d=addDays(new Date(),-i),key=dateKey(d);
      const habits=(state.statsHabitId==='all'?activeHabitsForDate(key):state.data.habits.filter(h=>h.id===state.statsHabitId&&habitAppliesOnDate(h,key)));
      const done=habits.filter(h=>getLog(h.id,key)?.completed).length,rate=habits.length?Math.round(done/habits.length*100):0;
      rows.push({d,rate});
    }
    $('#weeklyChart').innerHTML=rows.map(r=>`<div class="bar-col"><strong>${r.rate}%</strong><div class="bar-wrap"><div class="bar" style="height:${Math.max(3,r.rate)}%"></div></div><span>${DAY_NAMES[r.d.getDay()]}</span></div>`).join('');
  }

  function renderSettings(){ $('#globalReminder').checked=!!state.data.settings.globalReminder; $('#themeSelect').value=state.data.settings.theme||'warm'; }

  function runSelfTest(){
    const tests=[];
    const add=(name,pass)=>tests.push({name,pass:!!pass});
    try{
      const temp='__habit_garden_test__'; localStorage.setItem(temp,'ok'); add('로컬 저장소 읽기/쓰기',localStorage.getItem(temp)==='ok'); localStorage.removeItem(temp);
    }catch(e){add('로컬 저장소 읽기/쓰기',false);}
    add('서로 다른 목적의 화면 6개',$$('.screen').length>=6);
    const ids=new Set(state.data.habits.map(h=>h.id)); add('Habit ID 중복 없음',ids.size===state.data.habits.length);
    add('모든 Log가 Habit과 연결됨',state.data.logs.every(l=>ids.has(l.habitId)));
    add('목표 횟수 범위 정상',state.data.habits.every(h=>Number.isInteger(h.targetCount)&&h.targetCount>=1&&h.targetCount<=20));
    add('상태 이력 존재',state.data.habits.every(h=>Array.isArray(h.statusHistory)&&h.statusHistory.length>0));
    const passed=tests.filter(t=>t.pass).length;
    alert(`앱 자체 진단: ${passed}/${tests.length} 통과\n\n${tests.map(t=>`${t.pass?'✓':'✕'} ${t.name}`).join('\n')}`);
  }

  function resetAllData(){
    if(!confirm('모든 습관과 기록을 초기화할까요? 이 작업은 되돌릴 수 없어요.')) return;
    state.data=normalizeData({habits:[],logs:[],settings:{globalReminder:true,theme:'warm'}});
    saveData(); state.selectedHabitId=null; state.statsHabitId='all'; state.selectedDate=todayKey(); state.searchQuery=''; render(); toast('모든 데이터를 초기화했어요.'); navigate('today');
  }

  function toast(message){ const t=$('#toast'); t.textContent=message; t.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),2200); }
  function escapeHTML(s=''){ return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m])); }
  function escapeAttr(s=''){ return escapeHTML(s); }

  function bindNavButtons(root=document){ $$('[data-nav]',root).forEach(b=>{b.onclick=()=>{if(b.dataset.nav==='add')resetAddForm();navigate(b.dataset.nav);};}); }

  function init(){
    saveData();
    bindNavButtons();
    $('#quickAddBtn').onclick=()=>{resetAddForm();navigate('add');};
    $('#habitName').addEventListener('input',e=>{$('#nameCount').textContent=e.target.value.length;updateAddPreview();});
    $('#habitForm').addEventListener('submit',e=>{e.preventDefault();createHabitFromForm();});
    $('#todaySearch').addEventListener('input',e=>{state.searchQuery=e.target.value;renderToday();});
    $('#clearSearchBtn').onclick=()=>{state.searchQuery='';$('#todaySearch').value='';renderToday();$('#todaySearch').focus();};
    $('#prevMonthBtn').onclick=()=>{state.calendarCursor=new Date(state.calendarCursor.getFullYear(),state.calendarCursor.getMonth()-1,1);renderCalendar();};
    $('#nextMonthBtn').onclick=()=>{state.calendarCursor=new Date(state.calendarCursor.getFullYear(),state.calendarCursor.getMonth()+1,1);renderCalendar();};
    $('#statsHabitFilter').onchange=e=>{state.statsHabitId=e.target.value;renderStats();};
    $('#globalReminder').onchange=e=>{state.data.settings.globalReminder=e.target.checked;saveData();toast('리마인더 설정을 저장했어요.');};
    $('#themeSelect').onchange=e=>{state.data.settings.theme=e.target.value;saveData();render();};
    $('#selfTestBtn').onclick=runSelfTest;
    $('#resetDataBtn').onclick=resetAllData;
    render();
  }

  init();
})();
