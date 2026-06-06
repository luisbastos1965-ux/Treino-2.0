// ==========================================
// PARTE 1: BASES DE DADOS E VARIÁVEIS GLOBAIS
// ==========================================

let workoutData = {
    PUSH: [
        { name: 'Supino Inclinado c/ Halteres', sets: 3 },
        { name: 'Supino Plano na Máquina (Chest Press)', sets: 3 },
        { name: 'Press Militar c/ Halteres (Sentado)', sets: 3 },
        { name: 'Elevações Laterais na Polia', sets: 4 },
        { name: 'Tríceps à Testa com Barra EZ', sets: 3 },
        { name: 'Tríceps na Polia com Corda', sets: 3 }
    ],
    PULL: [
        { name: 'Puxada Vertical na Polia Alta', sets: 3 },
        { name: 'Remada Sentada com Cabo', sets: 3 },
        { name: 'Remada Inclinada c/ Halteres', sets: 3 },
        { name: 'Voos Posteriores (Rear Delt Fly)', sets: 4 },
        { name: 'Curl de Bíceps Inclinado c/ Halteres', sets: 3 },
        { name: 'Curl Martelo (Hammer Curl)', sets: 3 }
    ],
    LEGS: [
        { name: 'Leg Press 45º', sets: 4 },
        { name: 'Peso Morto Romeno (RDL)', sets: 3 },
        { name: 'Extensão de Pernas', sets: 3 },
        { name: 'Flexão de Pernas (Leg Curl)', sets: 3 },
        { name: 'Elevação de Gémeos em Pé', sets: 4 }
    ],
    CUSTOM: [] // Onde vamos guardar o treino gerado no Construtor
};

