# Роуты-хуеуты

## [Юзеры](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%8E%D0%B7%D0%B5%D1%80%D1%8B-1)
## [Новости](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8-1)
## [Офис](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%84%D0%B8%D1%81-1)
## [Тикеты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82%D1%8B-1)
## [Проекты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-1)
## [Отделы](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D1%8B-1)
## [Субподрядчики](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%B8-1)
## Клиентский

# [Юзеры](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
## Работа с текущим пользователем
|route|description|request|response|
|---|---|:---:|:---:|
|POST /users/|Регистрация|[жсон]()|[жсон]()|
|POST /auth/|Авторизация|[жсон]()|[жсон]()|
|GET /users/me|Профиль||[жсон]()|
|GET /users/me/sprints|Активные спринты||[жсон]()|
|PUT /users/me|Редактирование профиля|[жсон]()|[жсон]()|
|PUT /users/me/pw|Изменение пароля|[жсон]()|[жсон]()|
|PUT /users/me/a|Добавление/изменение аватара|[жсон]()|[жсон]()|
|PUT /users/me/rocket|Изменение рокетнейма|[жсон]()|[жсон]()|
|PUT /users/me/report|Добавить/изменить отчет|[жсон]()|[жсон]()|
|GET /users/me/report|Открыть отчет||[жсон]()|
|POST /users/passRC|Изменение пароля по рокетчату|[жсон]()|[жсон]()|
|PUT /users/part|Изменение разделов|[жсон]()|[жсон]()|

## Поиск пользователей
|route|description|request|response|
|---|---|:---:|:---:|
|GET /users/all|Все пользователи||[жсон]()|
|GET /users/q/search?field=&value=|Поиск по 1 параметру||[жсон]()|
|GET /users/:id|Получить профиль пользователя по _id||[жсон]()|
|GET /users/usr/get?fullname=&division=&partition=|Поиск по имени и/или разделу и/или отделу||[жсон]()|
|/users/usr/pos?position=|Поиск по должности||[жсон]()|

## Работа с другими пользователями(манагерство)
|route|description|request|response|
|---|---|:---:|:---:|
|PUT /users/poschange/:id|Изменить должность юзера|[жсон]()|[жсон]()|
|PUT /users/permchange/:id|Изменить пермишен юзера|[жсон]()|[жсон]()|
|DELETE /users/:id|Удалить пользователя||[жсон]()|
|GET /users/report/:id|Просмотреть отчет другого пользователя||[жсон]()|
|/users/usr/pos?position=|Поиск по должности|[жсон]()|[жсон]()|

# [Новости](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
|route|description|request|response|
|---|---|:---:|:---:|
|POST /news/|Новая новость|[жсон]()|[жсон]()|
|GET /news/all|Все новости||[жсон]()|
|GET /news/:id|Просмотреть новость по _id||[жсон]()|
|PUT /news/:id|Редактировать новость по _id|[жсон]()|[жсон]()|
|DELETE /news/:id|Удалить новость по _id||[жсон]()|

# [Тикеты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
|route|description|request|response|
|---|---|:---:|:---:|
|POST /tickets|Добавить тикет|[жсон]()|[жсон]()|
|GET /tickets/all|Все тикеты сорт. по дате||[жсон]()|
|GET /tickets/:id|Просмотр тикета по его _id||[жсон]()|
|GET /tickets/user/:id|Все тикеты пользователя||[жсон]()|
|GET /tickets/all/active|Все незавершенные тикеты||[жсон]()|
|GET /tickets/all/emergency|Все тикеты сорт. по срочности||[жсон]()|
|PUT /tickets/:id|Деактивировать тикет по _id||[жсон]()|
|DELETE /tickets/:id|Удалить тикет по _id||[жсон]()|

# [Офис](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
|route|description|request|response|
|---|---|:---:|:---:|
|POST /props|Добавить предложение|[жсон]()|[жсон]()|
|GET /props/all/likes|Все предложения сорт. по лайкам||[жсон]()|
|GET /props/all/date|Все предложения сорт. по дате||[жсон]()|
|GET /props/search?field=&order=|Кастомизируемый поиск|[квери]()|[жсон]()|
|PUT /props/like/:id|Лайк/дизлайк предложения по его _id|[жсон]()|[жсон]()|
|PUT /props/exec/:id|Добавить исполнителя|[жсон]()|[жсон]()|
|PUT /props/sts/:id|Запустить предложение в работу/отложить|[жсон]()|[жсон]()|
|PUT /props/sts/f/:id|Завершить предложение||[жсон]()|

