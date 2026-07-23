// ==========================================
// UI.JS: NAVEGAÇÃO E LÓGICA DE INTERFACE
// ==========================================

let radarInstance, bodyStatsInstance, tonnageInstance, measChartInstance;

function goHome() { document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); document.getElementById('view-home').classList.add('active'); document.getElementById('fab-home').classList.remove('visible'); renderHomeGamification(); }
function navigateTo(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); document.getElementById('fab-home').classList.add('visible');
    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); updateHeatmap(); renderAdvancedCharts(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); renderAchievements(); }
    if (id === 'view-dieta') { renderDieta(); renderPunishmentStatus(); startFastingTimer(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
    if (id === 'view-treino') { renderWorkoutSlots(); backToWorkoutSlots(); }
}

// --- NOTIFICAÇÕES PUSH ---
function requestPushPermissions() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") alert("✅ Notificações ativadas! Vais receber alertas de descanso.");
            else alert("❌ Notificações recusadas.");
        });
    } else {
        alert("O teu navegador não suporta Notificações Push.");
    }
}
function sendLocalPush(title, bodyText) {
    if ("Notification" in window && Notification.permission === "granted") {
        try {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(sw => { sw.showNotification(title, { body: bodyText, icon: 'assets/img/logo.png', vibrate: [200, 100, 200] }); });
            } else { new Notification(title, { body: bodyText, icon: 'assets/img/logo.png' }); }
        } catch (e) { console.log("Erro Push:", e); }
    } else if ("vibrate" in navigator) { navigator.vibrate([200, 100, 200]); }
}

function renderHomeGamification() {
    if(appStreaks && appStreaks.current > 0) { document.getElementById('home-streak-display').innerHTML = `<div class="streak-badge">🔥 ${appStreaks.current} Dias em Fogo</div>`; }
    if(activeMission) { document.getElementById('home-mission-display').innerHTML = `<div class="mission-box"><strong>🎯 Missão:</strong> ${activeMission.desc}<br><div style="background:#334155; height:6px; border-radius:3px; margin-top:5px;"><div style="background:var(--accent); height:100%; width:${Math.min((activeMission.progress / activeMission.target) * 100, 100)}%;"></div></div></div>`; }
}

// --- BIBLIOTECA ---
function toggleDeleteMode() { deleteMode = !deleteMode; renderWorkoutSlots(); }
function renderWorkoutSlots() {
    const container = document.getElementById('workout-slots-container'); if(!container) return; container.innerHTML = ''; let slotCount = 0; const minSlots = 7;
    const createSlotHTML = (type, index, title, subtitle, color) => { slotCount++; return `<div class="slot-container-flex"><div class="built-item" style="flex:1; border:1px solid ${color}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('${type}', ${index})`}"><div class="built-item-info"><span class="built-item-title" style="color:${color}; font-size:16px;">${title}</span><span style="font-size:12px; color:var(--muted); margin-top:3px;">${subtitle}</span></div></div><button class="info-btn" onclick="showWorkoutInfo('${type}', ${index})">i</button></div>`; };
    container.innerHTML += createSlotHTML('TITAN', 0, 'Divisão Titã (PPL)', 'Push, Pull e Legs', '#38bdf8'); container.innerHTML += createSlotHTML('MOBILITY', 0, 'Mobilidade Activa', 'SNC e Articulações', 'var(--success)');
    savedRoutines.forEach((item, index) => {
        let totalSets = item.routine.reduce((sum, ex) => sum + parseInt(ex.sets), 0); let actionBtn = deleteMode ? `<button class="info-btn" style="color:var(--danger); border-color:var(--danger);" onclick="deleteSavedRoutine(${index})">X</button>` : `<button class="info-btn" onclick="showWorkoutInfo('SAVED', ${index})">i</button>`;
        container.innerHTML += `<div class="slot-container-flex"><div class="built-item" style="flex:1; border:1px solid ${deleteMode ? 'var(--danger)' : '#f8fafc'}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('SAVED', ${index})`}"><div class="built-item-info"><span class="built-item-title" style="color:${deleteMode ? 'var(--danger)' : '#f8fafc'}; font-size:16px;">${item.name}</span><span style="font-size:12px; color:var(--muted); margin-top:3px;">${item.routine.length} Exs | ${totalSets} Séries</span></div></div>${actionBtn}</div>`; slotCount++;
    });
    while(slotCount < minSlots) { container.innerHTML += `<div class="slot-container-flex"><div class="built-item empty-slot" style="flex:1; border:1px dashed #334155; background:transparent;"><div class="built-item-info"><span class="built-item-title" style="color:#64748b;">Slot Vazio</span></div></div><div style="width:55px; border-radius:12px; border:1px dashed #334155; background:transparent;"></div></div>`; slotCount++; }
    container.innerHTML += `<div style="display: flex; gap: 10px; margin-top: 10px;"><div class="built-item" style="flex:2; border:1px dashed var(--accent); background:rgba(56,189,248,0.05); justify-content:center; cursor:pointer;" onclick="navigateTo('view-construtor')"><span style="color:var(--accent); font-weight:bold; font-size:14px;">+ Criar Novo</span></div><div class="built-item" style="flex:1; border:1px dashed var(--danger); background:${deleteMode ? 'var(--danger)' : 'rgba(239,68,68,0.05)'}; justify-content:center; cursor:pointer;" onclick="toggleDeleteMode()"><span style="color:${deleteMode ? 'white' : 'var(--danger)'}; font-weight:bold; font-size:14px;">${deleteMode ? 'Concluir' : 'Eliminar'}</span></div></div>`;
}

function showWorkoutInfo(type, index) {
    let title = ''; let content = ''; let totalSets = 0;
    if (type === 'TITAN') { title = 'Divisão Titã (PPL)'; totalSets = 52; content = `<div style="margin-bottom:10px;"><strong style="color:var(--accent);">PUSH:</strong><br>Peito, Ombros, Tríceps</div><div style="margin-bottom:10px;"><strong style="color:var(--accent);">PULL:</strong><br>Costas, Posterior, Bíceps</div><div style="margin-bottom:10px;"><strong style="color:var(--accent);">LEGS:</strong><br>Quads, Femorais, Gémeos</div>`; } 
    else if (type === 'MOBILITY') { title = 'Mobilidade Activa'; totalSets = 10; content = `<p>Rotina regenerativa para dias de descanso.</p>`; } 
    else if (type === 'SAVED') { const routine = savedRoutines[index]; title = routine.name; routine.routine.forEach(ex => totalSets += parseInt(ex.sets)); content = `<ul style="padding-left:15px; margin:0;">`; routine.routine.forEach(ex => { content += `<li style="margin-bottom:5px;"><b>${ex.sets}x</b> ${ex.name}</li>`; }); content += `</ul>`; }
    document.getElementById('info-modal-title').innerText = title; document.getElementById('info-modal-content').innerHTML = `<p style="color:var(--success); font-weight:bold; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">⏱️ Tempo Estimado: ~${totalSets * 3} min</p>` + content; document.getElementById('workout-info-modal').style.display = 'flex';
}
function closeWorkoutInfo() { document.getElementById('workout-info-modal').style.display = 'none'; }

