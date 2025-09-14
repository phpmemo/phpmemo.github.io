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
        
        <div class="notes-grid">
            {% for note in site.notes %}
                {% if note.card_id %} <!-- Пропускаем служебные файлы -->
                    {% include note-card.html note=note %}
                {% endif %}
            {% endfor %}          
        </div>
    </div>
</div>
