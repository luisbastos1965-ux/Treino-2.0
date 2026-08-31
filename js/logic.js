// ==========================================
// LOGIC.JS: REGRAS DE NEGÓCIO E ALGORITMOS
// ==========================================

function calculate1RM(weight, reps) { if (reps === 1) return weight; return weight * (1 + (reps / 30)); }
function calculateBodyFatFormula(waist, height, gender) { let rfm = (gender === 'male') ? 64 - (20 * (height / waist)) : 76 - (20 * (height / waist)); return Math.max(3, Math.min(rfm, 50)); }

// --- RANKING DE FORÇA GLOBAL (Strength Standards) ---
function getStrengthStandard(exerciseName, oneRM, bw, gender) {
    let lift = null; let n = exerciseName.toLowerCase();
    if (n.includes('supino plano') || n.includes('bench press')) lift = 'bench';
    else if (n.includes('agachamento livre') || n.includes('squat')) lift = 'squat';
    else if (n.includes('peso morto') || n.includes('deadlift') || n.includes('rdl')) lift = 'deadlift';
    else if (n.includes('press militar') || n.includes('overhead')) lift = 'ohp';
    
    if (!lift || !bw || bw <= 0) return null;
    
    // Multiplicadores baseados no Peso Corporal (BW)
    let ratios = {
        bench: { male: [0.75, 1.2, 1.5, 2.0], female: [0.5, 0.8, 1.0, 1.5] },
        squat: { male: [1.0, 1.5, 2.0, 2.5], female: [0.8, 1.2, 1.5, 2.0] },
        deadlift: { male: [1.2, 1.7, 2.5, 3.0], female: [1.0, 1.5, 2.0, 2.5] },
        ohp: { male: [0.5, 0.8, 1.0, 1.3], female: [0.3, 0.5, 0.8, 1.0] }
    };
    
    let r = ratios[lift][gender === 'female' ? 'female' : 'male'];
    let val = oneRM / bw;
    
    let levels = ["Iniciante", "Intermédio", "Avançado", "Elite", "Mutante"];
    let levelIdx = 0; let nextTarget = r[0] * bw;
    
    for(let i=0; i<r.length; i++) {
        if (val >= r[i]) { levelIdx = i + 1; nextTarget = r[i+1] ? r[i+1] * bw : null; }
    }
    
    return { level: levels[Math.min(levelIdx, 4)], nextKg: nextTarget ? Math.round(nextTarget - oneRM) : 0 };
}

// --- SUNDAY DEBRIEF GENERATOR ---
function generateSundayDebrief() {
    const now = new Date(); const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(now.getDate() - 7);
    let weeklyVol = 0; let workouts = 0; let prs = 0;
    
    history.forEach(log => {
        let parts = log.date.split('/'); if(parts.length === 3) {
            let d = new Date(parts[2], parts[1]-1, parts[0]);
            if (d >= sevenDaysAgo && d <= now) {
                workouts++;
                if(log.exercises) Object.values(log.exercises).forEach(sets => sets.forEach(s => { if(s.type !== 'W') weeklyVol += (s.weight||s.w||0) * (s.reps||s.r||0); }));
            }
        }
    });

    return { volume: Math.round(weeklyVol), workouts: workouts };
}

function getSmartRestTime(exerciseName) { let ex = exerciseLibrary.find(e => e.name === exerciseName); if (!ex) return 90; if (ex.tier === 'S') return 120; return 90; }

function checkPainWarning(exerciseName) {
    let muscle = getMuscleForExercise(exerciseName); let warnings = [];
    if (painTracker.includes('Ombros') && (muscle === 'Ombros' || muscle === 'Peito')) warnings.push("⚠️ Cuidado: Dores nos Ombros. Controla a descida.");
    if (painTracker.includes('Lombar') && (muscle === 'Costas' || muscle === 'Pernas')) warnings.push("⚠️ Cuidado: Atenção à Lombar. Usa cinto.");
    if (painTracker.includes('Joelhos') && muscle === 'Pernas') warnings.push("⚠️ Cuidado: Dores nos Joelhos. Aquece bem a articulação.");
    if (painTracker.includes('Cotovelos') && (muscle === 'Braços' || muscle === 'Peito')) warnings.push("⚠️ Cuidado: Tensão nos Cotovelos.");
    return warnings.length > 0 ? warnings[0] : "";
}