function openWorkoutSlot(type, index = 0) {
    if (deleteMode) return; document.getElementById('treino-slots-view').style.display = 'none'; document.getElementById('treino-active-view').style.display = 'block';
    const tabsContainer = document.getElementById('active-workout-tabs'); const beastBtn = document.getElementById('main-beast-btn');
    if (type === 'TITAN') { tabsContainer.style.display = 'flex'; tabsContainer.innerHTML = `<button class="tab-btn active" onclick="switchWorkout(event,'PUSH')">PUSH</button><button class="tab-btn" onclick="switchWorkout(event,'PULL')">PULL</button><button class="tab-btn" onclick="switchWorkout(event,'LEGS')">LEGS</button>`; currentDay = 'PUSH'; } 
    else if (type === 'MOBILITY') { tabsContainer.style.display = 'none'; currentDay = 'MOBILITY'; } 
    else if (type === 'SAVED') { tabsContainer.style.display = 'none'; workoutData.CUSTOM = JSON.parse(JSON.stringify(savedRoutines[index].routine)); currentDay = 'CUSTOM'; }
    if (beastBtn) beastBtn.style.display = (currentDay === 'MOBILITY') ? 'none' : 'block';
    openReadinessModal(); renderWorkout();
}
function backToWorkoutSlots() { document.getElementById('treino-slots-view').style.display = 'block'; document.getElementById('treino-active-view').style.display = 'none'; }
function switchWorkout(event, day) { currentDay = day; document.querySelectorAll('#active-workout-tabs .tab-btn').forEach(btn => btn.classList.remove('active')); event.currentTarget.classList.add('active'); const beastBtn = document.getElementById('main-beast-btn'); if (beastBtn) beastBtn.style.display = (day === 'MOBILITY') ? 'none' : 'block'; renderWorkout(); }

// --- TREINO, SWAP, SET-TYPE E NOTAS ---
function toggleSetType(btn) {
    let type = btn.getAttribute('data-type');
    if (type === 'work') { btn.setAttribute('data-type', 'warmup'); btn.innerHTML = '🔥'; btn.className = 'set-type-btn warmup'; }
    else { btn.setAttribute('data-type', 'work'); btn.innerHTML = '💪'; btn.className = 'set-type-btn work'; }
}

function openSwapModal(exName, idx) {
    currentSwapIndex = idx; let m = getMuscleForExercise(exName); let pool = exerciseLibrary.filter(x => x.muscle === m && x.name !== exName);
    let html = ''; pool.forEach(ex => { html += `<div class="dir-item" onclick="swapExercise('${ex.name}')" style="cursor:pointer;"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}</span></div>`; });
    if(html === '') html = '<p>Nenhum exercício similar encontrado.</p>';
    document.getElementById('swap-modal-content').innerHTML = html; document.getElementById('swap-modal').style.display = 'flex';
}
function closeSwapModal() { document.getElementById('swap-modal').style.display = 'none'; }
function swapExercise(newName) { if(currentSwapIndex !== -1) { let setsToKeep = workoutData[currentDay][currentSwapIndex].sets; workoutData[currentDay][currentSwapIndex] = { name: newName, sets: setsToKeep }; renderWorkout(); closeSwapModal(); } }

function toggleSetDone(btn, exName) {
    btn.parentElement.classList.toggle('done');
    if(btn.parentElement.classList.contains('done')) { let restSecs = getSmartRestTime(exName); startCustomRestTimer(restSecs); }
}
function triggerRestPause() { startCustomRestTimer(15); }
function startCustomRestTimer(seconds) {
    document.getElementById('rest-timer-overlay').style.display = 'flex';
    let timeLeft = seconds; document.getElementById('rest-time-display').innerText = timeLeft + 's';
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--; document.getElementById('rest-time-display').innerText = timeLeft + 's';
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            sendLocalPush("⏱️ Descanso Terminado!", "O aço não se levanta sozinho. Bora!");
            if("vibrate" in navigator) navigator.vibrate([200, 100, 200, 100, 200]); 
            document.getElementById('rest-timer-overlay').style.display='none'; 
        }
    }, 1000);
}

function renderWorkout() {
    const container = document.getElementById('workout-container'); if(!container) return; container.innerHTML = ''; const exercises = workoutData[currentDay];
    if (!exercises || exercises.length === 0) { container.innerHTML = '<p style="text-align:center; color:var(--muted); margin-top:20px;">Nenhum treino planeado.</p>'; return; }
    if (currentDay === 'MOBILITY') { exercises.forEach(ex => { container.innerHTML += `<div class="exercise-card" style="border-left: 4px solid var(--accent);"><div class="exercise-name">${ex.name}</div><div style="font-size: 13px; color: var(--muted); margin-bottom: 10px;">Execução: ${ex.sets} séries de ${ex.reps}</div><button class="beast-action-btn superset" style="width:100%; padding:10px;" onclick="this.innerText='✔ Concluído'; this.style.background='var(--success)'">Marcar Feito</button></div>`; }); return; }

    exercises.forEach((ex, exIdx) => {
        let lastPerf = getLastPerformance(ex.name); let preWeight = ''; let preReps = '';
        if(lastPerf && lastPerf.length > 0) { preWeight = lastPerf[0].weight || lastPerf[0].w || ''; preReps = lastPerf[0].reps || lastPerf[0].r || ''; }
        let painWarn = checkPainWarning(ex.name); let painHtml = painWarn ? `<div style="background:rgba(239,68,68,0.1); color:var(--danger); padding:8px; border-radius:8px; font-size:11px; margin-bottom:10px; border:1px solid var(--danger);">${painWarn}</div>` : '';
        
        let html = `<div class="exercise-card">${painHtml}<div class="exercise-name">${ex.name}</div><div class="exercise-buttons"><button class="exercise-tip-btn" onclick="openSwapModal('${ex.name}', ${exIdx})">🔄 Trocar</button><button class="exercise-video-btn" onclick="openModal('${ex.name}', 'Consulta a execução.')">🎥 Vídeo</button></div>`;
        for (let i = 1; i <= ex.sets; i++) { html += `<div class="set-row" id="row-${currentDay}-${exIdx}-${i}"><button onclick="toggleSetType(this)" class="set-type-btn work" id="type-${currentDay}-${exIdx}-${i}" data-type="work">💪</button><div class="input-group"><label>KG</label><input type="number" id="weight-${currentDay}-${exIdx}-${i}" value="${preWeight}"></div><div class="input-group"><label>Reps</label><input type="number" id="reps-${currentDay}-${exIdx}-${i}" value="${preReps}"></div><div class="input-group"><label>RIR</label><select id="rir-${currentDay}-${exIdx}-${i}"><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option><option value="3">3+</option></select></div><button class="check-btn" onclick="toggleSetDone(this, '${ex.name}')">✔</button></div>`; }
        html += `<input type="text" id="notes-${currentDay}-${exIdx}" class="exercise-notes" placeholder="Notas e Setup (ex: Polia no 3)..."></div>`; container.innerHTML += html;
    });
}

