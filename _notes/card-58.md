---
layout: note
title: "php://input — поток для чтения сырого тела HTTP-запроса"
card_id: 58
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Что представляет собой поток `php://input` в PHP, как он используется и в каких сценариях его применение предпочтительнее работы с суперглобальным массивом `$_POST`?

short_answer: |
  `php://input` — поток для чтения сырого тела HTTP-запроса. Используется через `file_get_contents('php://input')`. Идеален для JSON/XML API. Не работает с `multipart/form-data` (загрузка файлов). Возвращает данные как есть, без парсинга, в отличие от `$_POST`.
---
## Что такое `php://input`

`php://input` — это **поток только для чтения**, который позволяет получить **сырые (raw) данные тела HTTP-запроса**.

### Основные характеристики:

- **Только для чтения** — нельзя записывать данные
- **Содержит "сырое" тело запроса** — именно то, что пришло от клиента
- **Доступен только один раз** — поток нельзя перемотать или прочитать повторно
- **Недоступен для запросов с типом содержимого `multipart/form-data`** (загрузка файлов)

## Синтаксис использования

```php
$raw_input = file_get_contents('php://input');
```

## Практическое применение

### 1. **Обработка JSON API запросов**
```php
// Клиент отправляет: {"name":"John","age":30}
$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

echo $data['name']; // John
echo $data['age'];  // 30
```

### 2. **Обработка XML данных**
```php
$xml_data = file_get_contents('php://input');
$xml = simplexml_load_string($xml_data);
```

### 3. **Логирование сырых запросов**
```php
$raw_request = file_get_contents('php://input');
file_put_contents('request.log', $raw_request . PHP_EOL, FILE_APPEND);
```

## Отличие от `$_POST`

Это критически важное различие:

| | `php://input` | `$_POST` |
|---|---|---|
| **Формат данных** | Сырые данные как есть | Только `application/x-www-form-urlencoded` и `multipart/form-data` |
| **Тип контента** | Любой (JSON, XML, plain text) | Только формы |
| **Доступ к файлам** | Нет | Да (через `$_FILES`) |
| **Парсинг** | Ручной (ваш код) | Автоматический (PHP) |

### Пример различия:

**Клиент отправляет JSON:**
```json
{"username": "john", "password": "secret"}
```

```php
// $_POST - БУДЕТ ПУСТЫМ!
var_dump($_POST); // array(0) { }

// php://input - получит сырые данные
$input = file_get_contents('php://input');
echo $input; // '{"username": "john", "password": "secret"}'

$data = json_decode($input, true);
echo $data['username']; // john
```

## Особенности и ограничения

### **Не работает с `multipart/form-data`:**
```php
// Для форм с загрузкой файлов (enctype="multipart/form-data")
// php://input будет ПУСТЫМ!
```

### **Доступен только один раз:**
```php
$first_read = file_get_contents('php://input');  // OK
$second_read = file_get_contents('php://input'); // ПУСТО!
```

### **Размер данных:**
Может быть ограничен директивами `post_max_size` и `memory_limit`.

## Best Practices

### **Всегда проверяйте результат:**
```php
$input = file_get_contents('php://input');
if ($input === false) {
    http_response_code(400);
    die('Failed to read input');
}
```

### **Для JSON API:**
```php
header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Работа с $data...
```

### **С обработкой ошибок:**
```php
try {
    $input = file_get_contents('php://input');
    if ($input === false) {
        throw new Exception('Cannot read input stream');
    }
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    // Обработка данных...
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
```

## Когда использовать?

- **REST API** — получение JSON/XML данных
- **Webhooks** — обработка входящих уведомлений
- **Кастомные протоколы** — нестандартные форматы данных
- **Отладка** — логирование сырых запросов

## Когда НЕ использовать?

- **Обычные HTML-формы** — используйте `$_POST`
- **Загрузка файлов** — используйте `$_FILES`
- **GET-параметры** — используйте `$_GET`

## Итог:

`php://input` — поток для чтения **сырого тела HTTP-запроса**. Ключевые особенности:

1. **Только для чтения** и **одноразовый**
2. **Не парсит данные** — возвращает как есть
3. **Не работает с `multipart/form-data`**
4. **Идеален для API** (JSON, XML, кастомные форматы)
5. **Альтернатива `$_POST`** для не-форменных данных

Понимание `php://input` критически важно для работы с современными API и веб-сервисами.
