// ==========================================
// PARTE 1: BASES DE DADOS E VARIÁVEIS GLOBAIS
// ==========================================

let workoutData = {
    PUSH: [
        { name: 'Supino Inclinado c/ Halteres', sets: 3 },
        { name: 'Supino Plano na Máquina (Chest Press)', sets: 3 },
        { name: 'Press Militar c/ Halteres (Sentado)', sets: 3 },
        { name: 'Elevações Laterais na Polia', sets: 4 },
        { name: 'Tríceps à Testa com Barra EZ ou Halteres (Skullcrushers)', sets: 3 },
        { name: 'Tríceps na Polia com Corda (Pushdowns)', sets: 3 }
    ],
    PULL: [
        { name: 'Puxada Vertical na Polia Alta (Lat Pulldown) com pega aberta', sets: 3 },
        { name: 'Remada Sentada com Cabo (Pega Romena/Neutro)', sets: 3 },
        { name: 'Remada Inclinada c/ Halteres', sets: 3 },
        { name: 'Cruzamentos Inversos na Polia ou Voos Posteriores (Rear Delt Fly)', sets: 4 },
        { name: 'Curl de Bíceps Inclinado com Halteres', sets: 3 },
        { name: 'Curl Martelo (Hammer Curl) com Halteres', sets: 3 }
    ],
    LEGS: [
        { name: 'Leg Press 45º', sets: 4 },
        { name: 'Peso Morto Romeno (RDL) com Barra ou Halteres', sets: 3 },
        { name: 'Extensão de Pernas (Leg Extension)', sets: 3 },
        { name: 'Flexão de Pernas Sentado ou Deitado (Leg Curl)', sets: 3 },
        { name: 'Elevação de Gémeos em Pé (Calf Raises)', sets: 4 }
    ],
    CUSTOM: []
};