function getLevelAndProgress(xp) { let level = Math.floor(Math.sqrt(xp / 500)) + 1; let currentLevelXP = Math.pow(level - 1, 2) * 500; let nextLevelXP = Math.pow(level, 2) * 500; return { level, progress: ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100, xpIntoLevel: xp - currentLevelXP, xpRequired: nextLevelXP - currentLevelXP }; }

function categorizeMuscleByNameRPG(name) {
    if (!name) return 'Geral'; const n = name.toLowerCase();
    if(n.includes('supino') || n.includes('peito')) return 'Peito'; if(n.includes('remada') || n.includes('puxada') || n.includes('costas') || n.includes('pull')) return 'Costas';
    if(n.includes('agachamento') || n.includes('leg') || n.includes('extensora') || n.includes('flexora')) return 'Pernas'; if(n.includes('desenvolvimento') || n.includes('ombro') || n.includes('elevação') || n.includes('militar')) return 'Ombros';
    if(n.includes('rosca') || n.includes('tríceps') || n.includes('bíceps') || n.includes('curl') || n.includes('testa')) return 'Braços'; if(n.includes('abdom') || n.includes('prancha') || n.includes('core')) return 'Core'; return 'Geral';
}

function generateWorkoutLogic(focus, fatigue, library) {
    let targetCount = fatigue === 'energized' ? 6 : (fatigue === 'normal' ? 5 : 4); let pool = [];
    if (focus === 'PUSH') pool = library.filter(ex => ['Peito', 'Ombros'].includes(ex.muscle) || ex.name.includes('Tríceps')); else if (focus === 'PULL') pool = library.filter(ex => ['Costas'].includes(ex.muscle) || ex.name.includes('Bíceps')); else if (focus === 'LEGS') pool = library.filter(ex => ex.muscle === 'Pernas'); else if (focus === 'FULL') pool = [...library]; else pool = library.filter(ex => ex.muscle === focus); 
    pool = pool.sort(() => 0.5 - Math.random());
    if (fatigue === 'tired') pool.sort((a, b) => (a.type === 'machine' ? -1 : 1)); else pool.sort((a, b) => (a.tier === 'S' ? -1 : 1));
    let selected = pool.slice(0, targetCount); let finalRoutine = []; selected.forEach(ex => { let sets = ex.defaultSets; if (fatigue === 'tired') sets = Math.max(2, sets - 1); finalRoutine.push({ name: ex.name, sets: sets }); }); return finalRoutine;
}

