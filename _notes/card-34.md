---
layout: note
title: "$_SERVER — это важнейший суперглобальный массив в PHP для получения информации о сервере и HTTP-запросе"
card_id: 34
date: 2025-09-23
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Опишите назначение массива `$_SERVER`. Какие его элементы наиболее важны для реализации роутинга, определения среды выполнения и обеспечения безопасности? Какие данные из этого массива считаются ненадежными и почему?

short_answer: |
  `$_SERVER` — суперглобальный массив с данными о сервере и HTTP-запросе. Ключевые элементы: `REQUEST_METHOD`, `REQUEST_URI`, `HTTP_HOST`, `REMOTE_ADDR`.
  **Использование:** роутинг, определение среды (dev/prod), логирование, безопасность (проверка HTTPS). Данные из заголовков (`HTTP_*`) ненадежны — их можно подделать. Всегда проверяйте существование ключей.
---
### 1. Что такое `$_SERVER`?

`$_SERVER` — это **суперглобальный массив**, который содержит информацию о серверной среде и текущем HTTP-запросе. Он доступен в любой области видимости скрипта.

### 2. Ключевые элементы и их значение

Массив содержит десятки ключей. Вот наиболее важные и часто используемые:

#### **Информация о сервере и скрипте:**
- `$_SERVER['DOCUMENT_ROOT']` — корневая директория веб-сервера (`/var/www/html`)
- `$_SERVER['SERVER_NAME']` — имя сервера (`example.com`)
- `$_SERVER['SERVER_SOFTWARE']` — информация о сервере (`Apache/2.4.41`)

#### **Информация о текущем скрипте:**
- `$_SERVER['PHP_SELF']` — путь к текущему скрипту относительно DOCUMENT_ROOT (`/index.php`)
- `$_SERVER['SCRIPT_FILENAME']` — абсолютный путь к скрипту (`/var/www/html/index.php`)
- `$_SERVER['SCRIPT_NAME']` — аналогично PHP_SELF, но более безопасен

#### **Информация о запросе (самая важная часть):**
- `$_SERVER['REQUEST_METHOD']` — HTTP-метод запроса (`GET`, `POST`, `PUT`, `DELETE`)
- `$_SERVER['REQUEST_URI']` — полный URI запроса (`/page.php?id=1&sort=name`)
- `$_SERVER['QUERY_STRING']` — строка запроса (часть после `?`: `id=1&sort=name`)
- `$_SERVER['PATH_INFO']` — дополнительная информация пути (для ЧПУ)

#### **Информация о клиенте:**
- `$_SERVER['REMOTE_ADDR']` — IP-адрес клиента
- `$_SERVER['HTTP_USER_AGENT']` — информация о браузере клиента
- `$_SERVER['HTTP_REFERER']` — URL страницы, с которой пришел пользователь
- `$_SERVER['HTTP_HOST']` — имя хоста из заголовка запроса

#### **Прочие важные элементы:**
- `$_SERVER['HTTPS']` — работает ли HTTPS (`on`/пусто)
- `$_SERVER['SERVER_PORT']` — порт сервера (`80`, `443`)

### 3. Практическое использование в проектах

#### **1. Роутинг и обработка URL:**
```php
// Определение базового URL приложения
$base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") 
            . "://" . $_SERVER['HTTP_HOST'];

// Получение текущего пути для роутинга
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$current_path = trim($request_uri, '/');

// Пример простого роутера
switch ($current_path) {
    case '':
        show_homepage();
        break;
    case 'about':
        show_about();
        break;
    // ...
}
```

#### **2. Определение среды выполнения:**
```php
// Проверка, работает ли скрипт в CLI или через веб-сервер
if (php_sapi_name() === 'cli' || defined('STDIN')) {
    // CLI-режим
    $environment = 'cli';
} else {
    // Веб-режим
    $environment = 'web';
}

// Определение домена для настроек
$domain = $_SERVER['HTTP_HOST'];
if ($domain === 'localhost') {
    $config = require 'config/local.php';
} else {
    $config = require 'config/production.php';
}
```

#### **3. Логирование и аналитика:**
```php
// Лог доступа
$log_entry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'ip' => $_SERVER['REMOTE_ADDR'],
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'referrer' => $_SERVER['HTTP_REFERER'] ?? 'direct'
];
file_put_contents('access.log', json_encode($log_entry) . PHP_EOL, FILE_APPEND);
```

#### **4. Безопасность и валидация:**
```php
// Проверка HTTPS
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    die('Only POST requests are allowed');
}

// CSRF-защита (упрощенный пример)
if ($_SERVER['HTTP_ORIGIN'] !== 'https://mydomain.com') {
    http_response_code(403);
    die('Invalid origin');
}
```

#### **5. Отладка и разработка:**
```php
// Вывод отладочной информации только для разработчика
$developer_ips = ['192.168.1.100', '127.0.0.1'];
if (in_array($_SERVER['REMOTE_ADDR'], $developer_ips)) {
    echo '<pre>';
    print_r($_SERVER);
    echo '</pre>';
}
```

### 4. Вопросы безопасности и надежности

#### **Ненадежные данные:**
Помните, что большинство данных в `$_SERVER` (особенно заголовки `HTTP_*`) **контролируются клиентом** и могут быть подделаны!

```php
// НЕДОСТОВЕРНЫЕ данные (можно подделать):
$ip = $_SERVER['HTTP_X_FORWARDED_FOR']; // Легко подделывается
$browser = $_SERVER['HTTP_USER_AGENT']; // Можно указать любой

// ОТНОСИТЕЛЬНО достоверные данные:
$ip = $_SERVER['REMOTE_ADDR']; // IP-адрес TCP-соединения
$method = $_SERVER['REQUEST_METHOD']; // Контролируется веб-сервером
```

#### **Правильная обработка IP-адреса:**
```php
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}
```

### 5. Best Practices

1. **Всегда проверяйте существование ключа** перед использованием:
   ```php
   $referrer = $_SERVER['HTTP_REFERER'] ?? 'unknown';
   ```

2. **Фильтруйте и валидируйте** данные из `$_SERVER`, особенно те, что приходят от клиента.

3. **Не используйте `$_SERVER['PHP_SELF']`** в HTML-формах из-за уязвимостей XSS:
   ```php
   // ОПАСНО:
   <form action="<?php echo $_SERVER['PHP_SELF']; ?>">
   
   // БЕЗОПАСНО:
   <form action="">
   ```

4. **Для роутинга** предпочтительнее использовать `$_SERVER['REQUEST_URI']` вместо `$_SERVER['PHP_SELF']`.

### Итог:

`$_SERVER` — это важнейший суперглобальный массив для получения информации о сервере и HTTP-запросе. Основные сценарии использования: роутинг, определение среды, логирование, безопасность. Критически важно помнить, что многие данные (особенно HTTP-заголовки) ненадежны и требуют валидации. В современных фреймворках большая часть работы с `$_SERVER` абстрагирована, но понимание его содержимого необходимо для низкоуровневой разработки и отладки.
