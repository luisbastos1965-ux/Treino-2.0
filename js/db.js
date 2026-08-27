// ==========================================
// DB.JS: ESTADO GLOBAL E BASES DE DADOS
// ==========================================

let workoutData = {
    PUSH: [{ name: 'Supino Plano com Barra', sets: 3 }, { name: 'Supino Inclinado c/ Halteres', sets: 3 }, { name: 'Press Militar c/ Halteres', sets: 3 }, { name: 'Elevações Laterais na Polia', sets: 4 }, { name: 'Tríceps à Testa', sets: 3 }, { name: 'Tríceps na Polia com Corda', sets: 3 }],
    PULL: [{ name: 'Elevações (Pull-ups)', sets: 3 }, { name: 'Remada com Barra', sets: 3 }, { name: 'Puxada Vertical na Polia Alta', sets: 3 }, { name: 'Voos Posteriores (Rear Delt Fly)', sets: 4 }, { name: 'Curl de Bíceps Inclinado', sets: 3 }, { name: 'Curl Martelo', sets: 3 }],
    LEGS: [{ name: 'Agachamento Livre', sets: 4 }, { name: 'Peso Morto Romeno (RDL)', sets: 3 }, { name: 'Leg Press 45º', sets: 3 }, { name: 'Flexão de Pernas (Leg Curl)', sets: 3 }, { name: 'Elevação de Gémeos em Pé', sets: 4 }],
    MOBILITY: [{ name: 'Gato-Camelo (Cat-Cow)', sets: 2, reps: '10 reps' }, { name: 'Rotação Torácica no Chão', sets: 2, reps: '8 cada lado' }, { name: 'Alongamento de Flexores da Anca', sets: 2, reps: '30s cada' }, { name: 'Cão Olhando para Baixo', sets: 2, reps: '45s' }, { name: 'Ponte de Glúteos', sets: 2, reps: '15 reps' }],
    CUSTOM: []
};

let exerciseLibrary = [
    { name: "Supino Plano com Barra", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 }, { name: "Supino Inclinado c/ Halteres", muscle: "Peito", tier: "S", type: "free", defaultSets: 3 }, { name: "Supino Plano na Máquina", muscle: "Peito", tier: "A", type: "machine", defaultSets: 3 }, { name: "Peck Deck / Voador", muscle: "Peito", tier: "B", type: "machine", defaultSets: 3 }, { name: "Crossover na Polia", muscle: "Peito", tier: "A", type: "machine", defaultSets: 4 },
    { name: "Elevações (Pull-ups)", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 }, { name: "Puxada Vertical na Polia Alta", muscle: "Costas", tier: "S", type: "machine", defaultSets: 3 }, { name: "Remada com Barra", muscle: "Costas", tier: "S", type: "free", defaultSets: 3 }, { name: "Remada Sentada com Cabo", muscle: "Costas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Remada Inclinada c/ Halteres", muscle: "Costas", tier: "A", type: "free", defaultSets: 3 }, { name: "Pullover com Haltere", muscle: "Costas", tier: "B", type: "free", defaultSets: 3 },
    { name: "Agachamento Livre", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 }, { name: "Agachamento Hack", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Leg Press 45º", muscle: "Pernas", tier: "S", type: "machine", defaultSets: 4 }, { name: "Peso Morto Romeno (RDL)", muscle: "Pernas", tier: "S", type: "free", defaultSets: 3 }, { name: "Extensão de Pernas", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Flexão de Pernas (Leg Curl)", muscle: "Pernas", tier: "A", type: "machine", defaultSets: 3 }, { name: "Elevação de Gémeos em Pé", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 }, { name: "Elevação de Gémeos Sentado", muscle: "Pernas", tier: "B", type: "machine", defaultSets: 4 },
    { name: "Press Militar c/ Halteres", muscle: "Ombros", tier: "S", type: "free", defaultSets: 3 }, { name: "Elevações Laterais na Polia", muscle: "Ombros", tier: "S", type: "free", defaultSets: 4 }, { name: "Elevações Laterais c/ Halteres", muscle: "Ombros", tier: "A", type: "free", defaultSets: 4 }, { name: "Voos Posteriores (Rear Delt Fly)", muscle: "Ombros", tier: "A", type: "machine", defaultSets: 4 },
    { name: "Curl de Bíceps Inclinado", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Curl Martelo", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Curl de Bíceps na Polia", muscle: "Braços", tier: "B", type: "machine", defaultSets: 3 }, { name: "Tríceps à Testa", muscle: "Braços", tier: "A", type: "free", defaultSets: 3 }, { name: "Tríceps na Polia com Corda", muscle: "Braços", tier: "S", type: "machine", defaultSets: 3 },
    { name: "Crunch Abdominal na Polia", muscle: "Core", tier: "A", type: "machine", defaultSets: 3 }, { name: "Elevação de Pernas em Suspensão", muscle: "Core", tier: "S", type: "free", defaultSets: 3 }, { name: "Prancha Abdominal (Plank)", muscle: "Core", tier: "A", type: "free", defaultSets: 3 }
];

