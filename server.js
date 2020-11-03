const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: './config/config.env',
});

// process.on('uncaughtException', (err) => {
//   console.log('Uncaught Exception! shutting down...');
//   console.log(err.name, err.message);
//   process.exit(1);
// });

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
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Application is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Exception!  shutting down ...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
