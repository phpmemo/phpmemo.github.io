document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.note-card');
    const progressStats = document.getElementById('progressStats');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const storageKey = 'noteCardsState';
    
    let savedState = {};
    try {
        // Восстанавливаем состояние карточек
        savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch (e) {
        console.warn('Не удалось прочитать состояние карточек:', e);
    }

    // Восстанавливаем состояние и считаем прогресс
    let studiedCount = 0;
    cards.forEach(card => {
        const cardId = card.dataset.noteId;
        
        // Восстанавливаем сохраненное состояние
        if (savedState[cardId]) {
            card.classList.add('flipped');
            studiedCount++;
        }
        
        card.addEventListener('click', function(event) {
            // Проверяем, был ли клик по кнопке
            if (event.target.closest('.btn-primary')) {
                return;
            }
            
            const wasFlipped = this.classList.contains('flipped');
            // Переворачиваем карточку
            this.classList.toggle('flipped');
            // Сохраняем состояние
            saveCardState(this);
            updateProgress(!wasFlipped);
        });
    });
    
    // Инициализируем прогресс
    updateProgressDisplay();
    
    function saveCardState(card) {
        const cardId = card.dataset.noteId;
        const isFlipped = card.classList.contains('flipped');
        
        try {
            // Получаем текущее состояние
            const currentState = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            // Обновляем состояние для этой карточки
            if (isFlipped) {
                currentState[cardId] = true;
            } else {
                delete currentState[cardId];
            }
            
            // Сохраняем обратно
            localStorage.setItem(storageKey, JSON.stringify(currentState));
        } catch (e) {
            console.warn('Не удалось сохранить состояние:', e);
        }
    }
    
    function updateProgress(isNewlyStudied) {
        studiedCount += isNewlyStudied ? 1 : -1;
        updateProgressDisplay();
    }
    
    function updateProgressDisplay() {
        const total = cards.length;
        const percentage = total > 0 ? (studiedCount / total) * 100 : 0;
        
        progressText.textContent = `${studiedCount}/${total} изучено (${Math.round(percentage)}%)`;
        progressFill.style.width = `${percentage}%`;
        
        // Добавляем классы для разных уровней прогресса
        progressFill.className = 'progress-fill';
        if (percentage === 100) {
            progressFill.classList.add('complete');
        } else if (percentage >= 50) {
            progressFill.classList.add('halfway');
        }
    }
    
    // Кнопка сброса прогресса
    const resetButton = document.createElement('button');
    resetButton.textContent = '🔄 Сбросить прогресс';
    resetButton.className = 'reset-progress-btn';
    resetButton.addEventListener('click', function() {
        if (confirm('Сбросить весь прогресс?')) {
            localStorage.removeItem(storageKey);
            cards.forEach(card => card.classList.remove('flipped'));
            studiedCount = 0;
            updateProgressDisplay();
        }
    });
    
    progressStats.appendChild(resetButton);
});