const recipesDB = [ { name: "Papas de Aveia Titã", type: "Pequeno-Almoço", cals: 450, pro: 35, desc: "60g aveia, 1 scoop whey, 150ml leite, canela." }, { name: "Arroz de Frango Anabólico", type: "Pós-Treino", cals: 600, pro: 50, desc: "150g peito de frango, 100g arroz basmati, brócolos." } ];

// NOVO SISTEMA MASSIVO DE CONQUISTAS
const allAchievements = [
    // --- ASSIDUIDADE (Treinos Concluídos) ---
    { id: 'w_1', title: 'Primeiro Sangue', desc: 'Completaste o teu 1º treino.', reqWorkouts: 1, icon: '🩸' },
    { id: 'w_5', title: 'O Despertar', desc: 'Completaste 5 treinos.', reqWorkouts: 5, icon: '👀' },
    { id: 'w_10', title: 'Disciplina Iniciada', desc: 'Completaste 10 treinos.', reqWorkouts: 10, icon: '🌱' },
    { id: 'w_25', title: 'Hábito Forjado', desc: 'Completaste 25 treinos.', reqWorkouts: 25, icon: '🔥' },
    { id: 'w_50', title: 'Meio Centenário', desc: 'Completaste 50 treinos.', reqWorkouts: 50, icon: '🥉' },
    { id: 'w_100', title: 'Centurião', desc: 'Completaste 100 treinos.', reqWorkouts: 100, icon: '🥈' },
    { id: 'w_200', title: 'Duplo Centurião', desc: 'Completaste 200 treinos.', reqWorkouts: 200, icon: '🥇' },
    { id: 'w_365', title: 'O Ano de Ferro', desc: 'Completaste 365 treinos.', reqWorkouts: 365, icon: '📅' },
    { id: 'w_500', title: 'Meio Milhar', desc: 'Completaste 500 treinos.', reqWorkouts: 500, icon: '💎' },
    { id: 'w_1000', title: 'Lenda do Ginásio', desc: 'Completaste 1000 treinos.', reqWorkouts: 1000, icon: '👑' },

    // --- CARGA BRUTA MOVIDA (Tonagem Total) ---
    { id: 'v_1k', title: 'Levantador Leve', desc: 'Moveste 1.000 kg no total.', reqVol: 1000, icon: '🪶' },
    { id: 'v_5k', title: 'Aquecimento Feito', desc: 'Moveste 5.000 kg no total.', reqVol: 5000, icon: '💨' },
    { id: 'v_10k', title: '10 Toneladas', desc: 'Moveste 10.000 kg no total.', reqVol: 10000, icon: '🚗' },
    { id: 'v_25k', title: 'Camião de Carga', desc: 'Moveste 25.000 kg no total.', reqVol: 25000, icon: '🚚' },
    { id: 'v_50k', title: '50 Toneladas', desc: 'Moveste 50.000 kg no total.', reqVol: 50000, icon: '🐘' },
    { id: 'v_100k', title: 'Cem Toneladas', desc: 'Moveste 100.000 kg no total.', reqVol: 100000, icon: '🐋' },
    { id: 'v_250k', title: 'Um Quarto de Milhão', desc: 'Moveste 250.000 kg no total.', reqVol: 250000, icon: '🏗️' },
    { id: 'v_500k', title: "Meio Milhão", desc: "Moveste 500.000 kg no total.", reqVol: 500000, icon: "🚂" },
    { id: 'v_1m', title: "O Milionário", desc: "Moveste 1.000.000 kg no total.", reqVol: 1000000, icon: "🚢" },
    { id: 'v_2m', title: "A Montanha", desc: "Moveste 2.000.000 kg no total.", reqVol: 2000000, icon: "🏔️" },
    { id: 'v_5m', title: "Atlas", desc: "Moveste 5.000.000 kg no total.", reqVol: 5000000, icon: "🌍" },

    // --- MARCOS ESPECÍFICOS ---
    // SUPINO
    { id: 'b_60', title: 'O Standard', desc: 'Levantaste 60kg no Supino Plano.', reqBench: 60, icon: '🛡️' },
    { id: 'b_100', title: 'As Duas Chapas', desc: 'Levantaste 100kg no Supino Plano.', reqBench: 100, icon: '💿' },
    { id: 'b_140', title: 'Peitoral Mutante', desc: 'Levantaste 140kg no Supino Plano.', reqBench: 140, icon: '🦍' },
    // AGACHAMENTO
    { id: 's_100', title: 'Pernas de Aço', desc: 'Levantaste 100kg no Agachamento.', reqSquat: 100, icon: '🦵' },
    { id: 's_140', title: 'Três Chapas', desc: 'Levantaste 140kg no Agachamento.', reqSquat: 140, icon: '🚜' },
    { id: 's_180', title: 'Colunas do Templo', desc: 'Levantaste 180kg no Agachamento.', reqSquat: 180, icon: '🏛️' },
    // PESO MORTO
    { id: 'd_100', title: 'Força Bruta', desc: 'Levantaste 100kg no Peso Morto.', reqDeadlift: 100, icon: '💥' },
    { id: 'd_140', title: 'Levanta-Mortos', desc: 'Levantaste 140kg no Peso Morto.', reqDeadlift: 140, icon: '🧟' },
    { id: 'd_200', title: 'Urso Pardo', desc: 'Levantaste 200kg no Peso Morto.', reqDeadlift: 200, icon: '🐻' }
];

