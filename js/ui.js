// ==========================================
// UI.JS: NAVEGAÇÃO, RENDERIZAÇÃO E MODAIS
// ==========================================

function goHome() {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById('view-home').classList.add('active');
    document.getElementById('fab-home').classList.remove('visible');
}

function navigateTo(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('fab-home').classList.add('visible');

    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); updateHeatmap(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); renderAchievements(); }
    if (id === 'view-dieta') { renderDieta(); renderPunishmentStatus(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
    if (id === 'view-treino') { renderWorkoutSlots(); backToWorkoutSlots(); }
}

// --- BIBLIOTECA DE TREINOS E SLOTS ---
function toggleDeleteMode() {
    deleteMode = !deleteMode;
    renderWorkoutSlots();
}

function renderWorkoutSlots() {
    const container = document.getElementById('workout-slots-container');
    if(!container) return;
    container.innerHTML = '';
    
    let slotCount = 0;
    const minSlots = 7; // Aumentado para ter sempre 7 espaços preenchidos/vazios

    const createSlotHTML = (type, index, icon, title, subtitle, color, isSaved = false) => {
        slotCount++;
        return `
        <div class="slot-container-flex">
            <div class="built-item" style="flex:1; border:1px solid ${color}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('${type}', ${index})`}">
                <div style="font-size:24px; margin-right:15px;">${icon}</div>
                <div class="built-item-info">
                    <span class="built-item-title" style="color:${color};">${title}</span>
                    <span style="font-size:11px; color:var(--muted);">${subtitle}</span>
                </div>
            </div>
            <button class="info-btn" onclick="showWorkoutInfo('${type}', ${index})">i</button>
        </div>`;
    };

    // Slot 1: Titã Clássico 
    container.innerHTML += createSlotHTML('TITAN', 0, '🔱', 'Divisão Titã (PPL)', 'Push, Pull e Legs (Padrão)', '#38bdf8');
    
    // Slot 2: Mobilidade 
    container.innerHTML += createSlotHTML('MOBILITY', 0, '🧘', 'Mobilidade Activa', 'SNC e Articulações', 'var(--success)');

    // Slots das Rotinas Salvas
    savedRoutines.forEach((item, index) => {
        let totalSets = item.routine.reduce((sum, ex) => sum + parseInt(ex.sets), 0);
        let actionBtn = deleteMode 
            ? `<button class="info-btn" style="color:var(--danger); border-color:var(--danger);" onclick="deleteSavedRoutine(${index})">X</button>`
            : `<button class="info-btn" onclick="showWorkoutInfo('SAVED', ${index})">i</button>`;

        container.innerHTML += `
        <div class="slot-container-flex">
            <div class="built-item" style="flex:1; border:1px solid ${deleteMode ? 'var(--danger)' : '#f8fafc'}; cursor:pointer;" onclick="${deleteMode ? '' : `openWorkoutSlot('SAVED', ${index})`}">
                <div style="font-size:24px; margin-right:15px;">💾</div>
                <div class="built-item-info">
                    <span class="built-item-title" style="color:${deleteMode ? 'var(--danger)' : '#f8fafc'};">${item.name}</span>
                    <span style="font-size:11px; color:var(--muted);">${item.routine.length} Exs | ${totalSets} Séries</span>
                </div>
            </div>
            ${actionBtn}
        </div>`;
        slotCount++;
    });

    // Injetar Slots Vazias até preencher o ecrã (mínimo de 7)
    while(slotCount < minSlots) {
        container.innerHTML += `
        <div class="slot-container-flex">
            <div class="built-item empty-slot" style="flex:1; border:1px dashed #334155; background:transparent;">
                <div class="built-item-info">
                    <span class="built-item-title" style="color:#64748b;">Slot Vazio</span>
                </div>
            </div>
            <div style="width:55px; border-radius:12px; border:1px dashed #334155; background:transparent;"></div>
        </div>`;
        slotCount++;
    }

    // Botões Inferiores (Criar / Eliminar sem emoji de lixo)
    container.innerHTML += `
    <div style="display: flex; gap: 10px; margin-top: 10px;">
        <div class="built-item" style="flex:2; border:1px dashed var(--accent); background:rgba(56,189,248,0.05); justify-content:center; cursor:pointer;" onclick="navigateTo('view-construtor')">
            <span style="color:var(--accent); font-weight:bold; font-size:14px;">+ Criar Novo</span>
        </div>
        <div class="built-item" style="flex:1; border:1px dashed var(--danger); background:${deleteMode ? 'var(--danger)' : 'rgba(239,68,68,0.05)'}; justify-content:center; cursor:pointer;" onclick="toggleDeleteMode()">
            <span style="color:${deleteMode ? 'white' : 'var(--danger)'}; font-weight:bold; font-size:14px;">${deleteMode ? 'Concluir' : 'Eliminar'}</span>
        </div>
    </div>`;
}

function showWorkoutInfo(type, index) {
    let title = '';
    let content = '';
    let totalSets = 0;
    
    if (type === 'TITAN') {
        title = 'Divisão Titã (PPL)';
        totalSets = 52; 
        content = `
            <div style="margin-bottom:10px;"><strong style="color:var(--accent);">PUSH:</strong><br>Peito, Ombros, Tríceps (Foco em empurrar cargas)</div>
            <div style="margin-bottom:10px;"><strong style="color:var(--accent);">PULL:</strong><br>Costas, Posterior de Ombro, Bíceps (Foco na tração)</div>
            <div style="margin-bottom:10px;"><strong style="color:var(--accent);">LEGS:</strong><br>Quads, Femorais, Gémeos (Fundação Titã)</div>
        `;
    } else if (type === 'MOBILITY') {
        title = 'Mobilidade Activa';
        totalSets = 10;
        content = `Esta rotina regenerativa é ideal para os dias de descanso ou para os períodos onde o Alerta do SNC está ativo. Sem cargas, focada na respiração e recuperação fluída das articulações e tendões.`;
    } else if (type === 'SAVED') {
        const routine = savedRoutines[index];
        title = routine.name;
        routine.routine.forEach(ex => totalSets += parseInt(ex.sets));
        content = `<ul style="padding-left:15px; margin:0;">`;
        routine.routine.forEach(ex => {
            content += `<li style="margin-bottom:5px;"><b>${ex.sets}x</b> ${ex.name}</li>`;
        });
        content += `</ul>`;
    }
    
    let estTime = totalSets * 3; 
    let timeHtml = `<p style="color:var(--success); font-weight:bold; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">⏱️ Tempo Estimado: ~${estTime} min</p>`;
    
    document.getElementById('info-modal-title').innerText = title;
    document.getElementById('info-modal-content').innerHTML = timeHtml + content;
    document.getElementById('workout-info-modal').style.display = 'flex';
}

function closeWorkoutInfo() {
    document.getElementById('workout-info-modal').style.display = 'none';
}

function openWorkoutSlot(type, index = 0) {
    if (deleteMode) return; 
    document.getElementById('treino-slots-view').style.display = 'none';
    document.getElementById('treino-active-view').style.display = 'block';
    
    const tabsContainer = document.getElementById('active-workout-tabs');
    const beastBtn = document.getElementById('main-beast-btn');
    
    if (type === 'TITAN') {
        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = `
            <button class="tab-btn active" onclick="switchWorkout(event,'PUSH')">PUSH</button>
            <button class="tab-btn" onclick="switchWorkout(event,'PULL')">PULL</button>
            <button class="tab-btn" onclick="switchWorkout(event,'LEGS')">LEGS</button>
        `;
        currentDay = 'PUSH';
    } else if (type === 'MOBILITY') {
        tabsContainer.style.display = 'none';
        currentDay = 'MOBILITY';
    } else if (type === 'SAVED') {
        tabsContainer.style.display = 'none';
        workoutData.CUSTOM = JSON.parse(JSON.stringify(savedRoutines[index].routine));
        currentDay = 'CUSTOM';
    }
    
    if (beastBtn) beastBtn.style.display = (currentDay === 'MOBILITY') ? 'none' : 'block';
    renderWorkout();
}

function backToWorkoutSlots() {
    document.getElementById('treino-slots-view').style.display = 'block';
    document.getElementById('treino-active-view').style.display = 'none';
}

function switchWorkout(event, day) {
    currentDay = day;
    document.querySelectorAll('#active-workout-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const beastBtn = document.getElementById('main-beast-btn');
    if (beastBtn) beastBtn.style.display = (day === 'MOBILITY') ? 'none' : 'block';
    
    renderWorkout();
}

function renderWorkout() {
    const container = document.getElementById('workout-container');
    if(!container) return;
    container.innerHTML = '';
    const exercises = workoutData[currentDay];

    if (!exercises || exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--muted); margin-top:20px;">Nenhum treino planeado.</p>';
        return;
    }

    if (currentDay === 'MOBILITY') {
        container.innerHTML = '<p style="color:var(--accent); font-size:13px; text-align:center; margin-bottom:15px;">Rotina de recuperação para baixar o stress do SNC e nutrir as articulações.</p>';
        exercises.forEach((ex, exIdx) => {
            container.innerHTML += `
            <div class="exercise-card" style="border-left: 4px solid var(--accent);">
                <div class="exercise-name">${ex.name}</div>
                <div style="font-size: 13px; color: var(--muted); margin-bottom: 10px;">Execução: ${ex.sets} séries de ${ex.reps}</div>
                <button class="beast-action-btn superset" style="width:100%; padding:10px;" onclick="this.innerText='✔ Concluído'; this.style.background='var(--success)'">Marcar Feito</button>
            </div>`;
        });
        return;
    }

    exercises.forEach((ex, exIdx) => {
        let html = `
        <div class="exercise-card">
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-buttons">
                <button class="exercise-tip-btn" onclick="showExerciseTips('${ex.name}')">💡 Dica</button>
                <button class="exercise-video-btn" onclick="openModal('${ex.name}', 'Consulta a execução.')">🎥 Vídeo</button>
            </div>`;

        for (let i = 1; i <= ex.sets; i++) {
            html += `
            <div class="set-row" id="row-${currentDay}-${exIdx}-${i}">
                <span style="font-weight:bold; color:var(--muted); width:20px;">${i}</span>
                <div class="input-group"><label>KG</label><input type="number" id="weight-${currentDay}-${exIdx}-${i}"></div>
                <div class="input-group"><label>Reps</label><input type="number" id="reps-${currentDay}-${exIdx}-${i}"></div>
                <div class="input-group"><label>RIR</label><select id="rir-${currentDay}-${exIdx}-${i}"><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option><option value="3">3+</option></select></div>
                <button class="check-btn" onclick="this.parentElement.classList.toggle('done')">✔</button>
            </div>`;
        }
        html += `</div>`;
        container.innerHTML += html;
    });
}

function saveCurrentWorkout() {
    if(currentDay === 'MOBILITY') {
        alert('🧘‍♂️ Rotina de Mobilidade concluída! O teu SNC agradece.');
        return;
    }

    if (activePunishment) {
        alert('⛔ TENS UMA TAXA DO PECADO PENDENTE! Vai à aba Dieta cumprir a tua penitência antes de gravar novos treinos de XP.');
        return;
    }

    const exercises = workoutData[currentDay];
    let workoutRecord = { date: new Date().toLocaleDateString('pt-PT'), day: currentDay, exercises: {} };

    exercises.forEach((ex, exIdx) => {
        let setsDetails = [];
        for (let i = 1; i <= (ex.sets + 10); i++) { 
            let w = document.getElementById(`weight-${currentDay}-${exIdx}-${i}`);
            let r = document.getElementById(`reps-${currentDay}-${exIdx}-${i}`);
            let rir = document.getElementById(`rir-${currentDay}-${exIdx}-${i}`);
            
            if (w && r && w.value && r.value) {
                setsDetails.push({ weight: parseFloat(w.value), reps: parseInt(r.value), rir: rir.value });
            }
        }
        if (setsDetails.length > 0) workoutRecord.exercises[ex.name] = setsDetails;
    });

    history.push(workoutRecord);
    localStorage.setItem('gym_tracker_history', JSON.stringify(history));
    alert('✅ Treino guardado com sucesso!');
    
    updateHeatmap();
    calculateRPGStats();
    if(typeof checkAchievements === 'function') checkAchievements();
    backToWorkoutSlots();
}

// --- CONSTRUTOR 2.0 ---
function setFatigue(level) { builderState.fatigue = level; document.querySelectorAll('.fatigue-btn').forEach(btn => btn.classList.remove('active')); document.getElementById(`btn-fatigue-${level}`).classList.add('active'); }
function setBuilderMode(mode) {
    builderState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');
    
    document.getElementById('auto-focus-panel').style.display = 'none';
    document.getElementById('manual-library-panel').style.display = 'none';
    document.getElementById('directory-panel').style.display = 'none';

    if (mode === 'auto') document.getElementById('auto-focus-panel').style.display = 'block';
    else if (mode === 'manual') { document.getElementById('manual-library-panel').style.display = 'block'; renderLibrary(); }
    else if (mode === 'directory') { document.getElementById('directory-panel').style.display = 'block'; renderDirectory(); }
}

function renderLibrary() {
    const filterMuscle = document.getElementById('filter-muscle').value;
    const filterTier = document.getElementById('filter-tier').value;
    const list = document.getElementById('library-list'); list.innerHTML = '';
    let filtered = exerciseLibrary;
    if (filterMuscle !== 'ALL') filtered = filtered.filter(ex => ex.muscle === filterMuscle);
    if (filterTier !== 'ALL') filtered = filtered.filter(ex => ex.tier === filterTier);
    filtered.forEach(ex => {
        list.innerHTML += `<div class="lib-item"><div class="lib-item-info"><span class="lib-item-title">${ex.name}</span><div class="lib-item-badges"><span class="badge muscle">${ex.muscle}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}-Tier</span></div></div><button class="add-btn" onclick="addExerciseToBuilder('${ex.name}', ${ex.defaultSets})">+</button></div>`;
    });
}

function renderDirectory() {
    const container = document.getElementById('directory-list');
    container.innerHTML = '';
    const groups = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];
    
    groups.forEach(muscle => {
        let pool = exerciseLibrary.filter(ex => ex.muscle === muscle);
        if (pool.length > 0) {
            let html = `<div class="dir-group"><h4>${muscle}</h4>`;
            pool.forEach(ex => { html += `<div class="dir-item"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}</span></div>`; });
            html += `</div>`; container.innerHTML += html;
        }
    });
}

function generateWorkout() {
    const focus = document.getElementById('auto-focus-select').value;
    const fatigue = builderState.fatigue; 
    if(typeof generateWorkoutLogic === 'function') {
        builderState.routine = generateWorkoutLogic(focus, fatigue, exerciseLibrary);
        updateBuilderUI();
        alert(`✨ Treino gerado: ${builderState.routine.length} exercícios adaptados!`);
    } else {
        alert("Erro: A lógica de geração não foi encontrada.");
    }
}

function addExerciseToBuilder(name, sets) { builderState.routine.push({ name, sets }); updateBuilderUI(); }
function removeExerciseFromBuilder(index) { builderState.routine.splice(index, 1); updateBuilderUI(); }
function updateBuilderSets(index, value) { builderState.routine[index].sets = parseInt(value) || 1; updateBuilderUI(false); }

function updateBuilderUI(rebuildList = true) {
    const list = document.getElementById('builder-routine-list');
    const badge = document.getElementById('workout-volume-badge');
    const actionBtns = document.getElementById('builder-action-buttons');
    let totalSets = 0; if (rebuildList) list.innerHTML = '';
    
    if (builderState.routine.length === 0) {
        if (rebuildList) list.innerHTML = `<p class="text-center" style="color: var(--muted); padding: 20px 0;">Nenhum exercício selecionado.</p>`;
        badge.innerText = `0 Séries`; actionBtns.style.display = 'none'; return;
    }
    
    builderState.routine.forEach((item, idx) => {
        totalSets += parseInt(item.sets);
        if (rebuildList) {
            list.innerHTML += `<div class="built-item"><div class="built-item-info"><span class="built-item-title">${idx + 1}. ${item.name}</span></div><div class="built-item-controls"><span style="font-size: 10px; color: var(--muted);">SÉRIES</span><input type="number" class="set-input" value="${item.sets}" onchange="updateBuilderSets(${idx}, this.value)"><button class="remove-btn" onclick="removeExerciseFromBuilder(${idx})">✖</button></div></div>`;
        }
    });
    
    badge.innerText = `${totalSets} Séries`; badge.style.color = totalSets > 24 ? 'var(--danger)' : 'var(--accent)';
    actionBtns.style.display = 'flex';
}

function applyBuiltWorkout() {
    if (builderState.routine.length === 0) return;
    workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine));
    navigateTo('view-treino');
    document.getElementById('treino-slots-view').style.display = 'none';
    document.getElementById('treino-active-view').style.display = 'block';
    document.getElementById('active-workout-tabs').style.display = 'none';
    currentDay = 'CUSTOM';
    const beastBtn = document.getElementById('main-beast-btn'); if (beastBtn) beastBtn.style.display = 'block';
    renderWorkout();
}

function saveCurrentRoutine() {
    if (builderState.routine.length === 0) return;
    const routineName = prompt("Nome da rotina (ex: Peito Fritado):");
    if (!routineName) return;
    savedRoutines.push({ name: routineName, routine: JSON.parse(JSON.stringify(builderState.routine)) });
    localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); alert('✅ Guardada com sucesso na tua Biblioteca!');
    builderState.routine = []; updateBuilderUI(); navigateTo('view-treino');
}

function deleteSavedRoutine(index) {
    if (confirm("Apagar permanentemente este treino?")) {
        savedRoutines.splice(index, 1);
        localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines));
        renderWorkoutSlots();
    }
}

// --- MAPA DE CALOR E GRÁFICOS ---
function updateHeatmap() {
    const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
    let volume = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };

    history.forEach(log => {
        const parts = log.date.split('/');
        if(parts.length === 3) {
            const logDate = new Date(parts[2], parts[1]-1, parts[0]);
            if (logDate >= sevenDaysAgo && logDate <= now) {
                if(log.exercises) Object.entries(log.exercises).forEach(([exName, sets]) => { let muscle = getMuscleForExercise(exName); if (volume[muscle] !== undefined) volume[muscle] += sets.length; });
            }
        }
    });

    const getColor = (sets) => { if (sets === 0) return '#334155'; if (sets <= 6) return '#eab308'; if (sets <= 12) return '#f97316'; return '#ef4444'; };
    const c = { peito: getColor(volume['Peito']), costas: getColor(volume['Costas']), pernas: getColor(volume['Pernas']), ombros: getColor(volume['Ombros']), bracos: getColor(volume['Braços']), core: getColor(volume['Core']) };

    const hmPeito = document.getElementById('hm-peito');
    if(hmPeito) {
        hmPeito.setAttribute('fill', c.peito); document.getElementById('hm-ombros-l').setAttribute('fill', c.ombros); document.getElementById('hm-ombros-r').setAttribute('fill', c.ombros);
        document.getElementById('hm-biceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-biceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-quads-l').setAttribute('fill', c.pernas); document.getElementById('hm-quads-r').setAttribute('fill', c.pernas); document.getElementById('hm-core').setAttribute('fill', c.core);
        document.getElementById('hm-costas').setAttribute('fill', c.costas); document.getElementById('hm-triceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-triceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-femorais-l').setAttribute('fill', c.pernas); document.getElementById('hm-femorais-r').setAttribute('fill', c.pernas);
        document.getElementById('hm-gemeos-l').setAttribute('fill', c.pernas); document.getElementById('hm-gemeos-r').setAttribute('fill', c.pernas);
    }
}

function setupChartSelect() {
    const select = document.getElementById('exercise-select'); if (!select) return;
    select.innerHTML = '<option value="">Escolhe um exercício...</option>';
    const uniqueExercises = new Set();
    history.forEach(log => { if(log.exercises) Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); });
    uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value; if (!exercise) return;
    const labels = []; const data = []; const reps = [];
    history.forEach(log => {
        if (log.exercises && log.exercises[exercise]) {
            labels.push(log.date);
            data.push(log.exercises[exercise][0].weight || log.exercises[exercise][0].w);
            reps.push(log.exercises[exercise][0].reps || log.exercises[exercise][0].r);
        }
    });

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('progressChart').getContext('2d');
    chartInstance = new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Carga (kg)', data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.3 }] } });

    const maxWeight = Math.max(...data, 0); const maxReps = Math.max(...reps, 0); let totalVolume = 0;
    history.forEach(log => { if (log.exercises && log.exercises[exercise]) { log.exercises[exercise].forEach(set => totalVolume += (set.weight || set.w) * (set.reps || set.r)); } });

    document.getElementById('coach-message').innerText = data.length >= 3 ? (data[data.length - 1] > data[data.length - 2] ? '📈 Excelente progressão recente.' : '⚠️ Sem progressão recente. Ajusta volume.') : '📊 Poucos dados para análise.';
    update1RMPrediction(exercise, maxWeight, maxReps, totalVolume);
}

function update1RMPrediction(exerciseName, maxWeight, maxReps, totalVolume) {
    const container = document.getElementById('onerm-container'); if (!exerciseName || !container) return; let best1RM = calculate1RM(maxWeight, maxReps);
    if (best1RM > 0) {
        container.style.display = 'block'; document.getElementById('onerm-value').innerText = Math.round(best1RM) + ' kg';
        let target1RM = Math.round(best1RM * 1.10); let daysToTarget = Math.round((target1RM - best1RM) / (best1RM * 0.0005));
        let targetDate = new Date(); targetDate.setDate(targetDate.getDate() + daysToTarget);
        document.getElementById('onerm-prediction').innerHTML = `🔮 <b>Previsão:</b> Conseguirás <b>${target1RM}kg</b> até <b>${targetDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</b>.`;
    } else container.style.display = 'none';
    document.getElementById('pr-display').innerHTML = `
        <h3>🏆 PRs</h3><div id="onerm-container" style="display: none; margin-top: 15px; padding: 15px; background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.3); border-radius: 12px;"><div style="font-size: 11px; font-weight: bold; color: #d8b4fe;">1RM ESTIMADO</div><div id="onerm-value" style="font-size: 32px; font-weight: 900; color: #a855f7;">${Math.round(best1RM)} kg</div><div id="onerm-prediction" style="font-size: 13px; color: #cbd5e1; margin-top: 10px;"></div></div>
        <p style="margin-top:10px;"><strong>Maior carga:</strong> ${maxWeight} kg</p><p><strong>Maior reps:</strong> ${maxReps}</p><p><strong>Volume acumulado:</strong> ${Math.round(totalVolume)} kg</p>`;
}

function updateGlobalStats() {
    let totalWorkouts = history.length; let totalSets = 0, totalVolume = 0; let exercisesDone = {};
    history.forEach(log => {
        if(log.exercises) {
            Object.entries(log.exercises).forEach(([exercise, sets]) => {
                if (!exercisesDone[exercise]) exercisesDone[exercise] = 0; exercisesDone[exercise]++;
                totalSets += sets.length; sets.forEach(set => totalVolume += (set.weight||set.w||0) * (set.reps||set.r||0));
            });
        }
    });
    let fav = Object.keys(exercisesDone).length > 0 ? Object.keys(exercisesDone).reduce((a, b) => exercisesDone[a] > exercisesDone[b] ? a : b) : 'Nenhum';
    document.getElementById('global-stats').innerHTML = `<h3>📊 Estatísticas Globais</h3><br><p><strong>Total de treinos:</strong> ${totalWorkouts}</p><p><strong>Total de séries:</strong> ${totalSets}</p><p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p><p><strong>Exercício favorito:</strong> ${fav}</p>`;
    calculateRPGStats();
}

function calculateRPGStats() {
    const muscleXP = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(session => {
        if(session.exercises) {
            Object.entries(session.exercises).forEach(([exName, setsDetails]) => {
                let volume = 0;
                setsDetails.forEach(set => { let w = parseFloat(set.weight || set.w); let r = parseInt(set.reps || set.r); if(w > 0 && r > 0) volume += (w * r); });
                let muscle = getMuscleForExercise(exName) || categorizeMuscleByNameRPG(exName);
                if (muscleXP[muscle] !== undefined) muscleXP[muscle] += volume;
                else if (muscleXP['Braços'] !== undefined && (muscle === 'Bíceps' || muscle === 'Tríceps')) muscleXP['Braços'] += volume;
            });
        }
    });
    renderRPGStats(muscleXP);
}

function renderRPGStats(muscleXP) {
    const container = document.getElementById('rpg-stats-container'); if(!container) return; container.innerHTML = '';
    const colors = { 'Peito': '#38bdf8', 'Costas': '#22c55e', 'Pernas': '#f59e0b', 'Ombros': '#ef4444', 'Braços': '#a855f7', 'Core': '#f43f5e' };
    for (let muscle in muscleXP) {
        let stats = getLevelAndProgress(muscleXP[muscle]); let color = colors[muscle] || '#94a3b8';
        container.innerHTML += `<div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);"><div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span style="font-weight: bold; color: white; font-size: 14px;">${muscle}</span><span style="color: ${color}; font-weight: bold; font-size: 14px; text-shadow: 0 0 8px ${color}60;">Lvl ${stats.level}</span></div><div class="progress-bar" style="height: 8px; background: #1e293b; margin-bottom: 5px; border-radius: 4px; overflow: hidden;"><div style="height: 100%; width: ${stats.progress}%; background: ${color}; box-shadow: 0 0 10px ${color}80; transition: width 1s ease-out;"></div></div><div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--muted);"><span>${Math.round(stats.xpIntoLevel)} XP</span><span>${Math.round(stats.xpRequired)} XP p/ Lvl ${stats.level + 1}</span></div></div>`;
    }
}

