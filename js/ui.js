// ==========================================
// UI.JS: NAVEGAÇÃO, RENDERIZAÇÃO E MODAIS
// ==========================================

function toggleIsland() { document.getElementById('glass-island').classList.toggle('collapsed'); }

function navigateIsland(event, id, icon, text) {
    if(event) event.stopPropagation();
    document.getElementById('active-icon').innerText = icon;
    document.getElementById('active-text').innerText = text;
    document.getElementById('glass-island').classList.add('collapsed');

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.island-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');

    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); updateHeatmap(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); }
    if (id === 'view-dieta') { renderDieta(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
}

// --- RENDERIZAÇÃO DO TREINO NORMAL ---
function switchWorkout(event, day) {
    currentDay = day;
    document.querySelectorAll('#view-treino .tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderWorkout();
}

function renderWorkout() {
    const container = document.getElementById('workout-container');
    if(!container) return;
    container.innerHTML = '';
    const exercises = workoutData[currentDay];

    if (!exercises || exercises.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--muted); margin-top:20px;">Nenhum treino planeado. Vai ao Construtor!</p>';
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
                <div class="input-group">
                    <label>KG</label>
                    <input type="number" id="weight-${currentDay}-${exIdx}-${i}">
                </div>
                <div class="input-group">
                    <label>Reps</label>
                    <input type="number" id="reps-${currentDay}-${exIdx}-${i}">
                </div>
                <div class="input-group">
                    <label>RIR</label>
                    <select id="rir-${currentDay}-${exIdx}-${i}">
                        <option value="0">0</option>
                        <option value="1" selected>1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                    </select>
                </div>
                <button class="check-btn" onclick="this.parentElement.classList.toggle('done')">✔</button>
            </div>`;
        }
        html += `</div>`;
        container.innerHTML += html;
    });
}

function saveCurrentWorkout() {
    const exercises = workoutData[currentDay];
    let workoutRecord = { date: new Date().toLocaleDateString('pt-PT'), day: currentDay, exercises: {} };

    exercises.forEach((ex, exIdx) => {
        let setsDetails = [];
        for (let i = 1; i <= (ex.sets + 10); i++) { // Permite apanhar drop sets extra
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
    
    // Atualiza Heatmap e Estatísticas logo em background
    updateHeatmap();
    calculateRPGStats();
}

// --- CONSTRUTOR ---
function setFatigue(level) {
    builderState.fatigue = level;
    document.querySelectorAll('.fatigue-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-fatigue-${level}`).classList.add('active');
}

function setBuilderMode(mode) {
    builderState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');

    document.getElementById('auto-focus-panel').style.display = 'none';
    document.getElementById('manual-library-panel').style.display = 'none';
    document.getElementById('saved-routines-panel').style.display = 'none';

    if (mode === 'auto') document.getElementById('auto-focus-panel').style.display = 'block';
    else if (mode === 'manual') { document.getElementById('manual-library-panel').style.display = 'block'; renderLibrary(); }
    else if (mode === 'saved') { document.getElementById('saved-routines-panel').style.display = 'block'; renderSavedRoutines(); }
}

function renderLibrary() {
    const filterMuscle = document.getElementById('filter-muscle').value;
    const filterTier = document.getElementById('filter-tier').value;
    const list = document.getElementById('library-list');
    list.innerHTML = '';

    let filtered = exerciseLibrary;
    if (filterMuscle !== 'ALL') filtered = filtered.filter(ex => ex.muscle === filterMuscle);
    if (filterTier !== 'ALL') filtered = filtered.filter(ex => ex.tier === filterTier);

    filtered.forEach(ex => {
        list.innerHTML += `
        <div class="lib-item">
            <div class="lib-item-info">
                <span class="lib-item-title">${ex.name}</span>
                <div class="lib-item-badges">
                    <span class="badge muscle">${ex.muscle}</span>
                    <span class="badge tier-${ex.tier.toLowerCase()}">${ex.tier}-Tier</span>
                </div>
            </div>
            <button class="add-btn" onclick="addExerciseToBuilder('${ex.name}', ${ex.defaultSets})">+</button>
        </div>`;
    });
}

function generateWorkout() {
    const focus = document.getElementById('auto-focus-select').value;
    const fatigue = builderState.fatigue;
    builderState.routine = [];

    let targetMuscles = [];
    if (focus === 'PUSH') targetMuscles = ['Peito', 'Ombros', 'Braços']; 
    if (focus === 'PULL') targetMuscles = ['Costas', 'Ombros', 'Braços']; 
    if (focus === 'LEGS') targetMuscles = ['Pernas'];
    if (focus === 'FULL') targetMuscles = ['Pernas', 'Peito', 'Costas', 'Ombros'];

    targetMuscles.forEach(muscle => {
        let pool = exerciseLibrary.filter(ex => ex.muscle === muscle);
        let selectedEx;
        if (fatigue === 'tired') {
            const machines = pool.filter(ex => ex.type === 'machine');
            selectedEx = machines.length > 0 ? machines[Math.floor(Math.random() * machines.length)] : pool[0];
            let sets = Math.max(2, selectedEx.defaultSets - 1);
            builderState.routine.push({ name: selectedEx.name, sets: sets });
        } else if (fatigue === 'energized') {
            const sTiers = pool.filter(ex => ex.tier === 'S');
            selectedEx = sTiers.length > 0 ? sTiers[Math.floor(Math.random() * sTiers.length)] : pool[0];
            builderState.routine.push({ name: selectedEx.name, sets: selectedEx.defaultSets });
        } else {
            selectedEx = pool[Math.floor(Math.random() * pool.length)];
            builderState.routine.push({ name: selectedEx.name, sets: selectedEx.defaultSets });
        }

        if (focus !== 'FULL' && (muscle === 'Peito' || muscle === 'Costas' || muscle === 'Pernas')) {
            let secondEx = pool.filter(ex => ex.name !== selectedEx.name)[0];
            if (secondEx) {
                let sets = fatigue === 'tired' ? Math.max(2, secondEx.defaultSets - 1) : secondEx.defaultSets;
                builderState.routine.push({ name: secondEx.name, sets: sets });
            }
        }
    });

    if (focus === 'PUSH') builderState.routine = builderState.routine.filter(ex => !ex.name.includes('Bíceps') && !ex.name.includes('Curl'));
    if (focus === 'PULL') builderState.routine = builderState.routine.filter(ex => !ex.name.includes('Tríceps') && !ex.name.includes('Testa') && !ex.name.includes('Pushdown'));

    updateBuilderUI();
    alert('✨ Treino Inteligente gerado com sucesso! Verifica o Esboço abaixo.');
}

function addExerciseToBuilder(name, sets) { builderState.routine.push({ name, sets }); updateBuilderUI(); }
function removeExerciseFromBuilder(index) { builderState.routine.splice(index, 1); updateBuilderUI(); }
function updateBuilderSets(index, value) { builderState.routine[index].sets = parseInt(value) || 1; updateBuilderUI(false); }

function updateBuilderUI(rebuildList = true) {
    const list = document.getElementById('builder-routine-list');
    const badge = document.getElementById('workout-volume-badge');
    const actionBtns = document.getElementById('builder-action-buttons');
    
    let totalSets = 0;
    if (rebuildList) list.innerHTML = '';

    if (builderState.routine.length === 0) {
        if (rebuildList) list.innerHTML = `<p class="text-center" style="color: var(--muted); font-size: 14px; padding: 20px 0;">Nenhum exercício selecionado.</p>`;
        badge.innerText = `0 Séries`;
        actionBtns.style.display = 'none';
        return;
    }

    builderState.routine.forEach((item, idx) => {
        totalSets += parseInt(item.sets);
        if (rebuildList) {
            list.innerHTML += `
            <div class="built-item">
                <div class="built-item-info">
                    <span class="built-item-title">${idx + 1}. ${item.name}</span>
                </div>
                <div class="built-item-controls">
                    <span style="font-size: 10px; color: var(--muted);">SÉRIES</span>
                    <input type="number" class="set-input" value="${item.sets}" onchange="updateBuilderSets(${idx}, this.value)">
                    <button class="remove-btn" onclick="removeExerciseFromBuilder(${idx})">✖</button>
                </div>
            </div>`;
        }
    });

    badge.innerText = `${totalSets} Séries Totais`;
    badge.style.color = totalSets > 24 ? 'var(--danger)' : 'var(--accent)';
    actionBtns.style.display = 'flex';
}

function applyBuiltWorkout() {
    if (builderState.routine.length === 0) return;
    workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine));
    const tabsContainer = document.querySelector('#view-treino .tabs');
    if (!document.getElementById('tab-custom')) {
        tabsContainer.innerHTML += `<button id="tab-custom" class="tab-btn" onclick="switchWorkout(event,'CUSTOM')">LAB 🧪</button>`;
    }
    document.querySelector('.island-btn').click(); // Navega para Treino
    document.getElementById('tab-custom').click();
}

