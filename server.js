const express = require('express');
const routes = require('./routes');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const expressValidator = require('express-validator');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const { database } = require('./config/keys');
const passport = require('./config/passport');

require('dotenv').config({path: 'variables.env'});

/*=============================================
INICIALIZACION DE EXPRESS
=============================================*/
const app = express();

/*=============================================
CONFIGURACIONES
=============================================*/
//app.set('port', process.env.PORT || 4000);
//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'));
//Habilitar HBS
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
  }));
app.set('view engine', '.hbs');
//Donde cargar los archivos estaticos
app.use(express.static('public'));

/*=============================================
MIDDLEWARES
=============================================*/
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(session({
    secret: 'shhhhhhhhh',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


/*=============================================
VARIABLES LOCALES
=============================================*/
app.use((req, res, next) => {
  res.locals.usuario = {...req.user} || null;
  //res.locals.mensajes = req.flash();
  app.locals.error = req.flash('error');
  app.locals.success = req.flash('success');
  app.locals.warning = req.flash('warning');
  app.locals.info = req.flash('info');
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  next();
});


/*=============================================
ROUTES
=============================================*/
app.use('/', routes() );

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 4000;

/*=============================================
STARTING SERVER
=============================================*/
/* app.listen(app.get('port'), () => {
  console.log('Server is in port', app.get('port'));
}); */
app.listen(port,host,()=>{
  console.log('Server is in port', port);
})