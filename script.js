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

// Identificador Inteligente de Músculos
function getMuscleForExercise(name) {
    let found = exerciseLibrary.find(ex => ex.name === name);
    if (found) return found.muscle;
    
    let lower = name.toLowerCase();
    if (lower.includes('supino') || lower.includes('chest') || lower.includes('peck') || lower.includes('crossover')) return 'Peito';
    if (lower.includes('puxada') || lower.includes('remada') || lower.includes('pullover') || lower.includes('pull-up') || lower.includes('costas') || lower.includes('delt fly')) return 'Costas';
    if (lower.includes('leg') || lower.includes('agachamento') || lower.includes('peso morto') || lower.includes('gémeos') || lower.includes('flexão') || lower.includes('extensão')) return 'Pernas';
    if (lower.includes('press') || lower.includes('elevações laterais') || lower.includes('ombros') || lower.includes('voos')) return 'Ombros';
    if (lower.includes('curl') || lower.includes('tríceps') || lower.includes('bíceps') || lower.includes('braços') || lower.includes('skullcrushers') || lower.includes('pushdown')) return 'Braços';
    return 'Core';
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

// NOVO: Estado do Beast Mode
let beastState = {
    active: false,
    exIdx: 0,
    setIdx: 0
};

// Variável do Perfil
let userProfile = JSON.parse(localStorage.getItem('gym_profile')) || {
    name: '', age: 25, gender: 'male', height: 170, weight: 70, activity: '1.55', goal: 'maintain'
};
// ==========================================
// PARTE 2: BEAST MODE, NAVEGAÇÃO E CONSTRUTOR
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
        updateHeatmap(); 
    }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); }
    if (id === 'view-dieta') { renderDieta(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
}

function getLastPerformance(exerciseName) {
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].exercises[exerciseName]) return history[i].exercises[exerciseName];
    }
    return null;
}

// --- BEAST MODE (FOCO IMERSIVO) 🦍 ---
function startBeastMode() {
    const exercises = workoutData[currentDay];
    if (!exercises || exercises.length === 0) {
        alert('Não há exercícios para este dia! Usa o Construtor para criar um treino.');
        return;
    }
    beastState.active = true;
    beastState.exIdx = 0;
    beastState.setIdx = 1;
    document.getElementById('beast-mode-overlay').style.display = 'flex';
    renderBeastMode();
}

function renderBeastMode() {
    const exercises = workoutData[currentDay];
    if (beastState.exIdx >= exercises.length) {
        alert('TREINO CONCLUÍDO! 🦍 Não te esqueças de o gravar!');
        exitBeastMode();
        return;
    }

    const ex = exercises[beastState.exIdx];
    document.getElementById('beast-progress-text').innerText = `Exercício ${beastState.exIdx + 1}/${exercises.length} - Série ${beastState.setIdx}/${ex.sets}`;
    document.getElementById('beast-exercise-name').innerText = ex.name;

    const weightInput = document.getElementById('beast-weight');
    const repsInput = document.getElementById('beast-reps');
    
    weightInput.value = '';
    repsInput.value = '';

    const lastPerf = getLastPerformance(ex.name);
    if (lastPerf) {
        document.getElementById('beast-history-badge').innerText = `Última vez: ${lastPerf[0].weight}kg x ${lastPerf[0].reps}`;
        let prevSet = lastPerf[beastState.setIdx - 1] || lastPerf[0];
        weightInput.placeholder = prevSet.weight;
        repsInput.placeholder = prevSet.reps;
    } else {
        document.getElementById('beast-history-badge').innerText = `Sem registos anteriores`;
        weightInput.placeholder = '0';
        repsInput.placeholder = '0';
    }
}

