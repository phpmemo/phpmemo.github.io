---
layout: note
title: "count() подсчитывает элементы массива или Countable-объекта"
card_id: 60
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  ```php
  count(Countable|array $value, int $mode = COUNT_NORMAL): int
  ```
  Расскажите об этой функции всё, что знаете.

short_answer: |
  `count()` подсчитывает элементы массива или Countable-объекта. Поддерживает два режима: `COUNT_NORMAL` (первый уровень) и `COUNT_RECURSIVE` (включая вложенные). Для других типов возвращает 1 с Warning. `sizeof()` — псевдоним count(). Всегда проверяйте тип перед использованием.
---
### 1. Основное назначение и синтаксис

`count()` — это функция для **подсчета количества элементов в массиве** или объекте.

```php
count(Countable|array $value, int $mode = COUNT_NORMAL): int
```

- `$value` — массив или объект, реализующий интерфейс `Countable`
- `$mode` — режим подсчета (`COUNT_NORMAL` или `COUNT_RECURSIVE`)
- Возвращает количество элементов

### 2. Базовое использование с массивами

```php
$array = [1, 2, 3, 4, 5];
echo count($array); // 5

$assoc = ['a' => 1, 'b' => 2, 'c' => 3];
echo count($assoc); // 3

$empty = [];
echo count($empty); // 0
```

### 3. Режимы подсчета

#### **COUNT_NORMAL (по умолчанию):**
```php
$array = ['a' => 1, 'b' => [2, 3]];
echo count($array); // 2 (только первый уровень)
```

#### **COUNT_RECURSIVE:**
```php
$array = ['a' => 1, 'b' => [2, 3]];
echo count($array, COUNT_RECURSIVE); // 4 (1 + 2 элемента во вложенном массиве)

$nested = [1, [2, [3, 4]]];
echo count($nested, COUNT_RECURSIVE); // 6 (1 + 2 + 2)
```

### 4. Работа с объектами

#### **Объекты с интерфейсом Countable:**
```php
class MyCollection implements Countable {
    private $items = [];
    
    public function count(): int {
        return count($this->items);
    }
}

$collection = new MyCollection();
echo count($collection); // Вызовет метод count() объекта
```

#### **Обычные объекты:**
```php
$obj = new stdClass();
echo count($obj); // 1 + Warning

$obj->prop1 = 'value1';
$obj->prop2 = 'value2';
echo count($obj); // 1 + Warning (всегда 1 для объектов)
```

### 5. Особенности с разными типами данных

```php
echo count(null);        // 0 + Warning
echo count(123);         // 1 + Warning
echo count('string');    // 1 + Warning
echo count(true);        // 1 + Warning
echo count(false);       // 1 + Warning
```

### 6. Сравнение с `empty()` и `sizeof()`

#### **`sizeof()` — псевдоним `count()`:**
```php
$array = [1, 2, 3];
echo count($array);   // 3
echo sizeof($array);  // 3 (то же самое)
```

#### **Отличие от `empty()`:**
```php
$array = [0, '', false];

echo count($array);  // 3 (все элементы)
echo empty($array);  // false (массив не пустой)

$empty_array = [];
echo count($empty_array); // 0
echo empty($empty_array); // true
```

### 7. Практическое применение

#### **Проверка пустого массива:**
```php
$items = [];

// ПЛОХО - неявное преобразование
if (!$items) {
    echo "Массив пуст";
}

// ХОРОШО - явная проверка
if (count($items) === 0) {
    echo "Массив пуст";
}

// ИЛИ с empty()
if (empty($items)) {
    echo "Массив пуст";
}
```

#### **Обработка вложенных структур:**
```php
$data = [
    'users' => ['John', 'Jane', 'Bob'],
    'settings' => ['theme' => 'dark', 'notifications' => true]
];

$total_elements = count($data, COUNT_RECURSIVE);
echo $total_elements; // 7 (2 + 3 + 2)
```

### 8. Производительность и оптимизация

#### **Кэширование результата:**
```php
// ПЛОХО: многократный вызов в цикле
for ($i = 0; $i < count($large_array); $i++) {
    // count() вызывается на каждой итерации
}

// ХОРОШО: кэширование результата
$count = count($large_array);
for ($i = 0; $i < $count; $i++) {
    // count() вызван один раз
}
```

### 9. Обработка ошибок

#### **Безопасное использование:**
```php
function safeCount($value): int {
    if (is_array($value) || $value instanceof Countable) {
        return count($value);
    }
    return 0;
}

echo safeCount([1, 2, 3]);     // 3
echo safeCount('string');      // 0 (без Warning)
echo safeCount(null);          // 0 (без Warning)
```

### 10. Продвинутые сценарии

#### **Подсчет вложенных элементов:**
```php
function countDeep(array $array): int {
    $count = 0;
    array_walk_recursive($array, function() use (&$count) {
        $count++;
    });
    return $count;
}

$data = [1, [2, 3], [4, [5, 6]]];
echo countDeep($data); // 6
```

#### **Подсчет уникальных вхождений:**
```php
$colors = ['red', 'blue', 'red', 'green', 'blue', 'blue'];
$color_counts = array_count_values($colors);

print_r($color_counts);
// Array
// (
//     [red] => 2
//     [blue] => 3
//     [green] => 1
// )
```

### 11. Лучшие практики

1. **Всегда проверяйте тип** перед использованием `count()`
2. **Используйте `=== 0`** для проверки пустого массива
3. **Кэшируйте результат** в циклах
4. **Для объектов** реализуйте интерфейс `Countable`

```php
// ХОРОШИЙ ПРИМЕР:
if (is_array($data) && count($data) > 0) {
    foreach ($data as $item) {
        // обработка
    }
}
```

### Итог:

`count()` — функция для подсчета элементов в массивах и Countable-объектах. Ключевые особенности:

1. **Работает с массивами** и объектами `Countable`
2. **Два режима:** `COUNT_NORMAL` и `COUNT_RECURSIVE`
3. **Генерирует Warning** для неподдерживаемых типов
4. **`sizeof()` — псевдоним** `count()`
5. **Всегда проверяйте тип** перед использованием
6. **Кэшируйте результат** в циклах для производительности

**Рекомендация:** Используйте `count()` для массивов, а для объектов реализуйте интерфейс `Countable`. Всегда проверяйте входные данные и обрабатывайте возможные Warning'и.
