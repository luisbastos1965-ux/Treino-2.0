// ==========================================
// MAIN.JS: INICIALIZAÇÃO DA APP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizar Ecrãs Iniciais
    renderWorkout();
    renderProfile();
    updateHeatmap();
    
    // 2. Disparar Lógicas de Background
    setTimeout(() => {
        const hasFatigue = checkCentralFatigueLogic(history);
        const deloadWarning = document.getElementById('deload-warning');
        if (deloadWarning) {
            deloadWarning.style.display = hasFatigue ? 'block' : 'none';
        }
        
        calculateRPGStats();
    }, 1000);

    // 3. Listeners Globais
    const exerciseSelectDropdown = document.getElementById('exercise-select');
    if (exerciseSelectDropdown) {
        exerciseSelectDropdown.addEventListener('change', () => {
            setTimeout(renderChart, 100);
        });
    }
});
