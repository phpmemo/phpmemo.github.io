---
layout: note
title: "parse_str() — функция PHP для парсинга строки запроса"
card_id: 56
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  parse_str(string $string, array &$result): void
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `parse_str()` парсит строку запроса (`name=John&age=30`) в переменные. Без второго параметра опасно — создает переменные в глобальной области. Всегда используйте с массивом: `parse_str($query, $result)`. Автоматически URL-декодирует значения и поддерживает массивы.
---
### 1. Основное назначение и синтаксис

`parse_str()` — это функция для **парсинга строки запроса** (query string) и преобразования её в переменные или массив.

```php
parse_str(string $string, array &$result): void
```

- `$string` — строка запроса (например, `"name=John&age=30"`)
- `$result` — опциональный массив для сохранения результатов

### 2. Поведение без второго параметра (ОПАСНО!)

Если не передать второй параметр, функция создает переменные в текущей области видимости.

#### **Опасный пример:**
```php
$query = "name=John&age=30&admin=1";

parse_str($query); // ОПАСНО! Создает переменные напрямую

echo $name;   // John
echo $age;    // 30  
echo $admin;  // 1 - потенциальная уязвимость!
```

**Проблема:** Пользователь может передать любые имена переменных и перезаписать существующие.

### 3. Безопасное использование со вторым параметром

Всегда передавайте второй параметр для сохранения результатов в массив:

```php
$query = "name=John&age=30&admin=1";
$params = [];

parse_str($query, $params);

print_r($params);
// Array
// (
//     [name] => John
//     [age] => 30
//     [admin] => 1
// )
```

### 4. Особенности парсинга

#### **Сложные структуры:**
```php
$query = "user[name]=John&user[age]=30&colors[]=red&colors[]=blue";
$data = [];

parse_str($query, $data);

print_r($data);
// Array
// (
//     [user] => Array
//         (
//             [name] => John
//             [age] => 30
//         )
//     [colors] => Array
//         (
//             [0] => red
//             [1] => blue
//         )
// )
```

#### **Специальные символы:**
```php
$query = "message=Hello%20World&price=100%24";
$data = [];

parse_str($query, $data);

print_r($data);
// Array
// (
//     [message] => Hello World
//     [price] => 100$
// )
```

### 5. Практическое применение

#### **Парсинг URL:**
```php
$url = "https://example.com/page.php?name=John&age=30&action=edit";
$queryString = parse_url($url, PHP_URL_QUERY);
$params = [];

parse_str($queryString, $params);

echo $params['name'];   // John
echo $params['action']; // edit
```

#### **Обработка входящих данных:**
```php
// Например, из POST-запроса с Content-Type: application/x-www-form-urlencoded
$input = file_get_contents('php://input');
$data = [];

parse_str($input, $data);

// Теперь $data содержит разобранные параметры
```

### 6. Безопасность — КРИТИЧЕСКИ ВАЖНО!

#### **Уязвимость к перезаписи переменных:**
```php
// Исходные переменные
$isAdmin = false;
$authToken = 'secret';

// Пользовательский ввод (может быть из GET/POST)
$userInput = "isAdmin=1&authToken=hacked";

parse_str($userInput); // КАТАСТРОФА!

var_dump($isAdmin);   // true - перезаписано!
var_dump($authToken); // 'hacked' - перезаписано!
```

#### **Защищенный подход:**
```php
$userInput = "isAdmin=1&authToken=hacked";
$safeData = [];

parse_str($userInput, $safeData);

// Переменные не затронуты
var_dump($isAdmin);   // false
var_dump($authToken); // 'secret'

// Данные доступны безопасно через массив
var_dump($safeData['isAdmin']);   // '1'
```

### 7. Отличие от похожих функций

| Функция | Назначение | Возвращает |
|---------|------------|------------|
| **`parse_str()`** | Парсит query string | `void` (результат в параметр) |
| **`parse_url()`** | Парсит URL компоненты | Массив компонентов URL |
| **`http_build_query()`** | Обратная операция — создает query string | String |

### 8. Лучшие практики

#### **Всегда используйте второй параметр:**
```php
// ПЛОХО
parse_str($input); // Создает переменные

// ХОРОШО
$data = [];
parse_str($input, $data);
```

#### **Валидация полученных данных:**
```php
$input = "age=30&email=john@example.com";
$data = [];

parse_str($input, $data);

// Валидация
$age = filter_var($data['age'] ?? 0, FILTER_VALIDATE_INT);
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);

if ($age === false || $email === false) {
    throw new InvalidArgumentException('Invalid input data');
}
```

### 9. Особенности работы с массивами

```php
// Нотация с квадратными скобками
$query = "items[0]=apple&items[1]=banana&settings[theme]=dark";
$data = [];

parse_str($query, $data);

print_r($data);
// Array
// (
//     [items] => Array
//         (
//             [0] => apple
//             [1] => banana
//         )
//     [settings] => Array
//         (
//             [theme] => dark
//         )
// )
```

### Итог:

`parse_str()` — функция для парсинга строки запроса. Ключевые моменты:

1. **Без второго параметра — ОПАСНО** (создает переменные в глобальной области)
2. **С вторым параметром — безопасно** (сохраняет в массив)
3. **Поддерживает сложные структуры** (массивы, вложенные данные)
4. **Автоматически URL-декодирует** значения
5. **Критически важна для безопасности** — всегда используйте с вторым параметром

**Рекомендация:** Никогда не используйте `parse_str()` без второго параметра. Всегда сохраняйте результат в массив и тщательно валидируйте полученные данные.