function saveCurrentRoutine() {
    if (builderState.routine.length === 0) return;
    const routineName = prompt("Nome da rotina (ex: Peito Fritado):");
    if (!routineName) return;
    savedRoutines.push({ name: routineName, routine: JSON.parse(JSON.stringify(builderState.routine)) });
    localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines));
    alert('✅ Rotina guardada com sucesso!');
}

function renderSavedRoutines() {
    const list = document.getElementById('saved-routines-list');
    list.innerHTML = '';
    if (savedRoutines.length === 0) {
        list.innerHTML = `<p class="text-center" style="color: var(--muted); padding: 20px 0;">Sem rotinas guardadas.</p>`;
        return;
    }
    savedRoutines.forEach((item, index) => {
        let totalSets = item.routine.reduce((sum, ex) => sum + parseInt(ex.sets), 0);
        list.innerHTML += `
        <div class="built-item" style="border: 1px solid #334155;">
            <div class="built-item-info">
                <span class="built-item-title" style="color: var(--accent);">${item.name}</span>
                <span style="font-size: 11px; color: var(--muted);">${item.routine.length} Exercícios | ${totalSets} Séries</span>
            </div>
            <div class="built-item-controls" style="gap: 5px;">
                <button class="add-btn" style="width: auto; padding: 0 10px;" onclick="loadSavedRoutine(${index})">CARREGAR</button>
                <button class="remove-btn" onclick="deleteSavedRoutine(${index})">✖</button>
            </div>
        </div>`;
    });
}
function loadSavedRoutine(index) { builderState.routine = JSON.parse(JSON.stringify(savedRoutines[index].routine)); updateBuilderUI(); }
function deleteSavedRoutine(index) { if (confirm("Apagar esta rotina?")) { savedRoutines.splice(index, 1); localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); renderSavedRoutines(); } }