// A GRANDE BIBLIOTECA DE EXERCÍCIOS
const exerciseLibrary = [
    { name: "Supino Plano com Barra", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 },
    { name: "Supino Inclinado c/ Halteres", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 },
    { name: "Supino Plano na Máquina (Chest Press)", muscle: "Peito", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Peck Deck / Voador", muscle: "Peito", tier: "B", type: "machine", defaultSets: 3 },
    { name: "Crossover na Polia", muscle: "Peito", tier: "A", type: "machine", defaultSets: 4 },
    
    { name: "Elevações (Pull-ups)", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Puxada Vertical na Polia Alta (Lat Pulldown) com pega aberta", muscle: "Costas", tier: "S", type: "machine", defaultSets: 3 },
    { name: "Remada com Barra", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Remada Sentada com Cabo (Pega Romena/Neutro)", muscle: "Costas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Remada Inclinada c/ Halteres", muscle: "Costas", tier: "A", type: "free", defaultSets: 3 },

    { name: "Agachamento Livre", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Leg Press 45º", muscle: "Pernas", tier: "S", type: "machine", defaultSets: 4 },
    { name: "Peso Morto Romeno (RDL) com Barra ou Halteres", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Extensão de Pernas (Leg Extension)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Flexão de Pernas Sentado ou Deitado (Leg Curl)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Elevação de Gémeos em Pé (Calf Raises)", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 },

    { name: "Press Militar c/ Halteres (Sentado)", muscle: "Ombros", tier: "S", type: "free", defaultSets: 3 },
    { name: "Elevações Laterais na Polia", muscle: "Ombros", tier: "S", type: "free", defaultSets: 4 },
    { name: "Cruzamentos Inversos na Polia ou Voos Posteriores (Rear Delt Fly)", muscle: "Ombros", tier: "A", type: "machine", defaultSets: 4 },
    
    { name: "Curl de Bíceps Inclinado com Halteres", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Curl Martelo (Hammer Curl) com Halteres", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Tríceps à Testa com Barra EZ ou Halteres (Skullcrushers)", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Tríceps na Polia com Corda (Pushdowns)", muscle: "Braços", tier: "S", type: "machine", defaultSets: 3 }
];

// Identificador Inteligente de Músculos (Para o Mapa de Calor)
function getMuscleForExercise(name) {
    let found = exerciseLibrary.find(ex => ex.name === name);
    if (found) return found.muscle;
    
    let lower = name.toLowerCase();
    if (lower.includes('supino') || lower.includes('chest') || lower.includes('peck') || lower.includes('crossover')) return 'Peito';
    if (lower.includes('puxada') || lower.includes('remada') || lower.includes('pullover') || lower.includes('pull-up') || lower.includes('costas') || lower.includes('delt fly')) return 'Costas';
    if (lower.includes('leg') || lower.includes('agachamento') || lower.includes('peso morto') || lower.includes('gémeos') || lower.includes('flexão') || lower.includes('extensão')) return 'Pernas';
    if (lower.includes('press') || lower.includes('elevações laterais') || lower.includes('ombros') || lower.includes('voos')) return 'Ombros';
    if (lower.includes('curl') || lower.includes('tríceps') || lower.includes('bíceps') || lower.includes('braços') || lower.includes('skullcrushers') || lower.includes('pushdown')) return 'Braços';
    return 'Core'; // Fallback
}

// Estado Principal
let currentDay = 'PUSH';
let history = JSON.parse(localStorage.getItem('gym_history')) || [];
let currentCalendarDate = new Date();
let chartInstance;

// Variáveis do Mini-Jogo
let timerInterval;
let gameInterval;
let gameTicks = 0;
let barbellY = 50;
let barbellVelocity = 0;
let score = 0;

// Estado do Construtor de Treinos
let builderState = {
    fatigue: 'energized',
    mode: 'auto',
    routine: []
};

// Variável do Perfil
let userProfile = JSON.parse(localStorage.getItem('gym_profile')) || {
    name: '', age: 25, gender: 'male', height: 170, weight: 70, activity: '1.55', goal: 'maintain'
};
// ==========================================
// PARTE 2: NAVEGAÇÃO, CONSTRUTOR, TREINO E JOGO
// ==========================================

// --- NAVEGAÇÃO DA ILHA DINÂMICA ---
function toggleIsland() {
    const island = document.getElementById('glass-island');
    island.classList.toggle('collapsed');
}

function navigateIsland(event, id, icon, text) {
    event.stopPropagation();
    document.getElementById('active-icon').innerText = icon;
    document.getElementById('active-text').innerText = text;
    document.getElementById('glass-island').classList.add('collapsed');

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    document.querySelectorAll('.island-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    if (id === 'view-evolucao') { 
        setupChartSelect(); 
        updateGlobalStats(); 
        updateHeatmap(); // Nova função do Mapa de Calor!
    }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); }
    if (id === 'view-dieta') { renderDieta(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
}

// --- CONSTRUTOR DE TREINOS (LABORATÓRIO) ---
function setFatigue(level) {
    builderState.fatigue = level;
    document.querySelectorAll('.fatigue-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-fatigue-${level}`).classList.add('active');
}

function setBuilderMode(mode) {
    builderState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');

    if (mode === 'auto') {
        document.getElementById('auto-focus-panel').style.display = 'block';
        document.getElementById('manual-library-panel').style.display = 'none';
    } else {
        document.getElementById('auto-focus-panel').style.display = 'none';
        document.getElementById('manual-library-panel').style.display = 'block';
        renderLibrary();
    }
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
        } 
        else if (fatigue === 'energized') {
            const sTiers = pool.filter(ex => ex.tier === 'S');
            selectedEx = sTiers.length > 0 ? sTiers[Math.floor(Math.random() * sTiers.length)] : pool[0];
            builderState.routine.push({ name: selectedEx.name, sets: selectedEx.defaultSets });
        } 
        else {
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

function addExerciseToBuilder(name, sets) {
    builderState.routine.push({ name, sets });
    updateBuilderUI();
}

function removeExerciseFromBuilder(index) {
    builderState.routine.splice(index, 1);
    updateBuilderUI();
}

function updateBuilderSets(index, value) {
    builderState.routine[index].sets = parseInt(value) || 1;
    updateBuilderUI(false);
}

function updateBuilderUI(rebuildList = true) {
    const list = document.getElementById('builder-routine-list');
    const badge = document.getElementById('workout-volume-badge');
    const applyBtn = document.getElementById('btn-apply-workout');

    let totalSets = 0;
    if (rebuildList) list.innerHTML = '';

    if (builderState.routine.length === 0) {
        if (rebuildList) list.innerHTML = `<p class="text-center" style="color: var(--muted); font-size: 14px; padding: 20px 0;">Nenhum exercício selecionado ainda.</p>`;
        badge.innerText = `0 Séries`;
        applyBtn.style.display = 'none';
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
    applyBtn.style.display = 'block';
}

function applyBuiltWorkout() {
    if (builderState.routine.length === 0) return;
    workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine));

    const tabsContainer = document.querySelector('#view-treino .tabs');
    if (!document.getElementById('tab-custom')) {
        tabsContainer.innerHTML += `<button id="tab-custom" class="tab-btn" onclick="switchWorkout(event,'CUSTOM')">LAB 🧪</button>`;
    }

    navigateIsland({ currentTarget: document.querySelectorAll('.island-btn')[0], stopPropagation: () => {} }, 'view-treino', '🏋️‍♂️', 'Treinar');
    
    const customTab = document.getElementById('tab-custom');
    if (customTab) customTab.click();
    renderWorkout();
}

// --- LÓGICA DO TREINO ---
function switchWorkout(event, day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(event) event.target.classList.add('active');

    ['PUSH', 'PULL', 'LEGS', 'CUSTOM'].forEach(d => {
        const planDiv = document.getElementById(`plan-${d}`);
        if(planDiv) planDiv.style.display = (d === day) ? 'block' : 'none';
    });
}

function getLastPerformance(exerciseName) {
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].exercises[exerciseName]) return history[i].exercises[exerciseName];
    }
    return null;
}

function renderWorkout() {
    const container = document.getElementById('workout-container');
    container.innerHTML = '';

    ['PUSH', 'PULL', 'LEGS', 'CUSTOM'].forEach(day => {
        let displayStyle = day === currentDay ? 'block' : 'none';
        
        if (day === 'CUSTOM' && workoutData.CUSTOM.length === 0) {
            container.innerHTML += `<div id="plan-CUSTOM" style="display: ${displayStyle}; text-align:center; padding: 30px; color: var(--muted);">Vai à aba Construtor para criares o teu treino de hoje!</div>`;
            return;
        }

        let dayHTML = `<div id="plan-${day}" style="display: ${displayStyle};">`;

        workoutData[day].forEach((ex, exIdx) => {
            const lastPerf = getLastPerformance(ex.name);
            const historyHTML = lastPerf
                ? `<div class="history-badge">Última vez: ${lastPerf[0].weight}kg x ${lastPerf[0].reps} (RIR: ${lastPerf[0].rir !== undefined ? lastPerf[0].rir : '-'})</div>`
                : ``;

            let setsHTML = '';
            for (let s = 1; s <= ex.sets; s++) {
                const pW = lastPerf && lastPerf[s - 1] ? lastPerf[s - 1].weight : '';
                const pR = lastPerf && lastPerf[s - 1] ? lastPerf[s - 1].reps : '';

                setsHTML += `
                <div class="set-row" id="row-${day}-${exIdx}-${s}">
                    <span>S${s}</span>
                    <div class="input-group">
                        <label>KG</label>
                        <input type="number" id="weight-${day}-${exIdx}-${s}" placeholder="${pW}">
                    </div>
                    <div class="input-group">
                        <label>REPS</label>
                        <input type="number" id="reps-${day}-${exIdx}-${s}" placeholder="${pR}">
                    </div>
                    <div class="input-group">
                        <label>RIR</label>
                        <select id="rir-${day}-${exIdx}-${s}">
                            <option value="0">0</option>
                            <option value="1" selected>1</option>
                            <option value="2">2</option>
                            <option value="3">3+</option>
                        </select>
                    </div>
                    <button class="check-btn" onclick="checkSet('${day}', ${exIdx}, ${s})">✔</button>
                </div>`;
            }

            dayHTML += `
            <div class="exercise-card">
                <div class="exercise-name">${ex.name}</div>
                ${historyHTML}
                <div class="exercise-buttons">
                    <button class="exercise-tip-btn" onclick="showExerciseTips('${ex.name}')">📘 Dicas</button>
                    <button class="exercise-video-btn" onclick="showExerciseVideo('${ex.name}')">🎥 Vídeo</button>
                </div>
                ${setsHTML}
            </div>`;
        });

        dayHTML += `</div>`;
        container.innerHTML += dayHTML;
    });
}

function checkSet(day, exIdx, s) {
    document.getElementById(`row-${day}-${exIdx}-${s}`).classList.add('done');
    startTimer(90);
}

function saveCurrentWorkout() {
    const confirmSave = confirm(`Tens a certeza que queres gravar o teu treino de ${currentDay}?`);
    if (!confirmSave) return; 

    const dateObj = new Date();
    const todayString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    const workoutLog = {
        date: todayString,
        day: currentDay,
        exercises: {}
    };

    workoutData[currentDay].forEach((ex, exIdx) => {
        const sets = [];
        for (let s = 1; s <= ex.sets; s++) {
            const weightInput = document.getElementById(`weight-${currentDay}-${exIdx}-${s}`);
            const repsInput = document.getElementById(`reps-${currentDay}-${exIdx}-${s}`);
            const rirInput = document.getElementById(`rir-${currentDay}-${exIdx}-${s}`);

            const weight = parseFloat(weightInput.value || weightInput.placeholder || 0);
            const reps = parseInt(repsInput.value || repsInput.placeholder || 0);
            const rir = parseInt(rirInput.value || 0);

            sets.push({ weight, reps, rir });
        }
        workoutLog.exercises[ex.name] = sets;
    });

    const existingIndex = history.findIndex(h => h.date === todayString);
    if (existingIndex !== -1) {
        const confirmOverwrite = confirm("Já existe um treino gravado hoje. Queres substituir os dados anteriores pelos novos?");
        if (!confirmOverwrite) return; 
        history[existingIndex] = workoutLog;
    } else {
        history.push(workoutLog);
    }

    localStorage.setItem('gym_history', JSON.stringify(history));
    alert('Treino gravado com sucesso! 💪');
    
    if (document.getElementById('view-evolucao').classList.contains('active')) {
        updateGlobalStats();
        updateHeatmap();
    }
}

// --- LÓGICA DO MINI-JOGO DE DESCANSO ---
function startTimer(seconds) {
    clearInterval(timerInterval);
    clearInterval(gameInterval);

    const overlay = document.getElementById('rest-timer-overlay');
    const display = document.getElementById('rest-time-display');
    const scoreDisplay = document.getElementById('game-score');
    const barbell = document.getElementById('barbell');
    
    overlay.style.display = 'flex';
    
    let timeLeft = seconds;
    display.innerText = timeLeft + 's';
    barbellY = 50; barbellVelocity = 0; score = 0; gameTicks = 0;
    scoreDisplay.innerText = score;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        display.innerText = timeLeft + 's';
        if (timeLeft <= 0) endTimer();
    }, 1000);

    gameInterval = setInterval(() => {
        barbellVelocity += 0.8; 
        barbellY += barbellVelocity;
        
        if (barbellY > 90) { barbellY = 90; barbellVelocity = 0; }
        if (barbellY < 10) { barbellY = 10; barbellVelocity = 0; }
        
        barbell.style.top = barbellY + '%';
        
        if (barbellY >= 30 && barbellY <= 70) {
            gameTicks++;
            if(gameTicks % 30 === 0) { score++; scoreDisplay.innerText = score; }
        }
    }, 30);
}

function jumpBarbell() { barbellVelocity = -7; }
function skipTimer() { endTimer(); }
function endTimer() {
    clearInterval(timerInterval);
    clearInterval(gameInterval);
    document.getElementById('rest-timer-overlay').style.display = 'none';
}
// ==========================================
// PARTE 3: PROGRESSO, MAPA DE CALOR, CALENDÁRIO E BACKUP
// ==========================================

// --- MAPA DE CALOR MUSCULAR (HEATMAP) ---
function updateHeatmap() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Contadores de séries por músculo nos últimos 7 dias
    let volume = {
        'Peito': 0, 'Costas': 0, 'Pernas': 0, 'Ombros': 0, 'Braços': 0, 'Core': 0
    };

    history.forEach(log => {
        const logDate = new Date(log.date);
        if (logDate >= sevenDaysAgo && logDate <= now) {
            Object.entries(log.exercises).forEach(([exName, sets]) => {
                let muscle = getMuscleForExercise(exName);
                if (volume[muscle] !== undefined) {
                    volume[muscle] += sets.length; // Conta cada série realizada
                }
            });
        }
    });

    // Função que decide a cor consoante o volume (séries)
    function getColor(sets) {
        if (sets === 0) return '#334155'; // Descansado (Cinzento)
        if (sets <= 6) return '#eab308';  // Leve (Amarelo)
        if (sets <= 12) return '#f97316'; // Médio (Laranja)
        return '#ef4444';                 // Fritado (Vermelho)
    }

    const c = {
        peito: getColor(volume['Peito']),
        costas: getColor(volume['Costas']),
        pernas: getColor(volume['Pernas']),
        ombros: getColor(volume['Ombros']),
        bracos: getColor(volume['Braços']),
        core: getColor(volume['Core'])
    };

    // Pintar SVG Frente
    const hmPeito = document.getElementById('hm-peito');
    if(hmPeito) {
        hmPeito.setAttribute('fill', c.peito);
        document.getElementById('hm-ombros-l').setAttribute('fill', c.ombros);
        document.getElementById('hm-ombros-r').setAttribute('fill', c.ombros);
        document.getElementById('hm-biceps-l').setAttribute('fill', c.bracos);
        document.getElementById('hm-biceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-quads-l').setAttribute('fill', c.pernas);
        document.getElementById('hm-quads-r').setAttribute('fill', c.pernas);
        document.getElementById('hm-core').setAttribute('fill', c.core);
        
        // Pintar SVG Costas
        document.getElementById('hm-costas').setAttribute('fill', c.costas);
        document.getElementById('hm-triceps-l').setAttribute('fill', c.bracos);
        document.getElementById('hm-triceps-r').setAttribute('fill', c.bracos);
        document.getElementById('hm-femorais-l').setAttribute('fill', c.pernas);
        document.getElementById('hm-femorais-r').setAttribute('fill', c.pernas);
        document.getElementById('hm-gemeos-l').setAttribute('fill', c.pernas);
        document.getElementById('hm-gemeos-r').setAttribute('fill', c.pernas);
    }
}

// --- PROGRESSO E ESTATÍSTICAS ---
function setupChartSelect() {
    const select = document.getElementById('exercise-select');
    select.innerHTML = '<option value="">Escolhe um exercício...</option>';
    const uniqueExercises = new Set();

    history.forEach(log => {
        Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex));
    });

    uniqueExercises.forEach(ex => {
        select.innerHTML += `<option value="${ex}">${ex}</option>`;
    });
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value;
    if (!exercise) return;

    const labels = [];
    const data = [];
    const reps = [];

    history.forEach(log => {
        if (log.exercises[exercise]) {
            labels.push(log.date);
            data.push(log.exercises[exercise][0].weight);
            reps.push(log.exercises[exercise][0].reps);
        }
    });

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById('progressChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Carga (kg)',
                data,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56,189,248,0.2)',
                fill: true,
                tension: 0.3
            }]
        }
    });

    const maxWeight = Math.max(...data);
    const maxReps = Math.max(...reps);
    const estimated1RM = Math.round(maxWeight * (1 + maxReps / 30));

    let totalVolume = 0;
    history.forEach(log => {
        if (log.exercises[exercise]) {
            log.exercises[exercise].forEach(set => {
                totalVolume += set.weight * set.reps;
            });
        }
    });

    let coach = '';
    if (data.length >= 3) {
        const last = data[data.length - 1];
        const previous = data[data.length - 2];
        if (last > previous) {
            coach = '📈 Excelente progressão recente.';
        } else {
            coach = '⚠️ Sem progressão recente. Considera ajustar volume ou recuperação.';
        }
    } else {
        coach = '📊 Ainda há poucos dados para análise.';
    }

    document.getElementById('coach-message').innerText = coach;
    document.getElementById('pr-display').innerHTML = `
        <h3>🏆 PRs</h3>
        <br>
        <p><strong>Maior carga:</strong> ${maxWeight} kg</p>
        <p><strong>Maior reps:</strong> ${maxReps}</p>
        <p><strong>1RM estimado:</strong> ${estimated1RM} kg</p>
        <p><strong>Volume acumulado:</strong> ${Math.round(totalVolume)} kg</p>
    `;
}

