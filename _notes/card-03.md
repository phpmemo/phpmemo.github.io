---
layout: note
title: "Основное атрибуты в DocBlock"
card_id: 3
date: 2025-09-14
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Перечислите и кратко опишите основные атрибуты используемые в DocBlock.

short_answer: |
  Вот некоторые из основных атрибутов DocBlock:
  * `@param` - описание параметра функции/метода.
  * `@return` - описание возвращаемого значения.
  * `@throws` - исключение, которые может выбрасывать метод.
---

## Основное атрибуты в DocBlock:

**@param** `тип $param описание`
Описание параметра функции.
```php 
@param string $username Имя пользователя
```

**@return** `тип описание`
Описание возвращаемого значения.
```php 
@return bool true в случае успеха
```

**@throws** `Исключение описание`
Какие исключения может выбросить метод.
```php 
@throws InvalidArgumentException Если имя пустое
```

**@var** `тип описание`
Тип свойства класса или переменной.
```php 
@var string[] Список имён
```

**@deprecated** `версия описание`
Устаревший метод/класс. Чем заменить.
```php 
@deprecated 2.0 Use newMethod()
```

**@see** `ссылка`
Ссылка на связанный метод/класс.
```php 
@see User::getName()
```
