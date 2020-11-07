const mongoose = require('mongoose');
const dotenv = require('dotenv');

if (process.env.NODE_ENV == 'development') {
  dotenv.config({
    path: './config/development.env',
  });
} else {
  dotenv.config({
    path: './config/production.env',
  });
}

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect the database
mongoose.connect(database, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => {
  console.log('DB connection Successfully!');
  console.log(`Database - ${mongoose.connection.name}`);
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
  console.log(`Environment - ${process.env.NODE_ENV}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Exception!  shutting down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
