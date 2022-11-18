const { authorizationRouter, authorizationMiddleware } = require('./authorization')
const mongoose = require('mongoose');
const express = require('express')
const { body } = require('express-validator');
const cors = require('cors')

const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    creator: String,
    text: String,
})
function app(connection) {
    const Todo = connection.model('Todo', TodoSchema);

    const app = express()
    app.use(cors({ origin: '*' }))
    app.use(express.json());
    app.use('/user', authorizationRouter(connection))
    /**
     * Middleware для проверки jwt токена
     */
    app.use('/todo', authorizationMiddleware)
    /**
     * Получение списка задач
     * @param {number} [page]
     */
    app.get('/todo', async (req, res) => {
        const { page } = req.query
        let pagination = {}
        if (page) {
            body(page).isNumeric()
            pagination = { skip: (page - 1) * 10, limit: 10 }
        }
        res.json({ todos: await Todo.find(null, null, pagination) })
    })
    /**
     * Добавление задачи
     * @param {String} text
     */
    app.post('/todo', body('text').isString(), async (req, res) => {
        const todo = new Todo({ creator: res.locals.username, text: req.body.text })
        await todo.save()
        res.json({})
    })
    /**
     * Редактирование существующей задачи
     * @param {String} _id 
     * @param {String} text
     */
    app.put('/todo', body('_id').isString(), body('text').isString(), async (req, res) => {
        await Todo.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.body._id) }, { text: req.body.text })
        res.json({})
    })
    /**
     * Удаление существующей задачи
     * @param {String} _id
     */
    app.delete('/todo', body('_id').isString(), async (req, res) => {
        await Todo.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.body._id) })
        res.json({})
    })
    app.get('/', async (req, res) => { res.end(':)') })

    return app
}
module.exports = app