// A GRANDE BIBLIOTECA DE EXERCÍCIOS
const exerciseLibrary = [
    // --- PEITO ---
    { name: "Supino Plano com Barra", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 },
    { name: "Supino Inclinado c/ Halteres", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 },
    { name: "Chest Press na Máquina", muscle: "Peito", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Peck Deck / Voador", muscle: "Peito", tier: "B", type: "machine", defaultSets: 3 },
    { name: "Crossover na Polia (Cabos)", muscle: "Peito", tier: "A", type: "machine", defaultSets: 4 },
    
    // --- COSTAS ---
    { name: "Elevações (Pull-ups)", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Puxada Vertical na Polia Alta", muscle: "Costas", tier: "S", type: "machine", defaultSets: 3 },
    { name: "Remada com Barra (Barbell Row)", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Remada Sentada com Cabo", muscle: "Costas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Pullover na Polia Alta", muscle: "Costas", tier: "B", type: "machine", defaultSets: 3 },

    // --- PERNAS ---
    { name: "Agachamento Livre (Barra)", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Leg Press 45º", muscle: "Pernas", tier: "S", type: "machine", defaultSets: 4 },
    { name: "Peso Morto Romeno (RDL)", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 },
    { name: "Extensão de Pernas (Leg Ext)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Mesa Flexora (Leg Curl)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 },
    { name: "Bulgarian Split Squats", muscle: "Pernas", tier: "A", type: "free", defaultSets: 3 },
    { name: "Elevação de Gémeos", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 },

    // --- OMBROS ---
    { name: "Press Militar (Barra ou Halteres)", muscle: "Ombros", tier: "S", type: "free", defaultSets: 3 },
    { name: "Elevações Laterais", muscle: "Ombros", tier: "S", type: "free", defaultSets: 4 },
    { name: "Voos Posteriores (Rear Delt Fly)", muscle: "Ombros", tier: "A", type: "machine", defaultSets: 4 },
    
    // --- BRAÇOS ---
    { name: "Curl de Bíceps c/ Barra", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Curl Martelo (Hammer Curl)", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Tríceps à Testa (Skullcrushers)", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 },
    { name: "Tríceps Pushdown (Polia)", muscle: "Braços", tier: "S", type: "machine", defaultSets: 3 }
];

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
    fatigue: 'energized', // 'energized', 'normal', 'tired'
    mode: 'auto',         // 'auto', 'manual'
    routine: []           // Exercícios selecionados
};

// Variável do Perfil
let userProfile = JSON.parse(localStorage.getItem('gym_profile')) || {
    name: '', age: 25, gender: 'male', height: 170, weight: 70, activity: '1.55', goal: 'maintain'
};
// ==========================================
// PARTE 2: NAVEGAÇÃO, TREINO, GRAVAÇÃO E JOGO
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

    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); }
    if (id === 'view-dieta') { renderDieta(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
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
        if (history[i].exercises[exerciseName]) {
            return history[i].exercises[exerciseName];
        }
    }
    return null;
}

function renderWorkout() {
    const container = document.getElementById('workout-container');
    container.innerHTML = '';

    // Agora incluímos o dia "CUSTOM" que vem do construtor
    ['PUSH', 'PULL', 'LEGS', 'CUSTOM'].forEach(day => {
        let displayStyle = day === currentDay ? 'block' : 'none';
        
        // Se for o CUSTOM e estiver vazio, mostramos uma mensagem
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

// --- GRAVAÇÃO DE TREINOS ---
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
// PARTE 3: CONSTRUTOR, PROGRESSO, PERFIL E BACKUP
// ==========================================

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
    builderState.routine = []; // Limpar o esboço atual

    // Lógica de Mapeamento do Foco
    let targetMuscles = [];
    if (focus === 'PUSH') targetMuscles = ['Peito', 'Ombros', 'Braços']; // Braços aqui = Tríceps, o gerador filtra depois
    if (focus === 'PULL') targetMuscles = ['Costas', 'Ombros', 'Braços']; // Braços = Bíceps
    if (focus === 'LEGS') targetMuscles = ['Pernas'];
    if (focus === 'FULL') targetMuscles = ['Pernas', 'Peito', 'Costas', 'Ombros'];

    targetMuscles.forEach(muscle => {
        // Filtrar a biblioteca por músculo
        let pool = exerciseLibrary.filter(ex => ex.muscle === muscle);
        
        // Ajuste no número de séries e escolha do exercício baseado na fadiga
        let selectedEx;
        if (fatigue === 'tired') {
            // Cansado: Prefere Máquinas, Grau A ou B. Menos fadiga do sistema nervoso.
            const machines = pool.filter(ex => ex.type === 'machine');
            selectedEx = machines.length > 0 ? machines[Math.floor(Math.random() * machines.length)] : pool[0];
            
            // Reduz 1 série por estar cansado
            let sets = Math.max(2, selectedEx.defaultSets - 1);
            builderState.routine.push({ name: selectedEx.name, sets: sets });
        } 
        else if (fatigue === 'energized') {
            // Energizado: Pega sempre nos S-Tier e Pesos Livres primeiro
            const sTiers = pool.filter(ex => ex.tier === 'S');
            selectedEx = sTiers.length > 0 ? sTiers[Math.floor(Math.random() * sTiers.length)] : pool[0];
            builderState.routine.push({ name: selectedEx.name, sets: selectedEx.defaultSets });
        } 
        else {
            // Normal: Mistura aleatória dos melhores
            selectedEx = pool[Math.floor(Math.random() * pool.length)];
            builderState.routine.push({ name: selectedEx.name, sets: selectedEx.defaultSets });
        }

        // Adicionar um segundo exercício para músculos grandes se for focado
        if (focus !== 'FULL' && (muscle === 'Peito' || muscle === 'Costas' || muscle === 'Pernas')) {
            let secondEx = pool.filter(ex => ex.name !== selectedEx.name)[0];
            if (secondEx) {
                let sets = fatigue === 'tired' ? Math.max(2, secondEx.defaultSets - 1) : secondEx.defaultSets;
                builderState.routine.push({ name: secondEx.name, sets: sets });
            }
        }
    });

    // Se for Push/Pull/Arms, forçar filtragem específica (ex: PUSH só puxa Tríceps da aba Braços)
    if (focus === 'PUSH') {
        builderState.routine = builderState.routine.filter(ex => !ex.name.includes('Bíceps') && !ex.name.includes('Curl'));
    }
    if (focus === 'PULL') {
        builderState.routine = builderState.routine.filter(ex => !ex.name.includes('Tríceps'));
    }

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
    updateBuilderUI(false); // Falso para não perder o foco do teclado
}

function updateBuilderUI(rebuildList = true) {
    const list = document.getElementById('builder-routine-list');
    const badge = document.getElementById('workout-volume-badge');
    const applyBtn = document.getElementById('btn-apply-workout');

    let totalSets = 0;
    
    if (rebuildList) list.innerHTML = '';

    if (builderState.routine.length === 0) {
        list.innerHTML = `<p class="text-center" style="color: var(--muted); font-size: 14px; padding: 20px 0;">Nenhum exercício selecionado ainda.</p>`;
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

    // Guarda na variável global 'CUSTOM'
    workoutData.CUSTOM = JSON.parse(JSON.stringify(builderState.routine));

    // Adiciona o botão "CUSTOM" na UI do treino, se não existir
    const tabsContainer = document.querySelector('#view-treino .tabs');
    if (!document.getElementById('tab-custom')) {
        tabsContainer.innerHTML += `<button id="tab-custom" class="tab-btn" onclick="switchWorkout(event,'CUSTOM')">LAB 🧪</button>`;
    }

    // Muda a interface para o ecrã de treino
    navigateIsland({ currentTarget: document.querySelectorAll('.island-btn')[0], stopPropagation: () => {} }, 'view-treino', '🏋️‍♂️', 'Treinar');
    
    // Clica virtualmente na tab do Laboratório e desenha o treino
    const customTab = document.getElementById('tab-custom');
    if (customTab) customTab.click();
    renderWorkout();
}


// --- PROGRESSO E ESTATÍSTICAS ---
function setupChartSelect() {
    const select = document.getElementById('exercise-select');
    select.innerHTML = '<option value="">Escolhe um exercício...</option>';
    const uniqueExercises = new Set();
    history.forEach(log => { Object.keys(log.exercises).forEach(ex => uniqueExercises.add(ex)); });
    uniqueExercises.forEach(ex => { select.innerHTML += `<option value="${ex}">${ex}</option>`; });
}

function renderChart() {
    const exercise = document.getElementById('exercise-select').value;
    if (!exercise) return;
    const labels = [], data = [], reps = [];
    history.forEach(log => {
        if (log.exercises[exercise]) {
            labels.push(log.date);
            data.push(log.exercises[exercise][0].weight);
            reps.push(log.exercises[exercise][0].reps);
        }
    });

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('progressChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{ label: 'Carga (kg)', data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.2)', fill: true, tension: 0.3 }]
        }
    });

    const maxWeight = Math.max(...data);
    const maxReps = Math.max(...reps);
    const estimated1RM = Math.round(maxWeight * (1 + maxReps / 30));
    let totalVolume = 0;
    history.forEach(log => {
        if (log.exercises[exercise]) log.exercises[exercise].forEach(set => totalVolume += set.weight * set.reps);
    });

    let coach = data.length >= 3 
        ? (data[data.length - 1] > data[data.length - 2] ? '📈 Excelente progressão recente.' : '⚠️ Sem progressão recente. Considera ajustar volume.') 
        : '📊 Poucos dados para análise.';

    document.getElementById('coach-message').innerText = coach;
    document.getElementById('pr-display').innerHTML = `
        <h3>🏆 PRs</h3><br>
        <p><strong>Maior carga:</strong> ${maxWeight} kg</p>
        <p><strong>Maior reps:</strong> ${maxReps}</p>
        <p><strong>1RM estimado:</strong> ${estimated1RM} kg</p>
        <p><strong>Volume acumulado:</strong> ${Math.round(totalVolume)} kg</p>`;
}

function updateGlobalStats() {
    let totalWorkouts = history.length, totalSets = 0, totalVolume = 0, exercisesDone = {};
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
        <h3>📊 Estatísticas Globais</h3><br>
        <p><strong>Total treinos:</strong> ${totalWorkouts}</p>
        <p><strong>Total séries:</strong> ${totalSets}</p>
        <p><strong>Volume total:</strong> ${Math.round(totalVolume)} kg</p>
        <p><strong>Ex. favorito:</strong> ${fav}</p>`;
}

// --- CALENDÁRIO ---
function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const year = currentCalendarDate.getFullYear(), month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay(); startDay = startDay === 0 ? 6 : startDay - 1;

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('calendar-title').innerText = `${monthNames[month]} ${year}`;

    for (let i = 0; i < startDay; i++) grid.innerHTML += '<div class="day-box empty"></div>';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const trained = history.some(h => h.date === dateStr);
        grid.innerHTML += `<div class="day-box ${trained ? 'trained' : ''}" onclick="toggleTrainingDay('${dateStr}')">${day}</div>`;
    }
    updateWeeklyGoal(); updateMonthlyGoal();
}

function toggleTrainingDay(dateString) {
    const existing = history.find(h => h.date === dateString);
    if (existing) {
        if (existing.exercises && Object.keys(existing.exercises).length > 0) {
            if (!confirm("⚠️ APAGAR todos os dados deste dia?")) return;
        }
        history = history.filter(h => h.date !== dateString);
    } else {
        history.push({ date: dateString, day: 'MANUAL', exercises: {} });
    }
    localStorage.setItem('gym_history', JSON.stringify(history));
    renderCalendar(); updateGlobalStats();
}

function updateWeeklyGoal() {
    const now = new Date(), sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
    let weekly = 0;
    history.forEach(log => {
        const d = new Date(log.date);
        if (d >= sevenDaysAgo && d <= now) weekly++;
    });
    document.getElementById('weekly-count').innerText = weekly;
    document.getElementById('weekly-progress').style.width = `${Math.min(weekly, 6) / 6 * 100}%`;
}

function updateMonthlyGoal() {
    const year = currentCalendarDate.getFullYear(), month = currentCalendarDate.getMonth();
    let monthly = 0;
    history.forEach(log => {
        const d = new Date(log.date);
        if (d.getFullYear() === year && d.getMonth() === month) monthly++;
    });
    document.getElementById('monthly-count').innerText = monthly;
    document.getElementById('monthly-progress').style.width = `${Math.min(monthly, 24) / 24 * 100}%`;
}

function changeMonth(direction) { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction); renderCalendar(); }

// --- DICAS, VÍDEOS E PARTILHA ---
function shareWorkout() {
    const text = `💪 Acabei o treino de ${currentDay}!`;
    navigator.share ? navigator.share({ text }) : window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function showExerciseTips(exerciseName) {
    document.getElementById('modal-title').innerText = exerciseName;
    document.getElementById('modal-content').innerText = "Mantém a boa postura e controla o movimento excêntrico (a descida). Regista a carga real e não sacrifiques a técnica por ego!";
    document.getElementById('exercise-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('exercise-modal').style.display = 'none'; }

function showExerciseVideo(exerciseName) {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)}+tutorial`, '_blank');
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

    let bmiStatus = "Normal", bmiColor = "var(--success)";
    if (bmi < 18.5) { bmiStatus = "Baixo Peso"; bmiColor = "var(--accent)"; }
    else if (bmi >= 25 && bmi < 30) { bmiStatus = "Excesso de Peso"; bmiColor = "#f59e0b"; }
    else if (bmi >= 30) { bmiStatus = "Obesidade"; bmiColor = "var(--danger)"; }
    
    document.getElementById('calc-bmi-status').innerText = bmiStatus;
    document.getElementById('calc-bmi-status').style.color = bmiColor;

    let tdee = (10 * userProfile.weight) + (6.25 * userProfile.height) - (5 * userProfile.age) + (userProfile.gender === 'male' ? 5 : -161);
    tdee *= userProfile.activity;
    if (userProfile.goal === 'cut') tdee -= 500;
    if (userProfile.goal === 'bulk') tdee += 300;

    document.getElementById('calc-cals').innerText = Math.round(tdee);

    const avatar = document.getElementById('dynamic-avatar');
    let scaleX = Math.max(0.6, Math.min(1 + ((bmi - 24) / 24) * 0.6, 1.8));
    let scaleY = Math.max(0.7, Math.min(1 + ((userProfile.height - 170) / 170) * 0.7, 1.4));
    avatar.style.transform = `scale(${scaleX}, ${scaleY})`;
}

