---
layout: note
title: "В PHP символы :: — оператор доступа к статическим свойствам, методам и константам класса"
card_id: 38
date: 2025-09-23
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Что представляет собой оператор `::` в PHP и в каких ситуациях он применяется?

short_answer: |
  `::` — оператор доступа к статическим свойствам, методам и константам класса. Используется с `ClassName::`, `self::`, `parent::` и `static::`. Ключевое отличие от `->`: работает со статическим контекстом, а не с экземплярами объектов. Позволяет реализовать позднее статическое связывание.
---
### 1. Основное назначение: Оператор разрешения области видимости (Paamayim Nekudotayim)

`::` используется для доступа к **статическим** свойствам и методам класса, а также к константам. Его официальное название — **Paamayim Nekudotayim** (ивр. "дважды двоеточие").

### 2. Доступ к статическим членам класса

Это самое частое использование.

```php
class MathHelper {
    public static $pi = 3.14159;
    public const VERSION = '1.0'; // модификаторы у констант с PHP7.1+
    
    public static function square($x) {
        return $x * $x;
    }
}

// Доступ через имя класса
echo MathHelper::$pi;        // 3.14159
echo MathHelper::VERSION;    // 1.0
echo MathHelper::square(5);  // 25
```

### 3. Доступ к константам класса

`::` — единственный способ доступа к константам класса.

```php
class Status {
    const PENDING = 'pending';
    const APPROVED = 'approved';
    const REJECTED = 'rejected';
}

echo Status::APPROVED; // approved
```

### 4. Обращение к родительским методам и константам (parent)

Ключевое слово `parent` используется внутри класса для обращения к методам и свойствам родительского класса.

```php
class Animal {
    public function speak() {
        return "Some sound";
    }
}

class Dog extends Animal {
    public function speak() {
        // Вызов метода родительского класса
        return parent::speak() . " but specifically: Woof!";
    }
}

$dog = new Dog();
echo $dog->speak(); // "Some sound but specifically: Woof!"
```

### 5. Обращение к методам текущего класса (self и static)

- **`self::`** — ссылается на класс, где вызывается (раннее статическое связывание)
- **`static::`** — ссылается на класс, который фактически вызвал метод (позднее статическое связывание)

```php
class Base {
    public static function getClass() {
        return self::class;    // Всегда вернет 'Base'
    }
    
    public static function getLateClass() {
        return static::class;  // Вернет имя фактического класса
    }
}

class Child extends Base {}

echo Base::getClass();      // 'Base'
echo Child::getClass();     // 'Base' (потому что self::)

echo Base::getLateClass();  // 'Base'  
echo Child::getLateClass(); // 'Child' (потому что static::)
```

### 6. Доступ к константам и статическим методам объекта

Можно использовать переменную, содержащую имя класса:

```php
$className = 'MathHelper';
echo $className::square(3); // 9

// С PHP 8.0+ можно через объект
$obj = new MathHelper();
echo $obj::VERSION; // 1.0
```

### 7. Функции-колбэки с статическими методами

`::` используется для указания статических методов как колбэков:

```php
class Validator {
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }
}

$emails = ['test@example.com', 'invalid'];
$validEmails = array_filter($emails, ['Validator', 'validateEmail']);
// Или 
$validEmails = array_filter($emails, 'Validator::validateEmail');
```

### 8. Особый случай: вызов нестатического метода статически

Хотя это **не рекомендуется** и вызовет предупреждение, PHP позволяет это:

```php
class Example {
    public function nonStaticMethod() {
        echo "Called";
    }
}

Example::nonStaticMethod(); // Предупреждение, но работает до PHP8+
```

### 9. Константы массивы (PHP 5.6+)

`::` используется для доступа к элементам констант-массивов:

```php
class Config {
    const SETTINGS = ['host' => 'localhost', 'port' => 3306];
}

echo Config::SETTINGS['host']; // localhost (начиная с PHP 5.6)
```

### 10. Отличие от `->` (оператора объекта)

| Оператор | Контекст | Пример |
|----------|----------|---------|
| **`::`** | Статические методы/свойства, константы | `ClassName::method()` |
| **`->`** | Нестатические методы/свойства объекта | `$object->method()` |

### Итог:

`::` (Paamayim Nekudotayim) — оператор для работы со **статическим контекстом**:
- Доступ к **статическим свойствам** и **методам**
- Доступ к **константам класса**  
- Обращение к родителю через **`parent::`**
- Позднее статическое связывание через **`static::`**
- Работа с **классовыми константами-массивами**

Понимание разницы между `self::` и `static::` критически важно для наследования, а различие между `::` и `->` — фундаментально для ООП в PHP.
