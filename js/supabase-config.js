// ==========================================
// SUPABASE CONFIG & SYNC ENGINE
// ==========================================
const SUPABASE_URL = 'https://ylxnqaxqoqmgolvcjlxl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_EipMWdVRFgB2WovisKcK1g__Eaf-WEd';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para Guardar na Nuvem
async function syncDataToCloud() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return; // Se não estiver logado, não faz nada (mantém local)

    const fullPayload = {
        profile: userProfile,
        history: history,
        routines: savedRoutines,
        achievements: achievementsUnlocked,
        bodyStats: bodyStatsHistory,
        frequentFoods: frequentFoods
    };

    const { error } = await supabaseClient
        .from('user_data')
        .upsert({ id: user.id, updated_at: new Date(), payload: fullPayload });

    if (error) console.error("Erro ao sincronizar com a nuvem:", error);
    else console.log("☁️ Dados sincronizados com sucesso na nuvem!");
}

// Função para Puxar da Nuvem (ao iniciar sessão)
async function loadDataFromCloud() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabaseClient
        .from('user_data')
        .select('payload')
        .eq('id', user.id)
        .single();

    if (error || !data || !data.payload) return false;

    let cloudData = data.payload;
    if (cloudData.profile) { userProfile = cloudData.profile; localStorage.setItem('gym_profile', JSON.stringify(userProfile)); }
    if (cloudData.history) { history = cloudData.history; localStorage.setItem('gym_tracker_history', JSON.stringify(history)); }
    if (cloudData.routines) { savedRoutines = cloudData.routines; localStorage.setItem('gym_saved_routines', JSON.stringify(savedRoutines)); }
    if (cloudData.achievements) { achievementsUnlocked = cloudData.achievements; localStorage.setItem('gym_achievements', JSON.stringify(achievementsUnlocked)); }
    
    console.log("📥 Dados descarregados da nuvem com sucesso!");
    return true;
}

// Login com Google (Via Expressa)
async function loginWithGoogle() {
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) alert("Erro no login Google: " + error.message);
}

// Logout
async function logoutUser() {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    location.reload();
}