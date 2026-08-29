// ==========================================
// UI.JS: NAVEGAÇÃO E LÓGICA DE INTERFACE
// ==========================================

let radarInstance, bodyStatsInstance, tonnageInstance, measChartInstance, chartInstance;

window.onload = () => { 
    checkSundayDebrief(); 
    checkPunishmentExpiration(); // Verifica logo se há castigos caducados

    // CRASH RECOVERY BOOT
    if(activeSessionBackup) {
        setTimeout(() => {
            if(confirm("⚠️ O teu último treino foi interrompido (A app foi fechada). Queres retomar de onde ficaste?")) {
                currentDay = activeSessionBackup.day;
                workoutData[currentDay] = activeSessionBackup.workout;
                beastState = activeSessionBackup.state;
                navigateTo('view-treino');
                document.getElementById('treino-slots-view').style.display = 'none';
                document.getElementById('treino-active-view').style.display = 'block';
                renderWorkout();
                document.getElementById('beast-mode-overlay').style.display = 'flex';
                renderBeastMode();
            } else {
                localStorage.removeItem('gym_active_session');
                activeSessionBackup = null;
            }
        }, 500);
    }
};

function goHome() { 
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); 
    document.getElementById('view-home').classList.add('active'); 
    document.getElementById('fab-home').classList.remove('visible'); 
    window.scrollTo(0, 0); // Reset do scroll
    checkSundayDebrief(); 
}