function renderDieta() {
    let tdee = parseInt(document.getElementById('calc-cals').innerText) || 0;
    if (tdee === 0) return;
    let weight = userProfile.weight;
    
    let protein = Math.round(weight * 2.2);
    let fat = Math.round(weight * (userProfile.goal === 'cut' ? 0.8 : 1.0));
    let carbs = Math.max(0, Math.round((tdee - (protein * 4 + fat * 9)) / 4));

    document.getElementById('macro-pro').innerText = protein + 'g';
    document.getElementById('macro-car').innerText = carbs + 'g';
    document.getElementById('macro-fat').innerText = fat + 'g';

    let waterMl = (weight * 35) + (userProfile.activity >= 1.55 ? 500 : 0);
    document.getElementById('water-goal').innerText = (waterMl / 1000).toFixed(1) + ' L';
}

// --- SISTEMA DE BACKUP ---
function exportData() {
    const dataStr = JSON.stringify({ history, profile: userProfile }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `gym_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.href = url; a.click(); URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.history) { history = data.history; localStorage.setItem('gym_history', JSON.stringify(history)); }
            if (data.profile) { userProfile = data.profile; localStorage.setItem('gym_profile', JSON.stringify(userProfile)); }
            alert('✅ Backup carregado com sucesso!'); location.reload();
        } catch (error) { alert('❌ Erro ao ler o ficheiro.'); }
    };
    reader.readAsText(file);
}

// Iniciar a aplicação
renderWorkout();
renderProfile();
