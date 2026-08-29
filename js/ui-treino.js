// ==========================================
// UI-TREINO.JS: LÓGICA DO MODO TREINO
// ==========================================

let currentSwapIndex = -1;
let currentBarWeight = 20; 

function openSwapModal(exName, idx) { 
    currentSwapIndex = idx; 
    document.getElementById('swap-modal').querySelector('h3').innerHTML = '🔄 Substituir Exercício';
    let m = getMuscleForExercise(exName); let pool = exerciseLibrary.filter(x => x.muscle === m && x.name !== exName); let html = ''; 
    pool.forEach(ex => { html += `<div class="dir-item" onclick="swapExercise('${ex.name}')" style="cursor:pointer; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}" style="float:right;">${ex.tier}</span></div>`; }); 
    if(html === '') html = '<p style="color:var(--muted); font-size:13px;">Nenhum exercício similar encontrado.</p>'; 
    document.getElementById('swap-modal-content').innerHTML = html; document.getElementById('swap-modal').style.display = 'flex'; 
}
function closeSwapModal() { document.getElementById('swap-modal').style.display = 'none'; document.getElementById('swap-modal').querySelector('h3').innerHTML = '🔄 Substituir Exercício'; }
function swapExercise(newName) { if(currentSwapIndex !== -1) { let setsToKeep = workoutData[currentDay][currentSwapIndex].sets; workoutData[currentDay][currentSwapIndex] = { name: newName, sets: setsToKeep }; renderWorkout(); closeSwapModal(); } }
function toggleSetDone(btn, exName) { btn.parentElement.classList.toggle('done'); if(btn.parentElement.classList.contains('done')) { let restSecs = getSmartRestTime(exName); startCustomRestTimer(restSecs); } }
function startCustomRestTimer(seconds) { document.getElementById('rest-timer-overlay').style.display = 'flex'; let targetTime = Date.now() + (seconds * 1000); document.getElementById('rest-time-display').innerText = seconds + 's'; if(timerInterval) clearInterval(timerInterval); timerInterval = setInterval(() => { let timeLeft = Math.ceil((targetTime - Date.now()) / 1000); if(timeLeft < 0) timeLeft = 0; document.getElementById('rest-time-display').innerText = timeLeft + 's'; if (timeLeft <= 0) { clearInterval(timerInterval); sendLocalPush("⏱️ Descanso Terminado!", "Bora ao aço!"); if("vibrate" in navigator) navigator.vibrate([200, 100, 200]); document.getElementById('rest-timer-overlay').style.display='none'; } }, 1000); }