// --- MAPA DE CALOR & EVOLUÇÃO ---
function updateHeatmap() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    let volume = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };

    history.forEach(log => {
        const parts = log.date.split('/');
        if(parts.length === 3) {
            const logDate = new Date(parts[2], parts[1]-1, parts[0]);
            if (logDate >= sevenDaysAgo && logDate <= now) {
                if(log.exercises) {
                    Object.entries(log.exercises).forEach(([exName, sets]) => {
                        let muscle = getMuscleForExercise(exName);
                        if (volume[muscle] !== undefined) volume[muscle] += sets.length;
                    });
                }
            }
        }
    });

    const getColor = (sets) => {
        if (sets === 0) return '#334155';
        if (sets <= 6) return '#eab308'; 
        if (sets <= 12) return '#f97316';
        return '#ef4444'; 
    };

    const c = { peito: getColor(volume['Peito']), costas: getColor(volume['Costas']), pernas: getColor(volume['Pernas']), ombros: getColor(volume['Ombros']), bracos: getColor(volume['Braços']), core: getColor(volume['Core']) };

    const hmPeito = document.getElementById('hm-peito');
    if(hmPeito) {
        hmPeito.setAttribute('fill', c.peito);
        document.getElementById('hm-ombros-l').setAttribute('fill', c.ombros); document.getElementById('hm-ombros-r').setAttribute('fill', c.ombros);
        document.getElementById('hm-biceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-biceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-quads-l').setAttribute('fill', c.pernas); document.getElementById('hm-quads-r').setAttribute('fill', c.pernas);
        document.getElementById('hm-core').setAttribute('fill', c.core);
        document.getElementById('hm-costas').setAttribute('fill', c.costas);
        document.getElementById('hm-triceps-l').setAttribute('fill', c.bracos); document.getElementById('hm-triceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-femorais-l').setAttribute('fill', c.pernas); document.getElementById('hm-femorais-r').setAttribute('fill', c.pernas);
        document.getElementById('hm-gemeos-l').setAttribute('fill', c.pernas); document.getElementById('hm-gemeos-r').setAttribute('fill', c.pernas);
    }
}

function setupChartSelect() {
    const select = document.getElementById('exercise-select');
    if (!select) return;
    select.innerHTML = '<option value="">Escolhe um exercício...</option>';
    const uniqueExercises = new Set();
    history.forEach(log => { if(log.exercises) Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); });
    uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value;
    if (!exercise) return;

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
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'Carga (kg)', data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.3 }] }
    });

    const maxWeight = Math.max(...data, 0);
    const maxReps = Math.max(...reps, 0);
    let totalVolume = 0;
    history.forEach(log => {
        if (log.exercises && log.exercises[exercise]) {
            log.exercises[exercise].forEach(set => totalVolume += (set.weight || set.w) * (set.reps || set.r));
        }
    });

    document.getElementById('coach-message').innerText = data.length >= 3 ? (data[data.length - 1] > data[data.length - 2] ? '📈 Excelente progressão recente.' : '⚠️ Sem progressão recente. Ajusta volume ou recuperação.') : '📊 Poucos dados para análise.';
    update1RMPrediction(exercise, maxWeight, maxReps, totalVolume);
}