function updateGamificationLogic() {
    let today = new Date(); 
    let todayStr = today.toLocaleDateString('pt-PT');
    let appStreaks = JSON.parse(localStorage.getItem('gym_streaks')) || { current: 0, lastDate: null };
    
    if (appStreaks.lastDate !== todayStr) { 
        if (!appStreaks.lastDate) { 
            appStreaks.current = 1; 
        } else { 
            let parts = appStreaks.lastDate.split('/'); 
            let lastDateObj = new Date(parts[2], parts[1]-1, parts[0]); 
            let diffDays = Math.ceil(Math.abs(today - lastDateObj) / (1000 * 60 * 60 * 24)); 
            if (diffDays === 1) appStreaks.current += 1; 
            else if (diffDays > 2) appStreaks.current = 1; 
        } 
        appStreaks.lastDate = todayStr; 
        localStorage.setItem('gym_streaks', JSON.stringify(appStreaks)); 
    }
    
    // Lista alargada de missões possíveis para o loop infinito
    const possibleMissions = [ 
        { type: 'volume', target: 10000, desc: "Mover 10.000 kg de Carga Total" },
        { type: 'volume', target: 25000, desc: "Mover 25.000 kg de Carga Total" },
        { type: 'volume', target: 50000, desc: "Mover 50.000 kg de Carga Total" },
        { type: 'workouts', target: 2, desc: "Completar 2 Treinos" }, 
        { type: 'workouts', target: 4, desc: "Completar 4 Treinos" } 
    ];

    // Se não houver missão ativa ou se a anterior foi completada, gera uma nova imediatamente!
    if (!activeMission || activeMission.completed) { 
        let randMission = possibleMissions[Math.floor(Math.random() * possibleMissions.length)]; 
        activeMission = { 
            type: randMission.type, 
            target: randMission.target, 
            desc: randMission.desc, 
            progress: 0, 
            completed: false 
        }; 
    }
    
    let volToday = 0; 
    let lastLog = history[history.length - 1];
    
    // Se acabaste de gravar um treino hoje, contabiliza o progresso
    if (lastLog && lastLog.date === todayStr && lastLog.exercises && !activeMission.countedToday) { 
        if (activeMission.type === 'volume') { 
            Object.values(lastLog.exercises).forEach(sets => sets.forEach(s => {
                if (s.type !== 'W') volToday += (s.weight || s.w || 0) * (s.reps || s.r || 0);
            })); 
            activeMission.progress += volToday; 
        } else if (activeMission.type === 'workouts') { 
            activeMission.progress += 1; 
        } 
        activeMission.countedToday = true; // Evita duplicar o mesmo treino se fores ver o perfil várias vezes
    }
    
    // Se atingiste o objetivo, avisa e gera logo a próxima missão no mesmo instante!
    if (activeMission.progress >= activeMission.target && !activeMission.completed) { 
        activeMission.completed = true; 
        if (typeof showPulseToast === 'function') {
            showPulseToast("🎖️ MISSÃO CONCLUÍDA! Nova missão atribuída!");
        } else {
            alert("🎖️ MISSÃO CONCLUÍDA!");
        }
        
        // Loop infinito: reseta e puxa um novo desafio logo a seguir
        let randMission = possibleMissions[Math.floor(Math.random() * possibleMissions.length)]; 
        activeMission = { 
            type: randMission.type, 
            target: randMission.target, 
            desc: randMission.desc, 
            progress: 0, 
            completed: false 
        };
    } 
    
    localStorage.setItem('gym_mission', JSON.stringify(activeMission));
}

function checkAchievements() {
    let newlyUnlocked = false;
    let totalWorkouts = history.length;
    let totalVol = 0;
    
    let maxBench = 0;
    let maxSquat = 0;
    let maxDeadlift = 0;

    history.forEach(log => {
        if(log.exercises) {
            Object.entries(log.exercises).forEach(([exName, sets]) => {
                let n = exName.toLowerCase();
                let isBench = n.includes('supino plano') || n.includes('bench press');
                let isSquat = n.includes('agachamento livre') || n.includes('squat');
                let isDead = n.includes('peso morto') || n.includes('deadlift');

                sets.forEach(set => {
                    let w = parseFloat(set.weight || set.w || 0);
                    let r = parseInt(set.reps || set.r || 0);
                    
                    if (w > 0 && r > 0) {
                        if (set.type !== 'W') totalVol += (w * r); // Apenas carga de trabalho conta
                        
                        // Atualizar recordes absolutos do utilizador
                        if (isBench && w > maxBench) maxBench = w;
                        if (isSquat && w > maxSquat) maxSquat = w;
                        if (isDead && w > maxDeadlift) maxDeadlift = w;
                    }
                });
            });
        }
    });

    allAchievements.forEach(ach => {
        if (!achievementsUnlocked.includes(ach.id)) {
            let unlock = false;
            
            // Lógica de Desbloqueio
            if (ach.reqWorkouts && totalWorkouts >= ach.reqWorkouts) unlock = true;
            if (ach.reqVol && totalVol >= ach.reqVol) unlock = true;
            if (ach.reqBench && maxBench >= ach.reqBench) unlock = true;
            if (ach.reqSquat && maxSquat >= ach.reqSquat) unlock = true;
            if (ach.reqDeadlift && maxDeadlift >= ach.reqDeadlift) unlock = true;

            if (unlock) {
                achievementsUnlocked.push(ach.id);
                newlyUnlocked = true;
                setTimeout(() => alert(`🏆 NOVA CONQUISTA DESBLOQUEADA: ${ach.title}!\n${ach.desc}`), 500);
            }
        }
    });

    if (newlyUnlocked) {
        localStorage.setItem('gym_achievements', JSON.stringify(achievementsUnlocked));
        if (typeof renderAchievements === 'function') renderAchievements();
    }
}

