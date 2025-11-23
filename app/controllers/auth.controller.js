// require('dotenv').config();

// const db = require("../models");
// const config = require("../config/auth.config");
// const User = db.user;
// const Role = db.role;

// const Op = db.Sequelize.Op;

// let jwt = require("jsonwebtoken");
// let bcrypt = require("bcryptjs");

// const nodemailer = require('nodemailer');

// const AUTH_USER = process.env.AUTH_USER || "darabutkevich@gmail.com";
// const AUTH_PASS = process.env.AUTH_PASS || "ywjk zsqy boxp cqhx ";

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: AUTH_USER,
//     pass: AUTH_PASS 
//   }
// });

// async function sendLoginNotification(email, action = 'вход в систему') {
//     const mailOptions = {
//         from: `"Lab 5 Notifier" <${AUTH_USER}>`, 
//         to: email, 
//         subject: `Уведомление о ${action}`,
//         text: `Здравствуйте! Мы уведомляем вас о недавнем ${action} в вашу учетную запись ${email}.`,
//         html: `<p>Здравствуйте!</p><p>Мы уведомляем вас о недавнем <b>${action}</b> в вашу учетную запись <b>${email}</b>.</p>`,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Notification sent to ${email} about ${action}.`);
//     } catch (error) {
//         console.error(`Error sending notification to ${email}:`, error);
//         if (error.code === 'EAUTH') {
//             console.error('ПОДСКАЗКА: Ошибка EAUTH. Проверьте, что вы используете Пароль Приложения (App Password) вместо обычного пароля Gmail!');
//         }
//     }
// }

// exports.signup = async (req, res) => {
//   try {
//       // 1. Создаем пользователя
//       const user = await User.create({
//           username: req.body.username,
//           email: req.body.email,
//           password: bcrypt.hashSync(req.body.password, 8)
//       });

//       if (req.body.roles) {
//           // 2. Находим роли
//           const roles = await Role.findAll({
//               where: {
//                   name: {
//                       [Op.or]: req.body.roles
//                   }
//               }
//           });
//           // 3. Устанавливаем роли
//           await user.setRoles(roles);
//       } else {
//           // 3. Устанавливаем роль по умолчанию (ID=1)
//           await user.setRoles([1]);
//       }

//       // 4. Отправляем ответ
//       return res.send({ message: "User registered successfully!" });
//   } catch (err) {
//       // Обрабатываем ошибки
//       return res.status(500).send({ message: err.message });
//   }
// };

// exports.signin = async (req, res) => {
//   try {
//       // 1. Ищем пользователя
//       const user = await User.findOne({
//           where: {
//               username: req.body.username
//           }
//       });

//       if (!user) {
//           return res.status(404).send({ message: "User Not found." });
//       }

//       // 2. Проверяем пароль
//       const passwordIsValid = bcrypt.compareSync(
//           req.body.password,
//           user.password
//       );

//       if (!passwordIsValid) {
//           return res.status(401).send({
//               accessToken: null,
//               message: "Invalid Password!"
//           });
//       }

//       // 3. Генерируем Access Token
//       const accessToken = jwt.sign({ id: user.id },
//           config.secret,
//           {
//               algorithm: 'HS256',
//               allowInsecureKeySizes: true,
//               expiresIn: config.jwtExpiration, 
//           });

//       // 4. Генерируем Refresh Token
//       const refreshToken = await db.refreshToken.createToken(user); 
      
//       // 5. УВЕДОМЛЕНИЕ: Ждем отправки уведомления, прежде чем отправить ответ
//       await sendLoginNotification(user.email, 'успешный вход в систему');

//       // 6. Получаем роли
//       const roles = await user.getRoles();
//       var authorities = [];
//       for (let i = 0; i < roles.length; i++) {
//           authorities.push("ROLE_" + roles[i].name.toUpperCase());
//       }

//       // 7. Отправляем ответ
//       return res.status(200).send({
//           id: user.id,
//           username: user.username,
//           email: user.email,
//           roles: authorities,
//           accessToken: accessToken,
//           refreshToken: refreshToken
//       });

//   } catch (err) {
//       return res.status(500).send({ message: err.message });
//   }
// };


// exports.refreshToken = async (req, res) => {
//   const { refreshToken: requestToken } = req.body;

//   if (requestToken == null) {
//     return res.status(403).json({ message: "Refresh Token is required!" });
//   }

//   try {
//     let refreshToken = await db.refreshToken.findOne({ where: { token: requestToken } });

//     if (!refreshToken) {
//       return res.status(403).json({ message: "Refresh token is not in database!" });
//     }

//     if (db.refreshToken.verifyExpiration(refreshToken)) {
//       await refreshToken.destroy();
//       return res.status(403).json({
//         message: "Refresh token was expired. Please make a new signin request",
//       });
//     }

//     const user = await refreshToken.getUser();
    
//     await refreshToken.destroy(); 

