document.addEventListener('DOMContentLoaded', function() {
    const filterKey = 'notesFilters';
    const cards = document.querySelectorAll('.note-card');
    const progressStats = document.getElementById('progressStats');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    const storageKey = 'noteCardsState';
    const completedKey = 'noteCardsCompleted';
    
    let savedState = {};
    let completedCards = {};
    let activeFilters = {
        status: 'all',
        type: 'all_types'
    };
    
    try {
        // Восстанавливаем состояние переворота
        savedState = JSON.parse(localStorage.getItem(storageKey) || '{}');
        // Восстанавливаем состояние изученности
        completedCards = JSON.parse(localStorage.getItem(completedKey) || '{}');
    } catch (e) {
        console.warn('Не удалось прочитать состояние карточек:', e);
    }

    // Восстанавливаем состояние и считаем прогресс
    let studiedCount = Object.keys(completedCards).length;
    
    cards.forEach(card => {
        const cardId = card.dataset.noteId;
        const markCompletedBtn = card.querySelector('.mark-completed');
        const markUncompletedBtn = card.querySelector('.mark-uncompleted');
        const hideAnswerBtn = card.querySelector('.hide-answer');
        
        // Восстанавливаем сохраненное состояние переворота
        if (savedState[cardId]) {
            card.classList.add('flipped');
        }
        
        // Восстанавливаем состояние изученности
        if (completedCards[cardId]) {
            card.classList.add('completed');
            markCompletedBtn.style.display = 'none';
            markUncompletedBtn.style.display = 'inline-block';
        }
        
        // Обработчик клика по карточке (только переворот)
        card.addEventListener('click', function(event) {
            if (event.target.closest('.btn') || event.target.closest('.answer-actions')) {
                return;
            }
            
            this.classList.toggle('flipped');
            saveCardState(this);
            applyFilters();
        });
        
        // Кнопка "Бито"
        markCompletedBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            card.classList.add('completed');
            markCompletedBtn.style.display = 'none';
            markUncompletedBtn.style.display = 'inline-block';
            card.classList.remove('flipped');
            
            // Сохраняем состояние переворота (что карточка не перевернута)
            saveCardState(card);
            
            // Сохраняем и обновляем прогресс
            completedCards[cardId] = true;
            studiedCount++;
            saveCompletedState();
            updateProgressDisplay();
            applyFilters();
        });
        
        // Кнопка "В колоду"
        markUncompletedBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            card.classList.remove('completed');
            markCompletedBtn.style.display = 'inline-block';
            markUncompletedBtn.style.display = 'none';
            card.classList.remove('flipped');
            
            // Сохраняем состояние переворота (что карточка не перевернута)
            saveCardState(card);
            
            // Удаляем из прогресса
            delete completedCards[cardId];
            studiedCount--;
            saveCompletedState();
            updateProgressDisplay();
            applyFilters();
        });
        
        // Кнопка "Скрыть ответ"
        /*hideAnswerBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            card.classList.remove('flipped');
            saveCardState(card);
        });*/
    });
    
    // Инициализируем прогресс
    updateProgressDisplay();
    
    function saveCardState(card) {
        const cardId = card.dataset.noteId;
        const isFlipped = card.classList.contains('flipped');
        
        try {
            const currentState = JSON.parse(localStorage.getItem(storageKey) || '{}');
            
            if (isFlipped) {
                currentState[cardId] = true;
            } else {
                delete currentState[cardId];
            }
            
            localStorage.setItem(storageKey, JSON.stringify(currentState));
        } catch (e) {
            console.warn('Не удалось сохранить состояние переворота:', e);
        }
    }
    
    function saveCompletedState() {
        try {
            localStorage.setItem(completedKey, JSON.stringify(completedCards));
        } catch (e) {
            console.warn('Не удалось сохранить состояние изученности:', e);
        }
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
    
    // Функция для применения фильтров
    function applyFilters() {
        cards.forEach(card => {
            const cardId = card.dataset.noteId;
            const cardType = card.classList.contains('note-card-theory') ? 'theory' : 
                            card.classList.contains('note-card-technique') ? 'technique' : 
                            card.classList.contains('note-card-practice') ? 'practice' : '';
            
            const isCompleted = card.classList.contains('completed');
            const isFlipped = card.classList.contains('flipped');
            
            let statusMatch = false;
            let typeMatch = false;
            
            // Проверяем фильтр по статусу
            switch (activeFilters.status) {
                case 'all':
                    statusMatch = true;
                    break;
                case 'new':
                    statusMatch = !isCompleted;
                    break;
                case 'in_progress':
                    statusMatch = isCompleted && isFlipped;
                    break;
                case 'completed':
                    statusMatch = isCompleted;
                    break;
            }
            
            // Проверяем фильтр по типу
            switch (activeFilters.type) {
                case 'all_types':
                    typeMatch = true;
                    break;
                default:
                    typeMatch = activeFilters.type === cardType;
            }
            
            // Показываем/скрываем карточку
            if (statusMatch && typeMatch) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Функция для сохранения фильтров
    function saveFilters() {
        try {
            localStorage.setItem(filterKey, JSON.stringify(activeFilters));
        } catch (e) {
            console.warn('Не удалось сохранить фильтры:', e);
        }
    }

    // Обработчики для кнопок фильтров
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const filterGroup = this.closest('.filter-group').dataset.filterGroup;
            
            // Обновляем активный фильтр
            activeFilters[filterGroup] = filter;
            
            // Сбрасываем активность только в текущей группе
            const groupButtons = this.closest('.filter-group').querySelectorAll('.filter-btn');
            groupButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Сохраняем и применяем фильтры
            saveFilters();
            applyFilters();
        });
    });

    // Функция для восстановления фильтров
    function restoreFilters() {
        try {
            const savedFilters = JSON.parse(localStorage.getItem(filterKey));
            if (savedFilters) {
                activeFilters = savedFilters;
                
                // Активируем соответствующие кнопки в каждой группе
                Object.entries(activeFilters).forEach(([group, filter]) => {
                    const button = document.querySelector(`[data-filter-group="${group}"] [data-filter="${filter}"]`);
                    if (button) {
                        const groupButtons = button.closest('.filter-group').querySelectorAll('.filter-btn');
                        groupButtons.forEach(b => b.classList.remove('active'));
                        button.classList.add('active');
                    }
                });
            }
        } catch (e) {
            console.warn('Не удалось восстановить фильтры:', e);
        }
    }
    
    // Кнопка сброса прогресса
    const resetButton = document.createElement('button');
    resetButton.textContent = '🔄 Сбросить прогресс';
    resetButton.className = 'reset-progress-btn';
    resetButton.addEventListener('click', function() {
        if (confirm('Сбросить весь прогресс?')) {
            localStorage.removeItem(completedKey);
            cards.forEach(card => {
                card.classList.remove('completed');
                const markCompletedBtn = card.querySelector('.mark-completed');
                const markUncompletedBtn = card.querySelector('.mark-uncompleted');
                
                markCompletedBtn.style.display = 'inline-block';
                markUncompletedBtn.style.display = 'none';
            });
            studiedCount = 0;
            completedCards = {};
            updateProgressDisplay();
            applyFilters();
        }
    });
    
    progressStats.appendChild(resetButton);
    // Восстанавливаем фильтры при загрузке
    restoreFilters();
    applyFilters();
});
