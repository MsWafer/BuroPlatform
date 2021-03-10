[назад](../newReadme.md)
# РЕКВЕСТЫ


## users

### АВТОРИЗАЦИЯ
```json
{
    "email":"string",
    "password":"string"
}
```
### РЕГИСТРАЦИЯ
Регистрация нового пользователя, если email или rocketname уже есть в БД идете нахуй.
```json
{
    "email":"string",
    "rocketname":"string"
}
```
### РЕДАКТИРОВАНИЕ ЮЗЕРА
Необходимые поля: name, lastname, position
```json
{
    "name":"string",
    "lastname":"string",
    "position":"string",
    "email":"string",
    "phone":"string",
    "bday":2011-11-11,
}
```
### СМЕНА ПАРОЛЯ
```json
{
    "password":"string"
}
```
### АВАТАР
Отправляете .png/.jpg/.jpeg как "file"
### СМЕНА ДОЛЖНОСТИ ДРУГОГО ЮЗЕРА
Меняет должность чела, чей _id указан в юрле, манагер+ онли.
```json
{
    "position":"string"
}
```
### СМЕНА ПЕРМИШЕНА ДРУГОГО ЮЗЕРА
Админ онли, допустимые значения - user,manager,admin
```json
{
    "permission":"string"
}
```
### СМЕНА СВОЕГО РОКЕТЧАТА
Если указанный рокетнейм не существует в рокете - идете нахуй
```json
{
    "rocketname":"string"
}
```
### НАЙТИ ВСЕХ ЮЗЕРОВ, ОТСОРТИРОВАННЫХ КАК ХОТИТЕ
    /users/all?field={поле в документе юзера}&order={true или любая хуйня}
### ПОИСК ТОЛЬКО ТЕХ ЮЗЕРОВ КОТОРЫЕ ПОПАДАЮТ ПОД УСЛОВИЯ КВЕРИ
    /users/q/search?field={поле в доке юзера}&value={значение поля}
### СМЕНА СВОИХ РАЗДЕЛОВ
Отправлять все разделы, которые должны быть записаны, даже если они уже были в массиве
```json
{
    "partition":["string","string"]
}
```
### ПОИСК ЮЗЕРА ПО ТРЕМ ПАРАМЕТРАМ
    /usr/get?fullname={что-то из фуллнейма юзера}&division={_id отдела}&partition={раздел стрингом}
Все части квери опциональны, если любой из них нет ищет по другим частям, если ни одной нет - выдает всех юзеров
### ПОИСК ЮЗЕРОВ С ОПРЕДЕЛЕННОЙ ДОЛЖНОСТЬЮ
    /users/usr/pos?position={должность}
### ДОБАВИТЬ ОТЧЕТНОСТЬ
Шифруется, достать можно только по отдельному роуту
```json
{
    "report":"string",
}
```
### ВОССТАНОВИТЬ ПАРОЛЬ ЧЕРЕЗ РОКЕТЧАТ И МЫЛО
Отправляет новый пароль в рокет, который привзян к указанному мылу
```json
{
    "email":"string"
}
``` 

## propositions


### НОВОЕ ПРЕДЛОЖЕНИЕ
```json
{
    "text":"string",
    "title":"string"
}
```
### СОРТИРОВКА ПО КАСТОМНЫМ КРИТЕРИЯМ
    /props/search?field={поле по которому сортировать}&order={порядок сортировки(1 или -1)}
### ДОБАВИТЬ ИСПОЛНИТЕЛЯ
```json
{
    "user":"user_id",
}
```
### ИЗМЕНИТЬ СТАТУС ПРЕДЛОЖЕНИЯ + НАЗНАЧИТЬ ИСПОЛНИТЕЛЯ
```json
{
    "executor":"user_id",
    "rocket":true
}
```
Если не отправлять rocket или отправить как false - исполнителю не приходит оповещение в рокет



## news


### ДОБАВИТЬ НОВОСТЬ
```json
{
    "title":"string",
    "text":"string",
    "subtitle":"string"
}
```
### РЕДАКТИРОВАТЬ
```json
{
    "title":"string",
    "subtitle":"string",
    "text":"string"
}
```



## tickets


### НОВЫЙ ТИКЕТ
```json
{
    "problemname":"string",
    "text":"string",
    "emergency":3,
    "pcpass":"string"
}
```
Опционально скриншот проблемы как *file*



## mercs


