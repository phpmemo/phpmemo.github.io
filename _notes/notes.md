---
layout: default
title: Все карточки
permalink: /notes/
---

<div class="notes-page">
    <div class="container">
        <div class="progress-header">
            <h1 class="page-title">Все карточки</h1>
            <div class="progress-stats" id="progressStats">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <span class="progress-text" id="progressText">0/0 изучено</span>
            </div>
        </div>
        
        <!-- Фильтры -->
        <div class="notes-filters">
            <div class="filter-group" data-filter-group="status">
                <span class="filter-label">Статус:</span>
                <button class="filter-btn active" data-filter="all">Все</button>
                <button class="filter-btn" data-filter="new">Новые</button>
                <button class="filter-btn" data-filter="in_progress">На повторении</button>
                <button class="filter-btn" data-filter="completed">Изученные</button>
            </div>
            <div class="filter-group" data-filter-group="type">
                <span class="filter-label">Тип:</span>
                <button class="filter-btn active" data-filter="all_types">Все типы</button>
                <button class="filter-btn" data-filter="theory">📚 Теория</button>
                <button class="filter-btn" data-filter="technique">🎩 Методы</button>
                <button class="filter-btn" data-filter="practice">🔧 Практика</button>
            </div>
        </div>
        
        <div class="notes-grid">
            {% for note in site.notes %}
                {% if note.card_id %} <!-- Пропускаем служебные файлы -->
                    {% include note-card.html note=note %}
                {% endif %}
            {% endfor %}          
        </div>
    </div>
</div>
