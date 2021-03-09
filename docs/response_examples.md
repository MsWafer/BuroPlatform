# РЕСПОНСЫ
## Проекты
### С меседжом
```json
msg:"Саня проснись ты обосрался"
project:{
    "title":"string",
    "offTitle":"string",
    "type":"string",
    "stage":"string",
    "about":"string",
    "dateStart":2011-11-11,
    "dateFinish":2011-11-11,
    "par":"string",
    "cusStorage":"string",
    "schedule":"string",
    "budget":"string",
    "team2":[{
        "user":"user_object",
        "position":"Работяга",
        "task":"Работать",
        "fullname":"Работяга Работягович"
    },
    {
        "user":"user_object",
        "position":"Работяга",
        "task":"Работать",
        "fullname":"Работяга Работягович"
    }],
    "sprints":[{"sprint_object"},{"sprint_object"}],
    "customerNew":[{
        "name":"string",
        "phone":"string",
        "email":"string",
        "other":["string","string","string"]
    }],
    "city":"string",
    "area":"string",
    "crypt":"string",
    "crypter":"string",
    "status": false,
    "rocketchat":"string",
    "tags":["string","string","string"],
    "urn":"string",
    "urnDate":2011-11-11,
    "obj":"string",
    "mtl":"string",
    "infoRes":[{
        "description":"string",
        "name":"string",
        "content":"string",
        "type":"string",
    },],
    "cover":"string",
}
```
### Без меседжа
```json
{
    "title":"string",
    "offTitle":"string",
    "type":"string",
    "stage":"string",
    "about":"string",
    "dateStart":2011-11-11,
    "dateFinish":2011-11-11,
    "par":"string",
    "cusStorage":"string",
    "schedule":"string",
    "budget":"string",
    "team2":[{
        "user":"user_object",
        "position":"Работяга",
        "task":"Работать",
        "fullname":"Работяга Работягович"
    },
    {
        "user":"user_object",
        "position":"Работяга",
        "task":"Работать",
        "fullname":"Работяга Работягович"
    }],
    "sprints":[{"sprint_object"},{"sprint_object"}],
    "customerNew":[{
        "name":"string",
        "phone":"string",
        "email":"string",
        "other":["string","string","string"]
    }],
    "city":"string",
    "area":"string",
    "crypt":"string",
    "crypter":"string",
    "status": false,
    "rocketchat":"string",
    "tags":["string","string","string"],
    "urn":"string",
    "urnDate":2011-11-11,
    "obj":"string",
    "mtl":"string",
    "infoRes":[{
        "description":"string",
        "name":"string",
        "content":"string",
        "type":"string",
    },],
    "cover":"string",
}
```
### Много проектов
см. [Без месседжа](), но много и в массиве
## Юзеры
### С меседжом
```json
msg:"Саня проснись ты обосрался",
user:{
    "name":"string",
    "lastname":"string",
    "email":"string",
    "password":"string",
    "tickets":[{"ticket_obj"}],
    "projects":[{"project_obj"}],
    "sprints":[{"sprint_obj"}],
    "division":{"division_obj"},
    "permission":"user",
    "position":"string",
    "avatar":"string",
    "reccode":"string",
    "rocketname":"string",
    "rocketId":"string",
    "fullname":"lastname + + name",
    "report":"string",
    "partition":["string"],
    "bday":"string",
    "merc":false,
    "tasks":[{"task_obj"}],
}
```
### Без меседжа
```json
{
    "name":"string",
    "lastname":"string",
    "email":"string",
    "password":"string",
    "tickets":[{"ticket_obj"}],
    "projects":[{"project_obj"}],
    "sprints":[{"sprint_obj"}],
    "division":{"division_obj"},
    "permission":"user",
    "position":"string",
    "avatar":"string",
    "reccode":"string",
    "rocketname":"string",
    "rocketId":"string",
    "fullname":"lastname + + name",
    "report":"string",
    "partition":["string"],
    "bday":"string",
    "merc":false,
    "tasks":[{"task_obj"}],
}
```
### Много юзеров
см. [Без месседжа](), но много и в массиве
## Субподрядчики
см. [Юзеры](), но обрезанные
## Офис
### С меседжом
```json
msg:"Вот бы сео работал...",
prop:{
    "title":"string",
    "text":"string",
    "likes":[{"user_obj"}],
    "likeCount":1,
    "date":2011-11-11,
    "status":0,
    "user":{"user_obj"},
    "executor":{"user_obj"},
}
```
### Без меседжа
```json
{
    "title":"string",
    "text":"string",
    "likes":[{"user_obj"}],
    "likeCount":1,
    "date":2011-11-11,
    "status":0,
    "user":{"user_obj"},
    "executor":{"user_obj"},
}
```
### Много предложений
см. [Без месседжа](), но много и в массиве
## Отделы
### С меседжом
```json
msg:"Вот бы зарплату...",
div:{
    "divname":"string",
    "description":"string",
    "members":[{"user_obj"}],
    "cover":"string"
}
```
### Без меседжа
```json
{
    "divname":"string",
    "description":"string",
    "members":[{"user_obj"}],
    "cover":"string"
}
```
### Много отделов
см. [Без месседжа](), но много и в массиве
## Тикеты
### С меседжом
```json
msg:"Вот бы принтер не ломался...",
ticket:{
    "user":{"user_obj"},
    "problemname":"string",
    "status":false,
    "date":2011-11-11,
    "emergency":0,
    "screenshot":"string",
    "pcpass":"string"
}
```
### Без меседжа
```json
{
    "user":{"user_obj"},
    "problemname":"string",
    "status":false,
    "date":2011-11-11,
    "emergency":0,
    "screenshot":"string",
    "pcpass":"string"
}
```
### Много тикетов
см. [Без месседжа](), но много и в массиве
## Новости
### С меседжом
```json
msg:"huy",
news:{
    "title":"string",
    "text":"string",
    "subtitle":"string",
    "postDate":2011-11-11,
    "author":{"user_obj"},
}
```
### Без меседжа
```json
{
    "title":"string",
    "text":"string",
    "subtitle":"string",
    "postDate":2011-11-11,
    "author":{"user_obj"},
}
```
### Много новостей
см. [Без месседжа](), но много и в массиве
## Спринты
### С меседжом
### Без меседжа
```json
{
    "status":false,
    "title":"string",
    "dateOpen":2011-11-11,
    "dateClosePlan":2011-11-11,
    "dateCloseFact":2011-11-11,
    "description":"string",
    "tags":["string","string"],
    "tasks":[{
        "taskTitle":"string",
        "workVolume":0,
        "taskStatus":false,
        "user":{"user_obj"},
    }],
    "urn":"string",
    "creator":{"user_obj"}
}
```