// --- CALENDÁRIO COM DETALHES ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid'); if (!grid) return; grid.innerHTML = '';
    const year = currentCalendarDate.getFullYear(); const month = currentCalendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay(); startDay = startDay === 0 ? 6 : startDay - 1;
    document.getElementById('calendar-title').innerText = `${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][month]} ${year}`;
    
    for (let i = 0; i < startDay; i++) grid.innerHTML += '<div class="day-box empty"></div>';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const trainedSessions = history.filter(h => h.date === dateString);
        let dotHtml = '';
        if (trainedSessions.length > 0) {
            dotHtml = `<div style="width:6px; height:6px; background:var(--accent); border-radius:50%; margin-top:4px;"></div>`;
        }
        grid.innerHTML += `<div class="day-box ${trainedSessions.length > 0 ? 'trained' : ''}" style="flex-direction:column;" onclick="showHistoryDetails('${dateString}')">${day}${dotHtml}</div>`;
    }
    updateWeeklyGoal(); updateMonthlyGoal();
}

function changeMonth(direction) { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction); renderCalendar(); }

function showHistoryDetails(dateString) {
    const sessions = history.filter(h => h.date === dateString);
    if (sessions.length === 0) {
        if(confirm("Registar treino vazio neste dia?")) { history.push({ date: dateString, day: 'MANUAL', exercises: {} }); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); renderCalendar(); updateGlobalStats(); updateHeatmap(); }
        return;
    }
    let html = '';
    sessions.forEach(session => {
        let vol = 0; let exs = 0;
        if(session.exercises) Object.entries(session.exercises).forEach(([ex, sets]) => { exs++; sets.forEach(s => vol += (s.weight||s.w||0) * (s.reps||s.r||0)); });
        html += `<div style="background:#0f172a; padding:15px; border-radius:12px; margin-bottom:10px; border-left:4px solid var(--accent); text-align:left;"><h4 style="color:white; margin-bottom:5px;">${session.day || 'Treino'}</h4><p style="color:var(--muted); font-size:12px;">Exercícios: ${exs} | Volume: ${Math.round(vol)}kg</p></div>`;
    });
    html += `<button onclick="deleteDayHistory('${dateString}')" style="background:transparent; border:1px solid var(--danger); color:var(--danger); padding:10px; border-radius:8px; width:100%; margin-top:10px; cursor:pointer;">Apagar Registo</button>`;
    document.getElementById('history-details-content').innerHTML = html; document.getElementById('history-modal-date').innerText = dateString; document.getElementById('history-details-modal').style.display = 'flex';
}