function update1RMPrediction(exerciseName, maxWeight, maxReps, totalVolume) {
    const container = document.getElementById('onerm-container');
    if (!exerciseName || !container) return;

    let best1RM = calculate1RM(maxWeight, maxReps);
    if (best1RM > 0) {
        container.style.display = 'block';
        document.getElementById('onerm-value').innerText = Math.round(best1RM) + ' kg';
        let target1RM = Math.round(best1RM * 1.10); 
        let daysToTarget = Math.round((target1RM - best1RM) / (best1RM * 0.0005));
        let targetDate = new Date(); targetDate.setDate(targetDate.getDate() + daysToTarget);
        let dateString = targetDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
        document.getElementById('onerm-prediction').innerHTML = `🔮 <b>Previsão da Máquina:</b> Com base nos teus ${maxWeight}kg x ${maxReps} reps, vais conseguir esmagar os <b>${target1RM}kg</b> até <b>${dateString}</b>.`;
    } else container.style.display = 'none';

    document.getElementById('pr-display').innerHTML += `
        <p style="margin-top:10px;"><strong>Maior carga:</strong> ${maxWeight} kg</p>
        <p><strong>Maior reps:</strong> ${maxReps}</p>
        <p><strong>Volume acumulado:</strong> ${Math.round(totalVolume)} kg</p>
    `;
}

function updateGlobalStats() {
    let totalWorkouts = history.length;
    let totalSets = 0, totalVolume = 0;
    let exercisesDone = {};

    history.forEach(log => {
        if(log.exercises) {
            Object.entries(log.exercises).forEach(([exercise, sets]) => {
                if (!exercisesDone[exercise]) exercisesDone[exercise] = 0;
                exercisesDone[exercise]++;
                totalSets += sets.length;
                sets.forEach(set => totalVolume += (set.weight||set.w) * (set.reps||set.r));
            });
        }
    });

    let fav = Object.keys(exercisesDone).length > 0 ? Object.keys(exercisesDone).reduce((a, b) => exercisesDone[a] > exercisesDone[b] ? a : b) : 'Nenhum';
    document.getElementById('global-stats').innerHTML = `
        <h3>📊 Estatísticas Globais</h3><br>
        <p><strong>Total de treinos:</strong> ${totalWorkouts}</p>
        <p><strong>Total de séries:</strong> ${totalSets}</p>
        <p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p>
        <p><strong>Exercício favorito:</strong> ${fav}</p>
    `;
    calculateRPGStats();
}