function navigateTo(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
    document.getElementById('fab-home').classList.add('visible');
    window.scrollTo(0, 0); // Reset do scroll ao mudar de página
    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); updateHeatmap(); renderAdvancedCharts(); renderSBD(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); renderAchievements(); renderMissionProfile(); document.getElementById('theme-selector').value = appTheme; renderDisciplineWall(); }
    if (id === 'view-dieta') { renderDieta(); renderPunishmentStatus(); startFastingTimer(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
    if (id === 'view-treino') { renderWorkoutSlots(); backToWorkoutSlots(); }
}

// SISTEMA DE TABS DO PROGRESSO
function switchEvoTab(event, tabId) {
    document.querySelectorAll('#view-evolucao .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.querySelectorAll('#view-evolucao .evo-panel').forEach(panel => panel.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

// SISTEMA DE TOASTS (Notificações Modernas)
function showPulseToast(message, isError = false) {
    let toast = document.getElementById('pulse-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'pulse-toast';
        toast.style.cssText = 'display:none; position:fixed; top:20px; left:50%; transform:translateX(-50%); padding:12px 24px; border-radius:12px; font-weight:bold; z-index:20000; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; transition: opacity 0.3s; width: 90%; max-width: 350px; color: white;';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.style.display = 'none', 300);
    }, 3000);
}

function requestPushPermissions() { 
    if ("Notification" in window) { 
        Notification.requestPermission().then(permission => { 
            if (permission === "granted") showPulseToast("✅ Notificações ativadas com sucesso!"); 
            else showPulseToast("❌ Notificações recusadas.", true); 
        }); 
    } else { 
        showPulseToast("⚠️ O teu navegador não suporta Notificações.", true); 
    } 
}

function sendLocalPush(title, bodyText) { if ("Notification" in window && Notification.permission === "granted") { try { if ('serviceWorker' in navigator && navigator.serviceWorker.controller) { navigator.serviceWorker.ready.then(sw => { sw.showNotification(title, { body: bodyText, icon: 'assets/img/logo.png', vibrate: [200, 100, 200] }); }); } else { new Notification(title, { body: bodyText, icon: 'assets/img/logo.png' }); } } catch (e) { console.log("Erro Push:", e); } } else if ("vibrate" in navigator) { navigator.vibrate([200, 100, 200]); } }

function changeTheme(theme) { appTheme = theme; document.body.setAttribute('data-theme', theme); localStorage.setItem('gym_theme', theme); renderDisciplineWall(); }

// O GUARDIÃO DE DOMINGO (Debrief + Alerta de Backup)
function checkSundayDebrief() {
    let today = new Date();
    if (today.getDay() === 0) { 
        let todayStr = today.toLocaleDateString('pt-PT');
        if (lastDebriefDate !== todayStr) {
            let stats = generateSundayDebrief();
            document.getElementById('debrief-vol').innerText = stats.volume.toLocaleString('en-US') + ' kg';
            document.getElementById('debrief-work').innerText = stats.workouts;
            document.getElementById('sunday-debrief-modal').style.display = 'flex';
            lastDebriefDate = todayStr;
            localStorage.setItem('gym_last_debrief', lastDebriefDate);

            setTimeout(() => {
                sendLocalPush("🛡️ Guardião de Dados", "É Domingo! Exporta o Backup na aba ID Cartão para não perderes o legado.");
                showPulseToast("🛡️ Guardião de Dados: Faz o Backup no Perfil!");
            }, 1000);
        }
    }
}
function closeDebrief() { document.getElementById('sunday-debrief-modal').style.display = 'none'; }

// --- BIBLIOTECA E TREINOS ---
function toggleDeleteMode() { deleteMode = !deleteMode; renderWorkoutSlots(); }
function renderWorkoutSlots() {
    const container = document.getElementById('workout-slots-container'); if(!container) return; container.innerHTML = ''; let slotCount = 0; const minSlots = 7;
    const createSlotHTML = (type, index, title, subtitle, color) => { slotCount++; return `<div class="slot-container-flex"><div class="built-item" style="flex:1; border:1px solid ${color}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('${type}', ${index})`}"><div class="built-item-info"><span class="built-item-title" style="color:${color}; font-size:16px;">${title}</span><span style="font-size:12px; color:var(--muted); margin-top:3px;">${subtitle}</span></div></div><button class="info-btn" onclick="showWorkoutInfo('${type}', ${index})">i</button></div>`; };
    container.innerHTML += createSlotHTML('TITAN', 0, 'Divisão Titã (PPL)', 'Push, Pull e Legs', '#38bdf8'); container.innerHTML += createSlotHTML('MOBILITY', 0, 'Mobilidade Activa', 'SNC e Articulações', 'var(--success)');
    savedRoutines.forEach((item, index) => { let totalSets = item.routine.reduce((sum, ex) => sum + parseInt(ex.sets), 0); let actionBtn = deleteMode ? `<button class="info-btn" style="color:var(--danger); border-color:var(--danger);" onclick="deleteSavedRoutine(${index})">X</button>` : `<button class="info-btn" onclick="showWorkoutInfo('SAVED', ${index})">i</button>`; container.innerHTML += `<div class="slot-container-flex"><div class="built-item" style="flex:1; border:1px solid ${deleteMode ? 'var(--danger)' : '#f8fafc'}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('SAVED', ${index})`}"><div class="built-item-info"><span class="built-item-title" style="color:${deleteMode ? 'var(--danger)' : '#f8fafc'}; font-size:16px;">${item.name}</span><span style="font-size:12px; color:var(--muted); margin-top:3px;">${item.routine.length} Exs | ${totalSets} Séries</span></div></div>${actionBtn}</div>`; slotCount++; });
    while(slotCount < minSlots) { container.innerHTML += `<div class="slot-container-flex"><div class="built-item empty-slot" style="flex:1; border:1px dashed #334155; background:transparent;"><div class="built-item-info"><span class="built-item-title" style="color:#64748b;">Slot Vazio</span></div></div><div style="width:55px; border-radius:12px; border:1px dashed #334155; background:transparent;"></div></div>`; slotCount++; }
    container.innerHTML += `<div style="display: flex; gap: 10px; margin-top: 10px;"><div class="built-item" style="flex:2; border:1px dashed var(--accent); background:rgba(56,189,248,0.05); justify-content:center; cursor:pointer;" onclick="navigateTo('view-construtor')"><span style="color:var(--accent); font-weight:bold; font-size:14px;">+ Criar Novo</span></div><div class="built-item" style="flex:1; border:1px dashed var(--danger); background:${deleteMode ? 'var(--danger)' : 'rgba(239,68,68,0.05)'}; justify-content:center; cursor:pointer;" onclick="toggleDeleteMode()"><span style="color:${deleteMode ? 'white' : 'var(--danger)'}; font-weight:bold; font-size:14px;">${deleteMode ? 'Concluir' : 'Eliminar'}</span></div></div>`;
}
function showWorkoutInfo(type, index) {
    let title = ''; let content = ''; let totalSets = 0;
    if (type === 'TITAN') { title = 'Divisão Titã (PPL)'; totalSets = 52; content = `<div style="margin-bottom:10px;"><strong style="color:var(--accent);">PUSH:</strong><br>Peito, Ombros, Triceps</div><div style="margin-bottom:10px;"><strong style="color:var(--accent);">PULL:</strong><br>Costas, Posterior, Biceps</div><div style="margin-bottom:10px;"><strong style="color:var(--accent);">LEGS:</strong><br>Quads, Femorais, Gemeos</div>`; } else if (type === 'MOBILITY') { title = 'Mobilidade Activa'; totalSets = 10; content = `<p>Rotina regenerativa para dias de descanso.</p>`; } else if (type === 'SAVED') { const routine = savedRoutines[index]; title = routine.name; routine.routine.forEach(ex => totalSets += parseInt(ex.sets)); content = `<ul style="padding-left:15px; margin:0;">`; routine.routine.forEach(ex => { content += `<li style="margin-bottom:5px;"><b>${ex.sets}x</b> ${ex.name}</li>`; }); content += `</ul>`; }
    document.getElementById('info-modal-title').innerText = title; document.getElementById('info-modal-content').innerHTML = `<p style="color:var(--success); font-weight:bold; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">⏱️ Tempo Estimado: ~${totalSets * 3} min</p>` + content; document.getElementById('workout-info-modal').style.display = 'flex';
}
function closeWorkoutInfo() { document.getElementById('workout-info-modal').style.display = 'none'; }
function openWorkoutSlot(type, index = 0) {
    if (deleteMode) return; document.getElementById('treino-slots-view').style.display = 'none'; document.getElementById('treino-active-view').style.display = 'block';
    isDeloadMode = false; document.getElementById('btn-deload-toggle').innerHTML = '📉 Modo Deload'; document.getElementById('btn-deload-toggle').style.background = '#1e293b';
    const tabsContainer = document.getElementById('active-workout-tabs'); const beastBtn = document.getElementById('main-beast-btn');
    if (type === 'TITAN') { tabsContainer.style.display = 'flex'; tabsContainer.innerHTML = `<button class="tab-btn active" onclick="switchWorkout(event,'PUSH')">PUSH</button><button class="tab-btn" onclick="switchWorkout(event,'PULL')">PULL</button><button class="tab-btn" onclick="switchWorkout(event,'LEGS')">LEGS</button>`; currentDay = 'PUSH'; } else if (type === 'MOBILITY') { tabsContainer.style.display = 'none'; currentDay = 'MOBILITY'; } else if (type === 'SAVED') { tabsContainer.style.display = 'none'; workoutData.CUSTOM = JSON.parse(JSON.stringify(savedRoutines[index].routine)); currentDay = 'CUSTOM'; }
    if (beastBtn) beastBtn.style.display = (currentDay === 'MOBILITY') ? 'none' : 'block';
    openReadinessModal(); renderWorkout();
}
function backToWorkoutSlots() { document.getElementById('treino-slots-view').style.display = 'block'; document.getElementById('treino-active-view').style.display = 'none'; }
function switchWorkout(event, day) { currentDay = day; document.querySelectorAll('#active-workout-tabs .tab-btn').forEach(btn => btn.classList.remove('active')); event.currentTarget.classList.add('active'); const beastBtn = document.getElementById('main-beast-btn'); if (beastBtn) beastBtn.style.display = (day === 'MOBILITY') ? 'none' : 'block'; renderWorkout(); }
function toggleDeloadMode() { isDeloadMode = !isDeloadMode; const btn = document.getElementById('btn-deload-toggle'); if(isDeloadMode) { btn.innerHTML = '🧘 Deload ON (Cargas 70%)'; btn.style.background = 'var(--success)'; showPulseToast("Modo Deload Ativado: Cargas a 70%."); } else { btn.innerHTML = '📉 Modo Deload'; btn.style.background = '#1e293b'; showPulseToast("Modo Deload Desativado."); } renderWorkout(); }
function toggleSetType(btn) { let type = btn.getAttribute('data-type'); if (type === 'work') { btn.setAttribute('data-type', 'warmup'); btn.innerHTML = '🔥'; btn.className = 'set-type-btn warmup'; } else { btn.setAttribute('data-type', 'work'); btn.innerHTML = '💪'; btn.className = 'set-type-btn work'; } }

// LÓGICA DO SWAP MODAL E INJEÇÃO DE FINISHER
function openSwapModal(exName, idx) { 
    currentSwapIndex = idx; 
    document.getElementById('swap-modal').querySelector('h3').innerHTML = '🔄 Substituir Exercício';
    let m = getMuscleForExercise(exName); let pool = exerciseLibrary.filter(x => x.muscle === m && x.name !== exName); let html = ''; 
    pool.forEach(ex => { html += `<div class="dir-item" onclick="swapExercise('${ex.name}')" style="cursor:pointer; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}" style="float:right;">${ex.tier}</span></div>`; }); 
    if(html === '') html = '<p style="color:var(--muted); font-size:13px;">Nenhum exercício similar encontrado.</p>'; 
    document.getElementById('swap-modal-content').innerHTML = html; document.getElementById('swap-modal').style.display = 'flex'; 
}
function closeSwapModal() { 
    document.getElementById('swap-modal').style.display = 'none'; 
    document.getElementById('swap-modal').querySelector('h3').innerHTML = '🔄 Substituir Exercício';
}
function swapExercise(newName) { if(currentSwapIndex !== -1) { let setsToKeep = workoutData[currentDay][currentSwapIndex].sets; workoutData[currentDay][currentSwapIndex] = { name: newName, sets: setsToKeep }; renderWorkout(); closeSwapModal(); } }
function toggleSetDone(btn, exName) { btn.parentElement.classList.toggle('done'); if(btn.parentElement.classList.contains('done')) { let restSecs = getSmartRestTime(exName); startCustomRestTimer(restSecs); } }
function startCustomRestTimer(seconds) { document.getElementById('rest-timer-overlay').style.display = 'flex'; let targetTime = Date.now() + (seconds * 1000); document.getElementById('rest-time-display').innerText = seconds + 's'; if(timerInterval) clearInterval(timerInterval); timerInterval = setInterval(() => { let timeLeft = Math.ceil((targetTime - Date.now()) / 1000); if(timeLeft < 0) timeLeft = 0; document.getElementById('rest-time-display').innerText = timeLeft + 's'; if (timeLeft <= 0) { clearInterval(timerInterval); sendLocalPush("⏱️ Descanso Terminado!", "Bora ao aço!"); if("vibrate" in navigator) navigator.vibrate([200, 100, 200]); document.getElementById('rest-timer-overlay').style.display='none'; } }, 1000); }

function addFinisherToWorkout() {
    let firstEx = workoutData[currentDay] && workoutData[currentDay].length > 0 ? workoutData[currentDay][0] : null;
    let muscle = firstEx ? getMuscleForExercise(firstEx.name) : null;
    let pool = muscle ? exerciseLibrary.filter(x => x.muscle === muscle) : exerciseLibrary;
    if(!pool.length) pool = exerciseLibrary;
    
    let html = '';
    pool.forEach(ex => {
        html += `<div class="dir-item" onclick="injectFinisher('${ex.name}')" style="cursor:pointer; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}" style="float:right;">${ex.tier}</span></div>`;
    });
    
    document.getElementById('swap-modal-content').innerHTML = html;
    document.getElementById('swap-modal').querySelector('h3').innerHTML = '🔥 Escolher Finisher';
    document.getElementById('swap-modal').style.display = 'flex';
}
function injectFinisher(exName) {
    workoutData[currentDay].push({ name: `⚠️ CASTIGO: ${exName}`, sets: 3, reps: 15 });
    renderWorkout();
    closeSwapModal();
    showPulseToast('🔥 Finisher Injetado no Treino!');
}

function renderWorkout() {
    checkPunishmentExpiration(); // Garante que atualizamos o estado
    const container = document.getElementById('workout-container'); if(!container) return; container.innerHTML = ''; 
    
    // BANNER DA TAXA DO PECADO (Mostra apenas a PRIMEIRA tarefa da Fila)
    if (activePunishment && activePunishment.tasks && activePunishment.tasks.length > 0 && currentDay !== 'MOBILITY') {
        let firstTask = activePunishment.tasks[0];
        let remaining = activePunishment.tasks.length - 1;
        let extraText = remaining > 0 ? `<br><span style="font-size:11px; color:#f8fafc; opacity:0.8;">(+ ${remaining} castigos acumulados para os próximos dias)</span>` : '';
        
        container.innerHTML += `<div style="background:var(--danger); color:white; padding:15px; border-radius:12px; margin-bottom:20px; text-align:center; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(239,68,68,0.5);">
            <h4 style="margin-bottom: 10px; font-size:15px;">🔥 PENITÊNCIA ATIVA (1/${activePunishment.tasks.length})</h4>
            <p style="font-size: 13px; margin-bottom: 15px; font-weight:bold;">${firstTask}${extraText}</p>
            <button class="beast-action-btn" onclick="addFinisherToWorkout()" style="width:100%; background:white; color:var(--danger); padding:10px; font-weight:bold; font-size:12px;">✚ Injetar Finisher no Treino</button>
        </div>`;
    }

    const exercises = workoutData[currentDay];
    if (!exercises || exercises.length === 0) { container.innerHTML += '<p style="text-align:center; color:var(--muted); margin-top:20px;">Nenhum treino planeado.</p>'; return; }
    if (currentDay === 'MOBILITY') { exercises.forEach(ex => { container.innerHTML += `<div class="exercise-card" style="border-left: 4px solid var(--accent);"><div class="exercise-name">${ex.name}</div><div style="font-size: 13px; color: var(--muted); margin-bottom: 10px;">Execução: ${ex.sets} séries de ${ex.reps}</div><button class="beast-action-btn superset" style="width:100%; padding:10px;" onclick="this.innerText='✔ Concluído'; this.style.background='var(--success)'">Marcar Feito</button></div>`; }); return; }

    exercises.forEach((ex, exIdx) => {
        let lastPerf = getLastPerformance(ex.name); let preWeight = ''; let preReps = '';
        if(lastPerf && lastPerf.length > 0) { let w = parseFloat(lastPerf[0].weight || lastPerf[0].w || 0); if(isDeloadMode && w > 0) preWeight = Math.round(w * 0.7); else preWeight = w || ''; preReps = lastPerf[0].reps || lastPerf[0].r || ''; }
        let painWarn = checkPainWarning(ex.name); let painHtml = painWarn ? `<div style="background:rgba(239,68,68,0.1); color:var(--danger); padding:8px; border-radius:8px; font-size:11px; margin-bottom:10px; border:1px solid var(--danger);">${painWarn}</div>` : '';
        let setsToRender = isDeloadMode ? Math.max(2, ex.sets - 1) : ex.sets;
        let html = `<div class="exercise-card">${painHtml}<div class="exercise-name">${ex.name}</div><div class="exercise-buttons"><button class="exercise-tip-btn" onclick="openSwapModal('${ex.name}', ${exIdx})">🔄 Trocar</button><button class="exercise-video-btn" onclick="openModal('${ex.name}', 'Consulta a execução.')">🎥 Vídeo</button></div>`;
        for (let i = 1; i <= setsToRender; i++) { html += `<div class="set-row" id="row-${currentDay}-${exIdx}-${i}"><button onclick="toggleSetType(this)" class="set-type-btn work" id="type-${currentDay}-${exIdx}-${i}" data-type="work">💪</button><div class="input-group"><label>KG</label><input type="number" id="weight-${currentDay}-${exIdx}-${i}" value="${preWeight}"></div><div class="input-group"><label>Reps</label><input type="number" id="reps-${currentDay}-${exIdx}-${i}" value="${preReps}"></div><div class="input-group"><label>RIR</label><select id="rir-${currentDay}-${exIdx}-${i}"><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option><option value="3">3+</option></select></div><button class="check-btn" onclick="toggleSetDone(this, '${ex.name}')">✔</button></div>`; }
        html += `<input type="text" id="notes-${currentDay}-${exIdx}" class="exercise-notes" placeholder="Notas e Setup (ex: Polia no 3)..."></div>`; container.innerHTML += html;
    });
}

function saveCurrentWorkout() {
    if(currentDay === 'MOBILITY') { showPulseToast('🧘‍♂️ Rotina concluída!'); return; }
    
    // AQUI ABATE O CASTIGO UM A UM
    if (activePunishment && activePunishment.tasks && activePunishment.tasks.length > 0) { 
        let currentTask = activePunishment.tasks[0];
        if(confirm('Cumpriste o castigo no final do teu treino hoje?\n\n- ' + currentTask)) {
            activePunishment.tasks.shift(); // Remove só a primeira tarefa
            
            if (activePunishment.tasks.length === 0) {
                activePunishment = null; 
                localStorage.removeItem('gym_punishment'); 
                showPulseToast('🔥 Dívida totalmente paga! Estás limpo.');
            } else {
                activePunishment.lastUpdated = Date.now(); // Renova o prazo para os restantes
                localStorage.setItem('gym_punishment', JSON.stringify(activePunishment));
                showPulseToast(`🔥 Um castigo abatido! Restam ${activePunishment.tasks.length} na fila.`);
            }
            renderPunishmentStatus();
        } else {
            showPulseToast('⚠️ Treino gravado. O teu castigo transitou para o próximo treino!');
        }
    } else {
        showPulseToast('✅ Treino guardado com sucesso!');
    }

    const exercises = workoutData[currentDay]; let workoutRecord = { date: new Date().toLocaleDateString('pt-PT'), day: currentDay, exercises: {} };
    exercises.forEach((ex, exIdx) => {
        let setsDetails = []; let notes = document.getElementById(`notes-${currentDay}-${exIdx}`).value || "";
        for (let i = 1; i <= (ex.sets + 10); i++) { 
            let w = document.getElementById(`weight-${currentDay}-${exIdx}-${i}`); let r = document.getElementById(`reps-${currentDay}-${exIdx}-${i}`); let typeBtn = document.getElementById(`type-${currentDay}-${exIdx}-${i}`);
            if (w && r && w.value && r.value) { setsDetails.push({ weight: parseFloat(w.value), reps: parseInt(r.value), rir: document.getElementById(`rir-${currentDay}-${exIdx}-${i}`).value, type: typeBtn ? (typeBtn.getAttribute('data-type') === 'warmup' ? 'W' : 'S') : 'S', notes: notes }); }
        }
        if (setsDetails.length > 0) workoutRecord.exercises[ex.name] = setsDetails;
    });
    history.push(workoutRecord); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); 
    localStorage.removeItem('gym_active_session'); // Limpa o anti-crash
    updateGamificationLogic(); updateHeatmap(); calculateRPGStats(); if(typeof checkAchievements === 'function') checkAchievements(); renderDisciplineWall(); backToWorkoutSlots();
}
function openReadinessModal() { if (painTracker.includes('Ombros')) document.getElementById('pain-ombros').checked = true; if (painTracker.includes('Lombar')) document.getElementById('pain-lombar').checked = true; if (painTracker.includes('Joelhos')) document.getElementById('pain-joelhos').checked = true; if (painTracker.includes('Cotovelos')) document.getElementById('pain-cotovelos').checked = true; document.getElementById('readiness-modal').style.display = 'flex'; }
function closeReadinessModal() { let p = []; if(document.getElementById('pain-ombros').checked) p.push('Ombros'); if(document.getElementById('pain-lombar').checked) p.push('Lombar'); if(document.getElementById('pain-joelhos').checked) p.push('Joelhos'); if(document.getElementById('pain-cotovelos').checked) p.push('Cotovelos'); painTracker = p; localStorage.setItem('gym_pain_tracker', JSON.stringify(painTracker)); let slp = parseInt(document.getElementById('ready-sleep').value); let mus = parseInt(document.getElementById('ready-muscle').value); let nrg = parseInt(document.getElementById('ready-energy').value); if ((slp + mus + nrg) < 9) showPulseToast("⚠️ O teu SNC está sob stress.", true); document.getElementById('readiness-modal').style.display = 'none'; renderWorkout(); updateHeatmap(); }

// --- CONSTRUTOR 2.0 ---
function setFatigue(level) { builderState.fatigue = level; document.querySelectorAll('.fatigue-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-fatigue-${level}`).classList.add('active'); }
function setBuilderMode(mode) { builderState.mode = mode; document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-mode-${mode}`).classList.add('active'); document.getElementById('auto-focus-panel').style.display = 'none'; document.getElementById('manual-library-panel').style.display = 'none'; document.getElementById('directory-panel').style.display = 'none'; if (mode === 'auto') document.getElementById('auto-focus-panel').style.display = 'block'; else if (mode === 'manual') { document.getElementById('manual-library-panel').style.display = 'block'; renderLibrary(); } else if (mode === 'directory') { document.getElementById('directory-panel').style.display = 'block'; renderDirectory(); } }
function renderLibrary() { const filterMuscle = document.getElementById('filter-muscle').value; const filterTier = document.getElementById('filter-tier').value; const list = document.getElementById('library-list'); list.innerHTML = ''; let filtered = exerciseLibrary; if (filterMuscle !== 'ALL') filtered = filtered.filter(ex => ex.muscle === filterMuscle); if (filterTier !== 'ALL') filtered = filtered.filter(ex => ex.tier === filterTier); filtered.forEach(ex => { list.innerHTML += `<div class="lib-item"><div class="lib-item-info"><span class="lib-item-title">${ex.name}</span><div class="lib-item-badges"><span class="badge muscle">${ex.muscle}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}-Tier</span></div></div><button class="add-btn" onclick="addExerciseToBuilder('${ex.name}', ${ex.defaultSets})">+</button></div>`; }); list.innerHTML += `<div class="lib-item" style="border:1px dashed var(--accent); background:transparent; justify-content:center; cursor:pointer;" onclick="promptCustomExercise()"><span style="color:var(--accent); font-weight:bold;">✚ Criar Exercício Novo</span></div>`; }
function promptCustomExercise() { let name = prompt("Nome do Exercício:"); if(!name) return; let muscle = prompt("Músculo Alvo (Peito, Costas, Pernas, Ombros, Braços, Core):"); if(!muscle) return; let newEx = { name: name, muscle: muscle.charAt(0).toUpperCase() + muscle.slice(1).toLowerCase(), tier: "A", type: "machine", defaultSets: 3 }; customExercisesDB.push(newEx); exerciseLibrary.push(newEx); localStorage.setItem('gym_custom_exercises', JSON.stringify(customExercisesDB)); showPulseToast("✅ Adicionado ao Diretório!"); renderLibrary(); }
function renderDirectory() { const container = document.getElementById('directory-list'); container.innerHTML = ''; const groups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core']; groups.forEach(muscle => { let pool = exerciseLibrary.filter(ex => ex.muscle === muscle); if (pool.length > 0) { let html = `<div class="dir-group"><h4>${muscle}</h4>`; pool.forEach(ex => { html += `<div class="dir-item"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}</span></div>`; }); html += `</div>`; container.innerHTML += html; } }); }
function generateWorkout() { const focus = document.getElementById('auto-focus-select').value; const fatigue = builderState.fatigue; if(typeof generateWorkoutLogic === 'function') { builderState.routine = generateWorkoutLogic(focus, fatigue, exerciseLibrary); updateBuilderUI(); showPulseToast(`✨ Treino gerado!`); } }
function addExerciseToBuilder(name, sets) { builderState.routine.push({ name, sets }); updateBuilderUI(); }
function removeExerciseFromBuilder(index) { builderState.routine.splice(index, 1); updateBuilderUI(); }
function updateBuilderSets(index, value) { builderState.routine[index].sets = parseInt(value) || 1; updateBuilderUI(false); }
function updateBuilderUI(rebuildList = true) { const list = document.getElementById('builder-routine-list'); const badge = document.getElementById('workout-volume-badge'); const actionBtns = document.getElementById('builder-action-buttons'); let totalSets = 0; if (rebuildList) list.innerHTML = ''; if (builderState.routine.length === 0) { if (rebuildList) list.innerHTML = `<p class="text-center" style="color: var(--muted); padding: 20px 0;">Nenhum exercício selecionado.</p>`; badge.innerText = `0 Séries`; actionBtns.style.display = 'none'; return; } builderState.routine.forEach((item, idx) => { totalSets += parseInt(item.sets); if (rebuildList) { list.innerHTML += `<div class="built-item"><div class="built-item-info"><span class="built-item-title">${idx + 1}. ${item.name}</span></div><div class="built-item-controls"><span style="font-size: 10px; color: var(--muted);">SÉRIES</span><input type="number" class="set-input" value="${item.sets}" onchange="updateBuilderSets(${idx}, this.value)"><button class="remove-btn" onclick="removeExerciseFromBuilder(${idx})">✖</button></div></div>`; } }); badge.innerText = `${totalSets} Séries`; badge.style.color = totalSets > 24 ? 'var(--danger)' : 'var(--accent)'; actionBtns.style.display = 'flex'; }
function applyBuiltWorkout() { if (builderState.routine.length === 0) return; workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine)); navigateTo('view-treino'); document.getElementById('treino-slots-view').style.display = 'none'; document.getElementById('treino-active-view').style.display = 'block'; document.getElementById('active-workout-tabs').style.display = 'none'; currentDay = 'CUSTOM'; renderWorkout(); }
function saveCurrentRoutine() { if (builderState.routine.length === 0) return; const routineName = prompt("Nome da rotina:"); if (!routineName) return; savedRoutines.push({ name: routineName, routine: JSON.parse(JSON.stringify(builderState.routine)) }); localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); showPulseToast('✅ Guardada!'); builderState.routine = []; updateBuilderUI(); navigateTo('view-treino'); }

// --- MAPA DE CALOR E GRÁFICOS AVANÇADOS ---
function updateHeatmap() {
    const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7); 
    let volume = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    
    history.forEach(log => { 
        const parts = log.date.split('/'); 
        if(parts.length === 3) { 
            const logDate = new Date(parts[2], parts[1]-1, parts[0]); 
            if (logDate >= sevenDaysAgo && logDate <= now && log.exercises) {
                Object.entries(log.exercises).forEach(([exName, sets]) => { 
                    let muscle = getMuscleForExercise(exName); 
                    if (volume[muscle] !== undefined) volume[muscle] += sets.length; 
                }); 
            }
        } 
    });
    
    const getColor = (sets) => { if (sets === 0) return '#334155'; if (sets <= 6) return '#eab308'; if (sets <= 12) return '#f97316'; return '#ef4444'; };
    const getLabel = (sets) => { if (sets === 0) return 'Recuperado'; if (sets <= 6) return 'Ativado'; if (sets <= 12) return 'Fadigado'; return 'Destruído'; };

    const muscles = [
        { name: 'Peito', id: 'peito', pain: [] },
        { name: 'Costas', id: 'costas', pain: ['Lombar'] },
        { name: 'Pernas', id: 'pernas', pain: ['Joelhos'] },
        { name: 'Ombros', id: 'ombros', pain: ['Ombros'] },
        { name: 'Braços', id: 'bracos', pain: ['Cotovelos'] },
        { name: 'Core', id: 'core', pain: [] }
    ];

    muscles.forEach(m => {
        let el = document.getElementById(`hm-${m.id}`);
        if(el) {
            let color = getColor(volume[m.name]);
            let label = getLabel(volume[m.name]);
            let isPain = m.pain.some(p => painTracker.includes(p));

            let painHtml = isPain ? `<span style="font-size:10px; background:var(--danger); padding:2px 5px; border-radius:4px; color:white;">⚠️ DOR</span>` : '';
            
            el.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:white; font-size:14px;">${m.name}</span>
                    ${painHtml}
                </div>
                <div style="font-size:11px; color:${color}; margin-top:8px; font-weight:bold;">${label} (${volume[m.name]} S)</div>
                <div class="progress-bar" style="height:6px; margin-top:8px; background:rgba(255,255,255,0.05); border-radius:3px;">
                    <div style="height:100%; width:${Math.min((volume[m.name]/15)*100, 100)}%; background:${color}; border-radius:3px; transition:0.4s;"></div>
                </div>
            `;
            el.style.borderLeft = `4px solid ${isPain ? 'var(--danger)' : color}`;
        }
    });
}