function deleteDayHistory(dateString) { if(confirm("APAGAR dados deste dia?")) { history = history.filter(h => h.date !== dateString); localStorage.setItem('gym_tracker_history', JSON.stringify(history)); closeHistoryModal(); renderCalendar(); updateGlobalStats(); updateHeatmap(); } }
function closeHistoryModal() { document.getElementById('history-details-modal').style.display='none'; }
function updateWeeklyGoal() { let weekly = 0; const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7); history.forEach(log => { let parts = log.date.split('/'); if(parts.length===3){ let d = new Date(parts[2], parts[1]-1, parts[0]); if (d >= sevenDaysAgo && d <= now) weekly++; } }); document.getElementById('weekly-count').innerText = weekly; document.getElementById('weekly-progress').style.width = `${Math.min(weekly, 6) / 6 * 100}%`; }
function updateMonthlyGoal() { let monthly = 0; const year = currentCalendarDate.getFullYear(); const month = currentCalendarDate.getMonth(); history.forEach(log => { let parts = log.date.split('/'); if(parts.length===3 && parseInt(parts[2]) === year && parseInt(parts[1])-1 === month) monthly++; }); document.getElementById('monthly-count').innerText = monthly; document.getElementById('monthly-progress').style.width = `${Math.min(monthly, 24) / 24 * 100}%`; }