# [Отделы](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
|route|description|request|response|
|---|---|:---:|:---:|
|POST /divisions|Создать новый отдел|[жсон]()|[жсон]()|
|GET /divisions/find/:divname|Найти отдел по имени||[жсон]()|
|GET /divisions/all|Все отделы||[жсон]()|
|PUT /divisions/:divname|Вступить в отдел|[жсон]()|[жсон]()|
|DELETE /divisions/:divname|Выйти из отдела|[жсон]()|[жсон]()|
|GET /divisions/projects/:divid|Все проекты пользователей отдела|[жсон]()|[жсон]()|
|PUT /divisions/addcover/:divname|Добавить/изменить обложку отдела|[жсон]()|[жсон]()|

# [Субподрядчики](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
|route|description|request|response|
|---|---|:---:|:---:|
|POST /merc/new|Добавить субподрядчика|[жсон]()|[жсон]()|
|GET /merc/search?name=|Найти всех/найти 1 по имени|[квери]()|[жсон]()|
|PUT /merc/new/edit/:id|Редактирование по _id|[жсон]()|[жсон]()|
|DELETE /merc/:id|Удалить субподрядчика по _id||[жсон]()|


# [Проекты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md)
## Добавление/изменение
|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/add|Добавить проект|[жсон]()|[жсон]()|
|PUT /projects/:crypt|Редактирование проекта по шифру|[жсон]()|[жсон]()|
|DELETE /projects/:crypt|Удалить проект по шифру|[жсон]()|[жсон]()|
|PUT /projects/finish/:crypt|Завершить проект||[жсон]()|
|PUT /projects/inf/:crypt|Добавить информационные ресурсы|[жсон]()|[жсон]()|
|PUT /projects/cover/:crypt|Добавить обложку|[жсон]()|[жсон]()|
|PUT /projects/budget/:crypt|Добавить/изменить бюджет|[жсон]()|[жсон]()|

## Поиск
|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects|Все проекты + сорт.|[квери]()|[жсон]()|
|GET /projects/q/search?field=&value=|Найти проекты, подходящие по квери|[квери]()|[жсон]()|
|GET /projects/:crypt|Найти проект по шифру||[жсон]()|
|GET /projects/user/:id|Найти все проекты юзера, чей _id в юрл||[жсон]()|

## Работа с юзерами
|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/join2/:crypt|Вступить/выйти в/из команды проекта|[жсон]()|[жсон]()|
|PUT /projects/updteam/:crypt|Добавить/убрать юзера в/из команды проекта|[жсон]()|[жсон]()|
|PUT /projects/roleedit/:crypt|Редактирование роли/задачи юзера в отделе|[жсон]()|[жсон]()|

## Тэги проекта
|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/tag/:crypt|Добавить тэг в проект|[жсон]()|[жсон]()|
|DELETE /projects/tag/:crypt|Удалить тэг из проекта|[жсон]()|[жсон]()|
|GET /project/tag/search|Найти проекты с указанными тэгами|[жсон]()|[жсон]()|
|GET /projects/tag/find?crypt=&tag=|Поиск тэгов проекта|[квери]()|[жсон]()|

## Спринты
### Общая хуйня
|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/sprint/new/:crypt|Добавить спринт|[жсон]()|[жсон]()|
|PUT /projects/sprints/dd/:id|Добавить/изменить описание + планируемую дату окончания спринта|[жсон]()|[жсон]()|
|PUT /projects/sprints/description/:id|Добавить/изменить описание|[жсон]()|[жсон]()|
|PUT /projects/sprints/:id|Изменение статуса спринта||[жсон]()|
|PUT /projects/favsprint/:id|Фаворитнуть спринт||[жсон]()|
|DELETE /projects/sprints/:id|Удалить спринт||[жсон]()|
|GET /projects/sprints/:crypt|Все спринты проекта(устарело нахуй?)||[жсон]()|
|GET /projects/getsprint/:id|Инфа по 1 спринту||[жсон]()|

### Тэги спринтов
|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/sprints/addtag/:id|Добавить тэг в спринт|[жсон]()|[жсон]()|
|DELETE /projects/sprints/:id/tag?tag=|Удалить тэг из спринта|[квери]()|[жсон]()|
|GET /projects/sprint/tags|Найти все спринты подходящие по тегам|[жсон]()|[жсон]()|

### Таски
|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects/sprints/gettasks/:id|Все таски спринта|[жсон]()|[жсон]()|
|POST /projects/sprints/addtask/:id|Добавить много тасков в спринт|[жсон]()|[жсон]()|
|POST /projects/sprints/task/:id|Добавить 1 таск в спринт|[жсон]()|[жсон]()|
|PUT /projects/sprints/taskedit/:id|Изменить таск|[жсон]()|[жсон]()|
|PUT /projects/sprints/DAtask/test|Де/активировать таск|[жсон]()|[жсон]()|
|DELETE /projects/sprints/deltask/:id|Удалить таск|[жсон]()|[жсон]()|
|PUT /projects/sprints/task/adduser/:id|Добавить исполнителя в таск|[жсон]()|[жсон]()|
