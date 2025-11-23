const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

let corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:8081",  
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, '.')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return;  
  res.sendFile(path.join(__dirname, 'index.html'));
});

const db = require("./app/models");
const Role = db.role;

// if (process.env.NODE_ENV !== 'test') {
//   db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Database with { force: true }');
//     initial();
//   });
// }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    console.log('Dev/Test: Syncing DB...');
    db.sequelize.sync({ force: true }).then(() => {
      initial();
    }).catch(err => {
      console.error('DB Sync failed:', err.message);
    });
  } else {
    console.log('Production: DB connected (migrations via post-deploy)');
  }


// if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
//   db.sequelize.sync({ force: true }).then(() => {
//     console.log('Drop and Resync Database with { force: true } (dev/test only)');
//     initial();
//   });
// } else {
//   console.log('Production mode: DB connected without sync (use migrations)');
// }

app.get("/", (req, res) => {
  res.json({ message: "Test lab 5!" });
  // res.send('Lab 5 data.123');
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack); 
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

// if (require.main === module) {
//   const PORT = process.env.PORT || 8080;
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
//   });
// }

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {  
    console.log(`Server is running on port ${PORT}.`);
  });

  // DB sync ПОСЛЕ listen (async, с try-catch)
  const db = require("./app/models");
  const Role = db.role;
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    db.sequelize.sync({ force: true }).then(() => {
      console.log('Drop and Resync Database (dev/test only)');
      initial();
    }).catch(err => {
      console.error('DB Sync failed:', err.message);  
    });
  } else {
    console.log('Production: DB connected (migrations via post-deploy)');
  }
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