### Новый субподрядчик
```json
{
    "name":"string",
    "lastname":"string",
    "partition":["string","string"],
    "email":"string",
    "phone":"string"
}
```
### Поиск субподрядчиков
   /merc/search?name={*all* для всех субподрядчиков или *fullname* для конкретного}
### Редактирование
```json
{
    "name":"string",
    "lastname":"string",
    "partition":["string","string"],
    "email":"string",
    "phone":"string"
}
```



## Отделы


### Создать отдел
```json
{
    "divname":"string",
    "description":"string"
}
```
### Добавить обложку отдела
Отправляете .png/.jpg/.jpeg как *file*



## Проекты


### Создать проект
```json
{
    "title":"string",
    "city":"string",
    "type":"string",
    "stage":"string",
    "area":"string",
    "about":"string",
    "status":false,
    "par":"string",
    "rcheck":true,
    "offTitle":"string",
    "cusStorage":"string",
    "schedule":"string",
    "dateStart":2011-11-11,
    "dateFinish":2011-11-11,
    "userid2":[{"user":"user_id","position":"string","task":"string"}],
    "customerNew":{
        "name":"string",
        "phone":"string",
        "email":"string",
        "other":["string","string"]
        },
}
```
### Все проекты
    /projects?field={поле по которому сортировать}&order={true или что-то другое}
### Найти только проекты, попадающие под квери
    /projects/q/search?field={поле в дб}&value={валуе которое надо вывести}
### Изменить
```json
{
    "title":"string",
    "city":"string",
    "type":"string",
    "stage":"string",
    "area":"string",
    "about":"string",
    "status":false,
    "par":"string",
    "offTitle":"string",
    "cusStorage":"string",
    "schedule":"string",
    "dateStart":2011-11-11,
    "dateFinish":2011-11-11,
    "customerNew":{
        "name":"string",
        "phone":"string",
        "email":"string",
        "other":["string","string"]
        },
}
```
Можно отправлять только те поля, которые надо изменить
### Добавить/кикнуть в/из проекта
```json
{
    "user":"user_id",
    "position":"string",
    "task":"task"
}
```
Если надо кикнуть - можно отправлять только 
```json
{
    "user":"user_id",
}
```
### Вступить в команду/выйти из команды
```json
Для вступления отправлять жсон, для выхода не надо
{
    "position":"string",
    "task":"string"
}
```
### Редактировать должность/раздел челика в команде
```json
{
    "position":"string",
    "task":"task"
}
```
### Добавить информационные ресурсы
хз, пока непонятно как это все будет работать
### Добавить обложку
    Отправить картинку как *file*
### Добавить/редактировать бюджет проекта
```json
{
    "budget":"string"
}
```

<br/><br/>
<br/><br/>

### Добавить спринт к проекту
```json
{
    "title":"string",
    "date":2011-11-11,
    "description":"string",
    "tasks":[
        {
            "taskTitle":"string",
            "workVolume":0,
            "taskStatus":false
        }
    ],
    "tags":["string","string"]
}
```
*date* - планируемая дата окончания
### Добавить/изменить планируемую дату окончания и описание спринта
```json
{
    "date":2011-11-11,
    "description":"string"
}
```
### Добавить/изменить поле спринта
```json
{
    "description":"string",
    "title":"string",
    "dateClosePlan":2011-11-11
}
```
### Добавить таск к спринту
```json
{
    "taskState":false,
    "taskTitle":"string",
    "workVolume":0
}
```
### Добавить исполнителя к таску
```json
{
    "userid":"user_id",
    "taskid":"task_id",
    "rocket":false,
}
```
Если rocket!=true - не отправляет оповещение юзеру в рокет
### Де\активировать таск
```json
{
    "taskid":"task_id",
}
```
### Изменить имя таска
```json
{
    "taskid":"task_id",
    "taskTitle":"string",
}
```
### Удалить таск
```json
{
    "taskid":"task_id"
}
```

<br/><br/>
<br/><br/>

### Добавить тэг к проекту
```json
{
    "tag":"string"
}
```
### Удалить тэг из проекта
```json
{
    "tag":"string"
}
```
### Найти проекты по тэгам
    /projects/tag/search?tag={tag1}&tag={tag2}...
### Поиск по тэгам проекта
    /projects/tag/find?crypt={crypt проекта}&tag={часть тэга или целый тэг}
### Добавить тэг в спринт
```json
{
    "tag":"string"
}
```
### Убрать тэг из спринта
   /projects/sprints/:sprint_id/tag?tag={tag kotoriy nado ubrat}
### Найти спринт по тэгам
    /projects/sprint/tags?tag={tag}&tag={tag2}...