function addFinisherToWorkout() {
    let firstEx = workoutData[currentDay] && workoutData[currentDay].length > 0 ? workoutData[currentDay][0] : null;
    let muscle = firstEx ? getMuscleForExercise(firstEx.name) : null;
    let pool = muscle ? exerciseLibrary.filter(x => x.muscle === muscle) : exerciseLibrary;
    if(!pool.length) pool = exerciseLibrary;
    let html = '';
    pool.forEach(ex => { html += `<div class="dir-item" onclick="injectFinisher('${ex.name}')" style="cursor:pointer; background:rgba(255,255,255,0.02); padding:10px; border-radius:8px;"><span>${ex.name}</span><span class="badge tier-${ex.tier.toLowerCase()}" style="float:right;">${ex.tier}</span></div>`; });
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
    if(typeof checkPunishmentExpiration === 'function') checkPunishmentExpiration();
    const container = document.getElementById('workout-container'); if(!container) return; container.innerHTML = ''; 
    
    if (activePunishment && activePunishment.tasks && activePunishment.tasks.length > 0 && currentDay !== 'MOBILITY') {
        let firstTask = activePunishment.tasks[0];
        let remaining = activePunishment.tasks.length - 1;
        let extraText = remaining > 0 ? `<br><span style="font-size:11px; color:#f8fafc; opacity:0.8;">(+ ${remaining} castigos acumulados para os próximos dias)</span>` : '';
        container.innerHTML += `<div style="background:var(--danger); color:white; padding:15px; border-radius:12px; margin-bottom:20px; text-align:center; border: 2px solid #fff; box-shadow: 0 4px 15px rgba(239,68,68,0.5);"><h4 style="margin-bottom: 10px; font-size:15px;">🔥 PENITÊNCIA ATIVA (1/${activePunishment.tasks.length})</h4><p style="font-size: 13px; margin-bottom: 15px; font-weight:bold;">${firstTask}${extraText}</p><button class="beast-action-btn" onclick="addFinisherToWorkout()" style="width:100%; background:white; color:var(--danger); padding:10px; font-weight:bold; font-size:12px;">✚ Injetar Finisher no Treino</button></div>`;
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
    
    if (activePunishment && activePunishment.tasks && activePunishment.tasks.length > 0) { 
        let currentTask = activePunishment.tasks[0];
        if(confirm('Cumpriste o castigo no final do teu treino hoje?\n\n- ' + currentTask)) {
            activePunishment.tasks.shift(); 
            if (activePunishment.tasks.length === 0) { activePunishment = null; localStorage.removeItem('gym_punishment'); showPulseToast('🔥 Dívida totalmente paga! Estás limpo.'); } else { activePunishment.lastUpdated = Date.now(); localStorage.setItem('gym_punishment', JSON.stringify(activePunishment)); showPulseToast(`🔥 Um castigo abatido! Restam ${activePunishment.tasks.length} na fila.`); }
            if(typeof renderPunishmentStatus === 'function') renderPunishmentStatus();
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
    localStorage.removeItem('gym_active_session'); 
    if(typeof updateGamificationLogic === 'function') updateGamificationLogic(); if(typeof updateHeatmap === 'function') updateHeatmap(); if(typeof calculateRPGStats === 'function') calculateRPGStats(); if(typeof checkAchievements === 'function') checkAchievements(); if(typeof renderDisciplineWall === 'function') renderDisciplineWall(); backToWorkoutSlots();
}

function openReadinessModal() { if (painTracker.includes('Ombros')) document.getElementById('pain-ombros').checked = true; if (painTracker.includes('Lombar')) document.getElementById('pain-lombar').checked = true; if (painTracker.includes('Joelhos')) document.getElementById('pain-joelhos').checked = true; if (painTracker.includes('Cotovelos')) document.getElementById('pain-cotovelos').checked = true; document.getElementById('readiness-modal').style.display = 'flex'; }
function closeReadinessModal() { let p = []; if(document.getElementById('pain-ombros').checked) p.push('Ombros'); if(document.getElementById('pain-lombar').checked) p.push('Lombar'); if(document.getElementById('pain-joelhos').checked) p.push('Joelhos'); if(document.getElementById('pain-cotovelos').checked) p.push('Cotovelos'); painTracker = p; localStorage.setItem('gym_pain_tracker', JSON.stringify(painTracker)); let slp = parseInt(document.getElementById('ready-sleep').value); let mus = parseInt(document.getElementById('ready-muscle').value); let nrg = parseInt(document.getElementById('ready-energy').value); if ((slp + mus + nrg) < 9) showPulseToast("⚠️ O teu SNC está sob stress.", true); document.getElementById('readiness-modal').style.display = 'none'; renderWorkout(); if(typeof updateHeatmap === 'function') updateHeatmap(); }

function openPlateMath(targetWeightStr) {
    const targetWeight = parseFloat(targetWeightStr); if (!targetWeight || targetWeight <= currentBarWeight) { showPulseToast(`Insere um peso > ${currentBarWeight}kg para esta barra.`, true); return; } 
    document.getElementById('plate-target-weight').innerText = targetWeight; let weightPerSide = (targetWeight - currentBarWeight) / 2; const plates = [ { weight: 25, color: '#ef4444', height: '100px' }, { weight: 20, color: '#3b82f6', height: '90px' }, { weight: 15, color: '#eab308', height: '80px' }, { weight: 10, color: '#22c55e', height: '70px' }, { weight: 5, color: '#f8fafc', height: '50px' }, { weight: 2.5, color: '#334155', height: '40px' }, { weight: 1.25, color: '#94a3b8', height: '30px' } ];
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