function generatePunishmentLogic(cals) { 
    if (cals < 100) return null; 

    // CÁLCULO PROPORCIONAL COM LIMITES (Máx 20 mins, Máx 5 reps extra)
    let cardioMins = Math.min(20, 5 + Math.floor(cals / 100)); 
    let extraReps = Math.min(5, Math.ceil(cals / 250)); 
    let coreSets = Math.min(6, 2 + Math.floor(cals / 200)); 

    const punishments = [
        `🏃‍♂️ ${cardioMins} mins de Passadeira (Passo acelerado e inclinação máxima contínua)`,
        `🚴‍♂️ ${cardioMins} mins de Bicicleta em HIIT (Alterna: 1 min em sprint máximo com 1 min suave)`,
        `💦 ${cardioMins} mins de Elítica (Cadência alta com resistência pesada)`,
        `🧱 Finisher de Core: ${coreSets} Séries de Prancha (Tempo limite) + 20 Abdominais`,
        `💪 +1 Série Extra (até à falha muscular absoluta) no último exercício do treino`,
        `🥵 +${extraReps} Repetições adicionais forçadas no final de TODAS as séries`,
        `🔥 Adicionar Dropset na última série de TODOS os exercícios do treino de hoje` // Castigo pesado para muitas kcal acumuladas
    ];

    let randomTask = punishments[Math.floor(Math.random() * punishments.length)];

    return { 
        cals: cals, 
        date: new Date().toLocaleDateString('pt-PT'), 
        task: randomTask
    }; 
}

function exportToCSV() { 
    if(history.length === 0) { 
        if (typeof showPulseToast === 'function') showPulseToast("❌ Sem dados para exportar.", true);
        else alert("Sem dados."); 
        return; 
    } 
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
    const url = window.URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.setAttribute('href', url); 
    a.setAttribute('download', `Pulse_Relatorio_${new Date().toISOString().split('T')[0]}.csv`); 
    a.click(); 
    window.URL.revokeObjectURL(url); 
    if (typeof showPulseToast === 'function') showPulseToast("✅ CSV Exportado com Sucesso!");
}

function exportData() { 
    const data = { history: history, profile: userProfile, achievements: achievementsUnlocked, custom: customExercisesDB }; 
    const dataStr = JSON.stringify(data, null, 2); 
    const blob = new Blob([dataStr], { type: "application/json" }); 
    const url = URL.createObjectURL(blob); 
    const a = document.createElement('a'); 
    a.download = `pulse_backup_${new Date().toISOString().split('T')[0]}.json`; 
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
            if (data.history) { history = data.history; localStorage.setItem('gym_history', JSON.stringify(history)); } 
            if (data.profile) { userProfile = data.profile; localStorage.setItem('gym_profile', JSON.stringify(userProfile)); } 
            if (data.achievements) { achievementsUnlocked = data.achievements; localStorage.setItem('gym_achievements', JSON.stringify(achievementsUnlocked)); } 
            if(data.custom) { customExercisesDB = data.custom; localStorage.setItem('gym_custom_exercises', JSON.stringify(customExercisesDB)); } 
            alert('✅ Backup carregado com sucesso!'); 
            location.reload(); 
        } catch (error) { 
            alert('❌ Erro a ler o ficheiro.'); 
        } 
    }; 
    reader.readAsText(file); 
}

// ==========================================
// 🦖 SISTEMA ABSURDO DE VOLUME & RECAP
// ==========================================

