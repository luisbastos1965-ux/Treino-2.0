// ==========================================
// UI-CORE.JS: NAVEGAÇÃO E ARRANQUE
// ==========================================

let radarInstance, bodyStatsInstance, tonnageInstance, measChartInstance;

window.onload = () => { 
    checkSundayDebrief(); 
    if(typeof checkPunishmentExpiration === 'function') checkPunishmentExpiration();

    if(activeSessionBackup) {
        setTimeout(() => {
            if(confirm("⚠️ O teu último treino foi interrompido. Queres retomar de onde ficaste?")) {
                currentDay = activeSessionBackup.day;
                workoutData[currentDay] = activeSessionBackup.workout;
                beastState = activeSessionBackup.state;
                navigateTo('view-treino');
                document.getElementById('treino-slots-view').style.display = 'none';
                document.getElementById('treino-active-view').style.display = 'block';
                if(typeof renderWorkout === 'function') renderWorkout();
                document.getElementById('beast-mode-overlay').style.display = 'flex';
                if(typeof renderBeastMode === 'function') renderBeastMode();
            } else {
                localStorage.removeItem('gym_active_session');
                activeSessionBackup = null;
            }
        }, 500);
    }
};

function goHome() { document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); document.getElementById('view-home').classList.add('active'); document.getElementById('fab-home').classList.remove('visible'); checkSundayDebrief(); }

function navigateTo(id) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); document.getElementById('fab-home').classList.add('visible');
    if (id === 'view-evolucao') { setupChartSelect(); updateGlobalStats(); updateHeatmap(); renderAdvancedCharts(); renderSBD(); }
    if (id === 'view-calendario') { renderCalendar(); }
    if (id === 'view-perfil') { renderProfile(); renderAchievements(); renderMissionProfile(); document.getElementById('theme-selector').value = appTheme; renderDisciplineWall(); }
    if (id === 'view-dieta') { renderDieta(); renderPunishmentStatus(); startFastingTimer(); }
    if (id === 'view-construtor') { updateBuilderUI(); }
    if (id === 'view-treino') { renderWorkoutSlots(); backToWorkoutSlots(); }
}

function showPulseToast(message, isError = false) {
    let toast = document.getElementById('pulse-toast');
    if(!toast) {
        toast = document.createElement('div');
        toast.id = 'pulse-toast';
        toast.style.cssText = 'display:none; position:fixed; top:20px; left:50%; transform:translateX(-50%); padding:12px 24px; border-radius:12px; font-weight:bold; z-index:20000; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center; transition: opacity 0.3s; width: 90%; max-width: 350px; color: white;';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.background = isError ? 'var(--danger)' : 'var(--success)';
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.style.display = 'none', 300); }, 3000);
}

function requestPushPermissions() { 
    if ("Notification" in window) { Notification.requestPermission().then(p => { if(p === "granted") showPulseToast("✅ Notificações ativadas com sucesso!"); else showPulseToast("❌ Notificações recusadas.", true); }); } 
    else showPulseToast("⚠️ Sem suporte para Notificações.", true); 
}

function sendLocalPush(title, bodyText) { if ("Notification" in window && Notification.permission === "granted") { try { if ('serviceWorker' in navigator && navigator.serviceWorker.controller) { navigator.serviceWorker.ready.then(sw => { sw.showNotification(title, { body: bodyText, icon: 'assets/img/logo.png', vibrate: [200, 100, 200] }); }); } else { new Notification(title, { body: bodyText, icon: 'assets/img/logo.png' }); } } catch (e) { console.log(e); } } else if ("vibrate" in navigator) { navigator.vibrate([200, 100, 200]); } }
function changeTheme(theme) { appTheme = theme; document.body.setAttribute('data-theme', theme); localStorage.setItem('gym_theme', theme); if(typeof renderDisciplineWall === 'function') renderDisciplineWall(); }

function checkSundayDebrief() {
    let today = new Date();
    if (today.getDay() === 0) { 
        let todayStr = today.toLocaleDateString('pt-PT');
        if (lastDebriefDate !== todayStr) {
            let stats = generateSundayDebrief();
            document.getElementById('debrief-vol').innerText = stats.volume.toLocaleString('en-US') + ' kg';
            document.getElementById('debrief-work').innerText = stats.workouts;
            document.getElementById('sunday-debrief-modal').style.display = 'flex';
            lastDebriefDate = todayStr;
            localStorage.setItem('gym_last_debrief', lastDebriefDate);
            setTimeout(() => { sendLocalPush("🛡️ Guardião de Dados", "Exporta o Backup no Perfil."); showPulseToast("🛡️ Guardião de Dados: Faz o Backup no Perfil!"); }, 1000);
        }
    }
}
function closeDebrief() { document.getElementById('sunday-debrief-modal').style.display = 'none'; }
setTimeout(() => { if(typeof updateGamificationLogic === 'function') updateGamificationLogic(); }, 1000);
