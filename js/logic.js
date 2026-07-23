// ==========================================
// LOGIC.JS: REGRAS DE NEGÓCIO E ALGORITMOS
// ==========================================

function calculate1RM(weight, reps) { if (reps === 1) return weight; return weight * (1 + (reps / 30)); }
function calculateBodyFatFormula(waist, height, gender) { let rfm = (gender === 'male') ? 64 - (20 * (height / waist)) : 76 - (20 * (height / waist)); return Math.max(3, Math.min(rfm, 50)); }

const getWeekNumber = (d) => { const date = new Date(d.getTime()); date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); return Math.ceil((((date - yearStart) / 86400000) + 1) / 7); };

function checkCentralFatigueLogic(historyData) {
    if (!historyData || historyData.length === 0) return false;
    let activeWeeks = new Set();
    historyData.forEach(session => { if (session.date) { let parts = session.date.split('/'); if (parts.length === 3) { let d = new Date(parts[2], parts[1] - 1, parts[0]); activeWeeks.add(parts[2] + '-' + getWeekNumber(d)); } } });
    return activeWeeks.size >= 6;
}

function getLevelAndProgress(xp) {
    let level = Math.floor(Math.sqrt(xp / 500)) + 1; let currentLevelXP = Math.pow(level - 1, 2) * 500; let nextLevelXP = Math.pow(level, 2) * 500;
    let xpIntoLevel = xp - currentLevelXP; let xpRequired = nextLevelXP - currentLevelXP; let progress = (xpIntoLevel / xpRequired) * 100;
    return { level, progress, xpIntoLevel, xpRequired };
}

function categorizeMuscleByNameRPG(name) {
    if (!name) return 'Geral'; const n = name.toLowerCase();
    if(n.includes('supino') || n.includes('peito') || n.includes('crucifixo') || n.includes('fly')) return 'Peito';
    if(n.includes('remada') || n.includes('puxada') || n.includes('costas') || n.includes('pull')) return 'Costas';
    if(n.includes('agachamento') || n.includes('leg') || n.includes('extensora') || n.includes('flexora') || n.includes('panturrilha')) return 'Pernas';
    if(n.includes('desenvolvimento') || n.includes('ombro') || n.includes('elevação') || n.includes('militar')) return 'Ombros';
    if(n.includes('rosca') || n.includes('tríceps') || n.includes('bíceps') || n.includes('curl') || n.includes('testa')) return 'Braços';
    if(n.includes('abdom') || n.includes('prancha') || n.includes('core')) return 'Core'; return 'Geral';
}

function generateWorkoutLogic(focus, fatigue, library) {
    let targetCount = fatigue === 'energized' ? 6 : (fatigue === 'normal' ? 5 : 4); let pool = [];
    if (focus === 'PUSH') pool = library.filter(ex => ['Peito', 'Ombros'].includes(ex.muscle) || ex.name.includes('Tríceps'));
    else if (focus === 'PULL') pool = library.filter(ex => ['Costas'].includes(ex.muscle) || ex.name.includes('Bíceps'));
    else if (focus === 'LEGS') pool = library.filter(ex => ex.muscle === 'Pernas');
    else if (focus === 'FULL') pool = [...library]; else pool = library.filter(ex => ex.muscle === focus); 
    pool = pool.sort(() => 0.5 - Math.random());
    if (fatigue === 'tired') { pool.sort((a, b) => (a.type === 'machine' ? -1 : 1)); } else { pool.sort((a, b) => (a.tier === 'S' ? -1 : 1)); }
    let selected = pool.slice(0, targetCount); let finalRoutine = [];
    selected.forEach(ex => { let sets = ex.defaultSets; if (fatigue === 'tired') sets = Math.max(2, sets - 1); finalRoutine.push({ name: ex.name, sets: sets }); });
    return finalRoutine;
}

