// ==========================================
// DB.JS: ESTADO GLOBAL E BASES DE DADOS
// ==========================================

let workoutData = {
    PUSH: [{ name: 'Supino Inclinado c/ Halteres', sets: 3 }, { name: 'Supino Plano na Máquina', sets: 3 }, { name: 'Press Militar c/ Halteres', sets: 3 }, { name: 'Elevações Laterais na Polia', sets: 4 }, { name: 'Tríceps à Testa', sets: 3 }, { name: 'Tríceps na Polia com Corda', sets: 3 }],
    PULL: [{ name: 'Puxada Vertical na Polia Alta', sets: 3 }, { name: 'Remada Sentada com Cabo', sets: 3 }, { name: 'Remada Inclinada c/ Halteres', sets: 3 }, { name: 'Voos Posteriores (Rear Delt Fly)', sets: 4 }, { name: 'Curl de Bíceps Inclinado', sets: 3 }, { name: 'Curl Martelo', sets: 3 }],
    LEGS: [{ name: 'Leg Press 45º', sets: 4 }, { name: 'Peso Morto Romeno (RDL)', sets: 3 }, { name: 'Extensão de Pernas', sets: 3 }, { name: 'Flexão de Pernas (Leg Curl)', sets: 3 }, { name: 'Elevação de Gémeos em Pé', sets: 4 }],
    MOBILITY: [{ name: 'Gato-Camelo (Cat-Cow)', sets: 2, reps: '10 reps' }, { name: 'Rotação Torácica no Chão', sets: 2, reps: '8 cada lado' }, { name: 'Alongamento de Flexores da Anca', sets: 2, reps: '30s cada' }, { name: 'Cão Olhando para Baixo', sets: 2, reps: '45s' }, { name: 'Ponte de Glúteos', sets: 2, reps: '15 reps' }],
    CUSTOM: []
};