function setupChartSelect() { const select = document.getElementById('exercise-select'); if (!select) return; select.innerHTML = '<option value="">Escolhe um exercício...</option>'; const uniqueExercises = new Set(); history.forEach(log => { if(log.exercises) Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); }); uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; }); }

function renderAdvancedCharts() {
    let radarVol = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(log => { if(log.exercises) Object.entries(log.exercises).forEach(([ex, sets]) => { let m = getMuscleForExercise(ex); sets.forEach(s => { if(s.type !== 'W') { if(radarVol[m] !== undefined) radarVol[m] += (s.weight||s.w||0) * (s.reps||s.r||0); else if(m==='Bíceps'||m==='Tríceps') radarVol['Braços'] += (s.weight||s.w||0) * (s.reps||s.r||0); }}); }); });
    if (radarInstance) radarInstance.destroy(); radarInstance = new Chart(document.getElementById('radarChart').getContext('2d'), { type: 'radar', data: { labels: Object.keys(radarVol), datasets: [{ label: 'Volume (kg)', data: Object.values(radarVol), backgroundColor: 'rgba(56, 189, 248, 0.4)', borderColor: '#38bdf8', pointBackgroundColor: '#fff' }] }, options: { scales: { r: { min: 0, angleLines: { color: '#334155' }, grid: { color: '#334155' }, pointLabels: { color: '#94a3b8' }, ticks: { display: false } } }, plugins: { legend: { display: false } } } });

    let tonHistory = {}; history.forEach(log => { let parts = log.date.split('/'); if(parts.length!==3) return; let monthYear = `${parts[1]}/${parts[2]}`; if(!tonHistory[monthYear]) tonHistory[monthYear] = 0; if(log.exercises) Object.values(log.exercises).forEach(sets => sets.forEach(s => { if(s.type !== 'W') tonHistory[monthYear] += (s.weight||s.w||0) * (s.reps||s.r||0); })); });
    let tonKeys = Object.keys(tonHistory).slice(-6); let tonData = tonKeys.map(k => tonHistory[k]);
    if (tonnageInstance) tonnageInstance.destroy(); tonnageInstance = new Chart(document.getElementById('tonnageChart').getContext('2d'), { type: 'bar', data: { labels: tonKeys, datasets: [{ label: 'Tonagem (kg)', data: tonData, backgroundColor: '#22c55e', borderRadius: 6 }] }, options: { scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } } });

    if (bodyStatsHistory.length > 0) {
        let dates = bodyStatsHistory.map(s => s.date.slice(0, 5)); let wData = bodyStatsHistory.map(s => s.weight); let rfmData = bodyStatsHistory.map(s => s.rfm);
        if (bodyStatsInstance) bodyStatsInstance.destroy(); bodyStatsInstance = new Chart(document.getElementById('bodyStatsChart').getContext('2d'), { type: 'line', data: { labels: dates, datasets: [{ label: 'Peso (kg)', data: wData, borderColor: '#38bdf8', yAxisID: 'y', tension: 0.3 }, { label: 'RFM (%)', data: rfmData, borderColor: '#f59e0b', yAxisID: 'y1', tension: 0.3 }] }, options: { plugins: { legend: { display: true, position: 'bottom', labels: { color: 'white', usePointStyle: true, boxWidth: 8, padding: 20 } } }, scales: { y: { type: 'linear', display: true, position: 'left', grid: { color: '#334155' } }, y1: { type: 'linear', display: true, position: 'right', grid: { display: false } } } } });
    }
    let mHistory = JSON.parse(localStorage.getItem('gym_profile_history')) || [];
    if (mHistory.length > 0) {
        let mDates = mHistory.map(h => h.date.slice(0,5)); let mArm = mHistory.map(h => h.arm); let mChest = mHistory.map(h => h.chest); let mWaist = mHistory.map(h => h.waist); let mLeg = mHistory.map(h => h.leg);
        if (measChartInstance) measChartInstance.destroy(); measChartInstance = new Chart(document.getElementById('measChart').getContext('2d'), { type: 'line', data: { labels: mDates, datasets: [{ label: 'Braço', data: mArm, borderColor: '#a855f7', tension: 0.3 }, { label: 'Peito', data: mChest, borderColor: '#38bdf8', tension: 0.3 }, { label: 'Cintura', data: mWaist, borderColor: '#f59e0b', tension: 0.3 }, { label: 'Perna', data: mLeg, borderColor: '#22c55e', tension: 0.3 }] }, options: { plugins: { legend: { display: true, position: 'bottom', labels: { color: 'white', usePointStyle: true, boxWidth: 8, padding: 20 } } }, scales: { y: { grid: { color: '#334155' } } } } });
    }
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value; if (!exercise) return; const labels = []; const data = []; const reps = [];
    history.forEach(log => { if (log.exercises && log.exercises[exercise]) { labels.push(log.date); let workSets = log.exercises[exercise].filter(s => s.type !== 'W'); if(workSets.length===0) workSets = log.exercises[exercise]; data.push(workSets[0].weight || workSets[0].w); reps.push(workSets[0].reps || workSets[0].r); } });
    if (chartInstance) chartInstance.destroy(); const ctx = document.getElementById('progressChart').getContext('2d'); chartInstance = new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Carga (kg)', data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.3 }] }, options: { plugins: { legend: { display: true, position: 'bottom', labels: { color: 'white', usePointStyle: true, boxWidth: 8, padding: 20 } } }, scales: { y: { grid: { color: '#334155' } } } } });
    const maxWeight = Math.max(...data, 0); const maxReps = Math.max(...reps, 0); let totalVolume = 0; history.forEach(log => { if (log.exercises && log.exercises[exercise]) { log.exercises[exercise].forEach(set => { if(set.type !== 'W') totalVolume += (set.weight || set.w) * (set.reps || set.r); }); } });
    update1RMPrediction(exercise, maxWeight, maxReps, totalVolume);
}