function saveCurrentWorkout() {
    if(currentDay === 'MOBILITY') { alert('🧘‍♂️ Rotina concluída!'); return; }
    if (activePunishment) { alert('⛔ TENS UMA TAXA DO PECADO PENDENTE!'); return; }
    const exercises = workoutData[currentDay]; let workoutRecord = { date: new Date().toLocaleDateString('pt-PT'), day: currentDay, exercises: {} };

    exercises.forEach((ex, exIdx) => {
        let setsDetails = []; let notes = document.getElementById(`notes-${currentDay}-${exIdx}`).value || "";
        for (let i = 1; i <= (ex.sets + 10); i++) { 
            let w = document.getElementById(`weight-${currentDay}-${exIdx}-${i}`); let r = document.getElementById(`reps-${currentDay}-${exIdx}-${i}`); let typeBtn = document.getElementById(`type-${currentDay}-${exIdx}-${i}`);
            if (w && r && w.value && r.value) { setsDetails.push({ weight: parseFloat(w.value), reps: parseInt(r.value), rir: document.getElementById(`rir-${currentDay}-${exIdx}-${i}`).value, type: typeBtn ? (typeBtn.getAttribute('data-type') === 'warmup' ? 'W' : 'S') : 'S', notes: notes }); }
        }
        if (setsDetails.length > 0) workoutRecord.exercises[ex.name] = setsDetails;
    });

    history.push(workoutRecord); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); alert('✅ Treino guardado com sucesso!');
    updateGamificationLogic(); updateHeatmap(); calculateRPGStats(); if(typeof checkAchievements === 'function') checkAchievements(); backToWorkoutSlots();
}

function openReadinessModal() { 
    if (painTracker.includes('Ombros')) document.getElementById('pain-ombros').checked = true; if (painTracker.includes('Lombar')) document.getElementById('pain-lombar').checked = true;
    if (painTracker.includes('Joelhos')) document.getElementById('pain-joelhos').checked = true; if (painTracker.includes('Cotovelos')) document.getElementById('pain-cotovelos').checked = true;
    document.getElementById('readiness-modal').style.display = 'flex'; 
}
function closeReadinessModal() {
    let p = [];
    if(document.getElementById('pain-ombros').checked) p.push('Ombros'); if(document.getElementById('pain-lombar').checked) p.push('Lombar');
    if(document.getElementById('pain-joelhos').checked) p.push('Joelhos'); if(document.getElementById('pain-cotovelos').checked) p.push('Cotovelos');
    painTracker = p; localStorage.setItem('gym_pain_tracker', JSON.stringify(painTracker));
    let slp = parseInt(document.getElementById('ready-sleep').value); let mus = parseInt(document.getElementById('ready-muscle').value); let nrg = parseInt(document.getElementById('ready-energy').value);
    if ((slp + mus + nrg) < 9) alert("⚠️ O teu SNC está sob stress. O Titã aprova que reduzas as cargas em 10% hoje ou faças menos uma série.");
    document.getElementById('readiness-modal').style.display = 'none'; renderWorkout();
}

