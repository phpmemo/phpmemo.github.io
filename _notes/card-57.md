---
layout: note
title: "Функция file_get_contents() в PHP читает весь файл или URL в строку"
card_id: 57
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  file_get_contents(string $filename, bool $use_include_path = false, 
                  resource $context = ?, int $offset = 0, 
                  int $length = ?): string|false
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `file_get_contents()` читает весь файл или URL в строку. Работает с локальными файлами и HTTP (если включен `allow_url_fopen`). Можно настроить через stream context. Возвращает строку или `false` при ошибке. Не подходит для больших файлов — использует много памяти.
---
### 1. Основное назначение и синтаксис

`file_get_contents()` — это функция для **чтения всего содержимого файла в строку**.

```php
file_get_contents(string $filename, bool $use_include_path = false, 
                  resource $context = ?, int $offset = 0, 
                  int $length = ?): string|false
```

- `$filename` — путь к файлу или URL
- Возвращает содержимое файла как строку или `false` при ошибке

### 2. Базовое использование

#### **Чтение локального файла:**
```php
$content = file_get_contents('/path/to/file.txt');
echo $content; // Весь содержимое файла как строка
```

#### **Чтение с проверкой ошибок:**
```php
$content = file_get_contents('/path/to/file.txt');
if ($content === false) {
    die('Не удалось прочитать файл');
}
echo $content;
```

### 3. Чтение из URL (HTTP/HTTPS)

Функция может читать данные по HTTP:

```php
$html = file_get_contents('https://example.com');
$api_response = file_get_contents('https://api.example.com/data.json');
```

**Важно:** Для работы с HTTP требуется включенная директива `allow_url_fopen = On`

### 4. Контекст потока (Stream Context)

Для настройки HTTP-запросов используется контекст:

#### **POST-запрос с данными:**
```php
$data = http_build_query(['name' => 'John', 'age' => 30]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => $data
    ]
]);

$response = file_get_contents('https://api.example.com/users', false, $context);
```

#### **С заголовками:**
```php
$context = stream_context_create([
    'http' => [
        'header' => "User-Agent: MyBot/1.0\r\n" .
                   "Authorization: Bearer token123\r\n"
    ]
]);

$response = file_get_contents('https://api.example.com/data', false, $context);
```

### 5. Чтение части файла

#### **Смещение (offset):**
```php
// Чтение с 10-го байта
$content = file_get_contents('file.txt', false, null, 10);
```

#### **Ограничение длины:**
```php
// Чтение только 100 байт с начала файла
$content = file_get_contents('file.txt', false, null, 0, 100);
```

### 6. Использование include_path

Поиск файла в include path:

```php
// Ищет file.txt в директориях из include_path
$content = file_get_contents('file.txt', true);
```

### 7. Практическое применение

#### **Чтение конфигурации:**
```php
$config_json = file_get_contents('config.json');
$config = json_decode($config_json, true);
```

#### **Загрузка API данных:**
```php
$api_url = 'https://api.example.com/users';
$users_json = file_get_contents($api_url);
$users = json_decode($users_json, true);
```

#### **Чтение PHP-файла как текста:**
```php
$source_code = file_get_contents(__FILE__);
echo htmlspecialchars($source_code);
```

### 8. Безопасность

#### **Проверка существования файла:**
```php
$filename = 'user_uploaded_file.txt';
if (!file_exists($filename)) {
    die('Файл не существует');
}
$content = file_get_contents($filename);
```

### 9. Ограничения и ошибки

#### **Лимиты:**
- `memory_limit` — может быть превышен при чтении больших файлов
- `max_execution_time` — для медленных сетевых ресурсов
- `allow_url_fopen` — должна быть включена для HTTP

#### **Обработка ошибок:**
```php
$content = @file_get_contents('nonexistent.txt');
if ($content === false) {
    $error = error_get_last();
    echo "Ошибка: " . $error['message'];
}
```

### 10. Альтернативы

#### **Для больших файлов — `fopen()` + `fread()`:**
```php
$handle = fopen('large_file.txt', 'r');
$content = '';
while (!feof($handle)) {
    $content .= fread($handle, 8192); // Чтение по частям
}
fclose($handle);
```

#### **cURL для сложных HTTP-запросов:**
```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.example.com/data');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
```

### 11. Производительность

- **Быстрее** чем `fopen()` + `fread()` для маленьких файлов
- **Медленнее** и потребляет больше памяти для больших файлов
- **Кэширование** — может использовать кэш потоков PHP

### Итог:

`file_get_contents()` — универсальная функция для чтения данных:

1. **Локальные файлы** — быстрое чтение всего содержимого
2. **URL** — простые HTTP-запросы (требует `allow_url_fopen`)
3. **Гибкая настройка** через stream context
4. **Частичное чтение** через offset и length

**Преимущества:** Простота использования, подходит для маленьких файлов и простых HTTP-запросов.

**Недостатки:** Потребляет много памяти для больших файлов, ограниченные возможности для HTTP по сравнению с cURL.

**Рекомендация:** Используйте для маленьких файлов и простых запросов. Для больших файлов или сложных HTTP-сценариев выбирайте альтернативы.