function calculateRPGStats() {
    const muscleXP = { 'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0 };
    history.forEach(session => {
        if(session.exercises) {
            Object.entries(session.exercises).forEach(([exName, setsDetails]) => {
                let volume = 0;
                setsDetails.forEach(set => {
                    let w = parseFloat(set.weight || set.w); let r = parseInt(set.reps || set.r);
                    if(w > 0 && r > 0) volume += (w * r);
                });
                let muscle = getMuscleForExercise(exName) || categorizeMuscleByNameRPG(exName);
                if (muscleXP[muscle] !== undefined) muscleXP[muscle] += volume;
                else if (muscleXP['Braços'] !== undefined && (muscle === 'Bíceps' || muscle === 'Tríceps')) muscleXP['Braços'] += volume;
            });
        }
    });
    renderRPGStats(muscleXP);
}

function renderRPGStats(muscleXP) {
    const container = document.getElementById('rpg-stats-container');
    if(!container) return;
    container.innerHTML = '';
    const colors = { 'Peito': '#38bdf8', 'Costas': '#22c55e', 'Pernas': '#f59e0b', 'Ombros': '#ef4444', 'Braços': '#a855f7', 'Core': '#f43f5e' };

    for (let muscle in muscleXP) {
        let stats = getLevelAndProgress(muscleXP[muscle]);
        let color = colors[muscle] || '#94a3b8';
        container.innerHTML += `
        <div style="background: rgba(255,255,255,0.02); padding: 10px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: bold; color: white; font-size: 14px;">${muscle}</span>
                <span style="color: ${color}; font-weight: bold; font-size: 14px; text-shadow: 0 0 8px ${color}60;">Lvl ${stats.level}</span>
            </div>
            <div class="progress-bar" style="height: 8px; background: #1e293b; margin-bottom: 5px; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${stats.progress}%; background: ${color}; box-shadow: 0 0 10px ${color}80; transition: width 1s ease-out;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--muted);">
                <span>${Math.round(stats.xpIntoLevel)} XP</span>
                <span>${Math.round(stats.xpRequired)} XP p/ Lvl ${stats.level + 1}</span>
            </div>
        </div>`;
    }
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('calendar-title').innerText = `${monthNames[month]} ${year}`;

    for (let i = 0; i < startDay; i++) grid.innerHTML += '<div class="day-box empty"></div>';

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        const trained = history.some(h => h.date === dateString);
        grid.innerHTML += `<div class="day-box ${trained ? 'trained' : ''}" onclick="toggleTrainingDay('${dateString}')">${day}</div>`;
    }
    updateWeeklyGoal(); updateMonthlyGoal();
}
function changeMonth(direction) { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction); renderCalendar(); }
function toggleTrainingDay(dateString) {
    const existing = history.find(h => h.date === dateString);
    if (existing) {
        if (existing.exercises && Object.keys(existing.exercises).length > 0) {
            if (!confirm("⚠️ Este dia tem um treino com séries reais. Queres APAGAR tudo?")) return;
        }
        history = history.filter(h => h.date !== dateString);
    } else { history.push({ date: dateString, day: 'MANUAL', exercises: {} }); }
    localStorage.setItem('gym_tracker_history', JSON.stringify(history));
    renderCalendar(); updateGlobalStats(); updateHeatmap();
}

function updateWeeklyGoal() {
    let weekly = 0; const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
    history.forEach(log => {
        let parts = log.date.split('/');
        if(parts.length===3){
            let d = new Date(parts[2], parts[1]-1, parts[0]);
            if (d >= sevenDaysAgo && d <= now) weekly++;
        }
    });
    document.getElementById('weekly-count').innerText = weekly;
    document.getElementById('weekly-progress').style.width = `${Math.min(weekly, 6) / 6 * 100}%`;
}
function updateMonthlyGoal() {
    let monthly = 0; const year = currentCalendarDate.getFullYear(); const month = currentCalendarDate.getMonth();
    history.forEach(log => {
        let parts = log.date.split('/');
        if(parts.length===3 && parseInt(parts[2]) === year && parseInt(parts[1])-1 === month) monthly++;
    });
    document.getElementById('monthly-count').innerText = monthly;
    document.getElementById('monthly-progress').style.width = `${Math.min(monthly, 24) / 24 * 100}%`;
}

// --- PERFIL E DIETA ---
function renderProfile() {
    document.getElementById('prof-name').value = userProfile.name || '';
    document.getElementById('prof-age').value = userProfile.age || 25;
    document.getElementById('prof-gender').value = userProfile.gender || 'male';
    document.getElementById('prof-height').value = userProfile.height || 170;
    document.getElementById('prof-weight').value = userProfile.weight || 70;
    document.getElementById('prof-activity').value = userProfile.activity || '1.55';
    document.getElementById('prof-goal').value = userProfile.goal || 'maintain';
    
    if (userProfile.measurements) {
        document.getElementById('meas-arm').value = userProfile.measurements.arm || '';
        document.getElementById('meas-chest').value = userProfile.measurements.chest || '';
        document.getElementById('meas-waist').value = userProfile.measurements.waist || '';
        document.getElementById('meas-leg').value = userProfile.measurements.leg || '';
    }
    updateProfileData();
}

