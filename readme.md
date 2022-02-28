# CONFIGURATOR

Centralize and Management configurations of all your applications.

![logo](./src/logo/logo.png)

# Requirements

- Node.js > 14.*
- Mysql database. You could use [docker](https://gist.github.com/jrichardsz/73142c5c7eb7136d80b165e75d3a1e22)
- Create a database and execute this ddl to create the required tables: [./database/ddl.sql](./src/database/dump/ddl.sql)


# Settings


|key | sample value | description|
|---|---|---|
|PORT | 8080 | change the port of server. Default is 2708|
|CONFIGURATOR_DATABASE_HOST | 10.20.30.40 | some ip of your mysql database|
|CONFIGURATOR_DATABASE_USER | usr_configurator | the mysql user for your my database. Root is not required.|
|CONFIGURATOR_DATABASE_PASSWORD | ***** |  password related to the mysql user|
|CONFIGURATOR_DATABASE_PORT | 3306 | mysql port. Default is 3306|
|CONFIGURATOR_DATABASE_NAME | configurator | name of your mysql database|
|CONFIGURATOR_API_KEY | ****** | secret value to be used as key to protect the api invocations. Long as you can|
|CONFIGURATOR_CRYPT_KEY | ****** | secret value to be used as key to encrypt the sensible values in the database. Long as you can|
|CONFIGURATOR_BFA_THRESHOLD | 100 | Numeric value to protect against Force Brute Attack. Default is 50 |
|CONFIGURATOR_DISABLE_CAPTCHA | false | Enable or disable the captcha on login|


# For developers

- install dependencies
```
npm install
```
- [export variables](https://github.com/jrichardsz-software-architect-tools/configurator/wiki/Export--variables---Linux)
- run

```
npm run dev
```

# For servers without docker

- install dependencies
```
npm install
```
- [export variables](https://github.com/jrichardsz-software-architect-tools/configurator/wiki/Export--variables---Linux)
- run
```
npm run start
```

# For servers with docker

**Docker build**

```
docker build -t configurator .
```

**Docker run**

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

# For servers with docker-compose

```
docker-compose up -d
```

# For servers with public docker image

Follow this [guide](https://github.com/software-architect-tools/configurator/wiki/Launch-with-Docker).

# Usage

Open your browser pointing at:

- http://localhost:2708
- or http://localhost:8080 if you are using the PORT variable

> Note: Admin password will be showed in the server log.

If no errors, you will see:

![home](./src/logo/home.png)

# Login

By default two user are created:

- admin with admin role
- guest with reader role

Password are printed in the first log. Take care to delete them of the log!!. If you are using docker, [this](https://stackoverflow.com/a/42510314/3957754) works.

Admin can make anything. Guest user only can enter to few options and can't view secrets values.


# Api: /variables

If you have created an app called **helicarrier-api** with at least one variable, this is how you can get its variables:

```
curl localhost:2708/api/v1/variables?application=helicarrier-api -H "apiKey:changeme"
```

response will be

```
export ERP_HOST="12.124.1.6"
export firebase_key="65468748"
```

# Clients and How to use it

These variables are an option to the following strategies in several languages:

- application.properties (java spring boot)
- .env
- hardcoded variables in \_prod \_staging configuration files
- wp-config.php in wordpress
- settings.php in drupal
- AppSettings.json on c#
- etc

The previous files are inherited from first languages as a way to centralize the **configurations** of the application. Use them today in distributed enterprise environments **is not an option anymore**

The famous [The Twelve Factors](https://12factor.net/) for modern software, mention this on its third statement:

> III. Config : Store config in the environment

Also several platforms like [heroku](https://devcenter.heroku.com/articles/config-vars) recommends us the use environment variables instead hardcoded values:

> An app’s environment-specific configuration should be stored in environment variables (not in the app’s source code)

If this is your case, you just need to call the **/variables** endpoint in the startup of your application and expose that variables to your entire system in transparent way, so that your classes won't know the origin of the variables: development ide, developer shell or testing/prod shell

I will develop clients for every language. At this moment, just the client for bash or docker based apps are here:

- https://github.com/software-architect-tools/configurator/wiki/Linux-Client

# Success stories

I successful use the configurator for the following technologies based on docker:

- java : spring-boot
- java : war on tomcats
- java : pentaho
- nodejs : express aplications
- php : pure without frameworks
- php : drupal
- php : wordpress
- php : moodle
- c# : netcore

# Alternatives

Here some platforms:
- [zookeeper](https://zookeeper.apache.org)
  - http://www.therore.net/java/2015/05/03/distributed-configuration-with-zookeeper-curator-and-spring-cloud-config.html
- [Spring Cloud](http://spring.io/projects/spring-cloud-config#overview)
  - https://www.baeldung.com/spring-cloud-configuration
  - This is a java spring framework functionality in which you can create properties file with configurations and configure your applications to read them.
- [Consul](https://www.consul.io/intro)
  - Consul is a service mesh solution providing a full featured control plane with service discovery, configuration, and segmentation functionality.
- https://www.vaultproject.io/
- https://www.doppler.com/
- doozerd
- etcd


# Roadmap

- [ ] highlight variables who exist in another applications
- [ ] solve/implement [issues](https://github.com/software-architect-tools/configurator/issues)
- [ ] add changelog column for each app or variable
- [ ] add dependency injection
- [ ] improve unit tests tests
- [ ] unit selenium tests
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
      <label><a href="http://jrichardsz.github.io/">JRichardsz</a></label>
      <br />
    </td>    
  </tbody>
</table>
