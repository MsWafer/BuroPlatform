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
|POST /users/|Регистрация|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F)|{token:token, id:user.id, msg:String}|
|POST /auth/|Авторизация|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%B0%D1%86%D0%B8%D1%8F)|token|
|GET /users/me|Профиль||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|GET /users/me/sprints|Активные спринты||deprecated|
|PUT /users/me|Редактирование профиля|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|{msg:String,userid:user.id}|
|PUT /users/me/pw|Изменение пароля|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8F)|{msg:String}|
|PUT /users/me/a|Добавление/изменение аватара|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B0%D0%B2%D0%B0%D1%82%D0%B0%D1%80)|{msg:String}|
|PUT /users/me/rocket|Изменение рокетнейма|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D1%81%D0%B2%D0%BE%D0%B5%D0%B3%D0%BE-%D1%80%D0%BE%D0%BA%D0%B5%D1%82%D1%87%D0%B0%D1%82%D0%B0)|{msg:String}|
|PUT /users/me/report|Добавить/изменить отчет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D1%82%D1%87%D0%B5%D1%82%D0%BD%D0%BE%D1%81%D1%82%D1%8C)|{msg:String}|
|GET /users/me/report|Открыть свой отчет||String|
|POST /users/passRC|Изменение пароля по рокетчату|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D1%8C-%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C-%D1%87%D0%B5%D1%80%D0%B5%D0%B7-%D1%80%D0%BE%D0%BA%D0%B5%D1%82%D1%87%D0%B0%D1%82-%D0%B8-%D0%BC%D1%8B%D0%BB%D0%BE)|{msg:String}|
|PUT /users/part|Изменение разделов|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D1%81%D0%B2%D0%BE%D0%B8%D1%85-%D1%80%D0%B0%D0%B7%D0%B4%D0%B5%D0%BB%D0%BE%D0%B2)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
</details>

<details>
<summary style="font-size:150%;">Поиск пользователей</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /users/all|Все пользователи|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D0%B2%D1%81%D0%B5%D1%85-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D0%BE%D1%82%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D1%85-%D0%BA%D0%B0%D0%BA-%D1%85%D0%BE%D1%82%D0%B8%D1%82%D0%B5)|Массив из [юзеров](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|GET /users/q/search?field=&value=|Поиск по 1 параметру|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE-%D1%82%D0%B5%D1%85-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D0%BA%D0%BE%D1%82%D0%BE%D1%80%D1%8B%D0%B5-%D0%BF%D0%BE%D0%BF%D0%B0%D0%B4%D0%B0%D1%8E%D1%82-%D0%BF%D0%BE%D0%B4-%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F-%D0%BA%D0%B2%D0%B5%D1%80%D0%B8)|Массив из [юзеров](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|GET /users/:user_id|Получить профиль пользователя по _id||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|GET /users/usr/get?fullname=&division=&partition=|Поиск по имени и/или разделу и/или отделу|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0-%D0%BF%D0%BE-%D1%82%D1%80%D0%B5%D0%BC-%D0%BF%D0%B0%D1%80%D0%B0%D0%BC%D0%B5%D1%82%D1%80%D0%B0%D0%BC)|Массив из [юзеров](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|/users/usr/pos?position=|Поиск по должности|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%8E%D0%B7%D0%B5%D1%80%D0%BE%D0%B2-%D1%81-%D0%BE%D0%BF%D1%80%D0%B5%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C%D1%8E)|Массив из [юзеров](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
</details>

<details>
<summary style="font-size:150%;">Работа с другими пользователями(манагерство)</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /users/poschange/:user_id|Изменить должность юзера|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B3%D0%BE-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|{msg:String}|
|PUT /users/permchange/:user_id|Изменить пермишен юзера|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%B5%D1%80%D0%BC%D0%B8%D1%88%D0%B5%D0%BD%D0%B0-%D0%B4%D1%80%D1%83%D0%B3%D0%BE%D0%B3%D0%BE-%D1%8E%D0%B7%D0%B5%D1%80%D0%B0)|{msg:String}|
|DELETE /users/:user_id|Удалить пользователя||{msg:String}|
|GET /users/report/:user_id|Просмотреть отчет другого пользователя||String|
</details>

