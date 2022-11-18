# todo
```javascript
docker-compose up
npm i
npm test
npm run start
```

POST /user/login
  body:
    username: String; password: String
  returns:
    token

POST /user/register
  body:
    username: String; password: String
  returns:
    token

GET /todo
  query:
    token: string; page?:number
POST /todo
  body:
    text: string; token: string
PUT /todo
  body:
    _id: string; token: string; text: string
DELETE /todo
  body: 
    _id: string; token: string