// --- PERFIL E SPOTIFY ---
function renderProfile() {
    document.getElementById('prof-name').value = userProfile.name || ''; document.getElementById('prof-age').value = userProfile.age || 25; document.getElementById('prof-gender').value = userProfile.gender || 'male'; document.getElementById('prof-height').value = userProfile.height || 170; document.getElementById('prof-weight').value = userProfile.weight || 70; document.getElementById('prof-activity').value = userProfile.activity || '1.55'; document.getElementById('prof-goal').value = userProfile.goal || 'maintain';
    if (userProfile.measurements) { document.getElementById('meas-arm').value = userProfile.measurements.arm || ''; document.getElementById('meas-chest').value = userProfile.measurements.chest || ''; document.getElementById('meas-waist').value = userProfile.measurements.waist || ''; document.getElementById('meas-leg').value = userProfile.measurements.leg || ''; }
    if (document.getElementById('prof-spotify')) document.getElementById('prof-spotify').value = userProfile.spotify || '';
    updateProfileData();
}

function updateSpotifyPlayer() {
    const iframe = document.getElementById('spotify-iframe'); if(!iframe) return;
    let link = userProfile.spotify || ""; let embedUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?theme=0"; 
    if(link.includes('spotify.com')) { if(link.includes('embed')) embedUrl = link; else { const match = link.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/); if (match) embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`; } }
    if(iframe.src !== embedUrl) iframe.src = embedUrl;
}

function updateProfileData() {
    userProfile.name = document.getElementById('prof-name').value; userProfile.age = parseInt(document.getElementById('prof-age').value) || 25; userProfile.gender = document.getElementById('prof-gender').value; userProfile.height = parseInt(document.getElementById('prof-height').value) || 170; userProfile.weight = parseInt(document.getElementById('prof-weight').value) || 70; userProfile.activity = parseFloat(document.getElementById('prof-activity').value) || 1.55; userProfile.goal = document.getElementById('prof-goal').value;
    if (document.getElementById('prof-spotify')) userProfile.spotify = document.getElementById('prof-spotify').value;
    if (!userProfile.measurements) userProfile.measurements = {}; userProfile.measurements.arm = document.getElementById('meas-arm').value; userProfile.measurements.chest = document.getElementById('meas-chest').value; userProfile.measurements.waist = document.getElementById('meas-waist').value; userProfile.measurements.leg = document.getElementById('meas-leg').value;
    localStorage.setItem('gym_profile', JSON.stringify(userProfile)); document.getElementById('height-val').innerText = userProfile.height; document.getElementById('weight-val').innerText = userProfile.weight;
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2); document.getElementById('calc-bmi').innerText = bmi.toFixed(1);
    let bmiStatus = "Normal"; let bmiColor = "var(--success)"; if (bmi < 18.5) { bmiStatus = "Baixo Peso"; bmiColor = "var(--accent)"; } else if (bmi >= 25 && bmi < 30) { bmiStatus = "Excesso de Peso"; bmiColor = "#f59e0b"; } else if (bmi >= 30) { bmiStatus = "Obesidade"; bmiColor = "var(--danger)"; }
    document.getElementById('calc-bmi-status').innerText = bmiStatus; document.getElementById('calc-bmi-status').style.color = bmiColor;
    let tdee = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age); tdee += (userProfile.gender === 'male') ? 5 : -161; tdee *= userProfile.activity; if (userProfile.goal === 'cut') tdee -= 500; if (userProfile.goal === 'bulk') tdee += 300; document.getElementById('calc-cals').innerText = Math.round(tdee);
    const avatar = document.getElementById('dynamic-avatar'); let scaleY = 1 + ((userProfile.height - 170) / 170) * 0.7; let scaleX = 1 + ((bmi - 24) / 24) * 0.6; if(avatar) avatar.style.transform = `scale(${Math.max(0.6, Math.min(scaleX, 1.8))}, ${Math.max(0.7, Math.min(scaleY, 1.4))})`;
    renderDieta(); calculateBodyFat(); updateSpotifyPlayer(); setTimeout(updateWearableData, 200);
}

function renderAchievements() {
    const container = document.getElementById('achievements-list'); if(!container) return; container.innerHTML = ''; if(typeof allAchievements === 'undefined') return;
    allAchievements.forEach(ach => { const isUnlocked = achievementsUnlocked.includes(ach.id); const filter = isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)'; const color = isUnlocked ? 'var(--accent)' : 'var(--muted)'; container.innerHTML += `<div style="display:flex; align-items:center; gap:15px; padding:12px; background:var(--bg-color); border-radius:12px; margin-bottom:10px; filter:${filter}; transition:0.3s;"><div style="font-size:30px; background:#1e293b; padding:10px; border-radius:50%; border:2px solid ${color};">${ach.icon}</div><div><h4 style="color:white; margin:0; font-size:15px;">${ach.title}</h4><p style="color:var(--muted); font-size:12px; margin-top:3px;">${ach.desc}</p></div></div>`; });
}

// --- DIETA, RECEITAS E PECADO ---
function renderDieta() {
    const calsElement = document.getElementById('calc-cals'); if(!calsElement) return;
    let tdee = parseInt(calsElement.innerText) || 0; let weight = userProfile.weight; let goal = userProfile.goal; if (tdee === 0) return;
    let proteinTarget = Math.round(weight * 2.2); let fatTarget = Math.round(weight * (goal === 'cut' ? 0.8 : 1.0)); let carbsTarget = Math.max(0, Math.round((tdee - (proteinTarget * 4 + fatTarget * 9)) / 4));
    document.getElementById('macro-pro').innerText = proteinTarget + 'g'; document.getElementById('macro-car').innerText = carbsTarget + 'g'; document.getElementById('macro-fat').innerText = fatTarget + 'g';
    let waterMl = (weight * 35); if(userProfile.activity >= 1.55) waterMl += 500; document.getElementById('water-goal').innerText = (waterMl / 1000).toFixed(1) + ' L';

    const foodList = document.getElementById('daily-food-list'); const barsContainer = document.getElementById('daily-progress-bars');
    if(foodList && barsContainer) {
        foodList.innerHTML = ''; let totalCals = 0; let totalPro = 0;
        dailyIntake.foods.forEach((food, index) => {
            totalCals += food.cals; totalPro += food.pro;
            foodList.innerHTML += `<div style="background:#1e293b; padding:10px 15px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid var(--accent);"><div><div style="font-weight:bold; font-size:14px; color:white;">${food.name}</div><div style="font-size:12px; color:var(--success);">${food.cals} Kcal | ${food.pro}g Pro</div></div><button onclick="deleteDailyFood(${index})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:18px;">✖</button></div>`;
        });
        if (dailyIntake.foods.length === 0) foodList.innerHTML = '<p style="text-align:center; color:var(--muted); font-size:12px;">Ainda não comeste nada hoje.</p>';
        let calsPercent = Math.min((totalCals / tdee) * 100, 100); let proPercent = Math.min((totalPro / proteinTarget) * 100, 100); let calsColor = totalCals > tdee ? 'var(--danger)' : 'var(--accent)';
        barsContainer.innerHTML = `<div style="margin-bottom:10px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span>🔥 Calorias</span><span style="color:${calsColor}; font-weight:bold;">${totalCals} / ${tdee} Kcal</span></div><div class="progress-bar" style="height:8px; background:#1e293b;"><div style="height:100%; width:${calsPercent}%; background:${calsColor};"></div></div></div><div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span>🥩 Proteína</span><span style="color:var(--success); font-weight:bold;">${totalPro} / ${proteinTarget} g</span></div><div class="progress-bar" style="height:8px; background:#1e293b;"><div style="height:100%; width:${proPercent}%; background:var(--success);"></div></div></div>`;
    }
}
function addDailyFood() {
    const name = document.getElementById('food-name').value; const cals = parseInt(document.getElementById('food-cals').value) || 0; const pro = parseInt(document.getElementById('food-pro').value) || 0;
    if(!name || cals === 0) { alert('Insere o nome e as calorias!'); return; }
    dailyIntake.foods.push({ name, cals, pro }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake));
    document.getElementById('food-name').value = ''; document.getElementById('food-cals').value = ''; document.getElementById('food-pro').value = ''; renderDieta();
}
function deleteDailyFood(index) { dailyIntake.foods.splice(index, 1); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta(); }