function updateGlobalStats() {
    let totalWorkouts = history.length;
    let totalSets = 0;
    let totalVolume = 0;
    let exercisesDone = {};

    history.forEach(log => {
        Object.entries(log.exercises).forEach(([exercise, sets]) => {
            if (!exercisesDone[exercise]) {
                exercisesDone[exercise] = 0;
            }
            exercisesDone[exercise]++;
            totalSets += sets.length;
            sets.forEach(set => {
                totalVolume += set.weight * set.reps;
            });
        });
    });

    let favoriteExercise = 'Nenhum';
    if (Object.keys(exercisesDone).length > 0) {
        favoriteExercise = Object.keys(exercisesDone).reduce((a, b) => exercisesDone[a] > exercisesDone[b] ? a : b);
    }

    document.getElementById('global-stats').innerHTML = `
        <h3>📊 Estatísticas Globais</h3>
        <br>
        <p><strong>Total de treinos:</strong> ${totalWorkouts}</p>
        <p><strong>Total de séries:</strong> ${totalSets}</p>
        <p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p>
        <p><strong>Exercício favorito:</strong> ${favoriteExercise}</p>
    `;
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const title = document.getElementById('calendar-title');

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    title.innerText = `${monthNames[month]} ${year}`;

    for (let i = 0; i < startDay; i++) {
        grid.innerHTML += '<div class="day-box empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const trained = history.some(h => h.date === dateString);

        grid.innerHTML += `
        <div class="day-box ${trained ? 'trained' : ''}" onclick="toggleTrainingDay('${dateString}')">
            ${day}
        </div>`;
    }

    updateWeeklyGoal();
    updateMonthlyGoal();
}

