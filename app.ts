import express, { ErrorRequestHandler, Request, Response } from 'express'
import createHttpError from 'http-errors'
import path from 'path'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

app.route('/').get((req, res) => {
    res.send('Hello World')
})

// import route from routes/auth and use it
import authRoute from './routes/auth'
app.use('/auth', authRoute)

// error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.send('error')
})

app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000')
})