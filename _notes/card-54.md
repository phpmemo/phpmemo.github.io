---
layout: note
title: "Одиночное двоеточие : в PHP используется для альтернативного синтаксиса, объявления возвращаемых типов, тернарного оператора"
card_id: 54
date: 2025-10-07
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Расскажите об использовании символа `:` (одиночное двоеточие) в PHP.

short_answer: |
  `:` в PHP используется для: альтернативного синтаксиса (`if: ... endif`), объявления возвращаемых типов (`function(): type`), тернарного оператора (`a ? b : c`).
---
### 1. Альтернативный синтаксис для управляющих структур

Используется в альтернативном синтаксисе для `if`, `while`, `for`, `foreach`, `switch` вместо фигурных скобок `{}`.

```php
<?php if ($isLoggedIn): ?>
    <h1>Welcome, <?= $username ?></h1>
<?php else: ?>
    <h1>Please log in</h1>
<?php endif; ?>

<?php foreach ($users as $user): ?>
    <li><?= $user['name'] ?></li>
<?php endforeach; ?>

<?php switch ($status): ?>
    <?php case 'active': ?>
        <span class="active">Active</span>
    <?php case 'inactive': ?>
        <span class="inactive">Inactive</span>
<?php endswitch; ?>
```

### 2. Объявление возвращаемого типа

С PHP 7.0 двоеточие используется для объявления возвращаемого типа функций и методов.

```php
function calculateSum(int $a, int $b): int {
    return $a + $b;
}

class Calculator {
    public function multiply(float $x, float $y): float {
        return $x * $y;
    }
}
```

С PHP 8.0 для union types и возвращаемых типов.

```php
function parseValue(string $input): int|float {
    return is_numeric($input) ? (float)$input : (int)$input;
}

function findUser(int $id): User|null {
    // возвращает User или null
}
```

### 3. Тернарный оператор

Разделяет условие и значения в тернарном операторе.

```php
$status = $isActive ? 'active' : 'inactive';
$accessLevel = $user->isAdmin() ? 'admin' : ($user->isModerator() ? 'moderator' : 'user');
```

### 4. В синтаксисе goto

Разделяет метку и код в операторе `goto` (редко используется).

```php
start:
    echo "Hello";
    if ($condition) {
        goto start;
    }
```

### Итог:

Одиночное двоеточие `:` в PHP — многофункциональный символ с несколькими ключевыми ролями:

1. **Альтернативный синтаксис** для управляющих структур (`if: ... endif`)
2. **Объявление возвращаемых типов** (`function(): type`)
3. **Разделитель в тернарном операторе** (`condition ? true : false`)

Понимание контекста использования `:` критически важно для чтения современного PHP-кода, особенно с учетом широкого использования типизации и альтернативного синтаксиса в шаблонах.