// --- CONSTRUTOR 2.0 E CRIADOR DE EXERCÍCIOS ---
function setFatigue(level) { builderState.fatigue = level; document.querySelectorAll('.fatigue-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-fatigue-${level}`).classList.add('active'); }
function setBuilderMode(mode) {
    builderState.mode = mode; document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-mode-${mode}`).classList.add('active');
    document.getElementById('auto-focus-panel').style.display = 'none'; document.getElementById('manual-library-panel').style.display = 'none'; document.getElementById('directory-panel').style.display = 'none';
    if (mode === 'auto') document.getElementById('auto-focus-panel').style.display = 'block';
    else if (mode === 'manual') { document.getElementById('manual-library-panel').style.display = 'block'; renderLibrary(); }
    else if (mode === 'directory') { document.getElementById('directory-panel').style.display = 'block'; renderDirectory(); }
}
function renderLibrary() {
    const filterMuscle = document.getElementById('filter-muscle').value; const filterTier = document.getElementById('filter-tier').value;
    const list = document.getElementById('library-list'); list.innerHTML = ''; let filtered = exerciseLibrary;
    if (filterMuscle !== 'ALL') filtered = filtered.filter(ex => ex.muscle === filterMuscle); if (filterTier !== 'ALL') filtered = filtered.filter(ex => ex.tier === filterTier);
    filtered.forEach(ex => { list.innerHTML += `<div class="lib-item"><div class="lib-item-info"><span class="lib-item-title">${ex.name}</span><div class="lib-item-badges"><span class="badge muscle">${ex.muscle}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}-Tier</span></div></div><button class="add-btn" onclick="addExerciseToBuilder('${ex.name}', ${ex.defaultSets})">+</button></div>`; });
    
    // Botão Adicionar Customizado
    list.innerHTML += `<div class="lib-item" style="border:1px dashed var(--accent); background:transparent; justify-content:center; cursor:pointer;" onclick="promptCustomExercise()"><span style="color:var(--accent); font-weight:bold;">✚ Criar Exercício Novo</span></div>`;
}

function promptCustomExercise() {
    let name = prompt("Nome do Exercício (Ex: Máquina Convergente de Peito):"); if(!name) return;
    let muscle = prompt("Músculo Alvo (Peito, Costas, Pernas, Ombros, Braços, Core):"); if(!muscle) return;
    let newEx = { name: name, muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase(), tier: "A", type: "machine", defaultSets: 3 };
    customExercisesDB.push(newEx); exerciseLibrary.push(newEx);
    localStorage.setItem('gym_custom_exercises', JSON.stringify(customExercisesDB));
    alert("✅ Exercício adicionado ao Diretório!"); renderLibrary();
}

function renderDirectory() {
    const container = document.getElementById('directory-list'); container.innerHTML = ''; const groups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];
    groups.forEach(muscle => { let pool = exerciseLibrary.filter(ex => ex.muscle === muscle); if (pool.length > 0) { let html = `<div class="dir-group"><h4>${muscle}</h4>`; pool.forEach(ex => { html += `<div class="dir-item"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}</span></div>`; }); html += `</div>`; container.innerHTML += html; } });
}
function generateWorkout() { const focus = document.getElementById('auto-focus-select').value; const fatigue = builderState.fatigue; if(typeof generateWorkoutLogic === 'function') { builderState.routine = generateWorkoutLogic(focus, fatigue, exerciseLibrary); updateBuilderUI(); alert(`✨ Treino gerado: ${builderState.routine.length} exercícios adaptados!`); } }
function addExerciseToBuilder(name, sets) { builderState.routine.push({ name, sets }); updateBuilderUI(); }
function removeExerciseFromBuilder(index) { builderState.routine.splice(index, 1); updateBuilderUI(); }
function updateBuilderSets(index, value) { builderState.routine[index].sets = parseInt(value) || 1; updateBuilderUI(false); }
function updateBuilderUI(rebuildList = true) {
    const list = document.getElementById('builder-routine-list'); const badge = document.getElementById('workout-volume-badge'); const actionBtns = document.getElementById('builder-action-buttons'); let totalSets = 0; if (rebuildList) list.innerHTML = '';
    if (builderState.routine.length === 0) { if (rebuildList) list.innerHTML = `<p class="text-center" style="color: var(--muted); padding: 20px 0;">Nenhum exercício selecionado.</p>`; badge.innerText = `0 Séries`; actionBtns.style.display = 'none'; return; }
    builderState.routine.forEach((item, idx) => { totalSets += parseInt(item.sets); if (rebuildList) { list.innerHTML += `<div class="built-item"><div class="built-item-info"><span class="built-item-title">${idx + 1}. ${item.name}</span></div><div class="built-item-controls"><span style="font-size: 10px; color: var(--muted);">SÉRIES</span><input type="number" class="set-input" value="${item.sets}" onchange="updateBuilderSets(${idx}, this.value)"><button class="remove-btn" onclick="removeExerciseFromBuilder(${idx})">✖</button></div></div>`; } });
    badge.innerText = `${totalSets} Séries`; badge.style.color = totalSets > 24 ? 'var(--danger)' : 'var(--accent)'; actionBtns.style.display = 'flex';
}
function applyBuiltWorkout() { if (builderState.routine.length === 0) return; workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine)); navigateTo('view-treino'); document.getElementById('treino-slots-view').style.display = 'none'; document.getElementById('treino-active-view').style.display = 'block'; document.getElementById('active-workout-tabs').style.display = 'none'; currentDay = 'CUSTOM'; renderWorkout(); }
function saveCurrentRoutine() { if (builderState.routine.length === 0) return; const routineName = prompt("Nome da rotina:"); if (!routineName) return; savedRoutines.push({ name: routineName, routine: JSON.parse(JSON.stringify(builderState.routine)) }); localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); alert('✅ Guardada com sucesso na Biblioteca!'); builderState.routine = []; updateBuilderUI(); navigateTo('view-treino'); }
function deleteSavedRoutine(index) { if (confirm("Apagar permanentemente este treino?")) { savedRoutines.splice(index, 1); localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); renderWorkoutSlots(); } }

// --- MAPA DE CALOR E GRÁFICOS AVANÇADOS ---
function updateHeatmap() {
    const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7); let volume = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(log => {
        const parts = log.date.split('/'); if(parts.length === 3) {
            const logDate = new Date(parts[2], parts[1]-1, parts[0]);
            if (logDate >= sevenDaysAgo && logDate <= now && log.exercises) Object.entries(log.exercises).forEach(([exName, sets]) => { let muscle = getMuscleForExercise(exName); if (volume[muscle] !== undefined) volume[muscle] += sets.length; });
        }
    });
    const getColor = (sets) => { if (sets === 0) return '#334155'; if (sets <= 6) return '#eab308'; if (sets <= 12) return '#f97316'; return '#ef4444'; };
    const c = { peito: getColor(volume['Peito']), costas: getColor(volume['Costas']), pernas: getColor(volume['Pernas']), ombros: getColor(volume['Ombros']), bracos: getColor(volume['Braços']), core: getColor(volume['Core']) };
    const hmPeito = document.getElementById('hm-peito');
    if(hmPeito) { hmPeito.setAttribute('fill', c.peito); document.getElementById('hm-ombros-l').setAttribute('fill', c.ombros); document.getElementById('hm-ombros-r').setAttribute('fill', c.ombros); document.getElementById('hm-biceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-biceps-r').setAttribute('fill', c.bracos); document.getElementById('hm-quads-l').setAttribute('fill', c.pernas); document.getElementById('hm-quads-r').setAttribute('fill', c.pernas); document.getElementById('hm-core').setAttribute('fill', c.core); document.getElementById('hm-costas').setAttribute('fill', c.costas); document.getElementById('hm-triceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-triceps-r').setAttribute('fill', c.bracos); document.getElementById('hm-femorais-l').setAttribute('fill', c.pernas); document.getElementById('hm-femorais-r').setAttribute('fill', c.pernas); document.getElementById('hm-gemeos-l').setAttribute('fill', c.pernas); document.getElementById('hm-gemeos-r').setAttribute('fill', c.pernas); }
}
function setupChartSelect() { const select = document.getElementById('exercise-select'); if (!select) return; select.innerHTML = '<option value="">Escolhe um exercício...</option>'; const uniqueExercises = new Set(); history.forEach(log => { if(log.exercises) Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); }); uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; }); }

function renderAdvancedCharts() {
    let radarVol = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(log => { if(log.exercises) Object.entries(log.exercises).forEach(([ex, sets]) => { let m = getMuscleForExercise(ex); sets.forEach(s => { if(s.type !== 'W') { if(radarVol[m] !== undefined) radarVol[m] += (s.weight||s.w||0) * (s.reps||s.r||0); else if(m==='Bíceps'||m==='Tríceps') radarVol['Braços'] += (s.weight||s.w||0) * (s.reps||s.r||0); }}); }); });
    if (radarInstance) radarInstance.destroy(); radarInstance = new Chart(document.getElementById('radarChart').getContext('2d'), { type: 'radar', data: { labels: Object.keys(radarVol), datasets: [{ label: 'Volume (kg)', data: Object.values(radarVol), backgroundColor: 'rgba(56, 189, 248, 0.4)', borderColor: '#38bdf8', pointBackgroundColor: '#fff' }] }, options: { scales: { r: { angleLines: { color: '#334155' }, grid: { color: '#334155' }, pointLabels: { color: '#94a3b8' }, ticks: { display: false } } }, plugins: { legend: { display: false } } } });

    let tonHistory = {}; history.forEach(log => { let parts = log.date.split('/'); if(parts.length!==3) return; let monthYear = `${parts[1]}/${parts[2]}`; if(!tonHistory[monthYear]) tonHistory[monthYear] = 0; if(log.exercises) Object.values(log.exercises).forEach(sets => sets.forEach(s => { if(s.type !== 'W') tonHistory[monthYear] += (s.weight||s.w||0) * (s.reps||s.r||0); })); });
    let tonKeys = Object.keys(tonHistory).slice(-6); let tonData = tonKeys.map(k => tonHistory[k]);
    if (tonnageInstance) tonnageInstance.destroy(); tonnageInstance = new Chart(document.getElementById('tonnageChart').getContext('2d'), { type: 'bar', data: { labels: tonKeys, datasets: [{ label: 'Tonagem (kg)', data: tonData, backgroundColor: '#22c55e', borderRadius: 6 }] }, options: { scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } } });

    if (bodyStatsHistory.length > 0) {
        let dates = bodyStatsHistory.map(s => s.date.slice(0, 5)); let wData = bodyStatsHistory.map(s => s.weight); let rfmData = bodyStatsHistory.map(s => s.rfm);
        if (bodyStatsInstance) bodyStatsInstance.destroy(); bodyStatsInstance = new Chart(document.getElementById('bodyStatsChart').getContext('2d'), { type: 'line', data: { labels: dates, datasets: [{ label: 'Peso (kg)', data: wData, borderColor: '#38bdf8', yAxisID: 'y', tension: 0.3 }, { label: 'RFM (%)', data: rfmData, borderColor: '#f59e0b', yAxisID: 'y1', tension: 0.3 }] }, options: { scales: { y: { type: 'linear', display: true, position: 'left', grid: { color: '#334155' } }, y1: { type: 'linear', display: true, position: 'right', grid: { display: false } } } } });
    }
    
    let mHistory = JSON.parse(localStorage.getItem('gym_profile_history')) || [];
    if (mHistory.length > 0) {
        let mDates = mHistory.map(h => h.date.slice(0,5)); let mArm = mHistory.map(h => h.arm); let mChest = mHistory.map(h => h.chest); let mWaist = mHistory.map(h => h.waist); let mLeg = mHistory.map(h => h.leg);
        if (measChartInstance) measChartInstance.destroy(); measChartInstance = new Chart(document.getElementById('measChart').getContext('2d'), { type: 'line', data: { labels: mDates, datasets: [{ label: 'Braço', data: mArm, borderColor: '#a855f7', tension: 0.3 }, { label: 'Peito', data: mChest, borderColor: '#38bdf8', tension: 0.3 }, { label: 'Cintura', data: mWaist, borderColor: '#f59e0b', tension: 0.3 }, { label: 'Perna', data: mLeg, borderColor: '#22c55e', tension: 0.3 }] }, options: { plugins: { legend: { display: true, labels: { color: 'white' } } }, scales: { y: { grid: { color: '#334155' } } } } });
    }
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value; if (!exercise) return;
    const labels = []; const data = []; const reps = [];
    history.forEach(log => { if (log.exercises && log.exercises[exercise]) { labels.push(log.date); let workSets = log.exercises[exercise].filter(s => s.type !== 'W'); if(workSets.length===0) workSets = log.exercises[exercise]; data.push(workSets[0].weight || workSets[0].w); reps.push(workSets[0].reps || workSets[0].r); } });
    if (chartInstance) chartInstance.destroy(); const ctx = document.getElementById('progressChart').getContext('2d'); chartInstance = new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Carga (kg)', data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.3 }] } });
    const maxWeight = Math.max(...data, 0); const maxReps = Math.max(...reps, 0); let totalVolume = 0;
    history.forEach(log => { if (log.exercises && log.exercises[exercise]) { log.exercises[exercise].forEach(set => { if(set.type !== 'W') totalVolume += (set.weight || set.w) * (set.reps || set.r); }); } });
    update1RMPrediction(exercise, maxWeight, maxReps, totalVolume);
}
function update1RMPrediction(exerciseName, maxWeight, maxReps, totalVolume) {
    const container = document.getElementById('onerm-container'); if (!exerciseName || !container) return; let best1RM = calculate1RM(maxWeight, maxReps);
    if (best1RM > 0) { container.style.display = 'block'; document.getElementById('onerm-value').innerText = Math.round(best1RM) + ' kg'; document.getElementById('onerm-prediction').innerHTML = `🔮 Conseguirás <b>${Math.round(best1RM * 1.10)}kg</b> em breve.`; } else container.style.display = 'none';
    document.getElementById('pr-display').innerHTML = `<p style="margin-top:10px;"><strong>Maior carga:</strong> ${maxWeight} kg</p><p><strong>Maior reps:</strong> ${maxReps}</p><p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p>`;
}
function updateGlobalStats() {
    let totalWorkouts = history.length; let totalSets = 0, totalVolume = 0; let exercisesDone = {};
    history.forEach(log => { if(log.exercises) Object.entries(log.exercises).forEach(([exercise, sets]) => { if (!exercisesDone[exercise]) exercisesDone[exercise] = 0; exercisesDone[exercise]++; sets.forEach(set => { if(set.type !== 'W') { totalSets++; totalVolume += (set.weight||set.w||0) * (set.reps||set.r||0); }}); }); });
    let fav = Object.keys(exercisesDone).length > 0 ? Object.keys(exercisesDone).reduce((a, b) => exercisesDone[a] > exercisesDone[b] ? a : b) : 'Nenhum';
    document.getElementById('global-stats').innerHTML = `<h3>📊 Estatísticas Globais</h3><br><p><strong>Treinos:</strong> ${totalWorkouts}</p><p><strong>Séries de Trabalho:</strong> ${totalSets}</p><p><strong>Tonagem Total:</strong> ${Math.round(totalVolume)} kg</p><p><strong>Favorito:</strong> ${fav}</p>`; calculateRPGStats();
}
function calculateRPGStats() {
    const muscleXP = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(session => { if(session.exercises) Object.entries(session.exercises).forEach(([exName, setsDetails]) => { let volume = 0; setsDetails.forEach(set => { if(set.type !== 'W') { let w = parseFloat(set.weight || set.w); let r = parseInt(set.reps || set.r); if(w > 0 && r > 0) volume += (w * r); }}); let muscle = getMuscleForExercise(exName) || categorizeMuscleByNameRPG(exName); if (muscleXP[muscle] !== undefined) muscleXP[muscle] += volume; else if (muscleXP['Braços'] !== undefined && (muscle === 'Bíceps' || muscle === 'Tríceps')) muscleXP['Braços'] += volume; }); }); renderRPGStats(muscleXP);
}
function renderRPGStats(muscleXP) {
    const container = document.getElementById('rpg-stats-container'); if(!container) return; container.innerHTML = ''; const colors = { 'Peito': '#38bdf8', 'Costas': '#22c55e', 'Pernas': '#f59e0b', 'Ombros': '#ef4444', 'Braços': '#a855f7', 'Core': '#f43f5e' };
    for (let muscle in muscleXP) { let stats = getLevelAndProgress(muscleXP[muscle]); let color = colors[muscle] || '#94a3b8'; container.innerHTML += `<div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);"><div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: bold; color: white; font-size: 14px;">${muscle}</span><span style="color: ${color}; font-weight: bold; font-size: 14px;">Lvl ${stats.level}</span></div><div class="progress-bar" style="height: 8px; background: #1e293b; margin-bottom: 5px; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ${stats.progress}%; background: ${color};"></div></div></div>`; }
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid'); if (!grid) return; grid.innerHTML = '';
    const year = currentCalendarDate.getFullYear(); const month = currentCalendarDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate(); let startDay = new Date(year, month, 1).getDay(); startDay = startDay === 0 ? 6 : startDay - 1;
    document.getElementById('calendar-title').innerText = `${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][month]} ${year}`;
    for (let i = 0; i < startDay; i++) grid.innerHTML += '<div class="day-box empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const trainedSessions = history.filter(h => h.date === dateString);
        let dotHtml = trainedSessions.length > 0 ? `<div style="width:6px; height:6px; background:var(--accent); border-radius:50%; margin-top:4px;"></div>` : '';
        grid.innerHTML += `<div class="day-box ${trainedSessions.length > 0 ? 'trained' : ''}" style="flex-direction:column;" onclick="showHistoryDetails('${dateString}')">${day}${dotHtml}</div>`;
    }
}
function changeMonth(direction) { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction); renderCalendar(); }
function showHistoryDetails(dateString) {
    const sessions = history.filter(h => h.date === dateString);
    if (sessions.length === 0) { if(confirm("Registar treino vazio neste dia?")) { history.push({ date: dateString, day: 'MANUAL', exercises: {} }); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); renderCalendar(); } return; }
    let html = ''; sessions.forEach(session => { let vol = 0; let exs = 0; if(session.exercises) Object.entries(session.exercises).forEach(([ex, sets]) => { exs++; sets.forEach(s => { if(s.type !== 'W') vol += (s.weight||s.w||0) * (s.reps||s.r||0); }); }); html += `<div style="background:#0f172a; padding:15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--accent); text-align:left;"><h4 style="color:white; margin-bottom:5px;">${session.day || 'Treino'}</h4><p style="color:var(--muted); font-size:12px;">Exercícios: ${exs} | Tonagem: ${Math.round(vol)}kg</p></div>`; });
    html += `<button onclick="deleteDayHistory('${dateString}')" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:10px; border-radius:8px; width:100%; margin-top:10px; cursor:pointer;">Apagar Registo</button>`;
    document.getElementById('history-details-content').innerHTML = html; document.getElementById('history-modal-date').innerText = dateString; document.getElementById('history-details-modal').style.display = 'flex';
}
function deleteDayHistory(dateString) { if(confirm("APAGAR dados deste dia?")) { history = history.filter(h => h.date !== dateString); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); closeHistoryModal(); renderCalendar(); updateGlobalStats(); updateHeatmap(); } }
function closeHistoryModal() { document.getElementById('history-details-modal').style.display='none'; }