function update1RMPrediction(exerciseName, maxWeight, maxReps, totalVolume) {
    const container = document.getElementById('onerm-container'); if (!exerciseName || !container) return; let best1RM = calculate1RM(maxWeight, maxReps);
    if (best1RM > 0) { 
        container.style.display = 'block'; document.getElementById('onerm-value').innerText = Math.round(best1RM) + ' kg'; 
        let stdHtml = ''; if(typeof getStrengthStandard === 'function') { let std = getStrengthStandard(exerciseName, best1RM, userProfile.weight, userProfile.gender); if(std) stdHtml = `<div class="strength-badge rank-${std.level.toLowerCase()}">Rank: ${std.level}</div><div style="font-size:11px; margin-top:5px;">Faltam ${std.nextKg}kg para o próximo nível.</div>`; }
        document.getElementById('onerm-prediction').innerHTML = stdHtml; 
    } else container.style.display = 'none';
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

function renderDisciplineWall() {
    const wall = document.getElementById('discipline-wall'); if(!wall) return; wall.innerHTML = ''; let workoutMap = {};
    history.forEach(log => { let vol = 0; if(log.exercises) Object.values(log.exercises).forEach(sets => sets.forEach(s => { if(s.type !== 'W') vol += (s.weight||s.w||0) * (s.reps||s.r||0); })); workoutMap[log.date] = (workoutMap[log.date] || 0) + vol; });
    let today = new Date(); let html = '';
    for(let i = 364; i >= 0; i--) {
        let d = new Date(today); d.setDate(today.getDate() - i); let dStr = d.toLocaleDateString('pt-PT'); let vol = workoutMap[dStr];
        let bg = '#1e293b'; let op = 1;
        if(vol !== undefined) { bg = 'var(--accent)'; if (vol === 0) op = 0.2; else if (vol < 5000) op = 0.4; else if (vol < 10000) op = 0.7; else op = 1.0; }
        html += `<div class="discipline-block" style="background:${bg}; opacity:${op};" title="${dStr}${vol !== undefined ? ' - ' + Math.round(vol) + 'kg' : ''}"></div>`;
    }
    wall.innerHTML = html; setTimeout(() => { wall.scrollLeft = wall.scrollWidth; }, 100);
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

let selectedCalendarDate = '';

function showHistoryDetails(dateString) {
    const sessions = history.filter(h => h.date === dateString);
    if (sessions.length === 0) {
        selectedCalendarDate = dateString;
        document.getElementById('manual-history-date-text').innerText = `Queres registar um dia de treino em ${dateString}?`;
        document.getElementById('manual-history-modal').style.display = 'flex';
        return;
    }
    let html = ''; sessions.forEach(session => { let vol = 0; let exs = 0; if(session.exercises) Object.entries(session.exercises).forEach(([ex, sets]) => { exs++; sets.forEach(s => { if(s.type !== 'W') vol += (s.weight||s.w||0) * (s.reps||s.r||0); }); }); html += `<div style="background:#0f172a; padding:15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--accent); text-align:left;"><h4 style="color:white; margin-bottom:5px;">${session.day || 'Treino'}</h4><p style="color:var(--muted); font-size:12px;">Exercícios: ${exs} | Tonagem: ${Math.round(vol)}kg</p></div>`; });
    html += `<button onclick="deleteDayHistory('${dateString}')" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:10px; border-radius:8px; width:100%; margin-top:10px; cursor:pointer;">Apagar Registo</button>`;
    document.getElementById('history-details-content').innerHTML = html; document.getElementById('history-modal-date').innerText = dateString; document.getElementById('history-details-modal').style.display = 'flex';
}

function confirmManualHistory() {
    if (selectedCalendarDate) {
        history.push({ date: selectedCalendarDate, day: 'MANUAL', exercises: {} }); 
        localStorage.setItem('gym_tracker_history', JSON.stringify(history)); 
        closeManualHistoryModal(); 
        renderCalendar(); 
        showPulseToast("✅ Dia registado com sucesso!");
    }
}

function closeManualHistoryModal() {
    document.getElementById('manual-history-modal').style.display = 'none';
    selectedCalendarDate = '';
}

function deleteDayHistory(dateString) { if(confirm("APAGAR dados deste dia?")) { history = history.filter(h => h.date !== dateString); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); closeHistoryModal(); renderCalendar(); updateGlobalStats(); updateHeatmap(); renderDisciplineWall(); showPulseToast("🗑️ Registo apagado."); } }
function closeHistoryModal() { document.getElementById('history-details-modal').style.display='none'; }

// --- PERFIL, SBD TOTAL E MISSÕES ---
function renderSBD() {
    let bestSquat=0, bestBench=0, bestDead=0;
    history.forEach(log => {
        if(log.exercises) {
            Object.entries(log.exercises).forEach(([ex, sets]) => {
                let max = Math.max(...sets.map(s => parseFloat(s.weight||s.w||0))); let n = ex.toLowerCase();
                if(n.includes('supino plano') || n.includes('bench press')) { if(max > bestBench) bestBench = max; }
                if(n.includes('agachamento livre') || n.includes('squat')) { if(max > bestSquat) bestSquat = max; }
                if(n.includes('peso morto') || n.includes('deadlift') || n.includes('rdl')) { if(max > bestDead) bestDead = max; }
            });
        }
    });
    let sbdTotal = bestSquat + bestBench + bestDead;
    const elSbd = document.getElementById('sbd-total-val');
    const elRatio = document.getElementById('sbd-ratio');
    if (elSbd && elRatio) {
        elSbd.innerText = sbdTotal + ' kg';
        let ratio = userProfile.weight > 0 ? (sbdTotal / userProfile.weight).toFixed(1) : 0;
        elRatio.innerText = `${ratio}x o teu peso corporal`;
    }
}

let isProfileEditing = false;
function toggleProfileEdit() {
    isProfileEditing = !isProfileEditing;
    const formContainer = document.getElementById('profile-form-container');
    const editBtn = document.getElementById('btn-edit-profile');
    const detailsPanel = document.getElementById('details-profile'); 
    
    if (isProfileEditing) {
        if (detailsPanel) detailsPanel.open = true; 
        formContainer.style.opacity = '1';
        formContainer.style.pointerEvents = 'auto';
        editBtn.innerHTML = '💾 Gravar';
        editBtn.style.background = 'var(--success)';
        editBtn.style.borderColor = 'var(--success)';
    } else {
        formContainer.style.opacity = '0.7';
        formContainer.style.pointerEvents = 'none';
        editBtn.innerHTML = '✏️ Editar';
        editBtn.style.background = 'rgba(0,0,0,0.5)';
        editBtn.style.borderColor = 'var(--accent)';
        updateProfileData(); 
        showPulseToast("✅ Perfil Atualizado!");
    }
}

function renderProfile() {
    document.getElementById('prof-name').value = userProfile.name || ''; document.getElementById('prof-age').value = userProfile.age || 25; document.getElementById('prof-gender').value = userProfile.gender || 'male'; document.getElementById('prof-height').value = userProfile.height || 170; document.getElementById('prof-weight').value = userProfile.weight || 70; document.getElementById('prof-activity').value = userProfile.activity || '1.55'; document.getElementById('prof-goal').value = userProfile.goal || 'maintain';
    if (userProfile.measurements) { document.getElementById('meas-arm').value = userProfile.measurements.arm || ''; document.getElementById('meas-chest').value = userProfile.measurements.chest || ''; document.getElementById('meas-waist').value = userProfile.measurements.waist || ''; document.getElementById('meas-leg').value = userProfile.measurements.leg || ''; }
    
    let displayName = userProfile.name ? userProfile.name : "Titã Misterioso";
    document.getElementById('profile-display-name').innerText = displayName;
    
    let initials = "--";
    if (userProfile.name) {
        let nameParts = userProfile.name.trim().split(' ');
        if (nameParts.length >= 2) {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
            initials = nameParts[0].substring(0, 2).toUpperCase();
        }
    }
    document.getElementById('avatar-initials').innerText = initials;
    updateProfileData();
}

function renderMissionProfile() {
    const container = document.getElementById('profile-mission-display');
    if(!container) return;
    if(activeMission) { 
        container.innerHTML = `<div class="mission-box" style="margin-top: 5px;"><strong>${activeMission.desc}</strong><br><div style="background:#334155; height:6px; border-radius:3px; margin-top:5px;"><div style="background:var(--accent); height:100%; width:${Math.min((activeMission.progress / activeMission.target) * 100, 100)}%;"></div></div></div>`; 
    } else {
        container.innerHTML = '<p style="color:var(--muted); font-size:12px; text-align:center;">Sem missão ativa.</p>';
    }
}

function updateProfileData() {
    userProfile.name = document.getElementById('prof-name').value; userProfile.age = parseInt(document.getElementById('prof-age').value) || 25; userProfile.gender = document.getElementById('prof-gender').value; userProfile.height = parseInt(document.getElementById('prof-height').value) || 170; userProfile.weight = parseInt(document.getElementById('prof-weight').value) || 70; userProfile.activity = parseFloat(document.getElementById('prof-activity').value) || 1.55; userProfile.goal = document.getElementById('prof-goal').value;
    if (!userProfile.measurements) userProfile.measurements = {}; userProfile.measurements.arm = document.getElementById('meas-arm').value; userProfile.measurements.chest = document.getElementById('meas-chest').value; userProfile.measurements.waist = document.getElementById('meas-waist').value; userProfile.measurements.leg = document.getElementById('meas-leg').value;
    localStorage.setItem('gym_profile', JSON.stringify(userProfile)); document.getElementById('height-val').innerText = userProfile.height; document.getElementById('weight-val').innerText = userProfile.weight;
    
    // ATUALIZAÇÃO IMEDIATA DO AVATAR E NOME
    let displayName = userProfile.name ? userProfile.name : "Titã Misterioso";
    document.getElementById('profile-display-name').innerText = displayName;
    let initials = "--";
    if (userProfile.name) {
        let nameParts = userProfile.name.trim().split(' ');
        if (nameParts.length >= 2) {
            initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
        } else if (nameParts.length === 1 && nameParts[0].length > 0) {
            initials = nameParts[0].substring(0, 2).toUpperCase();
        }
    }
    document.getElementById('avatar-initials').innerText = initials;

    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2); document.getElementById('calc-bmi').innerText = bmi.toFixed(1);
    let bmiStatus = "Normal"; let bmiColor = "var(--success)"; if (bmi < 18.5) { bmiStatus = "Baixo Peso"; bmiColor = "var(--accent)"; } else if (bmi >= 25 && bmi < 30) { bmiStatus = "Excesso de Peso"; bmiColor = "#f59e0b"; } else if (bmi >= 30) { bmiStatus = "Obesidade"; bmiColor = "var(--danger)"; }
    document.getElementById('calc-bmi-status').innerText = bmiStatus; document.getElementById('calc-bmi-status').style.color = bmiColor;
    let tdee = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age); tdee += (userProfile.gender === 'male') ? 5 : -161; tdee *= userProfile.activity; if (userProfile.goal === 'cut') tdee -= 500; if (userProfile.goal === 'bulk') tdee += 300; document.getElementById('calc-cals').innerText = Math.round(tdee);
    
    let todayStr = new Date().toLocaleDateString('pt-PT'); let mHistory = JSON.parse(localStorage.getItem('gym_profile_history')) || [];
    let rfmCalc = (userProfile.gender === 'male') ? 64 - (20 * (userProfile.height / userProfile.measurements.waist)) : 76 - (20 * (userProfile.height / userProfile.measurements.waist)); let finalRfm = Math.max(3, Math.min(rfmCalc, 50)) || 0;
    let existingStat = bodyStatsHistory.find(s => s.date === todayStr); if(existingStat) { existingStat.weight = userProfile.weight; existingStat.rfm = finalRfm; } else { bodyStatsHistory.push({ date: todayStr, weight: userProfile.weight, rfm: finalRfm }); } localStorage.setItem('gym_body_stats', JSON.stringify(bodyStatsHistory));
    let existingMeas = mHistory.find(s => s.date === todayStr); if(existingMeas) { existingMeas.arm = userProfile.measurements.arm; existingMeas.chest = userProfile.measurements.chest; existingMeas.waist = userProfile.measurements.waist; existingMeas.leg = userProfile.measurements.leg; } else { mHistory.push({ date: todayStr, arm: userProfile.measurements.arm, chest: userProfile.measurements.chest, waist: userProfile.measurements.waist, leg: userProfile.measurements.leg }); } localStorage.setItem('gym_profile_history', JSON.stringify(mHistory));

    if(typeof renderDieta === 'function') renderDieta(); if(typeof calculateBodyFat === 'function') calculateBodyFat();
}

