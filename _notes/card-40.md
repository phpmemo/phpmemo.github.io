---
layout: note
title: "set_exception_handler() — это функция PHP для установки пользовательского обработчика необработанных исключений"
card_id: 40
date: 2025-09-26
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  set_exception_handler(callable $callback): ?callable
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `set_exception_handler()` — это механизм "последней линии защиты" для перехвата **непойманных исключений**. Она гарантирует, что даже если разработчик забыл обернуть код в `try/catch`, исключение будет корректно обработано — залогировано, и пользователь увидит адекватное сообщение вместо белого экрана. Критически важный инструмент для создания отказоустойчивых приложений.
---
### 1. Основное назначение и синтаксис

`set_exception_handler()` — это функция для установки **пользовательского обработчика необработанных исключений**. Она перехватывает исключения, которые не были пойманы ни одним блоком `catch`.

```php
set_exception_handler(callable $callback): ?callable
```

- Принимает callable-функцию (имя функции, анонимную функцию, метод объекта)
- Возвращает предыдущий обработчик или `null`, если его не было

### 2. Как работает?

Когда в коде возникает исключение, и оно **не перехватывается** блоком `try/catch`, PHP ищет зарегистрированный обработчик через `set_exception_handler()`. Если обработчик найден — управление передается ему. Если нет — выполнение скрипта завершается с фатальной ошибкой.

```php
// Устанавливаем обработчик
set_exception_handler(function($exception) {
    echo "Поймано исключение: " . $exception->getMessage();
});

// Исключение без try/catch
throw new Exception("Что-то пошло не так!");

// Этот код не выполнится, так как исключение уже обработано
echo "Этот текст не увидим";
```

### 3. Сигнатура функции-обработчика

Обработчик должен принимать **один аргумент** — объект исключения, реализующий интерфейс `Throwable`.

```php
function myExceptionHandler(Throwable $exception) {
    // Логика обработки
}

set_exception_handler('myExceptionHandler');
```

### 4. Практическое применение

#### **Логирование исключений:**
```php
set_exception_handler(function(Throwable $e) {
    $message = date('[Y-m-d H:i:s]') . " Необработанное исключение: " . 
               $e->getMessage() . " в файле " . $e->getFile() . 
               " на строке " . $e->getLine() . PHP_EOL;
    
    file_put_contents('logs/exceptions.log', $message, FILE_APPEND);
    
    // Показываем пользователю友好ское сообщение
    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
        echo "Произошла внутренняя ошибка. Администратор уведомлен.";
    }
});

// Где-то в коде без try/catch
throw new RuntimeException("Ошибка базы данных");
```

#### **Отправка уведомлений:**
```php
set_exception_handler(function(Throwable $e) {
    // Логируем
    error_log($e->getMessage());
    
    // Отправляем email администратору (в продакшене)
    if (!in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) {
        mail('admin@site.com', 'Критическая ошибка', $e->getMessage());
    }
    
    // Завершаем выполнение
    exit(1);
});
```

### 5. Восстановление предыдущего обработчика

Функция возвращает предыдущий обработчик, который можно сохранить и восстановить позже.

```php
// Сохраняем предыдущий обработчик
$previousHandler = set_exception_handler(function($e) {
    // Новый обработчик
});

// Восстанавливаем старый
set_exception_handler($previousHandler);
```

### 6. Сброс обработчика

`restore_exception_handler()` — восстанавливает предыдущий обработчик, удаляя текущий.

```php
set_exception_handler($handler1);
set_exception_handler($handler2); // Теперь активен handler2

restore_exception_handler(); // Восстанавливается handler1
restore_exception_handler(); // Обработчик сбрасывается полностью
```

### 7. Отличие от `set_error_handler()`

Важно понимать разницу:

| Функция | Что перехватывает | Тип |
|---------|-------------------|-----|
| **`set_exception_handler()`** | Непойманные **исключения** (Exception) | `Throwable` |
| **`set_error_handler()`** | **Ошибки** (E_ERROR, E_WARNING и др.) | `int $code, string $message...` |

**Но есть нюанс:** Начиная с PHP 7, большинство фатальных ошибок стали выбрасывать `Error` (который также реализует `Throwable`), поэтому `set_exception_handler()` может перехватывать и их.

### 8. Обработка Error vs Exception (PHP 7+)

С PHP 7 появился класс `Error`, который также реализует `Throwable`:

```php
set_exception_handler(function(Throwable $e) {
    if ($e instanceof Exception) {
        echo "Это исключение: " . $e->getMessage();
    } elseif ($e instanceof Error) {
        echo "Это ошибка: " . $e->getMessage();
    }
});

// Перехватится set_exception_handler
throw new Exception("Мое исключение"); 
// Также перехватится (PHP 7+)
nonexistentFunction(); // Fatal Error -> Error exception
```

### 9. Лучшие практики

#### **Всегда логируйте исключения:**
```php
set_exception_handler(function(Throwable $e) {
    error_log("Uncaught exception: " . $e->getMessage());
    // ...
});
```

#### **Не показывайте детали ошибок пользователям:**
```php
set_exception_handler(function(Throwable $e) {
    if (DEBUG_MODE) {
        // Показываем детали только в режиме разработки
        echo "Ошибка: " . $e->getMessage();
    } else {
        // В продакшене — общее сообщение
        http_response_code(500);
        echo "Внутренняя ошибка сервера";
    }
    exit(1);
});
```

#### **Используйте вместе с регистрацией ошибок:**
```php
// Устанавливаем обработчики
set_error_handler(function($code, $message, $file, $line) {
    throw new ErrorException($message, 0, $code, $file, $line);
});

set_exception_handler(function(Throwable $e) {
    // Теперь сюда попадают и ошибки, преобразованные в ErrorException
    echo "Поймано: " . $e->getMessage();
});

// Эта ошибка преобразуется в исключение и попадает в exception_handler
echo $undefinedVariable;
```

### 10. Ограничения

- **Не перехватывает фатальные ошибки на этапе парсинга** (синтаксические ошибки)
- **Не перехватывает некоторые типы фатальных ошибок** (например, out of memory)
- **Обработчик вызывается только один раз** — после него скрипт завершается

### Итог:

`set_exception_handler()` — это механизм "последней линии защиты" для перехвата **непойманных исключений**. Она гарантирует, что даже если разработчик забыл обернуть код в `try/catch`, исключение будет корректно обработано — залогировано, и пользователь увидит адекватное сообщение вместо белого экрана. Критически важный инструмент для создания отказоустойчивых приложений.
