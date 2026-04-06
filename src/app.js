const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const logger = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const user_routes = require('./routes/user.routes');
const category_routes =  require('./routes/category.routes');
const transaction_routes = require('./routes/transaction.routes');
const dashboard_routes = require('./routes/dashboard.routes');
const globalLimiter = require('./middlewares/rate.limitor/global.rate.limitor.middleware')

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

// Logger
app.use(morgan('dev'));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    withCredentials: true
  }
}));

// Routes
app.use('/api/users', user_routes);
app.use('/api/category', category_routes);
app.use('/api/transactions', transaction_routes);
app.use('/api/dashboard', dashboard_routes);

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

module.exports = app;