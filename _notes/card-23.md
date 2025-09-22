---
layout: note
title: "defined() — это встроенная функция, которая проверяет, определена ли указанная константа"
card_id: 23
date: 2025-09-20
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  defined(string $constant_name): bool
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `defined()` — это функция для проверки **существования константы** (объявленной через `define()` или `const` или перечисления enum). Она возвращает `true` или `false` и не генерирует ошибок для несуществующих констант. Стандартная практика — использовать `if (!defined('NAME'))` перед `define('NAME', value)` для избежания дублирования.
---
### 1. Основное назначение и синтаксис

`defined()` — это встроенная функция, которая проверяет, определена ли указанная **константа** с помощью директивы `define()` или ключевого слова `const` или перечисления enum (с PHP8.1+).

```php
defined(string $constant_name): bool
```

*   Принимает один аргумент — **строку** с именем константы.
*   Возвращает `true`, если константа существует, и `false` — если нет.

```php
define('APP_VERSION', '1.0.0');
const DEBUG_MODE = true;

var_dump(defined('APP_VERSION')); // bool(true)
var_dump(defined('DEBUG_MODE'));  // bool(true)
var_dump(defined('UNDEFINED_CONST')); // bool(false)
```

### 2. Ключевые особенности

1.  **Работает только с константами.** Это главное отличие от `isset()`, которая работает с переменными. Путать их — частая ошибка новичков.
    ```php
    $variable = 'value';
    define('CONSTANT', 'value');

    var_dump(isset($variable));    // true (для переменной)
    var_dump(defined('CONSTANT')); // true (для константы)

    var_dump(defined('variable')); // false (переменная - не константа)
    var_dump(isset(CONSTANT));     // Ошибка! (использование константы как имени переменной)
    ```

2.  **Регистрозависимость.** По умолчанию имена констант регистрозависимы. Функция `defined()` ищет точное совпадение по имени.
    ```php
    define('MY_CONST', 123);
    var_dump(defined('my_const')); // false
    ```

3.  **Проверка перед определением.** Стандартная практика — использовать `defined()` перед определением константы, чтобы избежать предупреждения о повторном объявлении.
    ```php
    if (!defined('APP_PATH')) {
        define('APP_PATH', dirname(__DIR__));
    }
    ```

4.  **Проверка встроенных и магических констант.** С помощью `defined()` можно проверить существование любых констант, включая встроенные (`PHP_VERSION`), но исключая магические (`__FILE__`).
    ```php
    var_dump(defined('PHP_VERSION')); // true
    var_dump(defined('__LINE__'));    // false (магические константы не определены)
    ```
    
5. **Использование с Enums (PHP 8.1+).** С появлением перечислений (Enums) в PHP 8.1, функция `defined()` обрела еще один важный контекст использования.

    **Enum-case по своей природе является константой объекта класса-перечисления.** Поэтому `defined()` может проверять существование конкретного case'а в enum.
    
    ```php
    enum Status: string
    {
        case DRAFT = 'draft';
        case PUBLISHED = 'published';
        case ARCHIVED = 'archived';
    }

    // defined() проверяет, существует ли case с таким именем в указанном enum
    var_dump(defined('Status::DRAFT'));    // bool(true)
    var_dump(defined('Status::PUBLISHED')); // bool(true)
    var_dump(defined('Status::PENDING'));   // bool(false) - такого case нет
    ```

### 3. Практическое применение

1.  **Условное определение констант:**
    ```php
    // Определяем константу отладки, только если она еще не задана
    if (!defined('DEBUG')) {
        define('DEBUG', false);
    }
    ```

2.  **Проверка доступности расширений:** Многие расширения PHP определяют константы для своей настройки.
    ```php
    // Проверяем, установлено ли расширение PDO
    if (defined('PDO::ATTR_DRIVER_NAME')) {
        echo 'PDO доступно';
    }
    ```

3.  **Проверка перечислений:**
    ```php
    $requestedStatus = 'PUBLISHED'; // Допустим, пришло из запроса

    // Динамически проверяем, что такой case действительно существует в enum
    if (defined("Status::$requestedStatus")) {
        // Безопасно используем
        $status = constant("Status::$requestedStatus"); // Получаем объект case
        echo $status->value; // 'published'
    } else {
        throw new InvalidArgumentException("Invalid status: $requestedStatus");
    }
    ```

### 4. Отличие от `isset()` и `function_exists()`

| Функция | Проверяет | Пример |
| :--- | :--- | :--- |
| **`defined()`** | Существование константы | `defined('CONST_NAME')` |
| **`isset()`** | Существование переменной и не-`null` значение | `isset($variable)` |
| **`function_exists()`** | Существование функции | `function_exists('function_name')` |

### 5. Нюансы и лучшие практики

*   **Используйте `defined()` для проверки констант, а `isset()` для переменных.**
*   **Всегда проверяйте существование константы перед её определением** — это предотвращает предупреждения и конфликты.

### Итог:

`defined()` — это функция для проверки **существования константы** (объявленной через `define()` или `const` или перечисления (Enum) начиная с PHP 8.1). Она возвращает `true` или `false` и не генерирует ошибок для несуществующих констант. Ключевое отличие от `isset()` — `defined()` работает **только с константами**, а `isset()` — **только с переменными**. Стандартная практика — использовать `if (!defined('NAME'))` перед `define('NAME', value)` для избежания дублирования.
