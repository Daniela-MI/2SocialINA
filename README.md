# 2socialIN

### Install dependencies

`npm install`

### Start the app in development mode

`npm run dev`

### Using MongoDB

- create a new account on mongodb.com
- create a new user
- create a new database
- get the mongoURI from Database -> Connect -> Select IP -> Connect Your Application
- add the mongoURI to config/default.json file:

```js
{
   "mongoURI": "mongodb+srv://<user>:<password>@cluster0.f4v5k.mongodb.net/?retryWrites=true&w=majority"
}
```