function completeBeastSet() {
    // Feedback tátil (vibração) se o telemóvel suportar
    if ("vibrate" in navigator) navigator.vibrate(200);

    const exercises = workoutData[currentDay];
    const ex = exercises[beastState.exIdx];
    
    // Ler valores do Beast Mode
    const bw = document.getElementById('beast-weight').value || document.getElementById('beast-weight').placeholder;
    const br = document.getElementById('beast-reps').value || document.getElementById('beast-reps').placeholder;
    const brir = document.getElementById('beast-rir').value;

    // Sincronizar com os inputs escondidos da aba de treino normal
    const mainW = document.getElementById(`weight-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    const mainR = document.getElementById(`reps-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    const mainRir = document.getElementById(`rir-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);

    if (mainW) mainW.value = bw;
    if (mainR) mainR.value = br;
    if (mainRir) mainRir.value = brir;

    // Adicionar a classe "done" na vista normal
    const row = document.getElementById(`row-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    if(row) row.classList.add('done');

    // Avançar a série ou exercício
    beastState.setIdx++;
    if (beastState.setIdx > ex.sets) {
        beastState.exIdx++;
        beastState.setIdx = 1;
    }

    // Iniciar temporizador de descanso, se não tiver acabado o treino
    if (beastState.exIdx < exercises.length) {
        startTimer(90); 
        renderBeastMode();
    } else {
        alert('MISSÃO CUMPRIDA! 🦍 Bom trabalho. Grava o teu treino!');
        exitBeastMode();
    }
}

function prevBeastExercise() {
    if (beastState.exIdx > 0) {
        beastState.exIdx--;
        beastState.setIdx = 1;
        renderBeastMode();
    }
}

function nextBeastExercise() {
    const exercises = workoutData[currentDay];
    if (beastState.exIdx < exercises.length - 1) {
        beastState.exIdx++;
        beastState.setIdx = 1;
        renderBeastMode();
    }
}

function exitBeastMode() {
    beastState.active = false;
    document.getElementById('beast-mode-overlay').style.display = 'none';
    renderWorkout(); // Força a atualização da vista normal do treino
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
// ==========================================
// PARTE 3: PROGRESSO, MAPA DE CALOR, CALENDÁRIO, DIETA E BACKUP
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
    if (!select) return;
    select.innerHTML = '<option value="">Escolhe um exercício...</option>';
    const uniqueExercises = new Set();
    history.forEach(log => { Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); });
    uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
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

    const maxWeight = Math.max(...data, 0);
    const maxReps = Math.max(...reps, 0);
    const estimated1RM = Math.round(maxWeight * (1 + maxReps / 30));

    let totalVolume = 0;
    history.forEach(log => {
        if (log.exercises[exercise]) log.exercises[exercise].forEach(set => totalVolume += set.weight * set.reps);
    });

    let coach = data.length >= 3 
        ? (data[data.length - 1] > data[data.length - 2] ? '📈 Excelente progressão recente.' : '⚠️ Sem progressão recente. Considera ajustar volume ou recuperação.') 
        : '📊 Ainda há poucos dados para análise.';

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
            if (!exercisesDone[exercise]) exercisesDone[exercise] = 0;
            exercisesDone[exercise]++;
            totalSets += sets.length;
            sets.forEach(set => totalVolume += set.weight * set.reps);
        });
    });

    let fav = Object.keys(exercisesDone).length > 0 ? Object.keys(exercisesDone).reduce((a, b) => exercisesDone[a] > exercisesDone[b] ? a : b) : 'Nenhum';
    document.getElementById('global-stats').innerHTML = `
        <h3>📊 Estatísticas Globais</h3>
        <br>
        <p><strong>Total de treinos:</strong> ${totalWorkouts}</p>
        <p><strong>Total de séries:</strong> ${totalSets}</p>
        <p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p>
        <p><strong>Exercício favorito:</strong> ${fav}</p>
    `;
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
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


// ==========================================
// PARTE 4: CALCULADORA DE DISCOS (PLATE MATH)
// ==========================================

