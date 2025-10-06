---
layout: note
title: "$_POST — суперглобальный массив для данных из HTTP POST-запросов"
card_id: 51
date: 2025-10-06
card_type: theory # theory, technique, practice
categories: ["PHP Basics"]
difficulty: 1 # Уровень сложности (опционально)
icon: book # book, lightning-bolt, check-circle (соответствует типу)
question: |
  Что представляет собой суперглобальный массив `$_POST` в PHP, как он формируется и какие основные меры безопасности необходимо соблюдать при работе с данными из форм?

short_answer: |
  `$_POST` — суперглобальный массив для данных из HTTP POST-запросов (обычно формы). Все значения — строки. Не виден в URL, но так же опасен — требует валидации, экранирования и проверки CSRF. Всегда проверяйте `REQUEST_METHOD === 'POST'`.
---
### 1. Основное назначение

`$_POST` — это **суперглобальный ассоциативный массив**, который содержит данные, переданные скрипту через **HTTP POST-запрос**, обычно из HTML-форм.

**Пример HTML-формы:**
```html
<form method="post" action="process.php">
    <input type="text" name="username">
    <input type="email" name="email">
    <input type="submit" value="Send">
</form>
```

**В process.php:**
```php
$username = $_POST['username'];
$email = $_POST['email'];
```

### 2. Источник данных

Данные в `$_POST` поступают из:
- **HTML-форм** с `method="post"`
- **AJAX/Fetch запросов** с Content-Type: `application/x-www-form-urlencoded`
- **API-запросов**

### 3. Особенности данных

#### **Все значения — строки:**
```php
// Форма: <input type="number" name="age" value="25">
echo gettype($_POST['age']); // string (не integer!)
```

#### **Структурированные данные:**
```php
// Форма с массивами:
// <input name="user[name]">
// <input name="user[email]">
$name = $_POST['user']['name'];
$email = $_POST['user']['email'];

// Чекбоксы с множественным выбором:
// <input type="checkbox" name="interests[]" value="sports">
// <input type="checkbox" name="interests[]" value="music">
$interests = $_POST['interests']; // массив значений
```

### 4. Отличие от `$_GET`

| Характеристика | `$_POST` | `$_GET` |
|----------------|----------|---------|
| **Метод передачи** | HTTP POST | HTTP GET |
| **Видимость данных** | Не видна в URL | Видна в URL |
| **Размер данных** | Большой (ограничен post_max_size) | Ограничен длиной URL |
| **Кэширование** | Не кэшируется | Может кэшироваться |
| **Безопасность** | Выше (не в логах) | Ниже (видна везде) |

### 5. Безопасность — КРИТИЧЕСКИ ВАЖНО!

Несмотря на "скрытость" от пользователя, данные в `$_POST` **также контролируются пользователем** и уязвимы для атак.

#### **XSS (Cross-Site Scripting):**
```php
// ОПАСНО: прямой вывод
echo $_POST['comment']; // Может содержать <script>

// БЕЗОПАСНО: экранирование
echo htmlspecialchars($_POST['comment'], ENT_QUOTES, 'UTF-8');
```

#### **SQL-инъекции:**
```php
// ОПАСНО
$sql = "INSERT INTO users VALUES ('{$_POST['username']}')";

// БЕЗОПАСНО: подготовленные выражения
$stmt = $pdo->prepare("INSERT INTO users (username) VALUES (?)");
$stmt->execute([$_POST['username']]);
```

### 6. Проверка существования параметров

Всегда проверяйте наличие данных перед использованием:

```php
// Проверка отправки формы
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Обрабатываем форму
}

// Проверка конкретных полей
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';

// Строгая проверка обязательных полей
if (empty($_POST['username'])) {
    $errors[] = 'Username is required';
}
```

### 7. Валидация и фильтрация

#### **Фильтрация данных:**
```php
// Валидация email
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
if (!$email) {
    die('Invalid email');
}

// Санитизация строки
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);

// Целое число
$age = filter_input(INPUT_POST, 'age', FILTER_VALIDATE_INT);
```

#### **Кастомная валидация:**
```php
$errors = [];

if (empty(trim($_POST['name']))) {
    $errors[] = 'Name is required';
}

if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email';
}

if (strlen($_POST['password']) < 8) {
    $errors[] = 'Password too short';
}
```

### 8. Загрузка файлов

Для файлов используется отдельный массив `$_FILES`:
```php
// Форма: <input type="file" name="avatar">
$file = $_FILES['avatar']; // Не $_POST['avatar']!
```

### 9. Ограничения

- **post_max_size** — максимальный размер данных (по умолчанию 8M)
- **max_input_vars** — максимальное количество переменных (по умолчанию 1000)
- **memory_limit** — может быть превышен при больших данных

### 10. Практическое применение

#### **Обработка форм:**
```php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = htmlspecialchars(trim($_POST['username'] ?? ''));
    $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
    
    if ($username && $email) {
        // Сохраняем данные
        saveUser($username, $email);
    }
}
```

#### **REST API:**
```php
// Для JSON данных нужно парсить входной поток
if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
    $input = json_decode(file_get_contents('php://input'), true);
    // $input аналог $_POST для JSON
}
```

### 11. Best Practices

1. **Всегда проверяйте `REQUEST_METHOD`**
2. **Валидируйте каждое поле** отдельно
3. **Используйте CSRF-токены** для защиты от межсайтовых запросов
4. **Не храните пароли** в открытом виде
5. **Используйте подготовленные выражения** для БД

### Итог:

`$_POST` — суперглобальный массив для данных HTTP POST-запросов. Ключевые особенности:
- **Данные форм** — основной источник
- **Не видны в URL** — но все равно ненадежны
- **Ограничены post_max_size** — обычно 8MB
- **Требуют такой же защиты** как `$_GET` (валидация, экранирование)
- **Всегда проверяйте REQUEST_METHOD** перед обработкой

Идеален для форм входа, регистрации, отправки любых данных, которые не должны быть видны в URL.
