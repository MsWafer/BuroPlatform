# Роуты-хуеуты

## [Юзеры](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%8E%D0%B7%D0%B5%D1%80%D1%8B-1)
## [Новости](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8-1)
## [Офис](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%84%D0%B8%D1%81-1)
## [Тикеты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82%D1%8B-1)
## [Проекты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-1)
## [Отделы](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D1%8B-1)
## [Субподрядчики](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%B8-1)

<br/><br/>

# [Юзеры](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%8E%D0%B7%D0%B5%D1%80%D1%8B)

<details>
<summary style="font-size:150%;">Работа с текущим пользователем</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /users/|Регистрация|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F)|[жсон]()|
|POST /auth/|Авторизация|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F)|[жсон]()|
|GET /users/me|Профиль||[жсон]()|
|GET /users/me/sprints|Активные спринты||[жсон]()|
|PUT /users/me|Редактирование профиля|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|[жсон]()|
|PUT /users/me/pw|Изменение пароля|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8F)|[жсон]()|
|PUT /users/me/a|Добавление/изменение аватара|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B0%D0%B2%D0%B0%D1%82%D0%B0%D1%80)|[жсон]()|
|PUT /users/me/rocket|Изменение рокетнейма|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D1%81%D0%B2%D0%BE%D0%B5%D0%B3%D0%BE-%D1%80%D0%BE%D0%BA%D0%B5%D1%82%D1%87%D0%B0%D1%82%D0%B0)|[жсон]()|
|PUT /users/me/report|Добавить/изменить отчет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D1%82%D1%87%D0%B5%D1%82%D0%BD%D0%BE%D1%81%D1%82%D1%8C)|[жсон]()|
|GET /users/me/report|Открыть отчет||[жсон]()|
|POST /users/passRC|Изменение пароля по рокетчату|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C-%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C-%D1%87%D0%B5%D1%80%D0%B5%D0%B7-%D1%80%D0%BE%D0%BA%D0%B5%D1%82%D1%87%D0%B0%D1%82-%D0%B8-%D0%BC%D1%8B%D0%BB%D0%BE)|[жсон]()|
|PUT /users/part|Изменение разделов|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D1%81%D0%B2%D0%BE%D0%B8%D1%85-%D1%80%D0%B0%D0%B7%D0%B4%D0%B5%D0%BB%D0%BE%D0%B2)|[жсон]()|
</details>

<details>
<summary style="font-size:150%;">Поиск пользователей</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /users/all|Все пользователи|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D0%B2%D1%81%D0%B5%D1%85-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D0%BE%D1%82%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85-%D0%BA%D0%B0%D0%BA-%D1%85%D0%BE%D1%82%D0%B8%D1%82%D0%B5)|[жсон]()|
|GET /users/q/search?field=&value=|Поиск по 1 параметру|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE-%D1%82%D0%B5%D1%85-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D0%B5-%D0%BF%D0%BE%D0%BF%D0%B0%D0%B4%D0%B0%D1%8E%D1%82-%D0%BF%D0%BE%D0%B4-%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F-%D0%BA%D0%B2%D0%B5%D1%80%D0%B8)|[жсон]()|
|GET /users/:id|Получить профиль пользователя по _id||[жсон]()|
|GET /users/usr/get?fullname=&division=&partition=|Поиск по имени и/или разделу и/или отделу|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0-%D0%BF%D0%BE-%D1%82%D1%80%D0%B5%D0%BC-%D0%BF%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D0%B0%D0%BC)|[жсон]()|
|/users/usr/pos?position=|Поиск по должности|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D1%81-%D0%BE%D0%BF%D1%80%D0%B5%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C%D1%8E)|[жсон]()|
</details>

<details>
<summary style="font-size:150%;">Работа с другими пользователями(манагерство)</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /users/poschange/:id|Изменить должность юзера|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B3%D0%BE-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|[жсон]()|
|PUT /users/permchange/:id|Изменить пермишен юзера|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%B5%D1%80%D0%BC%D0%B8%D1%88%D0%B5%D0%BD%D0%B0-%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B3%D0%BE-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|[жсон]()|
|DELETE /users/:id|Удалить пользователя||[жсон]()|
|GET /users/report/:id|Просмотреть отчет другого пользователя||[жсон]()|
</details>

<br/><br/>

