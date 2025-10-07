---
layout: note
title: "is_null() — это функция PHP, которая проверяет, является ли переменная null"
card_id: 59
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  is_null(mixed $value): bool
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `is_null()` проверяет, равна ли переменная `null`. Возвращает `true` только для `null`. Генерирует Notice для необъявленных переменных — это главная опасность. Функционально эквивалентна `=== null`, но медленнее. Всегда используйте `isset()` перед проверкой необъявленных переменных.
---
### 1. Основное назначение и синтаксис

`is_null()` — это функция, которая проверяет, является ли переменная `null`.

```php
is_null(mixed $value): bool
```

- Возвращает `true`, если переменная равна `null`
- Возвращает `false` для любого другого значения

### 2. Примеры использования

```php
var_dump(is_null(null));     // true
var_dump(is_null(0));        // false
var_dump(is_null(''));       // false
var_dump(is_null(false));    // false
var_dump(is_null([]));       // false

$var = null;
var_dump(is_null($var));     // true

$unset_var;
var_dump(is_null($unset_var)); // true + Notice
```

### 3. Критически важное поведение с необъявленными переменными

**Важная особенность:** `is_null()` **генерирует предупреждение (E_NOTICE)** для необъявленных переменных.

```php
// ОПАСНО: переменная $undefined не объявлена
var_dump(is_null($undefined)); // bool(true) + Notice: Undefined variable

// БЕЗОПАСНО: сначала проверяем существование
if (isset($undefined) && is_null($undefined)) {
    // Этот код не выполнится
}
```

### 4. Сравнение с другими способами проверки на `null`

#### **Строгое сравнение (`===`):**
```php
$var = null;

var_dump($var === null);    // true
var_dump(is_null($var));    // true - то же самое
```

#### **Нестрогое сравнение (`==`):**
```php
var_dump(null == false);    // true (опасно!)
var_dump(null == 0);        // true (опасно!)
var_dump(null == '');       // true (опасно!)
var_dump(is_null(false));   // false (правильно)
```

### 5. Разница между способами проверки

| Метод | Необъявленная переменная | `null` | Другие значения |
|-------|--------------------------|--------|-----------------|
| **`is_null($var)`** | `true` + **Notice** | `true` | `false` |
| **`$var === null`** | `true` + **Notice** | `true` | `false` |
| **`isset($var)`** | `false` | `false` | `true` |
| **`$var == null`** | `true` + **Notice** | `true` | `true` для false, 0, '' |

### 6. Практические сценарии

#### **Безопасная проверка:**
```php
// ПЛОХО - может вызвать Notice
if (is_null($maybe_undefined)) {
    // ...
}

// ХОРОШО - безопасная проверка
if (!isset($maybe_undefined) || $maybe_undefined === null) {
    // Переменная либо не объявлена, либо равна null
}
```

#### **В функциях с nullable-параметрами:**
```php
function processUser(?string $name): void {
    if (is_null($name)) {
        echo "Name is not provided";
        return;
    }
    echo "Hello, $name";
}

processUser(null); // "Name is not provided"
processUser("John"); // "Hello, John"
```

### 7. Особенности с типами (PHP 7.1+)

#### **Nullable types:**
```php
function findUser(int $id): ?User {
    // Возвращает User или null
    return $users[$id] ?? null;
}

$user = findUser(123);
if (is_null($user)) {
    echo "User not found";
}
```

#### **Union types с null (PHP 8.0+):**
```php
function processValue(string|int|null $value): void {
    if (is_null($value)) {
        echo "Value is null";
    }
}
```

### 8. Отличие от `empty()` и `isset()`

```php
$values = [null, 0, '', false, [], '0'];

foreach ($values as $value) {
    echo "Value: " . json_encode($value);
    echo " | is_null: " . (is_null($value) ? 'true' : 'false');
    echo " | empty: " . (empty($value) ? 'true' : 'false');
    echo " | isset: " . (isset($value) ? 'true' : 'false');
    echo "\n";
}
```

### 9. Лучшие практики

#### **Используйте `=== null` вместо `is_null()`:**
```php
// Функционально одинаковы, но === быстрее и короче
if ($var === null) { ... }  // Предпочтительнее
if (is_null($var)) { ... }  // Работает, но медленнее
```

#### **Для проверки существования переменной:**
```php
// Проверка на существование и не-null
if (isset($variable)) {
    // Переменная существует и не равна null
}

// Проверка конкретно на null (только для объявленных переменных)
if (isset($variable) && $variable === null) {
    // Переменная существует и равна null
}
```

### 10. Производительность

`$var === null` обычно **быстрее**, чем `is_null($var)`, так как:
- `===` — языковая конструкция
- `is_null()` — вызов функции

### Итог:

`is_null()` — функция для проверки значения на `null`. Ключевые особенности:

1. **Возвращает `true` только для `null`**
2. **Генерирует Notice для необъявленных переменных** — это главная опасность
3. **Функционально эквивалентна `=== null`**
4. **Медленнее чем `=== null`**

**Рекомендация:** В большинстве случаев используйте `$var === null` вместо `is_null($var)` — это быстрее и безопаснее. Для проверки существования переменной всегда используйте `isset()` перед проверкой на `null`.
