---
layout: note
title: "Ключевое слово function — основа функционального программирования в PHP"
card_id: 41
date: 2025-09-26
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Расскажите о ключевом слове `function` всё, что знаете.

short_answer: |
  Ключевое слово `function` — основа функционального программирования в PHP. Оно используется для:
  - Объявления **именованных функций** и **методов классов**
  - Создания **анонимных функций** и **стрелочных функций**
  - Определения **генераторов** и **callback-ов**
  - Реализации **рекурсивных алгоритмов**
---
### 1. Основное назначение: Объявление функций

Самое частое использование — объявление пользовательских функций.

**Базовый синтаксис:**
```php
function имяФункции($параметр1, $параметр2 = 'значение_по_умолчанию') {
    // тело функции
    return $результат;
}
```

**Пример:**
```php
function sum($a, $b) {
    return $a + $b;
}
echo sum(5, 3); // 8
```

### 2. Объявление методов класса

`function` используется для объявления методов внутри классов.

```php
class Calculator {
    public function add($a, $b) {
        return $a + $b;
    }
    
    protected static function validate($value) {
        return is_numeric($value);
    }
}
```

### 3. Анонимные функции (замыкания, closures)

С PHP 5.3+ `function` может использоваться без имени для создания анонимных функций.

```php
$greeting = function($name) {
    return "Hello, $name!";
};
echo $greeting('John'); // Hello, John!
```

### 4. Стрелочные функции (arrow functions, PHP 7.4+)

Упрощенный синтаксис для коротких замыканий с автоматическим захваом переменных из внешней области.

```php
// Обычная анонимная функция
$oldWay = function($x) use ($y) {
    return $x + $y;
};

// Стрелочная функция
$newWay = fn($x) => $x + $y; // $y автоматически захватывается
```

### 5. Callback-функции

`function` используется для передачи функций как аргументов.

```php
// Именованная функция как callback
function callback($item) {
    return $item * 2;
}
$result = array_map('callback', [1, 2, 3]); // [2, 4, 6]

// Анонимная функция как callback
$result = array_map(function($item) {
    return $item * 2;
}, [1, 2, 3]);
```

### 6. Генераторы (generators, PHP 5.5+)

Функции-генераторы используют `yield` вместо `return` и возвращают итератор.

```php
function generateNumbers($max) {
    for ($i = 0; $i < $max; $i++) {
        yield $i * 2;
    }
}

foreach (generateNumbers(5) as $number) {
    echo $number . ' '; // 0 2 4 6 8
}
```

### 7. Типизация параметров и возвращаемых значений

Современный PHP поддерживает строгую типизацию.

```php
// Типизированные параметры
function sendEmail(string $to, string $subject, string $message): bool {
    // ...
    return true;
}

// Nullable-типы (PHP 7.1+)
function findUser(int $id): ?User {
    // Возвращает User или null
}

// Union-типы (PHP 8.0+)
function processValue(int|string $value): int|float {
    // Принимает int или string, возвращает int или float
}

// Mixed type (PHP 8.0+)
function debug(mixed $data): void {
    var_dump($data);
}
```

### 8. Аргументы функций

#### **Передача по ссылке:**
```php
function addOne(&$value) {
    $value++;
}
$number = 5;
addOne($number);
echo $number; // 6
```

#### **Переменное количество аргументов (variadic, PHP 5.6+):**
```php
function sum(...$numbers) {
    return array_sum($numbers);
}
echo sum(1, 2, 3, 4); // 10
```

#### **Именованные аргументы (PHP 8.0+):**
```php
function createUser($name, $age = 0, $email = '') {
    // ...
}

// Можно передавать в любом порядке
createUser(age: 25, name: 'John', email: 'john@example.com');
```

### 9. Особенности области видимости

Функции в PHP имеют свою область видимости.

```php
$globalVar = 'external';

function test() {
    // Не видит $globalVar!
    // echo $globalVar; // Notice: Undefined variable
    
    // Нужно использовать global или $GLOBALS
    global $globalVar;
    echo $globalVar; // external
    
    $localVar = 'internal'; // Видна только внутри функции
}
```

### 10. Рекурсивные функции

Функции могут вызывать сами себя.

```php
function factorial($n) {
    if ($n <= 1) return 1;
    return $n * factorial($n - 1);
}
echo factorial(5); // 120
```

### 11. Встроенные (internal) функции vs пользовательские

- **Встроенные функции** — часть ядра PHP (`echo`, `count`, `strlen`)
- **Пользовательские функции** — объявляются разработчиком с помощью `function`

### 12. Условное объявление функций

Функции можно объявлять внутри условий, но это не рекомендуется.

```php
if (true) {
    function conditionalFunc() {
        return 'Defined';
    }
}
echo conditionalFunc(); // Defined
```

### 13. Функции внутри функций

PHP поддерживает вложенные функции, но они видны только после вызова родительской функции.

```php
function outer() {
    function inner() {
        return 'Inner function';
    }
    return 'Outer function';
}

// inner(); // Ошибка! Функция еще не определена
outer();    // Сначала вызываем outer
inner();    // Теперь inner доступна
```

### Итог:

Ключевое слово `function` — основа функционального программирования в PHP. Оно используется для:
- Объявления **именованных функций** и **методов классов**
- Создания **анонимных функций** и **стрелочных функций**
- Определения **генераторов** и **callback-ов**
- Реализации **рекурсивных алгоритмов**

Понимание всех аспектов `function` критически важно для написания качественного PHP-кода, особенно с учетом современных возможностей типизации (PHP 7+, PHP 8+).
