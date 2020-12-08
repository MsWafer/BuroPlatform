ГАЙД ДЛЯ МАЛЮТОК :man_with_probing_cane: :person_in_manual_wheelchair: :man_in_manual_wheelchair: :family_man_man_boy:
---------------------
## ЭндпоинтОчка
### ЮзерОчка :eye: :lips: :eye:
- **POST /users** - регистрация нового пользователя, требует *name*, *email*, *position* и *password*(7-20символов) в json в body, выдает ***auth-token*** в респонс, пользователь остается авторизованным 360000000 секунд(дев). ТЕПЕРЬ С АВАТАРКАМИ :joy: :joy: :joy: :joy: :joy: :joy:
- **POST /auth** - авторизация, требует *email* и *password* ранее зарегестрированного пользователя в json в body, выдает ***auth-token*** в респонс, пользователь остается авторизованным 360000000 секунд(дев).
- **GET /users/me** - показывает инфу текущего авторизованного пользователя
- **GET /users/all** - показывает всех пользователей
- **GET /users/:id** - показывает пользователя, чей *_id* указан в юрл
- **PUT /users/me** - редактирование своего аккаунта, требует авторизации(неожиданно)
- **DELETE /users/:id** - удаление аккаунта по *_id* пользователя

### СисадминОчка :mechanic: :man_mechanic: :mechanic: :place_of_worship:
  - **GET /tickets/all** - отправляет в респонс массив со всеми проектами, отсортированными по дате.
  - **POST /tickets** - требует авторизации, добавляет новый тикет. Требует ***auth-token*** в хедере, *problemname*, *text* и *emergency*(опционально - *pcpass* и скриншот) в json в body. Автоматически ставит *status* на *true* и добавляет *name* и *_id* пользователя.
  - **GET /tickets/:id** - находит конкретный тикет по его *id*. Выдает всю информацию тикета в полуорганизованном формате в респонсе.
  - **GET /tickets/user/:id** - находит все тикеты, созданные пользователем, чей *id* указан в хедере.
  - **GET /tickets/all/active** - находит все открытые тикеты (status:true).
  - **GET /tickets/all/emergency** - показывает все тикеты, отсортированные по emergency.
  - **PUT /tickets/id** - меняет *status* тикета на *false*, ~закрывая его.

### ПроектОчка :thumbsup: :call_me_hand: :call_me_hand: :call_me_hand: :call_me_hand: :call_me_hand:
  - **POST /projects/add** :joy: - добавить новый проект, указав *title*, *dateStart*, *city*, *type*, *stage*(опционально - *dateFinish*, *customer*, *area*) в body
  - **GET /projects** :star_struck: - получить список всех проектов
  - **GET /projects/:auth** :sunglasses: - найти проект по *auth*, где *auth* это *crypt* или *title* проекта, указанные в хедере, в респонсе выдает инфу по конкретному проекту если указан crypt, или все проекты с указанным title, если искали через него
  - **DELETE /projects/:crypt** :grimacing: - удалить проект, указав его *crypt* в хедере
  - **PUT /projects/:crypt** :stuck_out_tongue_winking_eye: - изменить информацию проекта, указав его crypt в хедере и новые значения в body. В респонсе измененные данные проекта
  - **GET projects/city/:city** - респонс со всеми проектами в городе, указанном в *city*
  - **GET projects/user/:id** - найти все проекты пользователя *id*
  - **PUT projects/updteam/:crypt** - находит проект по его *crypt* и добавляет в его команду пользователя, чей айди указан в *userid* в body
  - **DELETE projects/updteam/:crypt** - находит проект по его *crypt* и убирает из его команды пользователя, чей айди указан в *userid* в body


password recovery plan
------------------
- find user by email, write recovery code to model and send it to user's email
- check whenever recovery code inserted by user is the same as the one in model
- if its the same, ask for new password, encrypt it and write to model

sprints plan
-------------------
- add empty sprint with inactive status
- add task with taskTitle, workVolume, taskStatus
- activate task, check if all tasks in sprint are activated, activate sprint if so
- activate sprint