function toggleTrainingDay(dateString) {
    const existing = history.find(h => h.date === dateString);

    if (existing) {
        if (existing.exercises && Object.keys(existing.exercises).length > 0) {
            const confirmDelete = confirm("⚠️ Este dia tem um treino gravado com séries reais. Tens a certeza que queres APAGAR todos os dados deste dia?");
            if (!confirmDelete) return;
        }
        history = history.filter(h => h.date !== dateString);
    } else {
        history.push({
            date: dateString,
            day: 'MANUAL',
            exercises: {}
        });
    }

    localStorage.setItem('gym_history', JSON.stringify(history));
    renderCalendar();
    
    if (document.getElementById('view-evolucao').classList.contains('active')) {
        updateGlobalStats();
        updateHeatmap();
    }
}

function updateWeeklyGoal() {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    let weekly = 0;

    history.forEach(log => {
        const date = new Date(log.date);
        if (date >= sevenDaysAgo && date <= now) {
            weekly++;
        }
    });

    document.getElementById('weekly-count').innerText = weekly;
    document.getElementById('weekly-progress').style.width = `${Math.min(weekly, 6) / 6 * 100}%`;
}

function updateMonthlyGoal() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    let monthly = 0;

    history.forEach(log => {
        const date = new Date(log.date);
        if (date.getFullYear() === year && date.getMonth() === month) {
            monthly++;
        }
    });

    const goal = 24;
    document.getElementById('monthly-count').innerText = monthly;
    document.getElementById('monthly-progress').style.width = `${Math.min(monthly, goal) / goal * 100}%`;
}

