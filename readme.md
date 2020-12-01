СИСАДМИН_ОЧКА
---------------------
### Эндпоинты
 - **POST /users** - регистрация нового пользователя, требует name, email и password(7+символов) в json в body, выдает auth-token в респонс, пользователь остается авторизованным 360000000 секунд(дев).
 - **POST /auth** - авторизация, требует email и password ранее зарегестрированного пользователя в json в body, выдает auth-token в респонс, пользователь остается авторизованным 360000000 секунд(дев).
  - **GET /tickets/all** - отправляет в респонс массив со всеми проектами, отсортированными по дате.
  - **POST /tickets** - требует авторизации, добавляет новый тикет. Требует auth-token в хедере, problemname, text и emergency(опционально - pcpass и имя скриншота в json в body. Автоматически ставит status на true и добавляет имя и id пользователя. Респонс - плейсхолдер. 
  - **GET /tickets/:id** - находит конкретный тикет по его id. Выдает всю информацию тикета в полуорганизованном формате в респонсе.
  - **GET /tickets/user/:id** - находит все тикеты, созданные пользователем, чей id указан в хедере.
  - **GET /tickets/all/active** - находит все открытые тикеты(status:true).
  - **GET /tickets/all/emergency** - показывает все тикеты, отсортированные по emergency.
  - **PUT /tickets/id** - меняет status тикета на false, ~закрывая его.
  - **POST /** :joy: - добавить новый проект, указав name, date, city в body, в респонсе `${crypt}-${name}`
  - **GET /projects** :star_struck: - получить список всех проектов, респонс WiP
  - **GET /projects/:auth** :sunglasses: - найти проект по auth, где auth это crypt или name проекта, указанные в хедере, в респонсе выдает 
            ```
            name:`Имя проекта:${project.name}`,
            crypt: `Шифр проекта:${project.crypt}`,
            date: `Дата:${project.dateStart}-${project.dateFinish}`,
            city: `Город:${project.city}`
            ```
            если указан crypt, или все проекты с указанным name, если искали через него
  - **DELETE /projects/:crypt** :grimacing: - удалить проект, указав его crypt в хедере. респонс - проект удален
  - **PUT /projects/:crypt** :stuck_out_tongue_winking_eye: - изменить name и date проекта, указав его crypt в хедере и новые значения в body. респонс - 
            ``` 
            name:`Имя проекта:${project.name}`,
            crypt: `Шифр проекта:${project.crypt}`,
            date: `Дата:${project.dateStart}-${project.dateFinish}`,
            city: `Город:${project.city}`
            ```
  - **GET /city/:city** :cowboy_hat_face: - респонс со всеми проектами в городе, указанном в city
