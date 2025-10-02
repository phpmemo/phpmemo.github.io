---
layout: note
title: "error_reporting() — dual-функция для управления тем, какие типы ошибок PHP будет регистрировать."
card_id: 44
date: 2025-10-02
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  error_reporting(int $level): int
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `error_reporting()` — dual-функция для управления тем, **какие типы ошибок PHP будет регистрировать**. Критически важно понимать разницу между ней и настройками отображения ошибок. Используйте битовые маски для точного контроля уровня отчетности в разных окружениях. Никогда не отключайте полностью в продакшене — вместо этого настраивайте логирование.
---
### 1. Основное назначение и синтаксис

`error_reporting()` — это функция для **получения** и **установки** уровня отчетности об ошибках.

```php
// Получить текущий уровень
error_reporting(): int

// Установить новый уровень
error_reporting(int $level): int
```

### 2. Уровни ошибок (error levels)

Уровни задаются с помощью битовых масок:

| Константа | Значение | Описание |
|-----------|----------|----------|
| `E_ERROR` | 1 | Фатальные ошибки времени выполнения |
| `E_WARNING` | 2 | Предупреждения времени выполнения |
| `E_PARSE` | 4 | Ошибки парсинга на этапе компиляции |
| `E_NOTICE` | 8 | Уведомления времени выполнения |
| `E_ALL` | 32767 | Все ошибки и предупреждения |
| `E_STRICT` | 2048 | Совместимость и рекомендации |

### 3. Получение текущего уровня

```php
$current_level = error_reporting();
echo $current_level; // Например: 32767 (E_ALL)

// Проверка включен ли конкретный уровень
if (error_reporting() & E_WARNING) {
    echo "Warnings are enabled";
}
```

### 4. Установка уровня отчетности

#### **Через константы:**
```php
// Только критические ошибки
error_reporting(E_ERROR | E_PARSE | E_CORE_ERROR);

// Все ошибки кроме NOTICE
error_reporting(E_ALL & ~E_NOTICE);

// Только пользовательские ошибки
error_reporting(E_USER_ERROR | E_USER_WARNING | E_USER_NOTICE);
```

#### **Через числовые значения:**
```php
error_reporting(0);  // Полное отключение отчетности
error_reporting(-1); // Все ошибки (эквивалент E_ALL)
error_reporting(7);  // E_ERROR | E_WARNING | E_PARSE
```

### 5. Практическое применение

#### **Временное изменение уровня:**
```php
// Сохраняем текущий уровень
$old_level = error_reporting();

// Отключаем предупреждения для конкретной операции
error_reporting(error_reporting() & ~E_WARNING);
$result = @file_get_contents('maybe_missing_file.txt');

// Восстанавливаем уровень
error_reporting($old_level);
```

#### **Для разных окружений:**
```php
// development - все ошибки
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} 
// production - только критическое
else {
    error_reporting(E_ERROR | E_PARSE);
    ini_set('display_errors', 0);
}
```

### 6. Отличие от `display_errors` и `log_errors`

Важное различие:
- **`error_reporting()`** — какие ошибки **регистрировать**
- **`display_errors`** — показывать ли ошибки в выводе
- **`log_errors`** — записывать ли ошибки в лог

```php
// Регистрируем все ошибки, но не показываем пользователю
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
```

### 7. Взаимодействие с оператором @

Оператор `@` временно устанавливает `error_reporting(0)`:

```php
// Эквивалентно:
$old = error_reporting(0);
$value = risky_operation();
error_reporting($old);
```

### 8. Лучшие практики

#### **Не отключайте полностью:**
```php
// ПЛОХО - можно пропустить критические ошибки
error_reporting(0);

// ЛУЧШЕ - отключайте только мешающие типы
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
```

#### **Используйте в комбинации с обработчиками:**
```php
// Устанавливаем уровень
error_reporting(E_ALL);

// Настраиваем отображение
ini_set('display_errors', 1);

// Устанавливаем кастомный обработчик
set_error_handler('myErrorHandler');
```

### 9. Особенности в разных версиях PHP

- **PHP 5.x:** `E_ALL` не включает `E_STRICT`
- **PHP 7.x:** `E_ALL` включает `E_STRICT`  
- **PHP 8.x:** Некоторые константы устарели, добавлены новые

### Итог:

`error_reporting()` — dual-функция для управления тем, **какие типы ошибок PHP будет регистрировать**. Критически важно понимать разницу между ней и настройками отображения ошибок. Используйте битовые маски для точного контроля уровня отчетности в разных окружениях. Никогда не отключайте полностью в продакшене — вместо этого настраивайте логирование.