function updateWearableData() {
    const steps = parseInt(document.getElementById('wearable-steps').value) || 0; const workoutCals = parseInt(document.getElementById('wearable-cals').value) || 0; const extraCals = (steps * 0.04) + workoutCals;
    let weight = parseFloat(userProfile.weight) || 70; let height = parseFloat(userProfile.height) || 170; let age = parseInt(userProfile.age) || 25; let gender = userProfile.gender || 'male';
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161); let dynamicTDEE = (bmr * 1.2) + extraCals; const goal = userProfile.goal || 'maintain'; if (goal === 'cut') dynamicTDEE -= 500; if (goal === 'bulk') dynamicTDEE += 300;
    const tdeeDisplay = document.getElementById('dynamic-tdee'); if (tdeeDisplay) tdeeDisplay.innerText = Math.round(dynamicTDEE) + ' Kcal';
    let pro = weight * 2.2; let fat = weight * 1.0; let carb = Math.max(0, (dynamicTDEE - (pro * 4) - (fat * 9)) / 4);
    const proDisplay = document.getElementById('macro-pro'); if (proDisplay) proDisplay.innerText = Math.round(pro) + 'g';
    const fatDisplay = document.getElementById('macro-fat'); if (fatDisplay) fatDisplay.innerText = Math.round(fat) + 'g';
    const carDisplay = document.getElementById('macro-car'); if (carDisplay) carDisplay.innerText = Math.round(carb) + 'g';
    let baseWater = weight * 0.035; let extraWater = (workoutCals > 0) ? 0.8 : 0; let waterGoalDisplay = document.getElementById('water-goal'); if (waterGoalDisplay) waterGoalDisplay.innerText = (baseWater + extraWater).toFixed(1) + ' L';
}

