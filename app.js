const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const db = require('./db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressLayouts);
app.use(session({
  secret: 'login_dulu',
  resave: false,
  saveUninitialized: true,
}));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const indexRoutes = require('./routes/index');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRouter = require('./routes/order')
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');

// Ensure user is redirected to the login page if not authenticated
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.use('/', loginRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/products', checkAuth, productRoutes);
app.use('/cart', checkAuth, cartRoutes);
app.use('/order', checkAuth,orderRouter);
app.use('/home', checkAuth, indexRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