function renderAchievements() {
    const container = document.getElementById('achievements-list'); if(!container) return; container.innerHTML = '';
    allAchievements.forEach(ach => { const isUnlocked = achievementsUnlocked.includes(ach.id); const filter = isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'; const color = isUnlocked ? 'var(--accent)' : 'var(--muted)'; container.innerHTML += `<div style="display:flex; align-items:center; gap:15px; padding:12px; background:var(--bg-color); border-radius:12px; margin-bottom:10px; filter:${filter}; transition:0.3s;"><div style="font-size:30px; background:#1e293b; padding:10px; border-radius:50%; border:2px solid ${color};">${ach.icon}</div><div><h4 style="color:white; margin:0; font-size:15px;">${ach.title}</h4><p style="color:var(--muted); font-size:12px; margin-top:3px;">${ach.desc}</p></div></div>`; });
}

// --- NUTRIÇÃO E LISTA DE COMPRAS ---
const commonFoodsDB = [
    {name: "Ovo Cozido (1 uni)", cals: 70, pro: 6, car: 0}, {name: "Peito de Frango Cru (100g)", cals: 110, pro: 23, car: 0}, {name: "Peito de Frango Grelhado (100g)", cals: 165, pro: 31, car: 0},
    {name: "Bife de Vaca Magro (100g)", cals: 150, pro: 26, car: 0}, {name: "Salmão Grelhado (100g)", cals: 205, pro: 22, car: 0}, {name: "Arroz Branco (100g cozido)", cals: 130, pro: 2, car: 28},
    {name: "Massa (100g cozida)", cals: 130, pro: 5, car: 25}, {name: "Batata Doce (100g cozida)", cals: 86, pro: 1, car: 20}, {name: "Aveia (50g)", cals: 190, pro: 7, car: 33},
    {name: "Whey Protein (1 scoop 30g)", cals: 120, pro: 24, car: 3}, {name: "Banana (1 média)", cals: 105, pro: 1, car: 27}, {name: "Maçã (1 média)", cals: 95, pro: 0, car: 25},
    {name: "Manteiga de Amendoim (1 c.sopa)", cals: 95, pro: 4, car: 3}, {name: "Azeite (1 colher de sopa)", cals: 119, pro: 0, car: 0}, {name: "Atum em água (1 lata seca)", cals: 110, pro: 25, car: 0},
    {name: "Pão Integral (1 fatia)", cals: 75, pro: 3, car: 13}, {name: "Leite Meio Gordo (250ml)", cals: 115, pro: 8, car: 12}
];

function fillCommonFood() { let sel = document.getElementById('db-food-select').value; if(!sel) return; let food = commonFoodsDB.find(f => f.name === sel); if(food) { document.getElementById('food-name').value = food.name; document.getElementById('food-cals').value = food.cals; document.getElementById('food-pro').value = food.pro; document.getElementById('food-car').value = food.car; } }

function renderDieta() {
    const calsElement = document.getElementById('calc-cals'); if(!calsElement) return; let tdee = parseInt(calsElement.innerText) || 0; let weight = userProfile.weight; let goal = userProfile.goal; if (tdee === 0) return;
    let proteinTarget = Math.round(weight * 2.2); let fatTarget = Math.round(weight * (goal === 'cut' ? 0.8 : 1.0)); let carbsTarget = Math.max(0, Math.round((tdee - (proteinTarget * 4 + fatTarget * 9)) / 4));
    document.getElementById('dash-cals-target').innerText = tdee; document.getElementById('dash-pro-target').innerText = proteinTarget; document.getElementById('dash-car-target').innerText = carbsTarget;
    let waterTarget = Math.round(weight * 35); if(userProfile.activity >= 1.55) waterTarget += 500; document.getElementById('water-text').innerText = `${waterIntake.ml} / ${waterTarget} ml`; document.getElementById('water-fill').style.width = Math.min((waterIntake.ml / waterTarget) * 100, 100) + '%';
    
    const foodList = document.getElementById('daily-food-list'); let totalCals = 0, totalPro = 0, totalCar = 0;
    if(foodList) {
        foodList.innerHTML = '';
        dailyIntake.foods.forEach((food, index) => { 
            totalCals += food.cals || 0; totalPro += food.pro || 0; totalCar += food.car || 0;
            foodList.innerHTML += `<div style="background:#1e293b; padding:12px 15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent); margin-bottom:8px;"><div><div style="font-weight:bold; font-size:14px; color:white; margin-bottom:4px;">${food.name}</div><div style="font-size:11px; color:var(--muted);"><span style="color:var(--accent); font-weight:bold;">${food.cals} Kcal</span> | <span style="color:var(--success);">${food.pro}g Pro</span> | <span style="color:#3b82f6;">${food.car||0}g Car</span></div></div><button onclick="deleteDailyFood(${index})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:18px;">✖</button></div>`; 
        });
        if (dailyIntake.foods.length === 0) foodList.innerHTML = '<p style="text-align:center; color:var(--muted); font-size:12px;">Ainda não comeste nada hoje.</p>';
    }
    document.getElementById('dash-cals-done').innerText = totalCals; document.getElementById('dash-pro-done').innerText = totalPro; document.getElementById('dash-car-done').innerText = totalCar;
    document.getElementById('dash-cals-bar').style.width = Math.min((totalCals / tdee) * 100, 100) + '%'; document.getElementById('dash-pro-bar').style.width = Math.min((totalPro / proteinTarget) * 100, 100) + '%'; document.getElementById('dash-car-bar').style.width = Math.min((totalCar / carbsTarget) * 100, 100) + '%';
    document.getElementById('dash-cals-done').style.color = totalCals > tdee ? 'var(--danger)' : 'white'; document.getElementById('dash-cals-bar').style.background = totalCals > tdee ? 'var(--danger)' : 'var(--accent)';
    renderPunishmentStatus();
}

function addWater(ml) { waterIntake.ml += ml; localStorage.setItem('gym_water', JSON.stringify(waterIntake)); renderDieta(); }
function openWaterModal(type) { if (type === 'garrafas') { document.getElementById('water-garrafas-modal').style.display = 'flex'; } else { document.getElementById('glass-count').innerText = '1'; document.getElementById('water-copos-modal').style.display = 'flex'; } }
function closeWaterModal(type) { if (type === 'garrafas') document.getElementById('water-garrafas-modal').style.display = 'none'; else document.getElementById('water-copos-modal').style.display = 'none'; }
function addWaterGarrafa(ml) { addWater(ml); closeWaterModal('garrafas'); showPulseToast(`💧 +${ml}ml registados!`); }
function adjustGlasses(direction) { let el = document.getElementById('glass-count'); let val = parseInt(el.innerText) + direction; if (val < 1) val = 1; el.innerText = val; }
function confirmGlasses() { let count = parseInt(document.getElementById('glass-count').innerText); let ml = count * 250; addWater(ml); closeWaterModal('copos'); showPulseToast(`💧 ${count} Copo(s) registado(s)! (+${ml}ml)`); }

function quickAddFood(name, cals, pro, car = 0) { dailyIntake.foods.push({ name, cals, pro, car }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); showPulseToast(`✅ ${name} registado!`); }
function addDailyFood() { const name = document.getElementById('food-name').value; let cals = parseInt(document.getElementById('food-cals').value) || 0; let pro = parseInt(document.getElementById('food-pro').value) || 0; let car = parseInt(document.getElementById('food-car').value) || 0; if (cals === 0 && (pro > 0 || car > 0)) { cals = (pro * 4) + (car * 4); } if(!name || cals === 0) { showPulseToast('Insere o Nome e Kcal/Macros!', true); return; } dailyIntake.foods.push({ name, cals, pro, car }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); if(!frequentFoods.find(f => f.name === name)) { frequentFoods.push({ name, cals, pro, car }); if(frequentFoods.length > 6) frequentFoods.shift(); localStorage.setItem('gym_freq_foods', JSON.stringify(frequentFoods)); } document.getElementById('food-name').value = ''; document.getElementById('food-cals').value = ''; document.getElementById('food-pro').value = ''; document.getElementById('food-car').value = ''; document.getElementById('db-food-select').value = ''; renderDieta(); }
function deleteDailyFood(index) { dailyIntake.foods.splice(index, 1); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); }

function toggleFasting() { fastingState.active = !fastingState.active; if (fastingState.active) { fastingState.start = new Date().getTime(); } else { fastingState.start = null; clearInterval(fastingInterval); } localStorage.setItem('gym_fasting', JSON.stringify(fastingState)); startFastingTimer(); }
function startFastingTimer() { if(fastingInterval) clearInterval(fastingInterval); const ring = document.getElementById('fasting-ring'); const text = document.getElementById('fasting-time'); const btn = document.getElementById('fasting-btn'); if(!fastingState.active) { ring.classList.remove('active'); text.innerText = "00:00:00"; btn.innerText = "Iniciar"; btn.style.background = "var(--success)"; return; } ring.classList.add('active'); btn.innerText = "Terminar"; btn.style.background = "var(--danger)"; fastingInterval = setInterval(() => { let diff = new Date().getTime() - fastingState.start; let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); let secs = Math.floor((diff % (1000 * 60)) / 1000); text.innerText = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; }, 1000); }