function calculateBodyFat() {
    const waist = parseFloat(document.getElementById('meas-waist').value); const height = userProfile.height; const gender = userProfile.gender; const bfDisplay = document.getElementById('calc-bf');
    if (waist > 0 && height > 0 && typeof calculateBodyFatFormula === 'function') {
        let rfm = calculateBodyFatFormula(waist, height, gender); bfDisplay.innerText = rfm.toFixed(1) + '%';
        if (rfm < 12 && gender === 'male' || rfm < 20 && gender === 'female') bfDisplay.style.color = '#38bdf8'; else if (rfm < 20 && gender === 'male' || rfm < 28 && gender === 'female') bfDisplay.style.color = 'var(--success)'; else if (rfm < 25 && gender === 'male' || rfm < 33 && gender === 'female') bfDisplay.style.color = '#f59e0b'; else bfDisplay.style.color = 'var(--danger)';
    } else { bfDisplay.innerText = '--%'; bfDisplay.style.color = 'var(--accent)'; }
}

function openRecipesModal() {
    let html = ''; if(typeof recipesDB !== 'undefined'){ recipesDB.forEach(r => { html += `<div style="background:#0f172a; padding:15px; border-radius:12px; margin-bottom:12px; text-align:left; border-left:4px solid var(--accent);"><div style="display:flex; justify-content:space-between;"><h4 style="color:white; margin:0;">${r.name}</h4><span class="badge" style="background:#334155; color:var(--muted);">${r.type}</span></div><p style="color:var(--success); font-weight:bold; font-size:12px; margin:5px 0;">${r.cals} Kcal | ${r.pro}g Pro</p><p style="color:var(--muted); font-size:12px; line-height:1.4;">${r.desc}</p></div>`; }); }
    document.getElementById('recipes-list').innerHTML = html; document.getElementById('recipes-modal').style.display = 'flex';
}
function closeRecipesModal() { document.getElementById('recipes-modal').style.display = 'none'; }
function openPunishmentModal() { document.getElementById('punishment-modal').style.display = 'flex'; }
function closePunishmentModal() { document.getElementById('punishment-modal').style.display = 'none'; }
function fillSinPreset() {
    let sel = document.getElementById('sin-preset'); let opt = sel.options[sel.selectedIndex];
    if(opt.value) { document.getElementById('sin-cals').value = opt.value; document.getElementById('sin-pro').value = opt.getAttribute('data-p') || 0; document.getElementById('sin-car').value = opt.getAttribute('data-c') || 0; document.getElementById('sin-fat').value = opt.getAttribute('data-f') || 0; }
}
function calculateSinFromMacros() {
    let p = parseInt(document.getElementById('sin-pro').value) || 0; let c = parseInt(document.getElementById('sin-car').value) || 0; let f = parseInt(document.getElementById('sin-fat').value) || 0; let cals = (p * 4) + (c * 4) + (f * 9);
    if (cals > 0) { document.getElementById('sin-cals').value = cals; document.getElementById('sin-preset').value = ""; }
}
function triggerPunishment() {
    const cals = parseInt(document.getElementById('sin-cals').value); if (!cals || cals < 100) { alert('Mínimo 100kcal!'); return; }
    if(typeof generatePunishmentLogic === 'function') {
        activePunishment = generatePunishmentLogic(cals); localStorage.setItem('gym_punishment', JSON.stringify(activePunishment)); closePunishmentModal(); renderPunishmentStatus(); alert('🔥 Tens uma penitência para pagar!');
        let presetName = document.getElementById('sin-preset').options[document.getElementById('sin-preset').selectedIndex].text || "Pecado"; if(presetName === "Seleciona o Fast Food...") presetName = "Pecado / Cheat Meal";
        let pro = parseInt(document.getElementById('sin-pro').value) || 0; dailyIntake.foods.push({ name: `⚠️ ${presetName}`, cals: cals, pro: pro }); localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); renderDieta();
    }
}
function renderPunishmentStatus() {
    const container = document.getElementById('punishment-status'); if (!container) return;
    if (!activePunishment) { container.innerHTML = `<p style="color:var(--muted); font-size:13px;">Estás limpo. Mantém a dieta.</p>`; container.style.borderLeft = "4px solid var(--success)"; } 
    else { container.innerHTML = `<div style="color:var(--danger); font-weight:bold; margin-bottom:10px;">🚨 PENITÊNCIA PENDENTE (${activePunishment.cals} kcal extras)</div><div style="font-size:13px; color:white; line-height:1.6; margin-bottom:15px;">Para voltares a gravar treinos, tens de pagar:<br>• <b>${activePunishment.burpees}</b> Burpees<br>• <b>${activePunishment.squats}</b> Agachamentos c/ Salto<br>• <b>${activePunishment.pushups}</b> Flexões</div><button class="beast-action-btn dropset" style="width:100%; padding:12px; background:var(--danger);" onclick="completePunishment()">🩸 PENITÊNCIA CUMPRIDA</button>`; container.style.borderLeft = "4px solid var(--danger)"; }
}
function completePunishment() { if(confirm('Tens a certeza que suaste isso tudo?')) { activePunishment = null; localStorage.removeItem('gym_punishment'); renderPunishmentStatus(); alert('⛓️ Estás perdoado. Volta ao foco!'); } }

