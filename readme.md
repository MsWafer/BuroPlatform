ГАЙД ДЛЯ МАЛЮТОК :person_in_manual_wheelchair: :family_man_man_boy:
---------------------
## ЭндпоинтОчка
### ЮзерОчка :eye: :lips: :eye:
- **POST /users** - регистрация нового пользователя, требует *name*, *email*, *position* и *password*(7-20символов) в json в body, выдает ***auth-token*** в респонс, пользователь остается авторизованным 360000000 секунд(дев). ТЕПЕРЬ С АВАТАРКАМИ :joy: :joy: :joy: :joy: :joy: :joy:
- **POST /auth** - авторизация, требует *email* и *password* ранее зарегестрированного пользователя в json в body, выдает ***auth-token*** в респонс, пользователь остается авторизованным 360000000 секунд(дев).
- **GET /users/me** - показывает инфу текущего авторизованного пользователя
- **GET /users/all** - показывает всех пользователей
- **GET /users/:id** - показывает пользователя, чей *_id* указан в юрл
- **PUT /users/me** - меняет *name*,*email*,*position* текущего пользователя на новые, взятые из body. Если они не указаны оставляет старые значения
- **PUT /users/me/a** - меняет/ставит аватар текущего пользователя, требует *file*, возможно формдата
- **PUT /users/me/pw** - меняет пароль на новый *req.body.password*
- **PUT /users/poschange/:id** - меняет *position* юзера, чей ид указан в юрл
- **PUT /users/permchange/:id** - меняет *permission* юзера, чей ид указан в юрл
- **DELETE /users/:id** - удаление аккаунта по *_id* пользователя

### СисадминОчка :mechanic: :man_mechanic: :mechanic: :place_of_worship:
  - **GET /tickets/all** - отправляет в респонс массив со всеми проектами, отсортированными по дате.
  - **POST /tickets** - требует авторизации, добавляет новый тикет. Требует ***auth-token*** в хедере, *problemname*, *text* и *emergency*(опционально - *pcpass* и скриншот) в json в body. Автоматически ставит *status* на *true* и добавляет *name* и *_id* пользователя.
  - **GET /tickets/:id** - находит конкретный тикет по его *id*. Выдает всю информацию тикета в полуорганизованном формате в респонсе.
  - **GET /tickets/user/:id** - находит все тикеты, созданные пользователем, чей *id* указан в хедере.
  - **GET /tickets/all/active** - находит все открытые тикеты (status:true).
  - **GET /tickets/all/emergency** - показывает все тикеты, отсортированные по emergency.
  - **PUT /tickets/id** - меняет *status* тикета на *false*, ~закрывая его.
  - **DELETE /tickets/:id** - удалить тикет по ид в юрл

### ПроектОчка :call_me_hand: :call_me_hand: :call_me_hand: :call_me_hand: :call_me_hand:
  - **POST /projects/add** - добавить новый проект, указав *title*, *dateStart*, *city*, *type*, *stage*(опционально - *dateFinish*, *customer*, *area*, *about* *userid*(айдишники юзеров которых надо добавить в команду проекта в виде объектов в массиве)) в body, респонсит хуем в жопу фронтэндера
  - **GET /projects** - получить список всех проектов
  - **GET /projects/:auth** - найти проект по *auth*, где *auth* это *crypt* или *title* проекта, указанные в хедере, в респонсе выдает инфу по конкретному проекту если указан crypt, или все проекты с указанным title, если искали через него
  - **DELETE /projects/:crypt** - удалить проект, указав его *crypt* в хедере
  - **PUT /projects/:crypt** - изменить информацию проекта, указав его crypt в хедере и новые значения в body. В респонсе измененные данные проекта
  - **GET projects/city/:city** - респонс со всеми проектами в городе, указанном в *city*
  - **GET projects/user/:id** - найти все проекты пользователя *id*
  - **PUT projects/updteam/:crypt** - находит проект по его *crypt* и добавляет в его команду пользователя, чей айди указан в *userid* в body
  - **PUT projects/jointeam/:crypt** - текущий пользователь вступает в ~~ИГИЛ~~ команду проекта, чей *crypt* указан в юрл
  - **DELETE projects/updteam/:crypt** - находит проект по его *crypt* и убирает из его команды пользователя, чей айди указан в *userid* в body

  ### СпринтОчка :a: :shark: :a:
  - **POST projects/sprints/new/:crypt** - добавляет пустой спринт к проекту с шифром, указанным в юрл
  - **GET projects/sprints/:crypt** - показывает все спринты проекта, найденного по его шифру в юрл
  - **POST projects/sprints/addtask/:id** - находит спринт по *id* в юрл, добавляет массив *tasks* с *taskTitle*(string), *workVolume*(number),*taskState*:false(boolean) из body
  - **PUT projects/sprints/DAtask/:id** -  находит спринт по *id* в юрл, меняет статус таска, чей ид указан в *taskid*, если все таски спринта выполнены, меняет статус спринта(этот раут вообще нихуя не тестил, так что возможно не работает)
  - **PUT projects/sprints/:id** -  находит спринт по *id* в юрл, меняет его статус
  - **GET projects/getsprint/:id** - находит спринт по *id*

  ### Восстановление ПароляОчка
  - **PUT users/passrec** - находит юзера по *email* в body, создает *recCode*, сохраняет его в модель и отправляет пользователю на указанный email
  - **GET users/passrec/2** - проверяет введенный пользователем *recCode* из бади, возвращает *recCode* на всякий случай
  - **PUT users/passrec/3** - находит пользователя по *recCode* из body, меняет его пароль на новый *password* из body, удаляет старый *recCode* из модели, зачем-то возвращает юзер айди