// --- PERFIL E MEDIDAS ---
function renderProfile() {
    document.getElementById('prof-name').value = userProfile.name || ''; document.getElementById('prof-age').value = userProfile.age || 25; document.getElementById('prof-gender').value = userProfile.gender || 'male'; document.getElementById('prof-height').value = userProfile.height || 170; document.getElementById('prof-weight').value = userProfile.weight || 70; document.getElementById('prof-activity').value = userProfile.activity || '1.55'; document.getElementById('prof-goal').value = userProfile.goal || 'maintain';
    if (userProfile.measurements) { document.getElementById('meas-arm').value = userProfile.measurements.arm || ''; document.getElementById('meas-chest').value = userProfile.measurements.chest || ''; document.getElementById('meas-waist').value = userProfile.measurements.waist || ''; document.getElementById('meas-leg').value = userProfile.measurements.leg || ''; }
    updateProfileData();
}
function updateProfileData() {
    userProfile.name = document.getElementById('prof-name').value; userProfile.age = parseInt(document.getElementById('prof-age').value) || 25; userProfile.gender = document.getElementById('prof-gender').value; userProfile.height = parseInt(document.getElementById('prof-height').value) || 170; userProfile.weight = parseInt(document.getElementById('prof-weight').value) || 70; userProfile.activity = parseFloat(document.getElementById('prof-activity').value) || 1.55; userProfile.goal = document.getElementById('prof-goal').value;
    if (!userProfile.measurements) userProfile.measurements = {}; userProfile.measurements.arm = document.getElementById('meas-arm').value; userProfile.measurements.chest = document.getElementById('meas-chest').value; userProfile.measurements.waist = document.getElementById('meas-waist').value; userProfile.measurements.leg = document.getElementById('meas-leg').value;
    localStorage.setItem('gym_profile', JSON.stringify(userProfile)); document.getElementById('height-val').innerText = userProfile.height; document.getElementById('weight-val').innerText = userProfile.weight;
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2); document.getElementById('calc-bmi').innerText = bmi.toFixed(1);
    let bmiStatus = "Normal"; let bmiColor = "var(--success)"; if (bmi < 18.5) { bmiStatus = "Baixo Peso"; bmiColor = "var(--accent)"; } else if (bmi >= 25 && bmi < 30) { bmiStatus = "Excesso de Peso"; bmiColor = "#f59e0b"; } else if (bmi >= 30) { bmiStatus = "Obesidade"; bmiColor = "var(--danger)"; }
    document.getElementById('calc-bmi-status').innerText = bmiStatus; document.getElementById('calc-bmi-status').style.color = bmiColor;
    let tdee = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age); tdee += (userProfile.gender === 'male') ? 5 : -161; tdee *= userProfile.activity; if (userProfile.goal === 'cut') tdee -= 500; if (userProfile.goal === 'bulk') tdee += 300; document.getElementById('calc-cals').innerText = Math.round(tdee);
    
    let todayStr = new Date().toLocaleDateString('pt-PT'); let mHistory = JSON.parse(localStorage.getItem('gym_profile_history')) || [];
    let rfmCalc = (userProfile.gender === 'male') ? 64 - (20 * (userProfile.height / userProfile.measurements.waist)) : 76 - (20 * (userProfile.height / userProfile.measurements.waist)); let finalRfm = Math.max(3, Math.min(rfmCalc, 50)) || 0;
    let existingStat = bodyStatsHistory.find(s => s.date === todayStr); if(existingStat) { existingStat.weight = userProfile.weight; existingStat.rfm = finalRfm; } else { bodyStatsHistory.push({ date: todayStr, weight: userProfile.weight, rfm: finalRfm }); } localStorage.setItem('gym_body_stats', JSON.stringify(bodyStatsHistory));
    let existingMeas = mHistory.find(s => s.date === todayStr); if(existingMeas) { existingMeas.arm = userProfile.measurements.arm; existingMeas.chest = userProfile.measurements.chest; existingMeas.waist = userProfile.measurements.waist; existingMeas.leg = userProfile.measurements.leg; } else { mHistory.push({ date: todayStr, arm: userProfile.measurements.arm, chest: userProfile.measurements.chest, waist: userProfile.measurements.waist, leg: userProfile.measurements.leg }); } localStorage.setItem('gym_profile_history', JSON.stringify(mHistory));

    renderDieta(); calculateBodyFat();
}

