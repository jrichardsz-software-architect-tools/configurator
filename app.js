const path = require('path');
global.appHomePath = path.resolve(__dirname);

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const router = express.Router();
const hbs = require('hbs');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const Prototypes = require('./prototypes/Prototypes.js');
Prototypes.register();

const Configuration = require('./config/Configuration.js');
global.properties = new Configuration().loadJsonFile(appHomePath+'/config.json', 'utf8');

const logger = require('./log/Logger.js');
global.logger = logger;

const DatabaseConnection = require('./database/DatabaseConnection.js');
const HandleBarsConfigurator = require('./configurator/HandleBarsConfigurator.js');
const RoutesScanner = require('./scanner/RoutesScanner.js');
const DatabaseRepositoryScanner = require('./scanner/DatabaseRepositoryScanner.js');
const Security = require('./security/Security.js');

const port = process.env.PORT || 2708;
const app = express();

app.use(cookieParser())

app.use(session({
  secret: uuid.v4(),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: (45 * 60 * 1000)
  }
}));

var security = new Security();

security.setStaticAssets(["/vendor","/dist","/favicon.ico"]);
security.setLoginEndpoints(["/login","/login/action"]);
security.setApiEndpoints(["/api"]);

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(security.authorize);

hbs.registerPartials("./views/partials");

HandleBarsConfigurator.configure(hbs);

const databaseConnection = new DatabaseConnection();
databaseConnection.initializeConnection({
  host: properties.database.host, // your mysql host, ip or public domain
  user: properties.database.user, // your mysql user
  password: properties.database.password, // your mysql password
  port: properties.database.port, //port mysql
  database: properties.database.name // your database name
}, 'single');

global.databaseConnection = databaseConnection;

RoutesScanner.scan(app);
DatabaseRepositoryScanner.scan();

security.configureAdminCredentials();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static("./public"));

app.listen(port, () => {
  logger.info('serving on port ' + port);
});