function openPlateMath(targetWeightStr) {
    const targetWeight = parseFloat(targetWeightStr);
    
    // A barra pesa 20kg, logo se o peso for menor ou igual, não há discos a adicionar
    if (!targetWeight || targetWeight <= 20) {
        alert('Por favor, insere um peso superior a 20kg (peso da barra).');
        return;
    }

    document.getElementById('plate-target-weight').innerText = targetWeight;
    
    // Configuração dos discos padrão de ginásio (peso, cor CSS, altura visual)
    const plates = [
        { weight: 25, color: '#ef4444', height: '100px' },  // Vermelho
        { weight: 20, color: '#3b82f6', height: '90px' },   // Azul
        { weight: 15, color: '#eab308', height: '80px' },   // Amarelo
        { weight: 10, color: '#22c55e', height: '70px' },   // Verde
        { weight: 5, color: '#f8fafc', height: '50px' },    // Branco
        { weight: 2.5, color: '#334155', height: '40px' },  // Cinza Escuro
        { weight: 1.25, color: '#94a3b8', height: '30px' }  // Cinza Claro
    ];

    // O peso a colocar DE CADA LADO da barra
    let weightPerSide = (targetWeight - 20) / 2;
    let resultHTML = '';
    let visualHTML = '';

    // Algoritmo guloso: tenta sempre colocar os discos mais pesados primeiro
    plates.forEach(plate => {
        let count = Math.floor(weightPerSide / plate.weight);
        if (count > 0) {
            // 1. Adicionar o texto com as quantidades
            resultHTML += `
            <div class="plate-row">
                <div class="plate-info">
                    <div class="plate-color-box" style="background: ${plate.color};"></div>
                    Disco de ${plate.weight}kg
                </div>
                <span class="plate-qty">${count}x</span>
            </div>`;

            // 2. Adicionar os retângulos coloridos ao desenho da barra
            for(let i = 0; i < count; i++) {
                visualHTML += `<div style="width:12px; height:${plate.height}; background:${plate.color}; border-radius:3px; border:1px solid #000;"></div>`;
            }

            // Subtrair o peso adicionado e limpar erros de ponto flutuante do JavaScript
            weightPerSide -= count * plate.weight;
            weightPerSide = Math.round(weightPerSide * 100) / 100;
        }
    });

    if (resultHTML === '') {
        resultHTML = '<p style="color:var(--muted); text-align:center;">Não são necessários discos adicionais.</p>';
    }

    document.getElementById('plate-math-result').innerHTML = resultHTML;
    document.getElementById('visual-plates').innerHTML = visualHTML; // O desenho dos discos
    document.getElementById('plate-math-modal').style.display = 'flex';
}

function closePlateMath() {
    document.getElementById('plate-math-modal').style.display = 'none';
}

// ==========================================
// PARTE 5: ROTINAS GUARDADAS (OS TEUS CLÁSSICOS)
// ==========================================

let savedRoutines = JSON.parse(localStorage.getItem('gym_saved_routines')) || [];