function renderAchievements() {
    const container = document.getElementById('achievements-list'); if(!container) return; container.innerHTML = '';
    allAchievements.forEach(ach => { const isUnlocked = achievementsUnlocked.includes(ach.id); const filter = isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'; const color = isUnlocked ? 'var(--accent)' : 'var(--muted)'; container.innerHTML += `<div style="display:flex; align-items:center; gap:15px; padding:12px; background:var(--bg-color); border-radius:12px; margin-bottom:10px; filter:${filter}; transition:0.3s;"><div style="font-size:30px; background:#1e293b; padding:10px; border-radius:50%; border:2px solid ${color};">${ach.icon}</div><div><h4 style="color:white; margin:0; font-size:15px;">${ach.title}</h4><p style="color:var(--muted); font-size:12px; margin-top:3px;">${ach.desc}</p></div></div>`; });
}

// --- NUTRIÇÃO ---
function renderDieta() {
    const calsElement = document.getElementById('calc-cals'); if(!calsElement) return; let tdee = parseInt(calsElement.innerText) || 0; let weight = userProfile.weight; let goal = userProfile.goal; if (tdee === 0) return;
    let proteinTarget = Math.round(weight * 2.2); let fatTarget = Math.round(weight * (goal === 'cut' ? 0.8 : 1.0)); let carbsTarget = Math.max(0, Math.round((tdee - (proteinTarget * 4 + fatTarget * 9)) / 4));
    document.getElementById('macro-pro').innerText = proteinTarget + 'g'; document.getElementById('macro-car').innerText = carbsTarget + 'g'; document.getElementById('macro-fat').innerText = fatTarget + 'g';
    let waterTarget = Math.round(weight * 35); if(userProfile.activity >= 1.55) waterTarget += 500; document.getElementById('water-text').innerText = `${waterIntake.ml} / ${waterTarget} ml`; let waterPercent = Math.min((waterIntake.ml / waterTarget) * 100, 100); document.getElementById('water-fill').style.width = waterPercent + '%';
    
    const freqContainer = document.getElementById('frequent-foods'); if(freqContainer) { freqContainer.innerHTML = ''; frequentFoods.forEach(f => { freqContainer.innerHTML += `<span class="freq-food-chip" onclick="quickAddFood('${f.name}', ${f.cals}, ${f.pro})">✚ ${f.name}</span>`; }); }

    const foodList = document.getElementById('daily-food-list'); const barsContainer = document.getElementById('daily-progress-bars');
    if(foodList && barsContainer) {
        foodList.innerHTML = ''; let totalCals = 0; let totalPro = 0;
        dailyIntake.foods.forEach((food, index) => { totalCals += food.cals; totalPro += food.pro; foodList.innerHTML += `<div style="background:#1e293b; padding:10px 15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent); margin-bottom:5px;"><div><div style="font-weight:bold; font-size:14px; color:white;">${food.name}</div><div style="font-size:12px; color:var(--success);">${food.cals} Kcal | ${food.pro}g Pro</div></div><button onclick="deleteDailyFood(${index})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:18px;">✖</button></div>`; });
        if (dailyIntake.foods.length === 0) foodList.innerHTML = '<p style="text-align:center; color:var(--muted); font-size:12px;">Ainda não comeste nada hoje.</p>';
        let calsPercent = Math.min((totalCals / tdee) * 100, 100); let proPercent = Math.min((totalPro / proteinTarget) * 100, 100); let calsColor = totalCals > tdee ? 'var(--danger)' : 'var(--accent)';
        barsContainer.innerHTML = `<div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span>🔥 Calorias</span><span style="color:${calsColor}; font-weight:bold;">${totalCals} / ${tdee} Kcal</span></div><div class="progress-bar" style="height:8px; background:#1e293b;"><div style="height:100%; width:${calsPercent}%; background:${calsColor};"></div></div></div><div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span>🥩 Proteína</span><span style="color:var(--success); font-weight:bold;">${totalPro} / ${proteinTarget} g</span></div><div class="progress-bar" style="height:8px; background:#1e293b;"><div style="height:100%; width:${proPercent}%; background:var(--success);"></div></div></div>`;
    }
}
function addWater(ml) { waterIntake.ml += ml; localStorage.setItem('gym_water', JSON.stringify(waterIntake)); renderDieta(); }
function quickAddFood(name, cals, pro) { dailyIntake.foods.push({ name, cals, pro }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); }
function addDailyFood() {
    const name = document.getElementById('food-name').value; const cals = parseInt(document.getElementById('food-cals').value) || 0; const pro = parseInt(document.getElementById('food-pro').value) || 0;
    if(!name || cals === 0) { alert('Insere o nome e as calorias!'); return; }
    dailyIntake.foods.push({ name, cals, pro }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake));
    if(!frequentFoods.find(f => f.name === name)) { frequentFoods.push({ name, cals, pro }); if(frequentFoods.length > 5) frequentFoods.shift(); localStorage.setItem('gym_freq_foods', JSON.stringify(frequentFoods)); }
    document.getElementById('food-name').value = ''; document.getElementById('food-cals').value = ''; document.getElementById('food-pro').value = ''; renderDieta();
}
function deleteDailyFood(index) { dailyIntake.foods.splice(index, 1); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); }
function toggleFasting() {
    fastingState.active = !fastingState.active; if (fastingState.active) { fastingState.start = new Date().getTime(); } else { fastingState.start = null; clearInterval(fastingInterval); }
    localStorage.setItem('gym_fasting', JSON.stringify(fastingState)); startFastingTimer();
}
function startFastingTimer() {
    if(fastingInterval) clearInterval(fastingInterval);
    const ring = document.getElementById('fasting-ring'); const text = document.getElementById('fasting-time'); const btn = document.getElementById('fasting-btn');
    if(!fastingState.active) { ring.classList.remove('active'); text.innerText = "00:00:00"; btn.innerText = "▶ Iniciar Jejum"; btn.style.background = "var(--success)"; return; }
    ring.classList.add('active'); btn.innerText = "⏹ Quebrar Jejum"; btn.style.background = "var(--danger)";
    fastingInterval = setInterval(() => {
        let diff = new Date().getTime() - fastingState.start;
        let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); let secs = Math.floor((diff % (1000 * 60)) / 1000);
        text.innerText = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        // Push notification se atingir 16h!
        if (hours === 16 && mins === 0 && secs === 0) { sendLocalPush("⏳ Jejum de 16h Atingido!", "Parabéns, atingiste a tua meta de queima de gordura. Podes quebrar o jejum."); }
    }, 1000);
}

