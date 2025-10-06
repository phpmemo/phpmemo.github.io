---
layout: note
title: "$_GET — суперглобальный массив с параметрами URL-строки"
card_id: 50
date: 2025-10-06
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Что представляет собой суперглобальный массив `$_GET` в PHP, как он формируется и какие основные меры безопасности необходимо соблюдать при работе с ним?

short_answer: |
  `$_GET` — суперглобальный массив с параметрами URL-строки. Все значения — строки, контролируются пользователем, поэтому опасны. Всегда проверяйте (`isset()`, `??`), валидируйте и экранируйте (`htmlspecialchars()`) данные. Не используйте для чувствительной информации.
---
### 1. Основное назначение

`$_GET` — это **суперглобальный ассоциативный массив**, который содержит параметры, переданные скрипту через **URL (строку запроса)**.

**Пример URL:**
```
http://example.com/page.php?name=John&age=30&city=London
```

**Содержимое `$_GET`:**
```php
array(
    'name' => 'John',
    'age' => '30', 
    'city' => 'London'
)
```

### 2. Источник данных

Данные в `$_GET` поступают из:
- **Query string** URL (часть после `?`)
- **GET-формы** (`<form method="get">`)
- **Прямого указания параметров** в ссылках

### 3. Особенности данных

#### **Все значения — строки:**
```php
// URL: page.php?age=30
echo gettype($_GET['age']); // string (не integer!)
```

#### **Множественные значения:**
```php
// URL: page.php?color=red&color=blue
// PHP автоматически использует последнее значение
echo $_GET['color']; // 'blue'

// Для получения массива используйте []:
// URL: page.php?color[]=red&color[]=blue
print_r($_GET['color']); // ['red', 'blue']
```

### 4. Безопасность — КРИТИЧЕСКИ ВАЖНО!

Данные в `$_GET` **полностью контролируются пользователем** и могут быть легко подделаны.

#### **Уязвимость XSS (Cross-Site Scripting):**
```php
// ОПАСНО: прямой вывод без обработки
// URL: page.php?message=<script>alert('XSS')</script>
echo $_GET['message']; // Выполнит JavaScript!

// БЕЗОПАСНО: экранирование вывода
echo htmlspecialchars($_GET['message'], ENT_QUOTES, 'UTF-8');
```

#### **SQL-инъекции:**
```php
// ОПАСНО: прямое использование в SQL
// URL: page.php?id=1' OR '1'='1
$id = $_GET['id'];
$sql = "SELECT * FROM users WHERE id = '$id'"; // Уязвимо!

// БЕЗОПАСНО: подготовленные выражения
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
```

### 5. Проверка существования параметров

Всегда проверяйте наличие параметров перед использованием:

```php
// ПЛОХО: может вызвать Notice
$page = $_GET['page'];

// ХОРОШО: проверка существования
if (isset($_GET['page'])) {
    $page = $_GET['page'];
} else {
    $page = 'default';
}

// ЛУЧШЕ: с использованием null coalescing (PHP 7+)
$page = $_GET['page'] ?? 'default';

// С приведением типа
$pageId = (int) ($_GET['page_id'] ?? 1);
```

### 6. Валидация и фильтрация

#### **Фильтрация данных:**
```php
// Валидация email
$email = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);
if ($email === false) {
    die('Invalid email');
}

// Фильтрация целого числа
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if ($id === null || $id === false) {
    die('Invalid ID');
}

// Санитизация строки
$search = filter_input(INPUT_GET, 'q', FILTER_SANITIZE_STRING);
```

#### **Кастомная валидация:**
```php
$allowed_categories = ['news', 'blog', 'products'];
$category = $_GET['category'] ?? '';

if (!in_array($category, $allowed_categories)) {
    $category = 'news'; // значение по умолчанию
}
```

### 7. Ограничения

- **Максимальная длина:** Ограничена длиной URL (обычно 2048 символов)
- **Кэширование:** GET-запросы могут кэшироваться браузером
- **Безопасность:** Параметры видны в URL, истории браузера, логах

### 8. Практическое применение

#### **Пагинация:**
```php
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 20;
$offset = ($page - 1) * $perPage;
```

#### **Поиск и фильтрация:**
```php
$search = htmlspecialchars($_GET['search'] ?? '');
$category = (int) ($_GET['category'] ?? 0);
$sort = in_array($_GET['sort'] ?? 'name', ['name', 'price', 'date']) 
    ? $_GET['sort'] 
    : 'name';
```

#### **API-эндпоинты:**
```php
// API: /api/users.php?limit=10&offset=20
$limit = min(100, max(1, (int) ($_GET['limit'] ?? 50)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));
```

### 9. Best Practices

1. **Всегда валидируйте и фильтруйте** данные из `$_GET`
2. **Никогда не доверяйте** данным из `$_GET`
3. **Используйте htmlspecialchars()** при выводе в HTML
4. **Используйте подготовленные выражения** для работы с БД
5. **Устанавливайте значения по умолчанию** для необязательных параметров

### Итог:

`$_GET` — суперглобальный массив с параметрами URL. Ключевые особенности:
- **Данные от пользователя** → никогда не доверяйте им
- **Все значения — строки** → приводите к нужным типам
- **Уязвимы для XSS/SQL-инъекций** → всегда экранируйте и валидируйте
- **Используйте `isset()`/`??`** для проверки существования
- **Идеален для** пагинации, поиска, фильтрации — но не для чувствительных данных