// --- MODAIS GERAIS E FLEX ---
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
    if (exercises) { exercises.forEach((ex, exIdx) => { for (let setIdx = 1; setIdx <= 15; setIdx++) { let wInput = document.getElementById(`weight-${currentDay}-${exIdx}-${setIdx}`); let rInput = document.getElementById(`reps-${currentDay}-${exIdx}-${setIdx}`); if (wInput && rInput && wInput.value && rInput.value) { let w = parseFloat(wInput.value); let r = parseInt(rInput.value); if (!isNaN(w) && !isNaN(r)) { totalVolume += (w * r); totalSets++; } } } }); }
    let username = userProfile.name ? '@' + userProfile.name.replace(/\s+/g, '').toLowerCase() : '@atleta_misterioso';
    document.getElementById('flex-card-name').innerText = username; document.getElementById('flex-card-date').innerText = new Date().toLocaleDateString('pt-PT'); document.getElementById('flex-card-workout').innerText = currentDay.toUpperCase() + ' DAY'; document.getElementById('flex-card-volume').innerText = totalVolume.toLocaleString('en-US') + ' kg'; document.getElementById('flex-card-sets').innerText = totalSets + ' Sets';
    const flexQuotes = ["Mais um bloco de cimento colocado no castelo.", "A dor de hoje é a força de amanhã.", "O corpo atinge aquilo em que a mente acredita."]; document.getElementById('flex-card-quote').innerText = `"${flexQuotes[Math.floor(Math.random() * flexQuotes.length)]}"`; document.getElementById('flex-modal').style.display = 'flex';
}
function closeModoFlex() { document.getElementById('flex-modal').style.display = 'none'; }
function copyFlexText() { const textToCopy = `🔥 ACABEI DE FRITAR O MEU TREINO!\n\n💪 Foco: ${document.getElementById('flex-card-workout').innerText}\n📈 Volume Movido: ${document.getElementById('flex-card-volume').innerText}\n🥵 Séries Concluídas: ${document.getElementById('flex-card-sets').innerText}\n\n🤖 Registado no Pulse`; navigator.clipboard.writeText(textToCopy).then(() => alert('✅ Resumo copiado!')).catch(() => alert('Tira um print!')); }