function calculateBodyFat() {
    const waist = parseFloat(document.getElementById('meas-waist').value); const height = userProfile.height; const gender = userProfile.gender; const bfDisplay = document.getElementById('calc-bf');
    if (waist > 0 && height > 0) { let rfm = calculateBodyFatFormula(waist, height, gender); bfDisplay.innerText = rfm.toFixed(1) + '%'; if (rfm < 12 && gender === 'male' || rfm < 20 && gender === 'female') bfDisplay.style.color = '#38bdf8'; else if (rfm < 20 && gender === 'male' || rfm < 28 && gender === 'female') bfDisplay.style.color = 'var(--success)'; else if (rfm < 25 && gender === 'male' || rfm < 33 && gender === 'female') bfDisplay.style.color = '#f59e0b'; else bfDisplay.style.color = 'var(--danger)'; } else { bfDisplay.innerText = '--%'; bfDisplay.style.color = 'var(--accent)'; }
}

function openRecipesModal() { document.getElementById('recipes-modal').style.display = 'flex'; } function closeRecipesModal() { document.getElementById('recipes-modal').style.display = 'none'; }
function openPunishmentModal() { document.getElementById('punishment-modal').style.display = 'flex'; } function closePunishmentModal() { document.getElementById('punishment-modal').style.display = 'none'; }
function fillSinPreset() { let sel = document.getElementById('sin-preset'); let opt = sel.options[sel.selectedIndex]; if(opt.value) { document.getElementById('sin-cals').value = opt.value; document.getElementById('sin-pro').value = opt.getAttribute('data-p') || 0; document.getElementById('sin-car').value = opt.getAttribute('data-c') || 0; document.getElementById('sin-fat').value = opt.getAttribute('data-f') || 0; } }
function calculateSinFromMacros() { let p = parseInt(document.getElementById('sin-pro').value) || 0; let c = parseInt(document.getElementById('sin-car').value) || 0; let f = parseInt(document.getElementById('sin-fat').value) || 0; let cals = (p * 4) + (c * 4) + (f * 9); if (cals > 0) { document.getElementById('sin-cals').value = cals; document.getElementById('sin-preset').value = ""; } }
function triggerPunishment() {
    const cals = parseInt(document.getElementById('sin-cals').value); if (!cals || cals < 100) { alert('Mínimo 100kcal!'); return; }
    activePunishment = generatePunishmentLogic(cals); localStorage.setItem('gym_punishment', JSON.stringify(activePunishment)); closePunishmentModal(); renderPunishmentStatus(); alert('🔥 Tens uma penitência para pagar!');
    let presetName = document.getElementById('sin-preset').options[document.getElementById('sin-preset').selectedIndex].text || "Pecado"; if(presetName === "Seleciona o Fast Food...") presetName = "Pecado / Cheat Meal";
    dailyIntake.foods.push({ name: `⚠️ ${presetName}`, cals: cals, pro: parseInt(document.getElementById('sin-pro').value) || 0 }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta();
}
function renderPunishmentStatus() {
    const container = document.getElementById('punishment-status'); if (!container) return;
    if (!activePunishment) { container.innerHTML = `<p style="color:var(--muted); font-size:13px;">Estás limpo. Mantém a dieta.</p>`; container.style.borderLeft = "4px solid var(--success)"; } 
    else { container.innerHTML = `<div style="color:var(--danger); font-weight:bold; margin-bottom:10px;">🚨 PENITÊNCIA PENDENTE (${activePunishment.cals} kcal extras)</div><div style="font-size:13px; color:white; line-height:1.6; margin-bottom:15px;">Para voltares a gravar treinos, tens de pagar:<br>• <b>${activePunishment.burpees}</b> Burpees<br>• <b>${activePunishment.squats}</b> Agachamentos c/ Salto<br>• <b>${activePunishment.pushups}</b> Flexões</div><button class="beast-action-btn dropset" style="width:100%; padding:12px; background:var(--danger);" onclick="completePunishment()">🩸 PENITÊNCIA CUMPRIDA</button>`; container.style.borderLeft = "4px solid var(--danger)"; }
}
function completePunishment() { if(confirm('Tens a certeza que suaste isso tudo?')) { activePunishment = null; localStorage.removeItem('gym_punishment'); renderPunishmentStatus(); alert('⛓️ Estás perdoado. Volta ao foco!'); } }

// --- MODAIS GERAIS, FLEX E INSTAGRAM ---
function openPlateMath(targetWeightStr) {
    const targetWeight = parseFloat(targetWeightStr); if (!targetWeight || targetWeight <= 20) { alert('Insere um peso > 20kg.'); return; } document.getElementById('plate-target-weight').innerText = targetWeight;
    const plates = [ { weight: 25, color: '#ef4444', height: '100px' }, { weight: 20, color: '#3b82f6', height: '90px' }, { weight: 15, color: '#eab308', height: '80px' }, { weight: 10, color: '#22c55e', height: '70px' }, { weight: 5, color: '#f8fafc', height: '50px' }, { weight: 2.5, color: '#334155', height: '40px' }, { weight: 1.25, color: '#94a3b8', height: '30px' } ];
    let weightPerSide = (targetWeight - 20) / 2; let resultHTML = ''; let visualHTML = '';
    plates.forEach(plate => { let count = Math.floor(weightPerSide / plate.weight); if (count > 0) { resultHTML += `<div class="plate-row"><div class="plate-info"><div class="plate-color-box" style="background: ${plate.color};"></div>Disco de ${plate.weight}kg</div><span class="plate-qty">${count}x</span></div>`; for(let i = 0; i < count; i++) visualHTML += `<div style="width:12px; height:${plate.height}; background:${plate.color}; border-radius:3px; border:1px solid #000;"></div>`; weightPerSide = Math.round((weightPerSide - count * plate.weight) * 100) / 100; } });
    if (resultHTML === '') resultHTML = '<p style="color:var(--muted); text-align:center;">Não precisas de discos adicionais.</p>'; document.getElementById('plate-math-result').innerHTML = resultHTML; document.getElementById('visual-plates').innerHTML = visualHTML; document.getElementById('plate-math-modal').style.display = 'flex';
}
function closePlateMath() { document.getElementById('plate-math-modal').style.display = 'none'; }
function openWarmup() {
    const targetW = parseFloat(document.getElementById('beast-weight').value || document.getElementById('beast-weight').placeholder); if (!targetW || targetW <= 20) { alert("Insere peso alvo > 20kg."); return; }
    document.getElementById('warmup-results').innerHTML = `<div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #94a3b8;"><strong style="color: var(--accent);">Set 1:</strong> Barra (20kg) x 15 reps</div><div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #38bdf8;"><strong style="color: var(--accent);">Set 2:</strong> ${Math.round(targetW * 0.5)}kg x 8 reps</div><div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #ef4444;"><strong style="color: var(--accent);">Set 3:</strong> ${Math.round(targetW * 0.75)}kg x 3 reps</div>`; document.getElementById('warmup-modal').style.display = 'flex';
}
function closeWarmup() { document.getElementById('warmup-modal').style.display = 'none'; }
function openModal(title, content) { document.getElementById('modal-title').innerText = title; document.getElementById('modal-content').innerText = content; currentModalExercise = title; document.getElementById('custom-video-input').value = ""; renderVideoFrame(title); document.getElementById('exercise-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('exercise-modal').style.display = 'none'; document.getElementById('modal-video-container').innerHTML = ''; }
function showExerciseTips(exerciseName) { openModal(exerciseName, "Foca-te na execução perfeita e numa descida controlada!"); }
function saveCustomVideo() {
    const inputLink = document.getElementById('custom-video-input').value.trim(); if (!inputLink) return; let embedLink = inputLink;
    if (inputLink.includes('watch?v=')) { embedLink = inputLink.replace('watch?v=', 'embed/'); if(embedLink.includes('&')) embedLink = embedLink.split('&')[0]; } else if (inputLink.includes('youtu.be/')) { embedLink = inputLink.replace('youtu.be/', 'youtube.com/embed/'); if(embedLink.includes('?')) embedLink = embedLink.split('?')[0]; }
    let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {}; videoLibrary[currentModalExercise] = embedLink; localStorage.setItem('gym_tracker_videos', JSON.stringify(videoLibrary));
    renderVideoFrame(currentModalExercise); document.getElementById('custom-video-input').value = ""; document.getElementById('custom-video-input').placeholder = "Gravado com sucesso!"; if ("vibrate" in navigator) navigator.vibrate(50);
}
function renderVideoFrame(exerciseName) {
    let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {}; const container = document.getElementById('modal-video-container');
    if (videoLibrary[exerciseName]) container.innerHTML = `<iframe width="100%" height="100%" src="${videoLibrary[exerciseName]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    else container.innerHTML = `<div style="text-align: center;"><span style="font-size: 30px; display: block; margin-bottom: 5px;">🎥</span><span style="color: var(--muted); font-size: 12px;">Sem vídeo. Cola um link abaixo!</span></div>`;
}

function openModoFlex() {
    let totalVolume = 0; let totalSets = 0; const exercises = workoutData[currentDay];
    if (exercises) { exercises.forEach((ex, exIdx) => { for (let setIdx = 1; setIdx <= 15; setIdx++) { let wInput = document.getElementById(`weight-${currentDay}-${exIdx}-${setIdx}`); let rInput = document.getElementById(`reps-${currentDay}-${exIdx}-${setIdx}`); let typeBtn = document.getElementById(`type-${currentDay}-${exIdx}-${setIdx}`); if (wInput && rInput && wInput.value && rInput.value && typeBtn && typeBtn.getAttribute('data-type') === 'work') { let w = parseFloat(wInput.value); let r = parseInt(rInput.value); if (!isNaN(w) && !isNaN(r)) { totalVolume += (w * r); totalSets++; } } } }); }
    document.getElementById('flex-card-name').innerText = userProfile.name ? '@' + userProfile.name.replace(/\s+/g, '').toLowerCase() : '@atleta_misterioso'; document.getElementById('flex-card-date').innerText = new Date().toLocaleDateString('pt-PT'); document.getElementById('flex-card-workout').innerText = currentDay.toUpperCase() + ' DAY'; document.getElementById('flex-card-volume').innerText = totalVolume.toLocaleString('en-US') + ' kg'; document.getElementById('flex-card-sets').innerText = totalSets + ' Sets';
    document.getElementById('flex-modal').style.display = 'flex';
}
function closeModoFlex() { document.getElementById('flex-modal').style.display = 'none'; }
function copyFlexText() { navigator.clipboard.writeText(`🔥 ACABEI DE FRITAR O MEU TREINO!\n💪 Foco: ${document.getElementById('flex-card-workout').innerText}\n📈 Volume: ${document.getElementById('flex-card-volume').innerText}\n🥵 Séries: ${document.getElementById('flex-card-sets').innerText}\n🤖 Registado no Pulse`).then(() => alert('✅ Resumo copiado!')); }

// EXPORTAR INSTAGRAM STORIES (MÁGIA HTML2CANVAS)
function shareToInstagram() {
    if(typeof html2canvas === 'undefined') { alert("Erro a carregar a biblioteca de imagem. Verifica a net."); return; }
    const card = document.getElementById('flex-card');
    html2canvas(card, { backgroundColor: '#0f172a', scale: 2 }).then(canvas => {
        canvas.toBlob(blob => {
            const file = new File([blob], 'pulse-workout.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ title: 'Treino Pulse', text: 'Acabei de destruir mais um treino! 🔥', files: [file] }).catch(err => console.log('Erro Share:', err));
            } else {
                const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'pulse_story.png'; a.click();
                alert('📥 Imagem guardada na galeria! Abre o Instagram e publica na tua Story.');
            }
        });
    });
}

// Inicia as gamificações
setTimeout(() => { updateGamificationLogic(); }, 1000);