<br/><br/>

# [Новости](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /news/|Новая новость|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C)|{news:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C),msg:String}|
|GET /news/all|Все новости||Массив из [новостей](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C)|
|GET /news/:news_id|Просмотреть новость по _id||{news:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C)}|
|PUT /news/:news_id|Редактировать новость по _id|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C)|{news:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D1%8C),msg:String}|
|DELETE /news/:news_id|Удалить новость по _id||{msg:String}|
</details>

<br/><br/>

# [Тикеты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82%D1%8B)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /tickets|Добавить тикет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|{msg:String}|
|GET /tickets/all|Все тикеты сорт. по дате||Массив из [тикетов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|
|GET /tickets/:ticket_id|Просмотр тикета по его _id||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|
|GET /tickets/user/:id|Все тикеты пользователя|||Массив из [тикетов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|
|GET /tickets/all/active|Все незавершенные тикеты|||Массив из [тикетов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|
|GET /tickets/all/emergency|Все тикеты сорт. по срочности|||Массив из [тикетов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%82%D0%B8%D0%BA%D0%B5%D1%82)|
|PUT /tickets/:ticket_id|Деактивировать тикет по _id||{msg:String})|
|DELETE /tickets/:ticket_id|Удалить тикет по _id||{msg:String}|

</details>

<br/><br/>

# [Офис](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%84%D0%B8%D1%81)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /props|Добавить предложение|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D0%BE%D0%B5-%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5)|{msg:String}|
|GET /props/all/likes|Все предложения сорт. по лайкам||Массив из [предложений](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)|
|GET /props/all/date|Все предложения сорт. по дате||Массив из [предложений](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)|
|GET /props/search?field=&order=|Кастомизируемый поиск|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D1%80%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%BA%D0%B0-%D0%BF%D0%BE-%D0%BA%D0%B0%D1%81%D1%82%D0%BE%D0%BC%D0%BD%D1%8B%D0%BC-%D0%BA%D1%80%D0%B8%D1%82%D0%B5%D1%80%D0%B8%D1%8F%D0%BC)|Массив из [предложений](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)|
|PUT /props/like/:prop_id|Лайк/дизлайк предложения по его _id|[жсон]()|{msg:String}|
|PUT /props/exec/:prop_id|Добавить исполнителя|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)|
|PUT /props/sts/:prop_id|Запустить предложение в работу/отложить|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D1%81%D1%82%D0%B0%D1%82%D1%83%D1%81-%D0%BF%D1%80%D0%B5%D0%B4%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F--%D0%BD%D0%B0%D0%B7%D0%BD%D0%B0%D1%87%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F)|{msg:String, props:[{[prop](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)}]}|
|PUT /props/sts/f/:prop_id|Завершить предложение||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%84%D0%B8%D1%81)|
|DELETE /props/:prop_id|Удалить предложение||{msg:String}|

</details>

<br/><br/>

# [Отделы](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D1%8B)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /divisions|Создать новый отдел|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)|{msg:String, div:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB) }|
|GET /divisions/find/:divname|Найти отдел по имени||{division:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB) }|
|GET /divisions/all|Все отделы||Массив из [жсонов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)|
|PUT /divisions/:divname|Вступить в отдел||{msg:String, division:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)}|
|DELETE /divisions/:divname|Выйти из отдела||{msg:String, division:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)}|
|GET /divisions/projects/:div_id|Все проекты пользователей отдела||Массив из пользователей, в которых есть массивы *projects*, в которых лежат [проекты](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|PUT /divisions/addcover/:divname|Добавить/изменить обложку отдела|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D1%83-%D0%BE%D1%82%D0%B4%D0%B5%D0%BB%D0%B0)|{division:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BE%D1%82%D0%B4%D0%B5%D0%BB)}|

</details>

<br/><br/>

# [Субподрядчики](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%B8)

