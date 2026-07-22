// ==========================================
// LOGIC.JS: REGRAS DE NEGÓCIO E ALGORITMOS
// ==========================================

// --- ORÁCULO DE FORÇA (1RM) ---
function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return weight * (1 + (reps / 30));
}

// --- MOTOR METABÓLICO (GORDURA E TDEE) ---
function calculateBodyFatFormula(waist, height, gender) {
    let rfm = (gender === 'male') ? 64 - (20 * (height / waist)) : 76 - (20 * (height / waist));
    return Math.max(3, Math.min(rfm, 50));
}

// --- SISTEMA DE FADIGA CENTRAL (DELOAD) ---
const getWeekNumber = (d) => {
    const date = new Date(d.getTime());
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

function checkCentralFatigueLogic(historyData) {
    if (!historyData || historyData.length === 0) return false;
    let activeWeeks = new Set();
    historyData.forEach(session => {
        if (session.date) {
            let parts = session.date.split('/');
            if (parts.length === 3) {
                let d = new Date(parts[2], parts[1] - 1, parts[0]);
                activeWeeks.add(parts[2] + '-' + getWeekNumber(d));
            }
        }
    });
    return activeWeeks.size >= 6;
}

// --- MODO RPG ---
function getLevelAndProgress(xp) {
    let level = Math.floor(Math.sqrt(xp / 500)) + 1;
    let currentLevelXP = Math.pow(level - 1, 2) * 500;
    let nextLevelXP = Math.pow(level, 2) * 500;
    let xpIntoLevel = xp - currentLevelXP;
    let xpRequired = nextLevelXP - currentLevelXP;
    let progress = (xpIntoLevel / xpRequired) * 100;
    return { level, progress, xpIntoLevel, xpRequired };
}

function categorizeMuscleByNameRPG(name) {
    if (!name) return 'Geral';
    const n = name.toLowerCase();
    if(n.includes('supino') || n.includes('peito') || n.includes('crucifixo') || n.includes('fly')) return 'Peito';
    if(n.includes('remada') || n.includes('puxada') || n.includes('costas') || n.includes('pull')) return 'Costas';
    if(n.includes('agachamento') || n.includes('leg') || n.includes('extensora') || n.includes('flexora') || n.includes('panturrilha')) return 'Pernas';
    if(n.includes('desenvolvimento') || n.includes('ombro') || n.includes('elevação') || n.includes('militar')) return 'Ombros';
    if(n.includes('rosca') || n.includes('tríceps') || n.includes('bíceps') || n.includes('curl') || n.includes('testa')) return 'Braços';
    if(n.includes('abdom') || n.includes('prancha') || n.includes('core')) return 'Core';
    return 'Geral';
}

// --- GESTÃO DE BACKUP ---
function exportData() {
    const data = { history: history, profile: userProfile };
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
