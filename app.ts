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
app.use(cors({ origin: true, credentials: true }))

// Initialize Firebase
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY ?? '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.FIREBASE_APP_ID ?? '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? '',
}
const firebaseApp = initializeApp(firebaseConfig)

// Firebase analytics
isSupported().then((isSupported) => {
    if (isSupported) {
        const analytics = getAnalytics(firebaseApp)
    }
})

// routes
import accountRoute from './routes/account'
import messageRoute from './routes/message'
import signinRoute from './routes/signin'
import signoutRoute from './routes/signout'
import uploadRoute from './routes/upload'
import draftRoute from './routes/draft'
import changePasswordRoute from './routes/changePassword'
import forgotPasswordRoute from './routes/forgotPassword'
import emailRoute from './routes/email'
import recipientRoute from './routes/recipient'
app.use('/account', accountRoute)
app.use('/message', messageRoute)
app.use('/signin', signinRoute)
app.use('/signout', signoutRoute)
app.use('/upload', uploadRoute)
app.use('/draft', draftRoute)
app.use('/change-password', changePasswordRoute)
app.use('/forgot-password', forgotPasswordRoute)
app.use('/email', emailRoute)
app.use('/recipient', recipientRoute)

// // import route from routes/auth and use it
// import sendEmail from './routes/email'
// app.use('/send', sendEmail)

// error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.send('error')
})

const server = app.listen(3300, () => {
    console.log('Server is running at http://localhost:3300')
})