function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar();
}

// --- DICAS E VÍDEOS ---
function shareWorkout() {
    const text = `💪 Acabei o treino de ${currentDay}!`;
    if (navigator.share) {
        navigator.share({ text });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function showExerciseTips(exerciseName) {
    document.getElementById('modal-title').innerText = exerciseName;
    document.getElementById('modal-content').innerText = "Foca-te na execução perfeita e numa descida (fase excêntrica) bem controlada para maximizar os teus ganhos!";
    document.getElementById('exercise-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('exercise-modal').style.display = 'none';
}

function showExerciseVideo(exerciseName) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial+execução`;
    window.open(url, '_blank');
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

    localStorage.setItem('gym_profile', JSON.stringify(userProfile));

    document.getElementById('height-val').innerText = userProfile.height;
    document.getElementById('weight-val').innerText = userProfile.weight;

    const heightM = userProfile.height / 100;
    const bmi = userProfile.weight / (heightM * heightM);
    document.getElementById('calc-bmi').innerText = bmi.toFixed(1);

    let bmiStatus = "Normal";
    let bmiColor = "var(--success)";
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
    
    scaleX = Math.max(0.6, Math.min(scaleX, 1.8));
    scaleY = Math.max(0.7, Math.min(scaleY, 1.4));

    if(avatar) avatar.style.transform = `scale(${scaleX}, ${scaleY})`;

    renderDieta();
}

function renderDieta() {
    const calsElement = document.getElementById('calc-cals');
    if(!calsElement) return;
    let tdee = parseInt(calsElement.innerText) || 0;
    let weight = userProfile.weight;
    let goal = userProfile.goal;

    if (tdee === 0) return;

    let protein = Math.round(weight * 2.2);
    let fat = Math.round(weight * (goal === 'cut' ? 0.8 : 1.0));
    let proteinCals = protein * 4;
    let fatCals = fat * 9;
    let leftoverCals = tdee - (proteinCals + fatCals);
    let carbs = Math.max(0, Math.round(leftoverCals / 4));

    document.getElementById('macro-pro').innerText = protein + 'g';
    document.getElementById('macro-car').innerText = carbs + 'g';
    document.getElementById('macro-fat').innerText = fat + 'g';

    let waterMl = (weight * 35);
    if(userProfile.activity >= 1.55) waterMl += 500;
    document.getElementById('water-goal').innerText = (waterMl / 1000).toFixed(1) + ' L';

    let advice = "";
    if (goal === 'cut') {
        advice = "💡 Foco total no défice calórico! Privilegia alimentos com muito volume e poucas calorias para manter a saciedade. A proteína alta vai garantir que manténs a massa muscular.";
    } else if (goal === 'bulk') {
        advice = "💡 Estás em modo de construção! Se tiveres dificuldade em comer todas essas calorias, opta por alimentos densos como manteiga de amendoim, azeite, frutos secos e batidos líquidos.";
    } else {
        advice = "💡 Manutenção e recomposição: O equilíbrio perfeito. O teu objetivo é treinar pesado para dar o estímulo aos músculos, usando estas calorias para recuperar.";
    }
    
    document.getElementById('diet-advisor').innerText = advice;
}

// --- SISTEMA DE BACKUP ---
function exportData() {
    const data = {
        history: history,
        profile: userProfile
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.download = `gym_tracker_backup_${date}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.history) {
                history = data.history;
                localStorage.setItem('gym_history', JSON.stringify(history));
            }
            if (data.profile) {
                userProfile = data.profile;
                localStorage.setItem('gym_profile', JSON.stringify(userProfile));
            }
            
            alert('✅ Backup carregado com sucesso! A página vai recarregar para aplicar os dados.');
            location.reload(); 
        } catch (error) {
            alert('❌ Erro ao ler o ficheiro. Confirma se é o ficheiro de backup correto.');
        }
    };
    reader.readAsText(file);
}

// Inicia a aplicação
renderWorkout();
renderProfile();
updateHeatmap();
