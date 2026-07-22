// ==========================================
// BEASTMODE.JS: FOCO IMERSIVO E COACH DE VOZ
// ==========================================

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
    if (lastPerf && lastPerf[0]) {
        document.getElementById('beast-history-badge').innerText = `Última vez: ${lastPerf[0].weight || lastPerf[0].w}kg x ${lastPerf[0].reps || lastPerf[0].r}`;
        let prevSet = lastPerf[beastState.setIdx - 1] || lastPerf[0];
        weightInput.placeholder = prevSet.weight || prevSet.w || '0';
        repsInput.placeholder = prevSet.reps || prevSet.r || '0';
    } else {
        document.getElementById('beast-history-badge').innerText = `Sem registos anteriores`;
        weightInput.placeholder = '0';
        repsInput.placeholder = '0';
    }

    checkProgressiveOverload(ex.name);
}

function completeBeastSet(skipRest = false, isDropSet = false) {
    if ("vibrate" in navigator) navigator.vibrate(200);

    const exercises = workoutData[currentDay];
    const ex = exercises[beastState.exIdx];
    
    const bw = document.getElementById('beast-weight').value || document.getElementById('beast-weight').placeholder;
    const br = document.getElementById('beast-reps').value || document.getElementById('beast-reps').placeholder;
    const brir = document.getElementById('beast-rir').value;

    let mainW = document.getElementById(`weight-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    let mainR = document.getElementById(`reps-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    let mainRir = document.getElementById(`rir-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);
    let row = document.getElementById(`row-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`);

    if (!row) {
        const exCards = document.querySelectorAll('#workout-container .exercise-card');
        if(exCards[beastState.exIdx]) {
            const newRow = document.createElement('div');
            newRow.className = 'set-row done';
            newRow.id = `row-${currentDay}-${beastState.exIdx}-${beastState.setIdx}`;
            newRow.innerHTML = `
                <span style="font-weight:bold; color:var(--accent); width:20px;">D${beastState.setIdx}</span>
                <div class="input-group"><input type="number" id="weight-${currentDay}-${beastState.exIdx}-${beastState.setIdx}" value="${bw}"></div>
                <div class="input-group"><input type="number" id="reps-${currentDay}-${beastState.exIdx}-${beastState.setIdx}" value="${br}"></div>
                <div class="input-group">
                    <select id="rir-${currentDay}-${beastState.exIdx}-${beastState.setIdx}">
                        <option value="${brir}">${brir}</option>
                    </select>
                </div>
                <button class="check-btn" style="background:var(--success)">✔</button>
            `;
            exCards[beastState.exIdx].appendChild(newRow);
        }
    } else {
        if (mainW) mainW.value = bw;
        if (mainR) mainR.value = br;
        if (mainRir) mainRir.value = brir;
        row.classList.add('done');
    }

    if (isDropSet) {
        ex.sets++; 
        beastState.setIdx++;
    } else {
        beastState.setIdx++;
        if (beastState.setIdx > ex.sets) {
            beastState.exIdx++;
            beastState.setIdx = 1;
        }
    }

    if (beastState.exIdx < exercises.length) {
        if (skipRest) {
            renderBeastMode();
        } else {
            startTimer(90); 
            renderBeastMode();
        }
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
    if(typeof renderWorkout === 'function') renderWorkout(); 
}

function triggerDropSet() {
    if (voiceCoachActive) speakVoiceCoach("Drop set ativado. Tira algum peso e continua, sem desculpas!");
    completeBeastSet(true, true);
}

function triggerSuperset() {
    if (voiceCoachActive) speakVoiceCoach("Supersérie concluída. Passa imediatamente para o próximo movimento!");
    completeBeastSet(true, false);
}

function toggleVoiceCoach() {
    voiceCoachActive = !voiceCoachActive;
    const btn = document.getElementById('voice-coach-btn');
    if (btn) {
        btn.innerText = voiceCoachActive ? "🎧 Voz: LIGADA" : "🔇 Voz: DESLIGADA";
        btn.style.color = voiceCoachActive ? "var(--success)" : "var(--muted)";
    }
    if (voiceCoachActive) speakVoiceCoach("Assistente de voz ativado. Foco total no treino, campeão!");
}

function speakVoiceCoach(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

function triggerVoiceWarning() {
    if (!beastState.active) return;
    const ex = workoutData[currentDay][beastState.exIdx];
    if (!ex) return;
    const weightInput = document.getElementById('beast-weight');
    const weight = weightInput ? (weightInput.value || weightInput.placeholder || '0') : '0';
    speakVoiceCoach(`Prepara-te. Próxima série de ${ex.name}, com ${weight} quilos. Vamos a isto!`);
}

function checkProgressiveOverload(exerciseName) {
    const suggestionPanel = document.getElementById('beast-smart-suggestion');
    if (!suggestionPanel) return;

    let lastSetFound = null;
    for (let i = history.length - 1; i >= 0; i--) {
        const session = history[i];
        if (session.exercises) {
            const match = Array.isArray(session.exercises) 
                ? session.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase())
                : (session.exercises[exerciseName] ? {setsDetails: session.exercises[exerciseName]} : null);
                
            if (match && match.setsDetails && match.setsDetails.length > 0) {
                lastSetFound = match.setsDetails[0];
                break;
            } else if (session.exercises[exerciseName] && Array.isArray(session.exercises[exerciseName])) {
                lastSetFound = session.exercises[exerciseName][0];
                break;
            }
        }
    }

    if (!lastSetFound) {
        suggestionPanel.style.display = 'none';
        return;
    }

    const lastWeight = parseFloat(lastSetFound.w || lastSetFound.weight || 0);
    const lastRir = parseInt(lastSetFound.rir || 0);

    if (isNaN(lastWeight) || lastWeight === 0) {
        suggestionPanel.style.display = 'none';
        return;
    }

    let message = "";
    suggestionPanel.style.background = "rgba(34,197,94,0.1)";
    suggestionPanel.style.color = "var(--success)";
    suggestionPanel.style.padding = "10px";
    suggestionPanel.style.borderRadius = "10px";
    suggestionPanel.style.border = "1px solid rgba(34,197,94,0.2)";

    if (lastRir >= 3) {
        message = `🧠 Smart Coach: Última vez foi fácil (RIR 3+). Tenta subir para ${lastWeight + 5}kg ou faz +2 Reps!`;
    } else if (lastRir === 2) {
        message = `🧠 Smart Coach: Progressão ideal. Tenta carregar ${lastWeight + 2.5}kg hoje!`;
    } else if (lastRir === 1) {
        message = `🧠 Smart Coach: Perto do limite (RIR 1). Mantém os ${lastWeight}kg e tenta mais 1 repetição.`;
    } else {
        suggestionPanel.style.background = "rgba(245,158,11,0.1)";
        suggestionPanel.style.color = "#f59e0b";
        suggestionPanel.style.border = "1px solid rgba(245,158,11,0.2)";
        message = `🧠 Smart Coach: Treino ao limite (RIR 0). Repete os ${lastWeight}kg com técnica perfeita antes de subir.`;
    }

    suggestionPanel.innerText = message;
    suggestionPanel.style.display = 'block';

    if (voiceCoachActive && lastRir >= 2) {
        setTimeout(() => speakVoiceCoach(`Dica do treinador. Estás mais forte. Tenta aumentar a carga neste exercício hoje.`), 1500);
    }
}

// --- TEMPORIZADOR E MINI-JOGO ---
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
        
        if (timeLeft === 10 && voiceCoachActive && !spokeWarning) {
            spokeWarning = true;
            triggerVoiceWarning();
        }

        if (timeLeft <= 0) endTimer();
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

function jumpBarbell() { barbellVelocity = -10; }
function endTimer() {
    clearInterval(timerInterval);
    clearInterval(gameInterval);
    document.getElementById('rest-timer-overlay').style.display = 'none';
}
function skipTimer() { endTimer(); }