function updateProfileData() {
    userProfile.name = document.getElementById('prof-name').value;
    userProfile.age = parseInt(document.getElementById('prof-age').value) || 25;
    userProfile.gender = document.getElementById('prof-gender').value;
    userProfile.height = parseInt(document.getElementById('prof-height').value) || 170;
    userProfile.weight = parseInt(document.getElementById('prof-weight').value) || 70;
    userProfile.activity = parseFloat(document.getElementById('prof-activity').value) || 1.55;
    userProfile.goal = document.getElementById('prof-goal').value;
    if (!userProfile.measurements) userProfile.measurements = {};
    userProfile.measurements.arm = document.getElementById('meas-arm').value;
    userProfile.measurements.chest = document.getElementById('meas-chest').value;
    userProfile.measurements.waist = document.getElementById('meas-waist').value;
    userProfile.measurements.leg = document.getElementById('meas-leg').value;

    localStorage.setItem('gym_profile', JSON.stringify(userProfile));
    document.getElementById('height-val').innerText = userProfile.height;
    document.getElementById('weight-val').innerText = userProfile.weight;

    const heightM = userProfile.height / 100;
    const bmi = userProfile.weight / (heightM * heightM);
    document.getElementById('calc-bmi').innerText = bmi.toFixed(1);

    let bmiStatus = "Normal"; let bmiColor = "var(--success)";
    if (bmi < 18.5) { bmiStatus = "Baixo Peso"; bmiColor = "var(--accent)"; }
    else if (bmi >= 25 && bmi < 30) { bmiStatus = "Excesso de Peso"; bmiColor = "#f59e0b"; }
    else if (bmi >= 30) { bmiStatus = "Obesidade"; bmiColor = "var(--danger)"; }
    document.getElementById('calc-bmi-status').innerText = bmiStatus;
    document.getElementById('calc-bmi-status').style.color = bmiColor;

    let tdee = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age);
    tdee += (userProfile.gender === 'male') ? 5 : -161;
    tdee *= userProfile.activity;
    if (userProfile.goal === 'cut') tdee -= 500;
    if (userProfile.goal === 'bulk') tdee += 300;
    document.getElementById('calc-cals').innerText = Math.round(tdee);

    const avatar = document.getElementById('dynamic-avatar');
    let scaleY = 1 + ((userProfile.height - 170) / 170) * 0.7; 
    let scaleX = 1 + ((bmi - 24) / 24) * 0.6;
    if(avatar) avatar.style.transform = `scale(${Math.max(0.6, Math.min(scaleX, 1.8))}, ${Math.max(0.7, Math.min(scaleY, 1.4))})`;

    renderDieta();
    calculateBodyFat();
    setTimeout(updateWearableData, 200);
}

function renderDieta() {
    const calsElement = document.getElementById('calc-cals');
    if(!calsElement) return;
    let tdee = parseInt(calsElement.innerText) || 0;
    let weight = userProfile.weight; let goal = userProfile.goal;

    if (tdee === 0) return;
    let protein = Math.round(weight * 2.2);
    let fat = Math.round(weight * (goal === 'cut' ? 0.8 : 1.0));
    let carbs = Math.max(0, Math.round((tdee - (protein * 4 + fat * 9)) / 4));

    document.getElementById('macro-pro').innerText = protein + 'g';
    document.getElementById('macro-car').innerText = carbs + 'g';
    document.getElementById('macro-fat').innerText = fat + 'g';

    let waterMl = (weight * 35); if(userProfile.activity >= 1.55) waterMl += 500;
    document.getElementById('water-goal').innerText = (waterMl / 1000).toFixed(1) + ' L';

    let advice = goal === 'cut' ? "💡 Foco no défice calórico! Privilegia alimentos volumosos." : (goal === 'bulk' ? "💡 Modo construção! Alimentos densos como manteiga de amendoim e azeite." : "💡 Recomposição: O equilíbrio perfeito. Treina pesado.");
    document.getElementById('diet-advisor').innerText = advice;
}

function updateWearableData() {
    const steps = parseInt(document.getElementById('wearable-steps').value) || 0;
    const workoutCals = parseInt(document.getElementById('wearable-cals').value) || 0;
    const extraCals = (steps * 0.04) + workoutCals;
    
    let weight = parseFloat(userProfile.weight) || 70; let height = parseFloat(userProfile.height) || 170;
    let age = parseInt(userProfile.age) || 25; let gender = userProfile.gender || 'male';
    let bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
    
    let dynamicTDEE = (bmr * 1.2) + extraCals;
    const goal = userProfile.goal || 'maintain';
    if (goal === 'cut') dynamicTDEE -= 500; if (goal === 'bulk') dynamicTDEE += 300;
    
    const tdeeDisplay = document.getElementById('dynamic-tdee');
    if (tdeeDisplay) tdeeDisplay.innerText = Math.round(dynamicTDEE) + ' Kcal';
    
    let pro = weight * 2.2; let fat = weight * 1.0;
    let carb = Math.max(0, (dynamicTDEE - (pro * 4) - (fat * 9)) / 4);
    
    const proDisplay = document.getElementById('macro-pro');
    if (proDisplay) proDisplay.innerText = Math.round(pro) + 'g';
    const fatDisplay = document.getElementById('macro-fat');
    if (fatDisplay) fatDisplay.innerText = Math.round(fat) + 'g';
    const carDisplay = document.getElementById('macro-car');
    if (carDisplay) carDisplay.innerText = Math.round(carb) + 'g';
    
    let baseWater = weight * 0.035; let extraWater = (workoutCals > 0) ? 0.8 : 0;
    let waterGoalDisplay = document.getElementById('water-goal');
    if (waterGoalDisplay) waterGoalDisplay.innerText = (baseWater + extraWater).toFixed(1) + ' L';
}