// --- MISSÕES E STREAKS (Gamificação) ---
function updateGamificationLogic() {
    let today = new Date(); let todayStr = today.toLocaleDateString('pt-PT');
    
    // Streaks
    if (appStreaks.lastDate !== todayStr) {
        if (!appStreaks.lastDate) { appStreaks.current = 1; } 
        else {
            let parts = appStreaks.lastDate.split('/'); let lastDateObj = new Date(parts[2], parts[1]-1, parts[0]);
            let diffTime = Math.abs(today - lastDateObj); let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays === 1) appStreaks.current += 1; else if (diffDays > 2) appStreaks.current = 1; // Perde a streak após 2 dias sem treinar
        }
        appStreaks.lastDate = todayStr;
        localStorage.setItem('gym_streaks', JSON.stringify(appStreaks));
    }

    // Missões Mensais
    let currentMonth = today.getMonth();
    if (!activeMission || activeMission.month !== currentMonth) {
        const missions = [
            { type: 'volume', target: 30000, desc: "Mover 30.000 kg de Carga Total" },
            { type: 'workouts', target: 16, desc: "Completar 16 Treinos no Mês" }
        ];
        let randMission = missions[Math.floor(Math.random() * missions.length)];
        activeMission = { month: currentMonth, type: randMission.type, target: randMission.target, desc: randMission.desc, progress: 0, completed: false };
    }

    // Atualizar Missão
    let volToday = 0;
    let lastLog = history[history.length - 1];
    if (lastLog && lastLog.date === todayStr && lastLog.exercises) {
        if(activeMission.type === 'volume') {
            Object.values(lastLog.exercises).forEach(sets => sets.forEach(s => volToday += (s.weight||s.w||0) * (s.reps||s.r||0)));
            activeMission.progress += volToday;
        } else if (activeMission.type === 'workouts') {
            activeMission.progress += 1;
        }
    }
    
    if (activeMission.progress >= activeMission.target && !activeMission.completed) {
        activeMission.completed = true; alert("🎖️ MISSÃO MENSAL CONCLUÍDA! O Valhalla aprova.");
    }
    localStorage.setItem('gym_mission', JSON.stringify(activeMission));
}

function checkAchievements() {
    let newlyUnlocked = false; let totalWorkouts = history.length; let totalVol = 0;
    history.forEach(log => { if(log.exercises) Object.values(log.exercises).forEach(sets => { sets.forEach(set => totalVol += (set.weight||s.w||0) * (set.reps||s.r||0)); }); });
    allAchievements.forEach(ach => {
        if (!achievementsUnlocked.includes(ach.id)) {
            let unlock = false;
            if (ach.reqWorkouts && totalWorkouts >= ach.reqWorkouts) unlock = true;
            if (ach.reqVol && totalVol >= ach.reqVol) unlock = true;
            if (unlock) { achievementsUnlocked.push(ach.id); newlyUnlocked = true; setTimeout(() => alert(`🏆 NOVA CONQUISTA DESBLOQUEADA: ${ach.title}!`), 500); }
        }
    });
    if (newlyUnlocked) { localStorage.setItem('gym_achievements', JSON.stringify(achievementsUnlocked)); if (document.getElementById('view-perfil').classList.contains('active')) renderAchievements(); }
}

function generatePunishmentLogic(cals) { if (cals < 100) return null; return { cals: cals, date: new Date().toLocaleDateString('pt-PT'), burpees: Math.floor(cals / 15), squats: Math.floor(cals / 8), pushups: Math.floor(cals / 12) }; }

// --- EXPORTAÇÃO PARA TREINADORES (CSV) ---
function exportToCSV() {
    if(history.length === 0) { alert("Sem treinos registados para exportar."); return; }
    let csv = "Data,Exercicio,Serie,Peso_Kg,Repeticoes,Tipo,Notas\n";
    history.forEach(session => {
        if(session.exercises) {
            Object.entries(session.exercises).forEach(([ex, sets]) => {
                sets.forEach((s, i) => {
                    let type = s.type === 'W' ? 'Aquecimento' : 'Trabalho';
                    let notes = s.notes ? `"${s.notes}"` : "";
                    csv += `${session.date},"${ex}",${i+1},${s.weight||s.w||0},${s.reps||s.r||0},${type},${notes}\n`;
                });
            });
        }
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.setAttribute('href', url);
    a.setAttribute('download', `Pulse_Relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    a.click(); window.URL.revokeObjectURL(url);
}

function exportData() {
    const data = { history: history, profile: userProfile, achievements: achievementsUnlocked }; const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.download = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`; a.href = url; a.click(); URL.revokeObjectURL(url);
}
function importData(event) {
    const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = function(e) {
        try { const data = JSON.parse(e.target.result); if (data.history) { history = data.history; localStorage.setItem('gym_history', JSON.stringify(history)); } if (data.profile) { userProfile = data.profile; localStorage.setItem('gym_profile', JSON.stringify(userProfile)); } if (data.achievements) { achievementsUnlocked = data.achievements; localStorage.setItem('gym_achievements', JSON.stringify(achievementsUnlocked)); } alert('✅ Backup carregado com sucesso!'); location.reload(); } catch (error) { alert('❌ Erro ao ler o ficheiro.'); }
    }; reader.readAsText(file);
}
