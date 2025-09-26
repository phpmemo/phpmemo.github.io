---
layout: note
title: "set_error_handler() — мощный инструмент PHP для кастомной обработки не-фатальных ошибок"
card_id: 42
date: 2025-09-26
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  set_error_handler(callable $callback, int $error_levels = E_ALL): ?callable
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `set_error_handler()` — мощный инструмент для кастомной обработки **не-фатальных ошибок** PHP. Она позволяет:
  - **Логировать ошибки** в нужном формате
  - **Преобразовывать ошибки в исключения** 
  - **Гибко настраивать отображение** ошибок для разных окружений
  - **Создавать единую систему** обработки ошибок в приложении
---
### 1. Основное назначение и синтаксис

`set_error_handler()` — это функция для установки **пользовательского обработчика ошибок**. Она перехватывает ошибки, которые обычно выводятся в лог или отображаются пользователю.

```php
set_error_handler(callable $callback, int $error_levels = E_ALL): ?callable
```

- `$callback` — функция-обработчик
- `$error_levels` — маска типов ошибок, которые будет обрабатывать handler (по умолчанию `E_ALL`)
- Возвращает предыдущий обработчик или `null`

### 2. Сигнатура функции-обработчика

Обработчик должен принимать **4 обязательных параметра**:

```php
function myErrorHandler(
    int $errno,      // Уровень ошибки (E_ERROR, E_WARNING и т.д.)
    string $errstr,   // Сообщение об ошибке
    string $errfile,  // Файл, где произошла ошибка
    int $errline      // Строка, где произошла ошибка
): bool {
    // Возвращает true, если ошибка обработана, false - для передачи встроенному обработчику
    return true;
}
```

### 3. Типы ошибок, которые можно перехватить

`set_error_handler()` перехватывает **не-фатальные** ошибки:

- `E_WARNING` — предупреждения
- `E_NOTICE` — уведомления  
- `E_USER_ERROR` — пользовательские ошибки
- `E_USER_WARNING` — пользовательские предупреждения
- `E_USER_NOTICE` — пользовательские уведомления
- `E_DEPRECATED` — устаревшие функции
- `E_USER_DEPRECATED` — пользовательские deprecated-уведомления

**Не перехватываются:**
- `E_ERROR` — фатальные ошибки
- `E_PARSE` — ошибки парсинга
- `E_CORE_ERROR` — ошибки ядра
- `E_COMPILE_ERROR` — ошибки компиляции

### 4. Практические примеры

#### **Базовый обработчик:**
```php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo "Ошибка [$errno]: $errstr в $errfile на строке $errline";
    return true; // Ошибка обработана, стандартный обработчик не вызывается
});

echo $undefinedVar; // Выведет наше сообщение вместо стандартного Notice
```

#### **Логирование ошибок:**
```php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    $message = date('[Y-m-d H:i:s]') . " [$errno] $errstr в $errfile:$errline";
    file_put_contents('error.log', $message . PHP_EOL, FILE_APPEND);
    
    // В продакшене не показываем детали пользователю
    if (!DEBUG_MODE) {
        echo "Произошла ошибка. Мы уже работаем над исправлением.";
    }
    return true;
});
```

### 5. Преобразование ошибок в исключения

Распространенная практика — преобразовывать ошибки в исключения `ErrorException`:

```php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

try {
    echo $undefinedVariable; // Выбросит ErrorException вместо Notice
} catch (ErrorException $e) {
    echo "Поймано исключение: " . $e->getMessage();
}
```

### 6. Обработка только определенных типов ошибок

Можно указать, какие типы ошибок должен обрабатывать handler:

```php
// Обрабатываем только WARNING и ERROR, но не NOTICE
set_error_handler('myHandler', E_WARNING | E_USER_ERROR);

function myHandler($errno, $errstr, $errfile, $errline) {
    // Сюда попадут только WARNING и ERROR
    return true;
}
```

### 7. Возвращаемое значение обработчика

- **`return true`** — ошибка обработана, стандартный обработчик не вызывается
- **`return false`** — ошибка передается стандартному обработчику PHP

```php
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if ($errno === E_NOTICE) {
        // Игнорируем Notice, передаем остальное стандартному обработчику
        return false;
    }
    
    // Обрабатываем все остальные типы ошибок
    echo "Серьезная ошибка: $errstr";
    return true;
});
```

### 8. Восстановление и сброс обработчика

#### **Сохраняем предыдущий обработчик:**
```php
$previousHandler = set_error_handler('myErrorHandler');

// Восстанавливаем
set_error_handler($previousHandler);
```

#### **Сброс к стандартному обработчику:**
```php
restore_error_handler(); // Восстанавливает предыдущий обработчик
```

### 9. Отличие от `set_exception_handler()`

Критически важное различие:

| Аспект | `set_error_handler()` | `set_exception_handler()` |
|--------|---------------------|-------------------------|
| **Что перехватывает** | Ошибки (E_WARNING, E_NOTICE) | Непойманные исключения |
| **Сигнатура** | `function($errno, $errstr, $errfile, $errline)` | `function(Throwable $exception)` |
| **Фатальные ошибки** | Не перехватывает | Перехватывает (кроме parse error) |

### 10. Практическое применение в проектах

#### **Единый обработчик ошибок:**
```php
class ErrorHandler {
    public static function handleError($errno, $errstr, $errfile, $errline) {
        // Логируем в файл
        self::logError($errno, $errstr, $errfile, $errline);
        
        // В режиме разработки показываем подробности
        if (APP_ENV === 'development') {
            self::displayError($errno, $errstr, $errfile, $errline);
        }
        
        return true;
    }
    
    private static function logError($errno, $errstr, $errfile, $errline) {
        $message = "[$errno] $errstr in $errfile:$errline";
        error_log($message);
    }
}

set_error_handler(['ErrorHandler', 'handleError']);
```

#### **Комбинированная обработка ошибок и исключений:**
```php
// Преобразуем ошибки в исключения
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

// Обрабатываем все непойманные исключения
set_exception_handler(function($exception) {
    error_log("Uncaught exception: " . $exception->getMessage());
    http_response_code(500);
    echo "Internal Server Error";
});
```

### 11. Ограничения и особенности

- **Не перехватывает фатальные ошибки** — для них нужен `register_shutdown_function()`
- **@-оператор** подавляет ошибки до вызова обработчика
- **Не влияет на error_reporting()** — только на отображение/логирование

### Итог:

`set_error_handler()` — мощный инструмент для кастомной обработки **не-фатальных ошибок** PHP. Она позволяет:
- **Логировать ошибки** в нужном формате
- **Преобразовывать ошибки в исключения** 
- **Гибко настраивать отображение** ошибок для разных окружений
- **Создавать единую систему** обработки ошибок в приложении

Критически важно понимать разницу между обработкой ошибок и исключений, а также помнить о невозможности перехвата фатальных ошибок через этот механизм.
