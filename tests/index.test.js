const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const createApp = require('../src/app');

describe('Overall', () => {
  let app, conn, token;
  beforeAll(() => {
    conn = mongoose.createConnection(process.env.mongourl || 'mongodb://root:example@127.0.0.1/');
    app = createApp(conn);
    const promise = new Promise((resolve) => {
      conn.once('open', async () => {
        const collections = await conn.db.collections();

        for (let collection of collections) {
          await collection.remove();
        }
        resolve();
      });
    });

    return promise;
  });
  test('Unsuccesful login', () => {
    return request(app).post('/user/login').send({ username: 'fake@gank.tk', password: 'notrealpassword' }).expect(401);
  });
  test('Registration', async () => {
    const res = await request(app).post('/user/register').send({ username: 'real@gank.tk', password: 'realpassword' }).expect(200);
    expect(jwt.decode(res.body.jwt).username).toBe('real@gank.tk');

  });
  test('Authorization', async () => {
    const res = await request(app).post('/user/login').send({ username: 'real@gank.tk', password: 'realpassword' }).expect(200);
    expect(jwt.decode(res.body.jwt).username).toBe('real@gank.tk');
    token = res.body.jwt;
  });
  test('Acessing todo without jwt token', async () => {
    const res = await request(app).get('/todo').expect(401);
  });
  test('Acessing todo with jwt token', async () => {
    const res = await request(app).get('/todo').query({ token }).expect(200);

  });
  test('Todo should return empty list', async () => {
    const res = await request(app).get('/todo').query({ token }).expect(200);
    expect(res.body.todos).toHaveLength(0);
  });
  test('Create a todo task and retreiving list', async () => {
    await request(app).post('/todo').send({ token, text: 'wash hands after toilet' }).expect(200);
    const res = await request(app).get('/todo').query({ token }).expect(200);
    expect(res.body.todos).toHaveLength(1);
    expect(res.body.todos[0].creator).toBe('real@gank.tk');
    expect(res.body.todos[0]._id).toBeDefined();
  });
  test('Edit todo task', async () => {
    const text = 'Wash your hand after you come home';
    const todos = await request(app).get('/todo').query({ token, }).expect(200);
    await request(app).put('/todo').send({ _id: todos.body.todos[0]._id, token, text }).expect(200);
    const res = await request(app).get('/todo').query({ token }).expect(200);
    expect(res.body.todos).toHaveLength(1);
    expect(res.body.todos[0].text).toBe(text);
  });
  test('Delete todo task', async () => {
    const todos = await request(app).get('/todo').query({ token }).expect(200);
    await request(app).delete('/todo').send({ _id: todos.body.todos[0]._id, token }).expect(200);
    const res = await request(app).get('/todo').query({ token }).expect(200);
    expect(res.body.todos).toHaveLength(0);
  });
  test('Create a lot of todo tasks and use pagination to get 10 of them', async () => {
    for (let i = 1; i <= 15; i++) {
      await request(app).post('/todo').send({ token, text: 'wash hands after toilet #' + i }).expect(200);
    }
    const res = await request(app).get('/todo').query({ token, page: 1 }).expect(200);
    expect(res.body.todos).toHaveLength(10);
  });
  afterAll(() => {
    conn.close();
  });
});