const exerciseLibrary = [
    { name: "Supino Plano com Barra", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 }, { name: "Supino Inclinado c/ Halteres", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 }, { name: "Supino Plano na Máquina", muscle: "Peito", tier: "A", type: "machine", defaultSets: 3 }, { name: "Peck Deck / Voador", muscle: "Peito", tier: "B", type: "machine", defaultSets: 3 }, { name: "Crossover na Polia", muscle: "Peito", tier: "A", type: "machine", defaultSets: 4 },
    { name: "Elevações (Pull-ups)", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 }, { name: "Puxada Vertical na Polia Alta", muscle: "Costas", tier: "S", type: "machine", defaultSets: 3 }, { name: "Remada com Barra", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 }, { name: "Remada Sentada com Cabo", muscle: "Costas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Remada Inclinada c/ Halteres", muscle: "Costas", tier: "A", type: "free", defaultSets: 3 }, { name: "Pullover com Haltere", muscle: "Costas", tier: "B", type: "free", defaultSets: 3 },
    { name: "Agachamento Livre", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 }, { name: "Agachamento Hack", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Leg Press 45º", muscle: "Pernas", tier: "S", type: "machine", defaultSets: 4 }, { name: "Peso Morto Romeno (RDL)", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 }, { name: "Extensão de Pernas", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Flexão de Pernas (Leg Curl)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Elevação de Gémeos em Pé", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 }, { name: "Elevação de Gémeos Sentado", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 },
    { name: "Press Militar c/ Halteres", muscle: "Ombros", tier: "S", type: "free", defaultSets: 3 }, { name: "Elevações Laterais na Polia", muscle: "Ombros", tier: "S", type: "free", defaultSets: 4 }, { name: "Elevações Laterais c/ Halteres", muscle: "Ombros", tier: "A", type: "free", defaultSets: 4 }, { name: "Voos Posteriores (Rear Delt Fly)", muscle: "Ombros", tier: "A", type: "machine", defaultSets: 4 },
    { name: "Curl de Bíceps Inclinado", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Curl Martelo", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Curl de Bíceps na Polia", muscle: "Braços", tier: "B", type: "machine", defaultSets: 3 }, { name: "Tríceps à Testa", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Tríceps na Polia com Corda", muscle: "Braços", tier: "S", type: "machine", defaultSets: 3 },
    { name: "Crunch Abdominal na Polia", muscle: "Core", tier: "A", type: "machine", defaultSets: 3 }, { name: "Elevação de Pernas em Suspensão", muscle: "Core", tier: "S", type: "free", defaultSets: 3 }, { name: "Prancha Abdominal (Plank)", muscle: "Core", tier: "A", type: "free", defaultSets: 3 }
];

const recipesDB = [
    { name: "Papas de Aveia Titã", type: "Pequeno-Almoço", cals: 450, pro: 35, desc: "60g aveia, 1 scoop whey, 150ml leite, canela. Misturar tudo e 2 min no microondas." }, { name: "Arroz de Frango Anabólico", type: "Pós-Treino", cals: 600, pro: 50, desc: "150g peito de frango, 100g arroz basmati, brócolos." }, { name: "Panquecas de Combate", type: "Snack", cals: 350, pro: 20, desc: "1 banana, 2 ovos, 30g aveia. Triturar e fazer na frigideira antiaderente." }, { name: "Omolete de Claras Rápida", type: "Ceia", cals: 200, pro: 25, desc: "200ml claras, 1 ovo inteiro, espinafres." }, { name: "Batido T-Rex", type: "Bulk", cals: 800, pro: 40, desc: "2 scoops whey, 1 banana, 30g manteiga amendoim, 50g aveia, 300ml leite." }
];

const allAchievements = [
    { id: 'first_blood', icon: '🩸', title: 'Primeiro Sangue', desc: 'Completaste o teu primeiro treino.', reqWorkouts: 1 }, { id: 'consistency', icon: '🔥', title: 'Máquina Oleada', desc: 'Completaste 10 treinos.', reqWorkouts: 10 }, { id: 'titan', icon: '🦍', title: 'Titã do Ferro', desc: 'Completaste 50 treinos.', reqWorkouts: 50 }, { id: 'volume_10k', icon: '🧱', title: 'Construtor', desc: 'Moveste 10.000 kg de volume total.', reqVol: 10000 }, { id: 'volume_100k', icon: '🏗️', title: 'Guindaste', desc: 'Moveste 100.000 kg de volume total.', reqVol: 100000 }
];

// --- Variáveis de Estado (Memória RAM) ---
let currentDay = 'PUSH'; let currentCalendarDate = new Date(); let chartInstance;
let timerInterval, gameInterval, gameTicks = 0, barbellY = 50, barbellVelocity = 0, score = 0; let currentModalExercise = ""; let voiceCoachActive = false; let deleteMode = false; 
let builderState = { fatigue: 'energized', mode: 'auto', routine: [] }; let beastState = { active: false, exIdx: 0, setIdx: 0 };
let currentSwapIndex = -1; let fastingInterval = null;

// --- Bases de Dados Locais (Persistência no Dispositivo) ---
let history = JSON.parse(localStorage.getItem('gym_tracker_history')) || [];
let savedRoutines = JSON.parse(localStorage.getItem('gym_saved_routines')) || [];
let userProfile = JSON.parse(localStorage.getItem('gym_profile')) || { name: '', age: 25, gender: 'male', height: 170, weight: 70, activity: '1.55', goal: 'maintain', measurements: { arm: '', chest: '', waist: '', leg: '' } };
let achievementsUnlocked = JSON.parse(localStorage.getItem('gym_achievements')) || [];
let activePunishment = JSON.parse(localStorage.getItem('gym_punishment')) || null;
let bodyStatsHistory = JSON.parse(localStorage.getItem('gym_body_stats')) || [];
let frequentFoods = JSON.parse(localStorage.getItem('gym_freq_foods')) || [];
let fastingState = JSON.parse(localStorage.getItem('gym_fasting')) || { active: false, start: null };
let appStreaks = JSON.parse(localStorage.getItem('gym_streaks')) || { current: 0, lastDate: null };
let activeMission = JSON.parse(localStorage.getItem('gym_mission')) || null;

// INVENTÁRIO CORPORAL (Dores)
let painTracker = JSON.parse(localStorage.getItem('gym_pain_tracker')) || [];

let dailyIntake = JSON.parse(localStorage.getItem('gym_daily_intake')) || { date: new Date().toLocaleDateString('pt-PT'), foods: [] };
let waterIntake = JSON.parse(localStorage.getItem('gym_water')) || { date: new Date().toLocaleDateString('pt-PT'), ml: 0 };

if (dailyIntake.date !== new Date().toLocaleDateString('pt-PT')) { dailyIntake = { date: new Date().toLocaleDateString('pt-PT'), foods: [] }; localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); }
if (waterIntake.date !== new Date().toLocaleDateString('pt-PT')) { waterIntake = { date: new Date().toLocaleDateString('pt-PT'), ml: 0 }; localStorage.setItem('gym_water', JSON.stringify(waterIntake)); }

function getMuscleForExercise(name) {
    let found = exerciseLibrary.find(ex => ex.name === name); if (found) return found.muscle;
    let lower = name.toLowerCase();
    if (lower.includes('supino') || lower.includes('chest') || lower.includes('crossover')) return 'Peito';
    if (lower.includes('puxada') || lower.includes('remada') || lower.includes('pull-up')) return 'Costas';
    if (lower.includes('leg') || lower.includes('agachamento') || lower.includes('peso morto') || lower.includes('gémeos')) return 'Pernas';
    if (lower.includes('press') || lower.includes('elevações laterais') || lower.includes('voos')) return 'Ombros';
    if (lower.includes('curl') || lower.includes('tríceps') || lower.includes('testa') || lower.includes('pushdown')) return 'Braços';
    return 'Core';
}
function getLastPerformance(exerciseName) { for (let i = history.length - 1; i >= 0; i--) { if (history[i].exercises && history[i].exercises[exerciseName]) return history[i].exercises[exerciseName]; } return null; }