const absurdComparisonsDB = [
    // Animais
    { id: 'trex', name: 'T-Rex', cat: 'Animais', weight: 7000, emoji: '🦖' },
    { id: 'elefante', name: 'Elefante-Africano', cat: 'Animais', weight: 6000, emoji: '🐘' },
    { id: 'girafa', name: 'Girafa', cat: 'Animais', weight: 1200, emoji: '🦒' },
    { id: 'rinoceronte', name: 'Rinoceronte', cat: 'Animais', weight: 2300, emoji: '🦏' },
    { id: 'hipopotamo', name: 'Hipopótamo', cat: 'Animais', weight: 1500, emoji: '🦛' },
    { id: 'gorila', name: 'Gorila', cat: 'Animais', weight: 180, emoji: '🦍' },
    { id: 'urso', name: 'Urso-Polar', cat: 'Animais', weight: 450, emoji: '🐻‍❄️' },
    { id: 'crocodilo', name: 'Crocodilo', cat: 'Animais', weight: 500, emoji: '🐊' },
    // Veículos
    { id: 'fiat', name: 'Fiat 500', cat: 'Veículos', weight: 1000, emoji: '🚗' },
    { id: 'clio', name: 'Renault Clio', cat: 'Veículos', weight: 1200, emoji: '🚙' },
    { id: 'mota', name: 'Motociclo', cat: 'Veículos', weight: 200, emoji: '🏍️' },
    { id: 'trator', name: 'Trator', cat: 'Veículos', weight: 4000, emoji: '🚜' },
    { id: 'escavadora', name: 'Escavadora', cat: 'Veículos', weight: 20000, emoji: '🏗️' },
    { id: 'bus', name: 'Autocarro', cat: 'Veículos', weight: 12000, emoji: '🚌' },
    { id: 'comboio', name: 'Comboio', cat: 'Veículos', weight: 80000, emoji: '🚆' },
    { id: 'boeing', name: 'Boeing 737', cat: 'Veículos', weight: 41000, emoji: '✈️' },
    // Monumentos
    { id: 'eiffel', name: 'Torre Eiffel', cat: 'Monumentos', weight: 10100000, emoji: '🗼' },
    { id: 'liberdade', name: 'Estátua da Liberdade', cat: 'Monumentos', weight: 225000, emoji: '🗽' },
    { id: 'ponte', name: 'Ponte D. Luís I', cat: 'Monumentos', weight: 3000000, emoji: '🌉' },
    { id: 'bigben', name: 'Big Ben', cat: 'Monumentos', weight: 8400000, emoji: '🕰️' },
    { id: 'cristo', name: 'Cristo Redentor', cat: 'Monumentos', weight: 1145000, emoji: '⛰️' },
    { id: 'coliseu', name: 'Coliseu de Roma', cat: 'Monumentos', weight: 500000000, emoji: '🏛️' },
    // Comida
    { id: 'pizza', name: 'Pizza Grande', cat: 'Comida', weight: 1, emoji: '🍕' },
    { id: 'hamburguer', name: 'Hambúrgueres', cat: 'Comida', weight: 0.25, emoji: '🍔' },
    { id: 'melancia', name: 'Melancias', cat: 'Comida', weight: 5, emoji: '🍉' },
    { id: 'frango', name: 'Frangos Assados', cat: 'Comida', weight: 1.2, emoji: '🍗' },
    { id: 'arroz', name: 'Sacos de Arroz (5kg)', cat: 'Comida', weight: 5, emoji: '🍚' },
    { id: 'queijo', name: 'Rodas de Queijo', cat: 'Comida', weight: 25, emoji: '🧀' },
    // Objetos
    { id: 'frigo', name: 'Frigoríficos', cat: 'Objetos', weight: 70, emoji: '🧊' },
    { id: 'lavar', name: 'Máquinas de Lavar', cat: 'Objetos', weight: 70, emoji: '🧺' },
    { id: 'sofa', name: 'Sofás', cat: 'Objetos', weight: 80, emoji: '🛋️' },
    { id: 'piano', name: 'Pianos de Cauda', cat: 'Objetos', weight: 400, emoji: '🎹' },
    { id: 'bike', name: 'Bicicletas', cat: 'Objetos', weight: 15, emoji: '🚲' },
    { id: 'mala', name: 'Malas de Viagem', cat: 'Objetos', weight: 20, emoji: '🧳' },
    // História / Fantasia
    { id: 'armadura', name: 'Armaduras Medievais', cat: 'História', weight: 25, emoji: '🛡️' },
    { id: 'canhao', name: 'Canhões', cat: 'História', weight: 1000, emoji: '🏴‍☠️' },
    { id: 'ancora', name: 'Âncoras', cat: 'História', weight: 2000, emoji: '⚓' },
    { id: 'carruagem', name: 'Carruagens', cat: 'História', weight: 500, emoji: '🐴' },
    // Easter Eggs
    { id: 'minion', name: 'Minions', cat: 'Easter Egg', weight: 40, emoji: '🍌' },
    { id: 'ego', name: 'O Ego do gajo que faz supino ao teu lado', cat: 'Easter Egg', weight: Infinity, emoji: '😎', isEasterEgg: true }
];

