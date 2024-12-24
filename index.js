import express from 'express'
import cors from 'cors'
import getRouter from './routes/get.routes.js'
import postRouter from './routes/post.routes.js'
import putRouter from './routes/put.routes.js'
import deleteRouter from './routes/delete.routes.js'
import authRouter from './auth/auth.routes.js'
import userRouter from './users/user.routes.js'
const app = express()
const port = process.env.PORT

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/get', getRouter)
app.use('/post', postRouter)
app.use('/put', putRouter)
app.use('/delete', deleteRouter)
app.use('/authLogin', authRouter)
app.use('/users', userRouter)

app.get('/test', (req, res) => {
  res.send('Hello')
})
app.get('/reset', (req, res) => {
  res.send({ status: 'reset' })
  process.exit(0)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