let currentDay = 'PUSH'; let currentCalendarDate = new Date(); let chartInstance;
let timerInterval, gameInterval, gameTicks = 0, barbellY = 50, barbellVelocity = 0, score = 0; let currentModalExercise = ""; let voiceCoachActive = false; let deleteMode = false; 
let builderState = { fatigue: 'energized', mode: 'auto', routine: [] }; let beastState = { active: false, exIdx: 0, setIdx: 0 };
let currentSwapIndex = -1; let fastingInterval = null;

let isDeloadMode = false; let appTheme = localStorage.getItem('gym_theme') || 'default'; document.body.setAttribute('data-theme', appTheme);

// BD Locais
let history = JSON.parse(localStorage.getItem('gym_tracker_history')) || [];
let savedRoutines = JSON.parse(localStorage.getItem('gym_saved_routines')) || [];
let userProfile = JSON.parse(localStorage.getItem('gym_profile')) || { name: '', age: 25, gender: 'male', height: 170, weight: 70, activity: '1.55', goal: 'maintain', measurements: { arm: '', chest: '', waist: '', leg: '' } };
let achievementsUnlocked = JSON.parse(localStorage.getItem('gym_achievements')) || [];
let activePunishment = JSON.parse(localStorage.getItem('gym_punishment')) || null;
let bodyStatsHistory = JSON.parse(localStorage.getItem('gym_body_stats')) || [];
let frequentFoods = JSON.parse(localStorage.getItem('gym_freq_foods')) || [];
let fastingState = JSON.parse(localStorage.getItem('gym_fasting')) || { active: false, start: null };
let activeMission = JSON.parse(localStorage.getItem('gym_mission')) || null;
let painTracker = JSON.parse(localStorage.getItem('gym_pain_tracker')) || [];
let customExercisesDB = JSON.parse(localStorage.getItem('gym_custom_exercises')) || [];
exerciseLibrary.push(...customExercisesDB);

// Anti-Crash & Meal Prep
let activeSessionBackup = JSON.parse(localStorage.getItem('gym_active_session')) || null;
let groceryList = JSON.parse(localStorage.getItem('gym_groceries')) || [];

let lastDebriefDate = localStorage.getItem('gym_last_debrief') || '';
let dailyIntake = JSON.parse(localStorage.getItem('gym_daily_intake')) || { date: new Date().toLocaleDateString('pt-PT'), foods: [] };
let waterIntake = JSON.parse(localStorage.getItem('gym_water')) || { date: new Date().toLocaleDateString('pt-PT'), ml: 0 };
if (dailyIntake.date !== new Date().toLocaleDateString('pt-PT')) { dailyIntake = { date: new Date().toLocaleDateString('pt-PT'), foods: [] }; localStorage.setItem('gym_daily_intake', JSON.stringify(dailyIntake)); }
if (waterIntake.date !== new Date().toLocaleDateString('pt-PT')) { waterIntake = { date: new Date().toLocaleDateString('pt-PT'), ml: 0 }; localStorage.setItem('gym_water', JSON.stringify(waterIntake)); }

function getMuscleForExercise(name) {
    let found = exerciseLibrary.find(ex => ex.name === name); if (found) return found.muscle; let lower = name.toLowerCase();
    if (lower.includes('supino') || lower.includes('chest') || lower.includes('crossover')) return 'Peito';
    if (lower.includes('puxada') || lower.includes('remada') || lower.includes('pull-up')) return 'Costas';
    if (lower.includes('leg') || lower.includes('agachamento') || lower.includes('peso morto') || lower.includes('gémeos')) return 'Pernas';
    if (lower.includes('press') || lower.includes('elevações laterais') || lower.includes('voos')) return 'Ombros';
    if (lower.includes('curl') || lower.includes('tríceps') || lower.includes('testa') || lower.includes('pushdown')) return 'Braços';
    return 'Core';
}
function getLastPerformance(exerciseName) { for (let i = history.length - 1; i >= 0; i--) { if (history[i].exercises && history[i].exercises[exerciseName]) return history[i].exercises[exerciseName]; } return null; }