function getAbsurdComparisons(volumeKg, maxItems = 2) {
    if (volumeKg === 0) return [{ name: "O Ego do gajo que faz supino ao teu lado", count: 1, emoji: "😎" }];
    
    // Filtra objetos matematicamente relevantes (quantidade entre 0.5 e 10.000)
    let valid = absurdComparisonsDB.filter(obj => {
        if (obj.isEasterEgg) return false;
        let qty = volumeKg / obj.weight;
        return qty >= 0.5 && qty <= 10000;
    });

    if (valid.length === 0) valid = absurdComparisonsDB.filter(obj => !obj.isEasterEgg);

    // Baralha e escolhe os melhores
    valid.sort(() => 0.5 - Math.random());
    let selected = valid.slice(0, maxItems);
    
    // Adiciona Easter Egg com 5% de probabilidade
    if (Math.random() < 0.05) {
        selected[0] = absurdComparisonsDB.find(o => o.id === 'ego');
    }

    return selected.map(obj => {
        if (obj.isEasterEgg) return { name: obj.name, count: "Infinito", emoji: obj.emoji };
        let count = volumeKg / obj.weight;
        // Arredondamento limpo (ex: 2, 2.5, ou 2.15 se for muito pequeno)
        let formattedCount = count >= 10 ? Math.round(count) : Number(count.toFixed(1));
        return { name: obj.name, count: formattedCount, emoji: obj.emoji };
    });
}

// Injetar Achievements Divertidos (Sem mexer no db.js)
setTimeout(() => {
    if (typeof allAchievements !== 'undefined') {
        const funAchievements = [
            { id: 'jurassic', title: 'Jurassic Gains', desc: 'Levantar 7.000 kg (1 T-Rex) num só treino.', icon: '🦖', reqSingleVol: 7000 },
            { id: 'grua', title: 'Grua Humana', desc: 'Levantar 10 Toneladas numa sessão.', icon: '🏗️', reqSingleVol: 10000 },
            { id: 'gorilla', title: 'Certified Gorilla', desc: 'Levantar 100x o teu peso corporal (Acumulado).', icon: '🦍', reqGlobalVolMulti: 100, secret: true },
            { id: 'eiffel_ach', title: 'Tour Eiffel', desc: 'Acumular o peso da Torre Eiffel (10.100.000 kg).', icon: '🗼', reqGlobalVol: 10100000, secret: true },
            { id: 'pizza_ach', title: 'Pizzaiolo', desc: 'Levantar o equivalente a 10.000 pizzas (Global).', icon: '🍕', reqGlobalVol: 10000 },
            { id: 'onemoreset', title: 'One More Set', desc: 'Injetaste um finisher (Castigo) e sobreviveste.', icon: '💀', reqFinisher: true, secret: true }
        ];
        funAchievements.forEach(fa => {
            if (!allAchievements.find(a => a.id === fa.id)) allAchievements.push(fa);
        });
    }
}, 1000);