//     const newAccessToken = jwt.sign({ id: user.id }, config.secret, {
//       algorithm: 'HS256',
//       allowInsecureKeySizes: true,
//       expiresIn: config.jwtExpiration,
//     });

//     const newRefreshToken = await db.refreshToken.createToken(user);

//     await sendLoginNotification(user.email, 'обновлении токенов');

//     return res.status(200).json({
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken, 
//     });

//   } catch (err) {
//     return res.status(500).send({ message: err.message });
//   }
// };
require('dotenv').config();

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

const nodemailer = require('nodemailer');

const AUTH_USER = process.env.AUTH_USER || "darabutkevich@gmail.com";
const AUTH_PASS = process.env.AUTH_PASS || "ywjk zsqy boxp cqhx ";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  // --- ИСПРАВЛЕНИЕ: ЯВНО УКАЗЫВАЕМ ПОРТ И TLS ДЛЯ RENDER ---
  host: 'smtp.gmail.com', // Явно указываем хост, если service: 'gmail' не сработает
  port: 587,              // Порт 587 (STARTTLS) часто работает лучше на облачных хостингах
  secure: false,          // Используем STARTTLS (не SSL)
  requireTLS: true,       // Требуем STARTTLS
  // ---------------------------------------------------------
  auth: {
    user: AUTH_USER,
    pass: AUTH_PASS 
  }
});

async function sendLoginNotification(email, action = 'вход в систему') {
    const mailOptions = {
        from: `"Lab 5 Notifier" <${AUTH_USER}>`, 
        to: email, 
        subject: `Уведомление о ${action}`,
        text: `Здравствуйте! Мы уведомляем вас о недавнем ${action} в вашу учетную запись ${email}.`,
        html: `<p>Здравствуйте!</p><p>Мы уведомляем вас о недавнем <b>${action}</b> в вашу учетную запись <b>${email}</b>.</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification sent to ${email} about ${action}.`);
    } catch (error) {
        console.error(`Error sending notification to ${email}:`, error);
        if (error.code === 'EAUTH') {
            console.error('ПОДСКАЗКА: Ошибка EAUTH. Проверьте, что вы используете Пароль Приложения (App Password) вместо обычного пароля Gmail!');
        }
    }
}

exports.signup = async (req, res) => {
  try {
      // --- 1. ПРОВЕРКА УНИКАЛЬНОСТИ (ДОБАВЛЕНО) ---
      const existingUser = await User.findOne({
          where: {
              [Op.or]: [
                  { username: req.body.username },
                  { email: req.body.email }
              ]
          }
      });

      if (existingUser) {
          let message = "Failed! ";
          if (existingUser.username === req.body.username) {
              message += "Username is already in use!";
          } else {
              message += "Email is already in use!";
          }
          return res.status(400).send({ message: message });
      }
      // --------------------------------------------

      // 2. Создаем пользователя
      const user = await User.create({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 8)
      });

      if (req.body.roles) {
          // 3. Находим роли
          const roles = await Role.findAll({
              where: {
                  name: {
                      [Op.or]: req.body.roles
                  }
              }
          });
          // 4. Устанавливаем роли
          await user.setRoles(roles);
      } else {
          // 4. Устанавливаем роль по умолчанию (ID=1)
          await user.setRoles([1]);
      }

      // 5. Отправляем ответ
      return res.send({ message: "User registered successfully!" });
  } catch (err) {
      // Обрабатываем ошибки
      return res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
      // 1. Ищем пользователя
      const user = await User.findOne({
          where: {
              username: req.body.username
          }
      });

      if (!user) {
          return res.status(404).send({ message: "User Not found." });
      }

      // 2. Проверяем пароль
      const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
      );

      if (!passwordIsValid) {
          return res.status(401).send({
              accessToken: null,
              message: "Invalid Password!"
          });
      }

      // 3. Генерируем Access Token
      const accessToken = jwt.sign({ id: user.id },
          config.secret,
          {
              algorithm: 'HS256',
              allowInsecureKeySizes: true,
              expiresIn: config.jwtExpiration, 
          });

      // 4. Генерируем Refresh Token
      const refreshToken = await db.refreshToken.createToken(user); 
      
      // 5. УВЕДОМЛЕНИЕ: Ждем отправки уведомления, прежде чем отправить ответ
      await sendLoginNotification(user.email, 'успешный вход в систему');

      // 6. Получаем роли
      const roles = await user.getRoles();
      var authorities = [];
      for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
      }

      // 7. Отправляем ответ
      return res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: accessToken,
          refreshToken: refreshToken
      });

  } catch (err) {
      return res.status(500).send({ message: err.message });
  }
};


exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await db.refreshToken.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    if (db.refreshToken.verifyExpiration(refreshToken)) {
      await refreshToken.destroy();
      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    const user = await refreshToken.getUser();
    
    await refreshToken.destroy(); 

    const newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: config.jwtExpiration,
    });

    const newRefreshToken = await db.refreshToken.createToken(user);

    await sendLoginNotification(user.email, 'обновлении токенов');

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, 
    });

  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};