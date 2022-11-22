const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const { body } = require('express-validator');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const privateKey = fs.readFileSync('./private.key');
const publicKey = fs.readFileSync('./public.key');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: String,
  password: String,
});

function authorizationRouter(connection) {
  const User = connection.model('User', UserSchema);
  const router = express.Router();

  /**
   * Авторизация
   * @param {String} username
   * @param {String} password
   */
  router.post('/login', body('email').isEmail(), body('password').isLength({ min: 5 }), async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username }, privateKey, { algorithm: 'RS256' });
      res.json({ jwt: token });
    } else {
      res.status(401);
      res.end();
    }
  });

  /**
   * Регистрация
   * @param {String} username
   * @param {String} password
   */
  router.post('/register', body('email').isEmail(), body('password').isLength({ min: 5 }), async (req, res) => {
    const { username, password } = req.body;
    // без проверки уникальности юзернейма
    const user = new User({ username, password: await bcrypt.hash(password, saltRounds) });
    await user.save();
    const token = jwt.sign({ username }, privateKey, { algorithm: 'RS256' });
    res.json({ jwt: token });
  });
  router.get('/', async (req, res) => { res.end(':)'); });
  return router;
}

function authorizationMiddleware(req, res, next) {
  const token = req.body?.token || req.query?.token;
  let username;
  try {
    username = jwt.verify(token, publicKey, { algorithm: 'RS256' })?.username;
  } catch (err) {
    res.status(401);
    res.json({error: true});
    return;
  }
  if (token && username) {
    res.locals.username = username;
    next();
  } else {
    res.status(401);
    res.json({error: true});
  }
}
module.exports = { authorizationRouter, authorizationMiddleware };