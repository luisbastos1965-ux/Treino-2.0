const workoutData = {
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
    ]
};

let currentDay = 'PUSH';
let history = JSON.parse(localStorage.getItem('gym_history')) || [];
let currentCalendarDate = new Date();
let chartInstance;
let timerInterval;

function switchMainView(event, id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.main-nav button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (id === 'view-evolucao') {
        setupChartSelect();
        updateGlobalStats();
    }
    if (id === 'view-calendario') {
        renderCalendar();
    }
}

function switchWorkout(event, day) {
    currentDay = day;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Esconde todos e mostra só o do dia atual
    ['PUSH', 'PULL', 'LEGS'].forEach(d => {
        document.getElementById(`plan-${d}`).style.display = (d === day) ? 'block' : 'none';
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

// NOVA FUNÇÃO RENDERWORKOUT: Renderiza tudo de uma vez
function renderWorkout() {
    const container = document.getElementById('workout-container');
    container.innerHTML = '';

    ['PUSH', 'PULL', 'LEGS'].forEach(day => {
        let displayStyle = day === 'PUSH' ? 'block' : 'none';
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

function startTimer(seconds) {
    clearInterval(timerInterval);
    const banner = document.getElementById('timer-banner');
    const display = document.getElementById('timer-display');
    banner.style.display = 'block';

    let timeLeft = seconds;
    display.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        display.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            banner.style.display = 'none';
            alert('Descanso terminado!');
        }
    }, 1000);
}

// NOVA FUNÇÃO SAVECURRENTWORKOUT: Procura os IDs pelo dia correto
function saveCurrentWorkout() {
    const dateObj = new Date();
    const todayString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

    const workoutLog = {
        date: todayString,
        day: currentDay,
        exercises: {}
    };

    workoutData[currentDay].forEach((ex, exIdx) => {
        const exName = ex.name;
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
        workoutLog.exercises[exName] = sets;
    });

    history.push(workoutLog);
    localStorage.setItem('gym_history', JSON.stringify(history));
    alert('Treino gravado!');
}

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

function shareWorkout() {
    const text = `💪 Acabei o treino de ${currentDay}!`;
    if (navigator.share) {
        navigator.share({ text });
    } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function showExerciseTips(exerciseName) {
    const tips = {
        'Supino Inclinado c/ Halteres': 'Mantém o peito estufado e foca-te em aproximar os bíceps no topo da subida. Controla bem a descida.',
        'Supino Plano na Máquina (Chest Press)': 'Aproveita a estabilidade da máquina para ir até à falha total em segurança. Mantém a tensão constante no peito.',
        'Press Militar c/ Halteres (Sentado)': 'Para proteger a articulação, os cotovelos devem estar a cerca de 45 graus (ligeiramente à frente da linha do tronco), e não totalmente apontados para os lados.',
        'Elevações Laterais na Polia': 'Pensa em "empurrar o peso para longe", em direção às paredes, e não apenas em levantá-lo. Passa o cabo por trás de ti para alongar mais.',
        'Tríceps à Testa com Barra EZ ou Halteres (Skullcrushers)': 'Deixa os cotovelos passarem ligeiramente a linha da testa para trás. Isto mantém a tensão contínua na cabeça longa do tríceps.',
        'Tríceps na Polia com Corda (Pushdowns)': 'Mantém o peito alto e "prega" os cotovelos às costelas. No final da extensão, afasta as mãos ligeiramente para uma contração máxima.',
        'Puxada Vertical na Polia Alta (Lat Pulldown) com pega aberta': 'Puxa imaginando que queres encostar os cotovelos aos quadris. As tuas mãos são apenas "ganchos", a força vem das costas.',
        'Remada Sentada com Cabo (Pega Romena/Neutro)': 'Deixa as omoplatas alongarem à frente, mas na puxada espreme-as firmemente uma contra a outra antes de os braços dobrarem.',
        'Remada Inclinada c/ Halteres': 'O teu peito nunca pode descolar do banco (evita batota lombar). Puxa os halteres em direção à anca varrendo os cotovelos rentes ao corpo.',
        'Cruzamentos Inversos na Polia ou Voos Posteriores (Rear Delt Fly)': 'Movimento curto e muito controlado. Foca-te em afastar as costas da mão para os lados. Não tentes juntar as costas ao centro.',
        'Curl de Bíceps Inclinado com Halteres': 'Mantém os cotovelos a apontar para o chão o tempo todo e deixa o braço esticar por completo na descida para potenciar o alongamento.',
        'Curl Martelo (Hammer Curl) com Halteres': 'Aperta os halteres com muita força e não deixes os cotovelos balançarem para a frente durante a subida. Isola o braquial.',
        'Leg Press 45º': 'Apoia bem a lombar e garante que a descida é controlada (cerca de 2 a 3 segundos). Nunca bloqueies os joelhos de forma brusca no topo do movimento.',
        'Peso Morto Romeno (RDL) com Barra ou Halteres': 'O segredo é a anca. Imagina que queres fechar uma gaveta atrás de ti com os glúteos. O movimento termina assim que os femorais atingem o alongamento máximo.',
        'Extensão de Pernas (Leg Extension)': 'Agarra as pegas laterais com força para cravar a bacia no banco. Em cada repetição, aguenta 1 segundo no topo com os joelhos esticados.',
        'Flexão de Pernas Sentado ou Deitado (Leg Curl)': 'Pressiona a zona pélvica contra o banco durante todo o exercício. Controla rigorosamente a descida para não deixares o peso cair com a gravidade.',
        'Elevação de Gémeos em Pé (Calf Raises)': 'A magia está na pausa. Faz 2 segundos de pausa total na posição mais baixa (calcanhar perto do chão) para forçar o músculo a trabalhar sem o "efeito mola" do tendão de Aquiles.'
    };

    document.getElementById('modal-title').innerText = exerciseName;
    document.getElementById('modal-content').innerText = tips[exerciseName] || 'Sem dicas disponíveis.';
    document.getElementById('exercise-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('exercise-modal').style.display = 'none';
}

function showExerciseVideo(exerciseName) {
    const videos = {
        'Supino Inclinado c/ Halteres': 'https://www.youtube.com/results?search_query=supino+inclinado+halteres',
        'Peso Morto Romeno (RDL) com Barra ou Halteres': 'https://www.youtube.com/results?search_query=romanian+deadlift',
        'Leg Press 45º': 'https://www.youtube.com/results?search_query=leg+press+tutorial'
    };

    const url = videos[exerciseName];
    if (url) {
        window.open(url, '_blank');
    } else {
        alert('Vídeo ainda não disponível.');
    }
}

// Inicia a aplicação
renderWorkout();