// Modificar a função de mudar de modo no Laboratório para incluir os "Salvos"
const originalSetBuilderMode = setBuilderMode;
setBuilderMode = function(mode) {
    builderState.mode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-mode-${mode}`).classList.add('active');

    document.getElementById('auto-focus-panel').style.display = 'none';
    document.getElementById('manual-library-panel').style.display = 'none';
    document.getElementById('saved-routines-panel').style.display = 'none';

    if (mode === 'auto') {
        document.getElementById('auto-focus-panel').style.display = 'block';
    } else if (mode === 'manual') {
        document.getElementById('manual-library-panel').style.display = 'block';
        renderLibrary();
    } else if (mode === 'saved') {
        document.getElementById('saved-routines-panel').style.display = 'block';
        renderSavedRoutines();
    }
};

// Modificar a UI do construtor para mostrar/esconder o botão de guardar
const originalUpdateBuilderUI = updateBuilderUI;
updateBuilderUI = function(rebuildList = true) {
    originalUpdateBuilderUI(rebuildList);
    
    const actionBtns = document.getElementById('builder-action-buttons');
    const oldApplyBtn = document.getElementById('btn-apply-workout');
    
    if (oldApplyBtn) oldApplyBtn.style.display = 'none'; // Esconder o botão antigo isolado
    
    if (builderState.routine.length > 0) {
        actionBtns.style.display = 'flex';
    } else {
        actionBtns.style.display = 'none';
    }
};

function saveCurrentRoutine() {
    if (builderState.routine.length === 0) return;
    
    const routineName = prompt("Que nome queres dar a esta rotina épica? (ex: Peito Fritado)");
    if (!routineName) return;

    savedRoutines.push({
        name: routineName,
        routine: JSON.parse(JSON.stringify(builderState.routine))
    });

    localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines));
    alert('✅ Rotina guardada com sucesso! Podes encontrá-la na aba "Salvos".');
}

function renderSavedRoutines() {
    const list = document.getElementById('saved-routines-list');
    list.innerHTML = '';

    if (savedRoutines.length === 0) {
        list.innerHTML = `<p class="text-center" style="color: var(--muted); font-size: 14px; padding: 20px 0;">Ainda não tens rotinas guardadas. Constrói uma e clica em "Guardar".</p>`;
        return;
    }

    savedRoutines.forEach((item, index) => {
        let totalSets = item.routine.reduce((sum, ex) => sum + parseInt(ex.sets), 0);
        
        list.innerHTML += `
        <div class="built-item" style="border: 1px solid #334155;">
            <div class="built-item-info">
                <span class="built-item-title" style="color: var(--accent); font-size: 16px;">${item.name}</span>
                <span style="font-size: 11px; color: var(--muted);">${item.routine.length} Exercícios | ${totalSets} Séries</span>
            </div>
            <div class="built-item-controls" style="gap: 5px;">
                <button class="add-btn" style="width: auto; padding: 0 10px;" onclick="loadSavedRoutine(${index})">CARREGAR</button>
                <button class="remove-btn" onclick="deleteSavedRoutine(${index})">✖</button>
            </div>
        </div>`;
    });
}

function loadSavedRoutine(index) {
    builderState.routine = JSON.parse(JSON.stringify(savedRoutines[index].routine));
    updateBuilderUI();
    alert(`⚡ Rotina "${savedRoutines[index].name}" carregada para o Esboço!`);
}

function deleteSavedRoutine(index) {
    if (confirm("Tens a certeza que queres apagar esta rotina?")) {
        savedRoutines.splice(index, 1);
        localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines));
        renderSavedRoutines();
    }
}

// ==========================================
// PARTE 6: COACH DE VOZ INVISÍVEL 🎧🤖
// ==========================================

let voiceCoachActive = false;

function toggleVoiceCoach() {
    voiceCoachActive = !voiceCoachActive;
    const btn = document.getElementById('voice-coach-btn');
    
    if (btn) {
        btn.innerText = voiceCoachActive ? "🎧 Voz: LIGADA" : "🔇 Voz: DESLIGADA";
        btn.style.color = voiceCoachActive ? "var(--success)" : "var(--muted)";
    }
    
    if (voiceCoachActive) {
        speakVoiceCoach("Assistente de voz ativado. Foco total no treino, campeão!");
    }
}

function speakVoiceCoach(text) {
    if (!('speechSynthesis' in window)) {
        console.log("O teu navegador não suporta comandos de voz offline.");
        return;
    }
    // Cancelar qualquer fala em andamento para não encavalar o áudio
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT'; // Sotaque de Portugal 🇵🇹
    utterance.rate = 0.95;    // Velocidade ligeiramente cadenciada para soar natural
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
}

function triggerVoiceWarning() {
    // Só faz o anúncio se estivermos a treinar ativamente no Beast Mode
    if (!beastState.active) return;
    
    const exercises = workoutData[currentDay];
    const ex = exercises[beastState.exIdx];
    if (!ex) return;
    
    // Tenta ir buscar o peso inserido ou o placeholder planeado
    const weightInput = document.getElementById('beast-weight');
    const weight = weightInput ? (weightInput.value || weightInput.placeholder || '0') : '0';
    
    const phrase = `Prepara-te. Próxima série de ${ex.name}, com ${weight} quilos. Vamos a isto!`;
    speakVoiceCoach(phrase);
}

// REDEFINIÇÃO DO TEMPORIZADOR (Substitui o antigo automaticamente de forma segura)
function startTimer(seconds) {
    clearInterval(timerInterval);
    clearInterval(gameInterval);

    const overlay = document.getElementById('rest-timer-overlay');
    const display = document.getElementById('rest-time-display');
    const scoreDisplay = document.getElementById('game-score');
    const barbell = document.getElementById('barbell');
    
    if (overlay) overlay.style.display = 'flex';
    
    let timeLeft = seconds;
    if (display) display.innerText = timeLeft + 's';
    
    barbellY = 50; barbellVelocity = 0; score = 0; gameTicks = 0;
    if (scoreDisplay) scoreDisplay.innerText = score;
    
    let spokeWarning = false;

    timerInterval = setInterval(() => {
        timeLeft--;
        if (display) display.innerText = timeLeft + 's';
        
        // Disparar o Coach de Voz exatamente aos 10 segundos restantes
        if (timeLeft === 10 && voiceCoachActive && !spokeWarning) {
            spokeWarning = true;
            triggerVoiceWarning();
        }

        if (timeLeft <= 0) {
            endTimer();
        }
    }, 1000);

    gameInterval = setInterval(() => {
        barbellVelocity += 0.8; 
        barbellY += barbellVelocity;
        
        if (barbellY > 90) { barbellY = 90; barbellVelocity = 0; }
        if (barbellY < 10) { barbellY = 10; barbellVelocity = 0; }
        
        if (barbell) barbell.style.top = barbellY + '%';
        
        if (barbellY >= 30 && barbellY <= 70) {
            gameTicks++;
            if(gameTicks % 30 === 0) {
                score++;
                if (scoreDisplay) scoreDisplay.innerText = score;
            }
        }
    }, 30);
}
