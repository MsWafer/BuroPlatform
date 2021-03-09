[<= Все роуты](../newReadme.md)

# Базовая работа с пользователями
 
## 1. Работа с текущим пользователем

### Регистрация
**POST /users/** - 

### Авторизация
**POST /auth/**

### Профиль текущего пользователя
**GET /users/me**

### Активные спринты текущего пользователя
**GET /users/me/sprints**

### Редактирование текущего профиля пользователя
**PUT /users/me**

### Изменение пароля
**PUT /users/me/pw**

### Добавление/изменение аватара текущего пользователя
**PUT /users/me/a**

### Изменение рокетнейма текущего пользователя
**PUT /users/me/rocket**

### Добавить/изменить свой отчет
**PUT /users/me/report**

### Открыть свой отчет
**GET /users/me/report**

### Изменение пароля по рокетчату
**POST /users/passRC**

### Изменение разделов
**PUT /users/part**

## Поиск пользователей

### Найти всех пользователей
**GET /users/all**

### Поиск по одному параметру
**GET /users/q/search?field=&value=**

### Найти конкретного пользователя по его _id
**GET /users/:id**

### Найти пользователей по имени и/или разделу и/или отделу
**GET /users/usr/get?fullname=&division=&partition=**

### Найти пользователей по должности
**/users/usr/pos?position=**

## Работа с другими пользователями

### Изменить должность
**PUT /users/poschange/:id**

### Изменить пермишен
**PUT /users/permchange/:id**

### Удалить пользователя
**DELETE /users/:id**

### Просмотреть отчет другого пользователя
**users/report/:id**