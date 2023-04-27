import express, { ErrorRequestHandler, Request, Response } from 'express'
import path from 'path'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import session from 'express-session'
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getStorage, ref } from 'firebase/storage'
import { getAnalytics, isSupported } from 'firebase/analytics'

require('dotenv').config()

const app = express()

// Configure session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET ?? 'khoicute',
        resave: false, // avoid saving session if unmodified
        saveUninitialized: false, // avoid creating session until something stored
    })
)

// middleware
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())

// Initialize Firebase
const firebaseConfig = {
    apiKey: 'AIzaSyApy74WSSLZF-PQZvJrLwsImWoZMC7h0Bc',
    authDomain: 'email-nodejs-final.firebaseapp.com',
    projectId: 'email-nodejs-final',
    storageBucket: 'email-nodejs-final.appspot.com',
    messagingSenderId: '150154854268',
    appId: '1:150154854268:web:448975ec0742c94222eef9',
    measurementId: 'G-3LYP1BJ4PP',
}
const firebaseApp = initializeApp(firebaseConfig)

// Firebase analytics
isSupported().then((isSupported) => {
    if (isSupported) {
        const analytics = getAnalytics(firebaseApp)
    }
})

// routes
import authRoute from './routes/auth'
import messageRoute from './routes/message'
app.use('/auth', authRoute)
app.use('/message', messageRoute)

// error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.send('error')
})

const server = app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000')
})