// --- RECEITAS PARA HIPERTROFIA EM ACORDEÃO (C/ Instruções) ---
function openRecipesModal() { 
    const recipes = {
        "🌅 Pequeno-Almoço": [
            { name: "Papas de Aveia Proteicas", prep: "5 min", cals: 380, pro: 35, car: 45, desc: "60g de aveia, 1 scoop de Whey, 200ml água/leite.", instructions: "1. Numa taça grande, mistura os 60g de aveia com 1 scoop de Whey.\n2. Adiciona os 200ml de água ou leite e mexe bem.\n3. Leva ao micro-ondas durante 2 minutos.\n4. Retira, mexe novamente para ganhar textura e adiciona canela a gosto." },
            { name: "Panquecas Mutantes", prep: "10 min", cals: 420, pro: 30, car: 45, desc: "2 ovos, 1 banana, 40g de aveia.", instructions: "1. Esmaga a banana até virar puré.\n2. Adiciona os 2 ovos e os 40g de aveia e mistura tudo.\n3. Aquece uma frigideira anti-aderente em lume médio.\n4. Deita pequenas porções da massa e vira quando começarem a formar bolhas." },
            { name: "Ovos Mexidos c/ Pão", prep: "5 min", cals: 350, pro: 20, car: 26, desc: "3 ovos inteiros + 2 fatias de pão integral escuro.", instructions: "1. Parte os 3 ovos para um prato e bate-os levemente.\n2. Aquece uma frigideira com um fio de azeite e deita os ovos.\n3. Mexe devagar em lume brando até atingirem a consistência desejada.\n4. Serve acompanhado das 2 fatias de pão escuro torrado." }
        ],
        "☀️ Almoço": [
            { name: "Clássico Bodybuilder", prep: "15 min", cals: 550, pro: 50, car: 60, desc: "150g peito de frango, 80g de arroz basmati, brócolos.", instructions: "1. Coze o arroz basmati e os brócolos em água a ferver.\n2. Tempera o frango com sal, alho em pó, pimenta e sumo de limão.\n3. Grelha o frango numa frigideira quente até ficar dourado.\n4. Junta tudo no prato e foca-te nos ganhos." },
            { name: "Massa do Poder", prep: "15 min", cals: 620, pro: 45, car: 70, desc: "100g de massa, 120g carne picada magra, molho de tomate.", instructions: "1. Põe a massa a cozer com sal grosso durante 10 minutos.\n2. Numa frigideira, refoga cebola e deita a carne picada magra.\n3. Quando a carne estiver cozinhada, junta 3 colheres de molho de tomate natural.\n4. Mistura a carne com a massa." },
            { name: "Salmão com Quinoa", prep: "20 min", cals: 600, pro: 35, car: 45, desc: "150g salmão, 60g quinoa, espargos.", instructions: "1. Lava bem a quinoa e coze-a numa panela pequena (15 mins).\n2. Tempera o salmão com sal, pimenta e limão e grelha ou assa no forno.\n3. Salteia os espargos na frigideira durante 5 minutos.\n4. Prato completo, repleto de Ómega-3." }
        ],
        "🥪 Lanche / Pós-Treino": [
            { name: "Batido SOS", prep: "2 min", cals: 320, pro: 30, car: 40, desc: "250ml leite magro, 1 scoop Whey, 1 banana, 20g aveia.", instructions: "1. Despeja os 250ml de leite no liquidificador.\n2. Adiciona a Whey, a banana partida e a aveia.\n3. Bate tudo durante 30 segundos na velocidade máxima.\n4. Adiciona 2 cubos de gelo se preferires bem fresco." },
            { name: "Tostas de Amendoim", prep: "2 min", cals: 280, pro: 10, car: 35, desc: "4 tostas de arroz/milho, 2 colheres de Manteiga de Amendoim.", instructions: "1. Pega nas 4 tostas de milho ou arroz.\n2. Barra 1 colher de sobremesa rasa de manteiga de amendoim em cada uma.\n3. (Opcional: coloca meia rodela de banana no topo para extra energia pré-treino)." },
            { name: "Queijo Quark c/ Fruta", prep: "2 min", cals: 220, pro: 25, car: 20, desc: "250g Queijo Quark (magro), frutos vermelhos congelados.", instructions: "1. Deita as 250g de queijo quark numa taça (bate um pouco com a colher para ficar cremoso).\n2. Adiciona uma mão cheia de frutos vermelhos congelados por cima.\n3. (Opcional: Podes juntar umas gotas de adoçante ou Flavour Drops)." },
            { name: "Sandes de Peito de Peru", prep: "3 min", cals: 310, pro: 25, car: 35, desc: "2 fatias pão integral, 4 fatias peito de peru, queijo fresco.", instructions: "1. Barra o queijo fresco (ou creme de queijo light) nas fatias de pão integral.\n2. Coloca as fatias de peito de peru por cima.\n3. (Opcional: Junta umas folhas de alface para frescura). Fecha e devora." }
        ],
        "🌙 Jantar": [
            { name: "Omelete Titã", prep: "8 min", cals: 320, pro: 35, car: 5, desc: "1 ovo + 150ml claras, espinafres, 30g queijo magro.", instructions: "1. Numa tigela, bate o ovo com os 150ml de claras líquidas e uma pitada de sal.\n2. Aquece uma frigideira anti-aderente, deita a mistura.\n3. Espalha os espinafres frescos e as 30g de queijo fatiado por cima da massa ainda crua.\n4. Quando as bordas começarem a cozinhar, dobra ao meio e deixa acabar de fazer." },
            { name: "Bife Vaca Magro", prep: "12 min", cals: 450, pro: 40, car: 35, desc: "150g bife de vaca magro, 50g arroz, salada mista.", instructions: "1. Põe os 50g de arroz a cozer.\n2. Aquece bem a frigideira. Sela o bife de ambos os lados rapidamente para não secar (tempera só no fim).\n3. Prepara uma salada rápida (alface e tomate).\n4. Refeição rápida e densa em ferro e proteína." },
            { name: "Pescada no Forno", prep: "25 min", cals: 380, pro: 30, car: 40, desc: "2 filetes pescada, 150g batata assada, curgete.", instructions: "1. Pré-aquece o forno a 200ºC.\n2. Num tabuleiro, coloca os filetes de pescada, a curgete às rodelas e a batata em cubos.\n3. Tempera com alho em pó, pimentão doce, limão e um fiozinho pequeno de azeite.\n4. Assa durante 20-25 minutos. Leve e fácil de digerir." }
        ]
    };
    let html = ''; Object.keys(recipes).forEach(category => { html += `<h3 style="color:var(--accent); margin-top:30px; margin-bottom:15px; font-size:16px; border-bottom:1px solid #334155; padding-bottom:5px;">${category}</h3>`; recipes[category].forEach(r => { html += `<details class="custom-details" style="background:#1e293b; padding:12px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--accent);"><summary style="font-size: 14px; font-weight: bold; color: white; cursor: pointer; outline: none; list-style: none;"><div style="display:flex; justify-content:space-between; align-items:center; width:100%;"><span>${r.name}</span><span style="font-size:11px; color:var(--muted); font-weight:normal;">⏱️ ${r.prep} <span style="margin-left:5px; font-size:10px;">▼</span></span></div></summary><div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #334155;"><div style="font-size:12px; color:var(--success); font-weight:bold; margin-bottom:12px;">🔥 ${r.cals} Kcal | 🥩 ${r.pro}g Pro | 🍚 ${r.car}g Car</div><div style="margin-bottom: 12px;"><span style="font-size: 11px; color: var(--accent); font-weight: bold;">INGREDIENTES:</span><p style="color:var(--muted); font-size:12px; line-height:1.4; margin-top:3px;">${r.desc}</p></div><div style="margin-bottom: 15px;"><span style="font-size: 11px; color: var(--accent); font-weight: bold;">INSTRUÇÕES:</span><p style="color:white; font-size:12px; line-height:1.6; margin-top:3px; white-space: pre-wrap;">${r.instructions}</p></div><button onclick="quickAddFood('${r.name}', ${r.cals}, ${r.pro}, ${r.car}); closeRecipesModal();" style="width:100%; background:rgba(56,189,248,0.1); border:1px solid var(--accent); color:white; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;">✚ Adicionar ao Diário</button></div></details>`; }); });
    document.getElementById('recipes-list').innerHTML = html; document.getElementById('recipes-modal').style.display = 'flex'; 
} 
function closeRecipesModal() { document.getElementById('recipes-modal').style.display = 'none'; }

