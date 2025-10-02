---
layout: note
title: "register_shutdown_function() регистрирует функцию, которая выполняется после завершения скрипта"
card_id: 43
date: 2025-10-02
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  register_shutdown_function(callable $callback, mixed ...$args): void
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `register_shutdown_function()` регистрирует функцию, которая выполняется после завершения скрипта, даже при фатальных ошибках или exit(). Используется для обработки фатальных ошибок (через `error_get_last()`), гарантированного освобождения ресурсов и финального логирования.
---
### 1. Основное назначение и синтаксис

`register_shutdown_function()` регистрирует функцию, которая будет выполнена **после завершения работы скрипта** или при его аварийном завершении.

```php
register_shutdown_function(callable $callback, mixed ...$args): void
```

- Можно зарегистрировать несколько функций — они выполнятся в порядке регистрации
- Функции выполняются даже при фатальных ошибках или `exit()/die()`

### 2. Когда вызываются shutdown-функции?

Функции выполняются в следующих случаях:
- **Нормальное завершение** скрипта
- **Вызов `exit()` или `die()`**
- **Фатальные ошибки** (Fatal errors)
- **Превышение лимита времени** выполнения (max_execution_time)
- **Превышение лимита памяти** (memory_limit)
- **Парсер обнаружил фатальную ошибку** (только некоторые типы)

### 3. Практическое применение

#### **Обработка фатальных ошибок:**
```php
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && $error['type'] === E_ERROR) {
        // Логируем фатальную ошибку
        error_log("Fatal error: {$error['message']} in {$error['file']}:{$error['line']}");
        
        // Показываем пользователю友好ское сообщение
        if (headers_sent() === false) {
            http_response_code(500);
            echo "Извините, произошла внутренняя ошибка";
        }
    }
});

// Вызовет фатальную ошибку, но shutdown function выполнится
nonexistent_function();
```

#### **Гарантированное освобождение ресурсов:**
```php
$dbConnection = null;
$fileHandle = null;

register_shutdown_function(function() use (&$dbConnection, &$fileHandle) {
    if ($dbConnection !== null) {
        $dbConnection->close();
    }
    if ($fileHandle !== null) {
        fclose($fileHandle);
    }
    echo "Ресурсы освобождены";
});

// Даже если здесь произойдет ошибка, соединение закроется
$dbConnection = new DatabaseConnection();
some_risky_operation();
```

#### **Логирование времени выполнения:**
```php
$startTime = microtime(true);

register_shutdown_function(function() use ($startTime) {
    $executionTime = microtime(true) - $startTime;
    file_put_contents('performance.log', 
        "Script executed in: " . round($executionTime, 4) . " seconds" . PHP_EOL, 
        FILE_APPEND
    );
});
```

### 4. Работа с error_get_last()

`error_get_last()` возвращает информацию о последней произошедшей ошибке — это ключевой инструмент в shutdown functions.

```php
register_shutdown_function(function() {
    $error = error_get_last();
    
    if ($error !== null) {
        switch ($error['type']) {
            case E_ERROR:
            case E_PARSE:
            case E_CORE_ERROR:
            case E_COMPILE_ERROR:
                // Критическая ошибка - логируем и уведомляем
                error_log("CRITICAL: {$error['message']}");
                break;
            case E_WARNING:
            case E_NOTICE:
                // Менее критичные ошибки
                break;
        }
    }
});
```

### 5. Особенности и ограничения

#### **Что МОЖНО делать в shutdown function:**
- Логирование в файлы
- Отправка заголовков (если они еще не отправлены)
- Закрытие соединений с БД и файлов
- Отправка email-уведомлений
- Очистка временных файлов

#### **Что НЕЛЬЗЯ делать:**
- **Выполнять длительные операции** (скрипт уже завершается)
- **Полагаться на сессии** (session handler может быть уже закрыт)
- **Использовать некоторые расширения** (они могут быть уже выгружены)

### 6. Комбинирование с другими обработчиками

#### **Полная система обработки ошибок:**
```php
// Обычные ошибки -> в исключения
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Непойманные исключения
set_exception_handler(function($exception) {
    error_log("Uncaught exception: " . $exception->getMessage());
});

// Фатальные ошибки
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        error_log("Shutdown due to: {$error['message']}");
    }
});
```

### 7. Передача аргументов в shutdown function

```php
$userId = 123;
$action = 'process_data';

register_shutdown_function(function($userId, $action) {
    error_log("User $userId completed action: $action");
}, $userId, $action);
```

### 8. Множественная регистрация

```php
register_shutdown_function(function() {
    echo "First shutdown function\n";
});

register_shutdown_function(function() {
    echo "Second shutdown function\n";
});

// Выведет:
// First shutdown function
// Second shutdown function
```

### 9. Практические кейсы использования

#### **Гарантированное логирование:**
```php
class Logger {
    private static $logs = [];
    
    public static function log($message) {
        self::$logs[] = $message;
    }
    
    public static function registerShutdown() {
        register_shutdown_function(function() {
            if (!empty(self::$logs)) {
                file_put_contents('app.log', implode(PHP_EOL, self::$logs) . PHP_EOL, FILE_APPEND);
            }
        });
    }
}

Logger::registerShutdown();
Logger::log("Важное сообщение");
// Даже при фатальной ошибке сообщение будет записано
```

#### **Очистка временных данных:**
```php
$tempFile = '/tmp/processing_' . uniqid();

register_shutdown_function(function() use ($tempFile) {
    if (file_exists($tempFile)) {
        unlink($tempFile);
    }
});

// Работа с временным файлом...
```

### 10. Отладка и тестирование

```php
register_shutdown_function(function() {
    $memory = memory_get_peak_usage(true) / 1024 / 1024;
    $time = microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'];
    
    error_log("Memory peak: {$memory}MB, Time: {$time}s");
});
```

### Итог:

`register_shutdown_function()` — это механизм "последнего рубежа" выполнения кода в PHP. Его ключевые особенности:

1. **Выполняется всегда** — даже при фатальных ошибках и `exit()`
2. **Не перехватывает ошибки** — но позволяет их обнаружить через `error_get_last()`
3. **Полезен для**:
   - Обработки фатальных ошибок
   - Гарантированного освобождения ресурсов
   - Финального логирования и очистки
   - Мониторинга производительности

4. **Ограничения** — нельзя полагаться на все расширения и сервисы

Это критически важный инструмент для создания отказоустойчивых приложений, особенно в сочетании с `set_error_handler()` и `set_exception_handler()`.