<details>
<summary style="font-size:150%;">Expand</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /merc/new|Добавить субподрядчика|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9-%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA)|{msg:String, mercs: [[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)]}|
|GET /merc/search?name=&?field=&order=|Найти всех/найти 1 по имени|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D1%81%D1%83%D0%B1%D0%BF%D0%BE%D0%B4%D1%80%D1%8F%D0%B4%D1%87%D0%B8%D0%BA%D0%BE%D0%B2)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80) или массив из них|
|PUT /merc/new/edit/:merc_id|Редактирование по _id|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%8E%D0%B7%D0%B5%D1%80)|
|DELETE /merc/:merc_id|Удалить субподрядчика по _id||{msg:String}|

</details>

<br/><br/>


# [Проекты](https://github.com/MsWafer/BuroPlatform/blob/master/newReadme.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B)

<details>
<summary style="font-size:150%;">Добавление/изменение</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/add|Добавить проект|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|{msg:String, project: [жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)}|
|PUT /projects/:crypt|Редактирование проекта по шифру|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|DELETE /projects/:crypt|Удалить проект по шифру||{msg:String}|
|PUT /projects/finish/:crypt|Завершить проект||{msg:String}|
|PUT /projects/inf/:crypt|Добавить информационные ресурсы||?|
|PUT /projects/cover/:crypt|Добавить обложку|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%BE%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D1%83)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|PUT /projects/budget/:crypt|Добавить/изменить бюджет|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D0%B1%D1%8E%D0%B4%D0%B6%D0%B5%D1%82-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|PUT /projects/addrocket/:crypt|Привязать группу рокета к проекту|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D1%80%D0%B8%D0%B2%D1%8F%D0%B7%D0%B0%D1%82%D1%8C-%D1%80%D0%BE%D0%BA%D0%B5%D1%82-%D0%BA-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%83)|{msg:String}|

</details>

<details>
<summary style="font-size:150%;">Поиск</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects|Все проекты + сорт.|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D1%81%D0%B5-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B)|Массив из [проектов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|GET /projects/q/search?field=&value=|Найти проекты, подходящие по квери|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D1%82%D0%BE%D0%BB%D1%8C%D0%BA%D0%BE-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-%D0%BF%D0%BE%D0%BF%D0%B0%D0%B4%D0%B0%D1%8E%D1%89%D0%B8%D0%B5-%D0%BF%D0%BE%D0%B4-%D0%BA%D0%B2%D0%B5%D1%80%D0%B8)|Массив из [проектов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|GET /projects/:crypt|Найти проект по шифру||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|GET /projects/user/:user_id|Найти все проекты юзера, чей _id в юрл||Массив из [проектов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|

</details>

<details>
<summary style="font-size:150%;">Работа с юзерами</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/join2/:crypt|Вступить/выйти в/из команды проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B2%D1%81%D1%82%D1%83%D0%BF%D0%B8%D1%82%D1%8C-%D0%B2-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%83%D0%B2%D1%8B%D0%B9%D1%82%D0%B8-%D0%B8%D0%B7-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D1%8B)|{msg:String, project:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)}|
|PUT /projects/updteam/:crypt|Добавить/убрать юзера в/из команды проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%BA%D0%B8%D0%BA%D0%BD%D1%83%D1%82%D1%8C-%D0%B2%D0%B8%D0%B7-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|PUT /projects/team2/:crypt/:user_id|Редактирование роли/задачи юзера в отделе|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%80%D0%B5%D0%B4%D0%B0%D0%BA%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D0%B4%D0%BE%D0%BB%D0%B6%D0%BD%D0%BE%D1%81%D1%82%D1%8C%D1%80%D0%B0%D0%B7%D0%B4%D0%B5%D0%BB-%D1%87%D0%B5%D0%BB%D0%B8%D0%BA%D0%B0-%D0%B2-%D0%BA%D0%BE%D0%BC%D0%B0%D0%BD%D0%B4%D0%B5)|{msg:String, project:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)}|

</details>