// --- TAXA DO PECADO (CUMULATIVA & PRESCRIÇÃO 5 DIAS) ---
let baseSinCals = 0, baseSinPro = 0, baseSinCar = 0;
function checkPunishmentExpiration() { let ap = JSON.parse(localStorage.getItem('gym_punishment')); if (ap && ap.lastUpdated) { let daysPassed = (Date.now() - ap.lastUpdated) / (1000 * 60 * 60 * 24); if (daysPassed >= 5) { activePunishment = null; localStorage.removeItem('gym_punishment'); showPulseToast('⏳ Os deuses da hipertrofia perdoaram a tua dívida (5 dias). Estás limpo!'); } else { activePunishment = ap; } } else if (ap && !ap.lastUpdated) { ap.lastUpdated = Date.now(); localStorage.setItem('gym_punishment', JSON.stringify(ap)); activePunishment = ap; } }
function openPunishmentModal() { document.getElementById('punishment-modal').style.display = 'flex'; } function closePunishmentModal() { document.getElementById('punishment-modal').style.display = 'none'; }
function fillSinPreset() { let sel = document.getElementById('sin-preset'); let opt = sel.options[sel.selectedIndex]; if(opt.value) { baseSinCals = parseInt(opt.value) || 0; baseSinPro = parseInt(opt.getAttribute('data-p')) || 0; baseSinCar = parseInt(opt.getAttribute('data-c')) || 0; document.getElementById('sin-qty').value = "1"; updateSinValuesFromQty(); } }
function adjustSinQty(delta) { let input = document.getElementById('sin-qty'); let current = parseFloat(input.value) || 1; input.value = Math.max(0.5, current + delta); updateSinValuesFromQty(); }
function updateSinValuesFromQty() { let qty = parseFloat(document.getElementById('sin-qty').value) || 1; document.getElementById('sin-cals').value = Math.round(baseSinCals * qty); document.getElementById('sin-pro').value = Math.round(baseSinPro * qty); document.getElementById('sin-car').value = Math.round(baseSinCar * qty); }
function calculateSinFromMacros() { let p = parseInt(document.getElementById('sin-pro').value) || 0; let c = parseInt(document.getElementById('sin-car').value) || 0; let cals = (p * 4) + (c * 4); if (cals > 0) { document.getElementById('sin-cals').value = cals; document.getElementById('sin-preset').value = ""; } }
function generatePunishmentTask(cals) { let cardioMins = Math.min(20, 5 + Math.floor(cals / 100)); let extraReps = Math.min(5, Math.ceil(cals / 250)); let coreSets = Math.min(6, 2 + Math.floor(cals / 200)); const punishments = [ `🏃‍♂️ ${cardioMins} mins de Passadeira (Passo acelerado, inclinação máxima contínua)`, `🚴‍♂️ ${cardioMins} mins de Bicicleta em HIIT (Alterna: 1 min forte com 1 min suave)`, `💦 ${cardioMins} mins de Elítica (Cadência alta com resistência pesada)`, `🧱 Finisher de Core: ${coreSets} Séries de Prancha (Tempo limite) + 20 Abdominais`, `💪 +1 Série Extra (até à falha muscular absoluta) no último exercício do treino`, `🥵 +${extraReps} Repetições forçadas a adicionar no final de TODAS as séries`, `🔥 Adicionar Dropset na última série de TODOS os exercícios de hoje` ]; return punishments[Math.floor(Math.random() * punishments.length)]; }
function triggerPunishment() { const newCals = parseInt(document.getElementById('sin-cals').value); if (!newCals || newCals < 100) { showPulseToast('Mínimo 100kcal!', true); return; } let task = generatePunishmentTask(newCals); if (!activePunishment) { activePunishment = { cals: 0, tasks: [], lastUpdated: Date.now() }; } else if (!activePunishment.tasks) { activePunishment.tasks = [activePunishment.task || "Punição Antiga"]; } activePunishment.cals += newCals; activePunishment.tasks.push(task); activePunishment.lastUpdated = Date.now(); localStorage.setItem('gym_punishment', JSON.stringify(activePunishment)); closePunishmentModal(); renderPunishmentStatus(); showPulseToast('🔥 Castigo Acumulado com Sucesso!', true); let presetName = document.getElementById('sin-preset').options[document.getElementById('sin-preset').selectedIndex].text || "Pecado"; if(presetName === "Seleciona o Pecado...") presetName = "Pecado / Cheat Meal"; let qty = document.getElementById('sin-qty').value; dailyIntake.foods.push({ name: `⚠️ ${presetName} (${qty}x)`, cals: newCals, pro: parseInt(document.getElementById('sin-pro').value) || 0, car: parseInt(document.getElementById('sin-car').value) || 0 }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); }
function renderPunishmentStatus() { checkPunishmentExpiration(); const container = document.getElementById('punishment-status'); if (!container) return; if (!activePunishment || !activePunishment.tasks || activePunishment.tasks.length === 0) { container.innerHTML = ``; } else { let firstTask = activePunishment.tasks[0]; let remaining = activePunishment.tasks.length - 1; let extraText = remaining > 0 ? `<br><br><span style="font-size:11px; color:var(--muted);">⚠️ Ficam a faltar mais ${remaining} castigo(s) na fila.</span>` : ''; container.innerHTML = `<div style="background: rgba(239,68,68,0.1); border-left: 4px solid var(--danger); padding: 15px; border-radius: 12px;"><div style="color:var(--danger); font-weight:bold; margin-bottom:10px;">🚨 PENITÊNCIA PENDENTE (Fila: ${activePunishment.tasks.length})</div><div style="font-size:13px; color:white; line-height:1.4; margin-bottom:15px;">No teu <b>Próximo Treino</b>, tens de abater a primeira tarefa da dívida:<br><br>👉 <b>${firstTask}</b> ${extraText}</div><p style="font-size:11px; color:var(--muted); font-style:italic; margin-bottom: 15px;">Ao gravares o próximo treino a app vai perguntar se cumpriste. Prescreve em 5 dias.</p><button class="beast-action-btn dropset" style="width:100%; padding:12px; background:#1e293b; border: 1px solid var(--danger); color: var(--danger);" onclick="openConfessModal()">🩸 Ou confessar e limpar TUDO agora (Fraqueza)</button></div>`; } }
function openConfessModal() { document.getElementById('confess-modal').style.display = 'flex'; } function closeConfessModal() { document.getElementById('confess-modal').style.display = 'none'; }
function confirmConfess() { activePunishment = null; localStorage.removeItem('gym_punishment'); closeConfessModal(); renderPunishmentStatus(); showPulseToast('⛓️ Estás perdoado. Mais foco na próxima vez.'); }