# [Новости](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /news/|Новая новость|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C)|[жсон]()|
|GET /news/all|Все новости||[жсон]()|
|GET /news/:id|Просмотреть новость по _id||[жсон]()|
|PUT /news/:id|Редактировать новость по _id|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C)|[жсон]()|
|DELETE /news/:id|Удалить новость по _id||[жсон]()|
</details>

<br/><br/>

# [Тикеты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82%D1%8B)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /tickets|Добавить тикет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|[жсон]()|
|GET /tickets/all|Все тикеты сорт. по дате||[жсон]()|
|GET /tickets/:id|Просмотр тикета по его _id||[жсон]()|
|GET /tickets/user/:id|Все тикеты пользователя||[жсон]()|
|GET /tickets/all/active|Все незавершенные тикеты||[жсон]()|
|GET /tickets/all/emergency|Все тикеты сорт. по срочности||[жсон]()|
|PUT /tickets/:id|Деактивировать тикет по _id||[жсон]()|
|DELETE /tickets/:id|Удалить тикет по _id||[жсон]()|

</details>

<br/><br/>

# [Офис](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%84%D0%B8%D1%81)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /props|Добавить предложение|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D0%B5-%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5)|[жсон]()|
|GET /props/all/likes|Все предложения сорт. по лайкам||[жсон]()|
|GET /props/all/date|Все предложения сорт. по дате||[жсон]()|
|GET /props/search?field=&order=|Кастомизируемый поиск|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0-%D0%BF%D0%BE-%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%BC%D0%BD%D1%8B%D0%BC-%D0%BA%D1%80%D0%B8%D1%82%D0%B5%D1%80%D0%B8%D1%8F%D0%BC)|[жсон]()|
|PUT /props/like/:id|Лайк/дизлайк предложения по его _id|[жсон]()|[жсон]()|
|PUT /props/exec/:id|Добавить исполнителя|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F)|[жсон]()|
|PUT /props/sts/:id|Запустить предложение в работу/отложить|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%81-%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F--%D0%BD%D0%B0%D0%B7%D0%BD%D0%B0%D1%87%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F)|[жсон]()|
|PUT /props/sts/f/:id|Завершить предложение||[жсон]()|

</details>

<br/><br/>

# [Отделы](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D1%8B)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /divisions|Создать новый отдел|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)|[жсон]()|
|GET /divisions/find/:divname|Найти отдел по имени||[жсон]()|
|GET /divisions/all|Все отделы||[жсон]()|
|PUT /divisions/:divname|Вступить в отдел||[жсон]()|
|DELETE /divisions/:divname|Выйти из отдела||[жсон]()|
|GET /divisions/projects/:divid|Все проекты пользователей отдела||[жсон]()|
|PUT /divisions/addcover/:divname|Добавить/изменить обложку отдела|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D1%83-%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D0%B0)|[жсон]()|

</details>

<br/><br/>

# [Субподрядчики](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%B8)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /merc/new|Добавить субподрядчика|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA)|[жсон]()|
|GET /merc/search?name=|Найти всех/найти 1 по имени|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%BE%D0%B2)|[жсон]()|
|PUT /merc/new/edit/:id|Редактирование по _id|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)|[жсон]()|
|DELETE /merc/:id|Удалить субподрядчика по _id||[жсон]()|

</details>

<br/><br/>


# [Проекты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B)

<details>
<summary style="font-size:150%;">Добавление/изменение</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/add|Добавить проект|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|[жсон]()|
|PUT /projects/:crypt|Редактирование проекта по шифру|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C)|[жсон]()|
|DELETE /projects/:crypt|Удалить проект по шифру||[жсон]()|
|PUT /projects/finish/:crypt|Завершить проект||[жсон]()|
|PUT /projects/inf/:crypt|Добавить информационные ресурсы||[жсон]()|
|PUT /projects/cover/:crypt|Добавить обложку|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D1%83)|[жсон]()|
|PUT /projects/budget/:crypt|Добавить/изменить бюджет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D0%B1%D1%8E%D0%B4%D0%B6%D0%B5%D1%82-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон]()|

</details>

<details>
<summary style="font-size:150%;">Поиск</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects|Все проекты + сорт.|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D1%81%D0%B5-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B)|[жсон]()|
|GET /projects/q/search?field=&value=|Найти проекты, подходящие по квери|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-%D0%BF%D0%BE%D0%BF%D0%B0%D0%B4%D0%B0%D1%8E%D1%89%D0%B8%D0%B5-%D0%BF%D0%BE%D0%B4-%D0%BA%D0%B2%D0%B5%D1%80%D0%B8)|[жсон]()|
|GET /projects/:crypt|Найти проект по шифру||[жсон]()|
|GET /projects/user/:id|Найти все проекты юзера, чей _id в юрл||[жсон]()|