<details>
<summary style="font-size:150%;">Тэги проекта</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/tag/:crypt|Добавить тэг в проект|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%BA-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%83)|{msg:String}|
|DELETE /projects/tag/:crypt|Удалить тэг из проекта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B8%D0%B7-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|{msg:String}|
|GET /project/tag/search|Найти проекты с указанными тэгами|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%8B-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC)|Массив из [проектов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82)|
|GET /projects/tag/find?crypt=&tag=|Поиск тэгов проекта|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BF%D0%BE%D0%B8%D1%81%D0%BA-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D0%B0)|Массив из стрингов|

</details>

<details>
<summary style="font-size:150%;">Спринты</summary>
<br></br>
<details>
<summary style="font-size:120%;">Общая хуйня</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|POST /projects/sprint/new/:crypt|Добавить спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82-%D0%BA-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%D1%83)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|PUT /projects/sprints/dd/:sprint_id|Добавить/изменить описание + планируемую дату окончания спринта|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%BF%D0%BB%D0%B0%D0%BD%D0%B8%D1%80%D1%83%D0%B5%D0%BC%D1%83%D1%8E-%D0%B4%D0%B0%D1%82%D1%83-%D0%BE%D0%BA%D0%BE%D0%BD%D1%87%D0%B0%D0%BD%D0%B8%D1%8F-%D0%B8-%D0%BE%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%B8%D0%B5-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|[жсон]({msg:String})|
|PUT /projects/sprints/description/:sprint_id|Изменить спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%BF%D0%BE%D0%BB%D0%B5-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|PUT /projects/sprints/:sprint_id|Изменение статуса спринта||{msg:String}|
|PUT /projects/favsprint/:sprint_id|Фаворитнуть спринт||{msg:String}|
|DELETE /projects/sprints/:sprint_id|Удалить спринт||{msg:String}|
|GET /projects/sprints/:crypt|Все спринты проекта(устарело нахуй?)|||
|GET /projects/getsprint/:sprint_id|Инфа по 1 спринту||[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|

</details>

<details>
<summary style="font-size:120%;">Тэги спринтов</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|PUT /projects/sprints/addtag/:sprint_id|Добавить тэг в спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B2-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|DELETE /projects/sprints/:sprint_id/tag?tag=|Удалить тэг из спринта|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B1%D1%80%D0%B0%D1%82%D1%8C-%D1%82%D1%8D%D0%B3-%D0%B8%D0%B7-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D0%B0)|{msg:String, }sprint:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|GET /projects/sprint/tags|Найти все спринты подходящие по тегам|[квери](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%BD%D0%B0%D0%B9%D1%82%D0%B8-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82-%D0%BF%D0%BE-%D1%82%D1%8D%D0%B3%D0%B0%D0%BC)|Массив из [спринтов](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|

</details>

<details>
<summary style="font-size:120%;">Таски</summary>

|route|description|request|response|
|---|---|:---:|:---:|
|GET /projects/sprints/gettasks/:sprint_id|Все таски спринта(устарело?)||Обрезанный [спринт](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|POST /projects/sprints/addtask/:sprint_id|Добавить много тасков в спринт||устарело|
|POST /projects/sprints/task/:sprint_id|Добавить 1 таск в спринт|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA-%D0%BA-%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82%D1%83)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|
|PUT /projects/sprints/taskedit/:sprint_id|Изменить таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B8%D1%82%D1%8C-%D0%B8%D0%BC%D1%8F-%D1%82%D0%B0%D1%81%D0%BA%D0%B0)|{msg:String, sprint:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)}|
|PUT /projects/sprints/DAtask/test|Де/активировать таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%B5%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA)|{msg:String, sprint:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)}|
|DELETE /projects/sprints/deltask/:sprint_id|Удалить таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C-%D1%82%D0%B0%D1%81%D0%BA)|{msg:String, sprint:[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)}|
|PUT /projects/sprints/task/adduser/:sprint_id|Добавить исполнителя в таск|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/call_examples.md#%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D0%BD%D0%B8%D1%82%D0%B5%D0%BB%D1%8F-%D0%BA-%D1%82%D0%B0%D1%81%D0%BA%D1%83)|[жсон](https://github.com/MsWafer/BuroPlatform/blob/master/docs/response_examples.md#%D1%81%D0%BF%D1%80%D0%B8%D0%BD%D1%82)|

</details>

</details>