function calculateBodyFat() {
    const waist = parseFloat(document.getElementById('meas-waist').value);
    const height = userProfile.height; const gender = userProfile.gender;
    const bfDisplay = document.getElementById('calc-bf');
    if (waist > 0 && height > 0) {
        let rfm = calculateBodyFatFormula(waist, height, gender);
        bfDisplay.innerText = rfm.toFixed(1) + '%';
        if (rfm < 12 && gender === 'male' || rfm < 20 && gender === 'female') bfDisplay.style.color = '#38bdf8';
        else if (rfm < 20 && gender === 'male' || rfm < 28 && gender === 'female') bfDisplay.style.color = 'var(--success)';
        else if (rfm < 25 && gender === 'male' || rfm < 33 && gender === 'female') bfDisplay.style.color = '#f59e0b';
        else bfDisplay.style.color = 'var(--danger)';
    } else { bfDisplay.innerText = '--%'; bfDisplay.style.color = 'var(--accent)'; }
}

// --- MODAIS DIVERSOS ---
function openPlateMath(targetWeightStr) {
    const targetWeight = parseFloat(targetWeightStr);
    if (!targetWeight || targetWeight <= 20) { alert('Insere um peso superior a 20kg (peso da barra).'); return; }
    document.getElementById('plate-target-weight').innerText = targetWeight;
    const plates = [ { weight: 25, color: '#ef4444', height: '100px' }, { weight: 20, color: '#3b82f6', height: '90px' }, { weight: 15, color: '#eab308', height: '80px' }, { weight: 10, color: '#22c55e', height: '70px' }, { weight: 5, color: '#f8fafc', height: '50px' }, { weight: 2.5, color: '#334155', height: '40px' }, { weight: 1.25, color: '#94a3b8', height: '30px' } ];
    let weightPerSide = (targetWeight - 20) / 2; let resultHTML = ''; let visualHTML = '';
    plates.forEach(plate => {
        let count = Math.floor(weightPerSide / plate.weight);
        if (count > 0) {
            resultHTML += `<div class="plate-row"><div class="plate-info"><div class="plate-color-box" style="background: ${plate.color};"></div>Disco de ${plate.weight}kg</div><span class="plate-qty">${count}x</span></div>`;
            for(let i = 0; i < count; i++) visualHTML += `<div style="width:12px; height:${plate.height}; background:${plate.color}; border-radius:3px; border:1px solid #000;"></div>`;
            weightPerSide = Math.round((weightPerSide - count * plate.weight) * 100) / 100;
        }
    });
    if (resultHTML === '') resultHTML = '<p style="color:var(--muted); text-align:center;">Não são necessários discos adicionais.</p>';
    document.getElementById('plate-math-result').innerHTML = resultHTML; document.getElementById('visual-plates').innerHTML = visualHTML;
    document.getElementById('plate-math-modal').style.display = 'flex';
}
function closePlateMath() { document.getElementById('plate-math-modal').style.display = 'none'; }

function openWarmup() {
    const targetW = parseFloat(document.getElementById('beast-weight').value || document.getElementById('beast-weight').placeholder);
    if (!targetW || targetW <= 20) { alert("Insere um peso alvo superior a 20kg."); return; }
    document.getElementById('warmup-results').innerHTML = `
        <div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #94a3b8;"><strong style="color: var(--accent);">Set 1:</strong> Barra (20kg) x 15 reps <br><span style="font-size: 11px; color: var(--muted);">Foco na técnica</span></div>
        <div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #38bdf8;"><strong style="color: var(--accent);">Set 2:</strong> ${Math.round(targetW * 0.5)}kg x 8 reps <br><span style="font-size: 11px; color: var(--muted);">50% da carga alvo</span></div>
        <div style="background: #334155; padding: 15px; border-radius: 12px; color: white; text-align: left; border-left: 4px solid #ef4444;"><strong style="color: var(--accent);">Set 3:</strong> ${Math.round(targetW * 0.75)}kg x 3 reps <br><span style="font-size: 11px; color: var(--muted);">75% da carga</span></div>`;
    document.getElementById('warmup-modal').style.display = 'flex';
}
function closeWarmup() { document.getElementById('warmup-modal').style.display = 'none'; }