</details>

<details>
<summary style="font-size:150%;">Работа с юзерами</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/join2/:crypt|Вступить/выйти в/из команды проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D1%81%D1%82%D1%83%D0%BF%D0%B8%D1%82%D1%8C-%D0%B2-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%83%D0%B2%D1%8B%D0%B9%D1%82%D0%B8-%D0%B8%D0%B7-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%8B)|[жсон]()|
|PUT /projects/updteam/:crypt|Добавить/убрать юзера в/из команды проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%BA%D0%B8%D0%BA%D0%BD%D1%83%D1%82%D1%8C-%D0%B2%D0%B8%D0%B7-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон]()|
|PUT /projects//team2/:crypt/:userid|Редактирование роли/задачи юзера в отделе|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C%D1%80%D0%B0%D0%B7%D0%B4%D0%B5%D0%BB-%D1%87%D0%B5%D0%BB%D0%B8%D0%BA%D0%B0-%D0%B2-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B5)|[жсон]()|

</details>

<details>
<summary style="font-size:150%;">Тэги проекта</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/tag/:crypt|Добавить тэг в проект|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%BA-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%83)|[жсон]()|
|DELETE /projects/tag/:crypt|Удалить тэг из проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B8%D0%B7-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон]()|
|GET /project/tag/search|Найти проекты с указанными тэгами|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC)|[жсон]()|
|GET /projects/tag/find?crypt=&tag=|Поиск тэгов проекта|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон]()|

</details>

<details>
<summary style="font-size:150%;">Спринты</summary>

<details>
<summary style="font-size:120%;">Общая хуйня</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/sprint/new/:crypt|Добавить спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82-%D0%BA-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%83)|[жсон]()|
|PUT /projects/sprints/dd/:id|Добавить/изменить описание + планируемую дату окончания спринта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%BF%D0%BB%D0%B0%D0%BD%D0%B8%D1%80%D1%83%D0%B5%D0%BC%D1%83%D1%8E-%D0%B4%D0%B0%D1%82%D1%83-%D0%BE%D0%BA%D0%BE%D0%BD%D1%87%D0%B0%D0%BD%D0%B8%D1%8F-%D0%B8-%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|[жсон]()|
|PUT /projects/sprints/description/:id|Изменить спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%BF%D0%BE%D0%BB%D0%B5-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|[жсон]()|
|PUT /projects/sprints/:id|Изменение статуса спринта||[жсон]()|
|PUT /projects/favsprint/:id|Фаворитнуть спринт||[жсон]()|
|DELETE /projects/sprints/:id|Удалить спринт||[жсон]()|
|GET /projects/sprints/:crypt|Все спринты проекта(устарело нахуй?)||[жсон]()|
|GET /projects/getsprint/:id|Инфа по 1 спринту||[жсон]()|

</details>

<details>
<summary style="font-size:120%;">Тэги спринтов</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/sprints/addtag/:id|Добавить тэг в спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B2-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|[жсон]()|
|DELETE /projects/sprints/:id/tag?tag=|Удалить тэг из спринта|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B1%D1%80%D0%B0%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B8%D0%B7-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|[жсон]()|
|GET /projects/sprint/tags|Найти все спринты подходящие по тегам|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC)|[жсон]()|

</details>

<details>
<summary style="font-size:120%;">Таски</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects/sprints/gettasks/:id|Все таски спринта||[жсон]()|
|POST /projects/sprints/addtask/:id|Добавить много тасков в спринт||[жсон]()|
|POST /projects/sprints/task/:id|Добавить 1 таск в спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA-%D0%BA-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D1%83)|[жсон]()|
|PUT /projects/sprints/taskedit/:id|Изменить таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%B8%D0%BC%D1%8F-%D1%82%D0%B0%D1%81%D0%BA%D0%B0)|[жсон]()|
|PUT /projects/sprints/DAtask/test|Де/активировать таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%B5%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA)|[жсон]()|
|DELETE /projects/sprints/deltask/:id|Удалить таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA)|[жсон]()|
|PUT /projects/sprints/task/adduser/:id|Добавить исполнителя в таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F-%D0%BA-%D1%82%D0%B0%D1%81%D0%BA%D1%83)|[жсон]()|

</details>

</details>
