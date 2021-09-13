# CONFIGURATOR

Centralize and Management configurations of all your applications.

![logo](./logo/logo.png)

# Requirements

- Node.js > 8.*
- Mysql database. You could use [docker](https://gist.github.com/jrichardsz/73142c5c7eb7136d80b165e75d3a1e22)
- Create a database and execute this ddl to create the required tables: [./database/ddl.sql](./database/ddl.sql)


# Variables

```
export PORT=8080
export CONFIGURATOR_DATABASE_HOST=localhost
export CONFIGURATOR_DATABASE_USER=root
export CONFIGURATOR_DATABASE_PASSWORD=secret
export CONFIGURATOR_DATABASE_PORT=3306
export CONFIGURATOR_DATABASE_NAME=configurator
export CONFIGURATOR_API_KEY=changeme
export CONFIGURATOR_CRYPT_KEY=changeme
export CONFIGURATOR_BFA_THRESHOLD=100
```

## For developers

npm install
npm run dev

## For servers

npm install
npm run start

# Run with docker

## Docker build

```
docker build -t configurator .
```

## Docker run

```
docker run --name configurator -it --rm -p 8080:2708 \
-e CONFIGURATOR_DATABASE_HOST=localhost \
-e CONFIGURATOR_DATABASE_USER=root \
-e CONFIGURATOR_DATABASE_PASSWORD=secret \
-e CONFIGURATOR_DATABASE_PORT=3306 \
-e CONFIGURATOR_DATABASE_NAME=configurator \
-e CONFIGURATOR_API_KEY=changeme \
-e CONFIGURATOR_CRYPT_KEY=changeme \
-e CONFIGURATOR_BFA_THRESHOLD=100 \
-e TZ=America/Lima configurator
```


# Usage

Open your browser pointing at:

- http://localhost:2708
- or http://localhost:8080 if you are using the PORT variables

> Note: Admin password will be showed in the server log.

If no errors, you will see:

![home](./logo/home.png)

# Users

By default two user are created:

- admin with admin role
- guest with reader role

Password are printed in the first log. Take care to delete them of the log!!. If you are using docker, [this](https://stackoverflow.com/a/42510314/3957754) works.

Admin can make anything. Guest user only can enter to few options and can't view secrets values.


# Get variables

If you have created an app called **helicarrier-api** with at least one variable, this is how can we get its variables:

```
curl localhost:2708/api/v1/variables?application=helicarrier-api -H "apiKey:changeme"
```

response will be

```
export ERP_HOST="12.124.1.6"
export firebase_key="65468748"
```

# Docker

Follow this [guide](https://github.com/software-architect-tools/configurator/wiki/Launch-with-Docker)

# Roadmap

- [ ] solve/implement [issues](https://github.com/software-architect-tools/configurator/issues)
- [ ] add changelog column for each app or variable
- [ ] add dependency injection
- [ ] unit tests/selenium tests
- [ ] java and nodejs libraries to be used in application as **configurator client**


# Made with

- Node.js
- Mysql
- Web template engine for fast development: https://www.npmjs.com/package/pug
- Bootstrap template: https://adminlte.io/
- Handlebars Engine : https://handlebarsjs.com/builtin_helpers.html
- Initial template : https://github.com/jayetan/Nodejs-Admin-Dashboard.git


# Contributors

Thanks goes to these wonderful people :

<table>
  <tbody>
    <td>
      <img src="https://avatars0.githubusercontent.com/u/3322836?s=460&v=4" width="100px;"/>
      <br />
      <label><a href="http://jrichardsz.github.io/">Richard Leon</a></label>
      <br />
    </td>    
  </tbody>
</table>