// --- MODAIS GERAIS, FLEX E INSTAGRAM ---
let currentBarWeight = 20; 
function openPlateMath(targetWeightStr) {
    const targetWeight = parseFloat(targetWeightStr); if (!targetWeight || targetWeight <= currentBarWeight) { showPulseToast(`Insere um peso > ${currentBarWeight}kg para esta barra.`, true); return; } 
    document.getElementById('plate-target-weight').innerText = targetWeight;
    let weightPerSide = (targetWeight - currentBarWeight) / 2; 
    const plates = [ { weight: 25, color: '#ef4444', height: '100px' }, { weight: 20, color: '#3b82f6', height: '90px' }, { weight: 15, color: '#eab308', height: '80px' }, { weight: 10, color: '#22c55e', height: '70px' }, { weight: 5, color: '#f8fafc', height: '50px' }, { weight: 2.5, color: '#334155', height: '40px' }, { weight: 1.25, color: '#94a3b8', height: '30px' } ];
    let resultHTML = ''; let visualHTML = '';
    plates.forEach(plate => { let count = Math.floor(weightPerSide / plate.weight); if (count > 0) { resultHTML += `<div class="plate-row"><div class="plate-info"><div class="plate-color-box" style="background: ${plate.color};"></div>Disco de ${plate.weight}kg</div><span class="plate-qty">${count}x</span></div>`; for(let i = 0; i < count; i++) visualHTML += `<div style="width:12px; height:${plate.height}; background:${plate.color}; border-radius:3px; border:1px solid #000;"></div>`; weightPerSide = Math.round((weightPerSide - count * plate.weight) * 100) / 100; } });
    if (resultHTML === '') resultHTML = '<p style="color:var(--muted); text-align:center;">Não precisas de discos adicionais.</p>'; 
    let barSelectorHtml = `<div class="bar-type-selector"><button class="bar-type-btn ${currentBarWeight===20?'active':''}" onclick="currentBarWeight=20; openPlateMath(${targetWeight})">Olímpica (20kg)</button><button class="bar-type-btn ${currentBarWeight===10?'active':''}" onclick="currentBarWeight=10; openPlateMath(${targetWeight})">Pequena (10kg)</button><button class="bar-type-btn ${currentBarWeight===8?'active':''}" onclick="currentBarWeight=8; openPlateMath(${targetWeight})">EZ (8kg)</button></div>`;
    document.getElementById('plate-math-result').innerHTML = barSelectorHtml + resultHTML; document.getElementById('visual-plates').innerHTML = visualHTML; document.getElementById('plate-math-modal').style.display = 'flex';
}
function closePlateMath() { document.getElementById('plate-math-modal').style.display = 'none'; }
function openWarmup() { const targetW = parseFloat(document.getElementById('beast-weight').value || document.getElementById('beast-weight').placeholder); if (!targetW || targetW <= 20) { showPulseToast("Insere peso alvo > 20kg.", true); return; } document.getElementById('warmup-results').innerHTML = `<div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #94a3b8;"><strong style="color: var(--accent);">Set 1:</strong> Barra (20kg) x 15 reps</div><div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #38bdf8;"><strong style="color: var(--accent);">Set 2:</strong> ${Math.round(targetW * 0.5)}kg x 8 reps</div><div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #ef4444;"><strong style="color: var(--accent);">Set 3:</strong> ${Math.round(targetW * 0.75)}kg x 3 reps</div>`; document.getElementById('warmup-modal').style.display = 'flex'; }
function closeWarmup() { document.getElementById('warmup-modal').style.display = 'none'; }
function openModal(title, content) { document.getElementById('modal-title').innerText = title; document.getElementById('modal-content').innerText = content; currentModalExercise = title; document.getElementById('custom-video-input').value = ""; renderVideoFrame(title); document.getElementById('exercise-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('exercise-modal').style.display = 'none'; document.getElementById('modal-video-container').innerHTML = ''; }
function showExerciseTips(exerciseName) { openModal(exerciseName, "Foca-te na execução perfeita e numa descida controlada!"); }
function saveCustomVideo() { const inputLink = document.getElementById('custom-video-input').value.trim(); if (!inputLink) return; let embedLink = inputLink; if (inputLink.includes('watch?v=')) { embedLink = inputLink.replace('watch?v=', 'embed/'); if(embedLink.includes('&')) embedLink = embedLink.split('&')[0]; } else if (inputLink.includes('youtu.be/')) { embedLink = inputLink.replace('youtu.be/', 'youtube.com/embed/'); if(embedLink.includes('?')) embedLink = embedLink.split('?')[0]; } let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {}; videoLibrary[currentModalExercise] = embedLink; localStorage.setItem('gym_tracker_videos', JSON.stringify(videoLibrary)); renderVideoFrame(currentModalExercise); document.getElementById('custom-video-input').value = ""; document.getElementById('custom-video-input').placeholder = "Gravado!"; if ("vibrate" in navigator) navigator.vibrate(50); showPulseToast("🎥 Vídeo associado!"); }
function renderVideoFrame(exerciseName) { let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {}; const container = document.getElementById('modal-video-container'); if (videoLibrary[exerciseName]) container.innerHTML = `<iframe width="100%" height="100%" src="${videoLibrary[exerciseName]}" frameborder="0" allowfullscreen></iframe>`; else container.innerHTML = `<div style="text-align: center;"><span style="font-size: 30px; display: block; margin-bottom: 5px;">🎥</span><span style="color: var(--muted); font-size: 12px;">Sem vídeo. Cola um link abaixo!</span></div>`; }

function openModoFlex() { let totalVolume = 0; let totalSets = 0; const exercises = workoutData[currentDay]; if (exercises) { exercises.forEach((ex, exIdx) => { for (let setIdx = 1; setIdx <= 15; setIdx++) { let wInput = document.getElementById(`weight-${currentDay}-${exIdx}-${setIdx}`); let rInput = document.getElementById(`reps-${currentDay}-${exIdx}-${setIdx}`); let typeBtn = document.getElementById(`type-${currentDay}-${exIdx}-${setIdx}`); if (wInput && rInput && wInput.value && rInput.value && typeBtn && typeBtn.getAttribute('data-type') === 'work') { let w = parseFloat(wInput.value); let r = parseInt(rInput.value); if (!isNaN(w) && !isNaN(r)) { totalVolume += (w * r); totalSets++; } } } }); } document.getElementById('flex-card-name').innerText = userProfile.name ? '@' + userProfile.name.replace(/\s+/g, '').toLowerCase() : '@atleta_misterioso'; document.getElementById('flex-card-date').innerText = new Date().toLocaleDateString('pt-PT'); document.getElementById('flex-card-workout').innerText = currentDay.toUpperCase() + ' DAY'; document.getElementById('flex-card-volume').innerText = totalVolume.toLocaleString('en-US') + ' kg'; document.getElementById('flex-card-sets').innerText = totalSets + ' Sets'; document.getElementById('flex-modal').style.display = 'flex'; }
function closeModoFlex() { document.getElementById('flex-modal').style.display = 'none'; }
function copyFlexText() { navigator.clipboard.writeText(`🔥 ACABEI DE FRITAR O MEU TREINO!\n💪 Foco: ${document.getElementById('flex-card-workout').innerText}\n📈 Volume: ${document.getElementById('flex-card-volume').innerText}\n🥵 Séries: ${document.getElementById('flex-card-sets').innerText}\n🤖 Registado no Pulse`).then(() => showPulseToast('✅ Resumo copiado!')); }

function shareToInstagram() { if(typeof html2canvas === 'undefined') { showPulseToast("❌ Erro de imagem.", true); return; } const card = document.getElementById('flex-card'); html2canvas(card, { backgroundColor: '#0f172a', scale: 2 }).then(canvas => { canvas.toBlob(blob => { const file = new File([blob], 'pulse-workout.png', { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ title: 'Treino Pulse', text: '🔥', files: [file] }).catch(err => console.log(err)); } else { const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'pulse_story.png'; a.click(); showPulseToast('📥 Imagem guardada na galeria!'); } }); }); }

setTimeout(() => { updateGamificationLogic(); }, 1000);
