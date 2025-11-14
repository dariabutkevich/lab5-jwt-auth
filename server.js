// const express = require("express");
// const cors = require("cors");

// const app = express();

// let corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));

// app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

// const db = require("./app/models");
// const Role = db.role;

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// app.get("/", (req, res) => {
//   res.json({ message: "Test lab 5!" });
// });

// require('./app/routes/auth.routes')(app);
// require('./app/routes/user.routes')(app);

// // const PORT = process.env.PORT || 8080;
// // app.listen(PORT, () => {
// //   console.log(`Server is running on port ${PORT}.`);
// // });

// // function initial() {
// //   Role.create({
// //     id: 1,
// //     name: "user"
// //   });
// //   Role.create({
// //     id: 2,
// //     name: "admin"
// //   });
// // }

// module.exports = app;

// // Запуск сервера только при прямом запуске файла (node server.js)
// if (require.main === module) {
//     const PORT = process.env.PORT || 8080;
    
//     // Синхронизация БД и запуск сервера только при обычном запуске
//     db.sequelize.sync({force: true}).then(() => {
//         console.log('Drop and Resync Database with { force: true }');
//         initial();
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}.`);
//         });
//     });
// }

// function initial() {
//   Role.create({
//     id: 1,
//     name: "user"
//   });
//   Role.create({
//     id: 2,
//     name: "admin"
//   });
// }

const express = require("express");
const cors = require("cors");

const app = express();

let corsOptions = {
  // origin: "http://localhost:8081"
  origin: process.env.CORS_ORIGIN || "http://localhost:8081",  
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

// if (process.env.NODE_ENV !== 'test') {
//   db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Database with { force: true }');
//     initial();
//   });
// }
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  db.sequelize.sync({ force: true }).then(() => {
    console.log('Drop and Resync Database with { force: true } (dev/test only)');
    initial();
  });
} else {
  console.log('Production mode: DB connected without sync (use migrations)');
}

app.get("/", (req, res) => {
  res.json({ message: "Test lab 5!" });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack); 
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
}

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
  Role.create({
    id: 2,
    name: "admin"
  });
}