function openModal(title, content) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-content').innerText = content;
    currentModalExercise = title;
    document.getElementById('custom-video-input').value = ""; 
    renderVideoFrame(title);
    document.getElementById('exercise-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('exercise-modal').style.display = 'none'; document.getElementById('modal-video-container').innerHTML = ''; }
function showExerciseTips(exerciseName) { openModal(exerciseName, "Foca-te na execução perfeita e numa descida controlada!"); }

function saveCustomVideo() {
    const inputLink = document.getElementById('custom-video-input').value.trim();
    if (!inputLink) return;
    let embedLink = inputLink;
    if (inputLink.includes('watch?v=')) { embedLink = inputLink.replace('watch?v=', 'embed/'); if(embedLink.includes('&')) embedLink = embedLink.split('&')[0]; } 
    else if (inputLink.includes('youtu.be/')) { embedLink = inputLink.replace('youtu.be/', 'youtube.com/embed/'); if(embedLink.includes('?')) embedLink = embedLink.split('?')[0]; }
    let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {};
    videoLibrary[currentModalExercise] = embedLink;
    localStorage.setItem('gym_tracker_videos', JSON.stringify(videoLibrary));
    renderVideoFrame(currentModalExercise);
    document.getElementById('custom-video-input').value = ""; document.getElementById('custom-video-input').placeholder = "Gravado com sucesso!";
    if ("vibrate" in navigator) navigator.vibrate(50);
}

function renderVideoFrame(exerciseName) {
    let videoLibrary = JSON.parse(localStorage.getItem('gym_tracker_videos')) || {};
    const container = document.getElementById('modal-video-container');
    if (videoLibrary[exerciseName]) container.innerHTML = `<iframe width="100%" height="100%" src="${videoLibrary[exerciseName]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    else container.innerHTML = `<div style="text-align: center;"><span style="font-size: 30px; display: block; margin-bottom: 5px;">🎥</span><span style="color: var(--muted); font-size: 12px;">Sem vídeo. Cola um link abaixo!</span></div>`;
}

function openModoFlex() {
    let totalVolume = 0; let totalSets = 0; const exercises = workoutData[currentDay];
    if (exercises) {
        exercises.forEach((ex, exIdx) => {
            for (let setIdx = 1; setIdx <= 15; setIdx++) {
                let wInput = document.getElementById(`weight-${currentDay}-${exIdx}-${setIdx}`);
                let rInput = document.getElementById(`reps-${currentDay}-${exIdx}-${setIdx}`);
                if (wInput && rInput && wInput.value && rInput.value) {
                    let w = parseFloat(wInput.value); let r = parseInt(rInput.value);
                    if (!isNaN(w) && !isNaN(r)) { totalVolume += (w * r); totalSets++; }
                }
            }
        });
    }
    let username = userProfile.name ? '@' + userProfile.name.replace(/\s+/g, '').toLowerCase() : '@atleta_misterioso';
    document.getElementById('flex-card-name').innerText = username;
    document.getElementById('flex-card-date').innerText = new Date().toLocaleDateString('pt-PT');
    document.getElementById('flex-card-workout').innerText = currentDay.toUpperCase() + ' DAY';
    document.getElementById('flex-card-volume').innerText = totalVolume.toLocaleString('en-US') + ' kg';
    document.getElementById('flex-card-sets').innerText = totalSets + ' Sets';
    const flexQuotes = ["Mais um bloco de cimento colocado no castelo.", "A dor de hoje é a força de amanhã.", "O corpo atinge aquilo em que a mente acredita."];
    document.getElementById('flex-card-quote').innerText = `"${flexQuotes[Math.floor(Math.random() * flexQuotes.length)]}"`;
    document.getElementById('flex-modal').style.display = 'flex';
}
function closeModoFlex() { document.getElementById('flex-modal').style.display = 'none'; }
function copyFlexText() {
    const textToCopy = `🔥 ACABEI DE FRITAR O MEU TREINO!\n\n💪 Foco: ${document.getElementById('flex-card-workout').innerText}\n📈 Volume Movido: ${document.getElementById('flex-card-volume').innerText}\n🥵 Séries Concluídas: ${document.getElementById('flex-card-sets').innerText}\n\n🤖 Registado no Gym Tracker Ultra`;
    navigator.clipboard.writeText(textToCopy).then(() => alert('✅ Resumo copiado!')).catch(() => alert('Tira um print!'));
}
