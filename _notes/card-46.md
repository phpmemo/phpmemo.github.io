---
layout: note
title: "array — конструктор массивов в PHP."
card_id: 46
date: 2025-10-03
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Расскажите о ключевом слове `array` всё, что знаете.

short_answer: |
  `array` — конструктор массивов (`array(1, 2)`), тип данных и type hint. С PHP 5.4 рекомендуется использовать короткий синтаксис `[]`. Применяется для объявления констант-массивов, свойств классов и в type hints (`function test(array $data)`).
---
### 1. Основное назначение: Конструктор массива

`array()` — это **языковая конструкция** для создания массивов.

```php
// Индексированный массив
$fruits = array('apple', 'banana', 'orange');

// Ассоциативный массив
$user = array('name' => 'John', 'age' => 30, 'city' => 'London');

// Многомерный массив
$matrix = array(
    array(1, 2, 3),
    array(4, 5, 6)
);
```

### 2. Современная альтернатива: Короткий синтаксис `[]`

С PHP 5.4 появился короткий синтаксис, который **рекомендуется** к использованию:

```php
// Эквивалентные записи
$old = array(1, 2, 3);
$new = [1, 2, 3];

$old = array('key' => 'value');
$new = ['key' => 'value'];
```

**Преимущества `[]`:**
- Более краткая запись
- Единообразие с другими языками
- Лучшая читаемость

### 3. Тип данных array

`array` — это один из основных типов данных в PHP:

```php
$arr = [1, 2, 3];
var_dump(is_array($arr)); // bool(true)
echo gettype($arr);       // array
```

### 4. Проверка типа array

```php
// Разные способы проверки
$data = [1, 2, 3];

var_dump(is_array($data));     // true
var_dump(gettype($data));      // "array"
var_dump($data instanceof ArrayObject); // false (это не объект)
```

### 5. array в объявлениях типов

С PHP 7.1+ `array` можно использовать в type hints:

```php
function processUsers(array $users): array {
    return array_filter($users, function($user) {
        return $user['active'];
    });
}

// Callable тип для функций, работающих с массивами
function array_map_user(callable $callback, array $data): array {
    return array_map($callback, $data);
}
```

### 6. Константы массивы (PHP 5.6+)

С PHP 5.6 можно объявлять массивы как константы:

```php
const STATUSES = array('PENDING', 'APPROVED', 'REJECTED');
define('SETTINGS', array('debug' => true, 'cache' => false));
```

### 7. array в объявлениях свойств классов

```php
class Config {
    public static $defaults = array('host' => 'localhost', 'port' => 3306);
    private $settings = array(); // Инициализация пустым массивом
}
```

### 8. Функции для работы с массивами

PHP имеет огромное количество встроенных функций для работы с массивами:

```php
$numbers = array(1, 2, 3, 4, 5);

// Фильтрация
$even = array_filter($numbers, function($n) { return $n % 2 === 0; });

// Преобразование
$squared = array_map(function($n) { return $n * $n; }, $numbers);

// Редукция
$sum = array_reduce($numbers, function($carry, $item) { 
    return $carry + $item; 
}, 0);
```

### 9. Особенности массивов в PHP

#### **Гибкие ключи:**
```php
$array = array(
    1 => 'a',      // integer ключ
    '1' => 'b',    // string ключ (перезапишет предыдущий)
    1.5 => 'c',    // float ключ (будет приведен к integer 1)
    true => 'd'    // boolean ключ (будет 1)
);
// Результат: [1 => 'd']
```

#### **Автоинкремент индексов:**
```php
$array = array(
    5 => 'a',
    'b',           // ключ 6
    10 => 'c',
    'd'            // ключ 11
);
```

### 10. Array unpacking (PHP 7.4+)

Оператор `...` для распаковки массивов:

```php
$parts = array('apple', 'pear');
$fruits = array('banana', ...$parts, 'berry');
// Результат: ['banana', 'apple', 'pear', 'berry']
```

### 11. Деструктуризация (PHP 7.1+)

```php
$data = array('John', 30, 'London');
list($name, $age, $city) = $data;
// Или короче
[$name, $age, $city] = $data;
```

### 12. array в комбинации с другими типами

#### **Union types (PHP 8.0+):**
```php
function processData(array|string $data): array|string {
    if (is_array($data)) {
        return array_filter($data);
    }
    return trim($data);
}
```

### 13. Best Practices

1. **Используйте короткий синтаксис `[]`** вместо `array()`
2. **Всегда указывайте тип `array`** в объявлениях функций
3. **Используйте современные возможности** (деструктуризация, распаковка)
4. **Помните о приведении ключей** к integer

```php
// Хорошо
$data = ['name' => 'John', 'age' => 30];
function getUserData(): array { return []; }

// Плохо (устаревший синтаксис)
$data = array('name' => 'John', 'age' => 30);
```

### Итог:

Ключевое слово `array` в PHP имеет несколько основных ролей:
1. **Конструктор массивов** (`array()`) — устаревший, но поддерживаемый синтаксис
2. **Тип данных** для type hints и проверок
3. **Часть синтаксиса** для констант и свойств классов

**Рекомендация:** В новом коде всегда используйте короткий синтаксис `[]`, а `array` применяйте только в объявлениях типов. Понимание особенностей массивов (приведение ключей, автоинкремент) критически важно для избежания неожиданного поведения.
