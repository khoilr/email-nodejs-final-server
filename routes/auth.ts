import express from 'express'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import bcrypt from 'bcrypt'
import { body, validationResult } from 'express-validator'
import jwt, { Secret } from 'jsonwebtoken'

import multer, { memoryStorage } from 'multer'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'

// // Initialize firebase app with your credential
// const firebaseApp = initializeApp({
//     apiKey: 'AIzaSyApy74WSSLZF-PQZvJrLwsImWoZMC7h0Bc',
//     authDomain: 'email-nodejs-final.firebaseapp.com',
//     projectId: 'email-nodejs-final',
//     storageBucket: 'email-nodejs-final.appspot.com',
//     messagingSenderId: '150154854268',
//     appId: '1:150154854268:web:448975ec0742c94222eef9',
//     measurementId: 'G-3LYP1BJ4PP',
// })

// Get a reference to the firebase storage service
const storage = getStorage()

// Create a multer instance with disk storage
const upload = multer({ storage: memoryStorage() })

const validatePhoneNumber = body('phone')
    // Phone number must exist
    .exists({ checkFalsy: true })
    .withMessage('Phone number is required')

    // Phone number must have 10 characters
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must have 10 characters')

    // Phone number must begin with 0
    .matches(/^0/)
    .withMessage('Phone number must begin with 0')

const router = express.Router()

const saltRounds = 10

// handle get account
router.get('/', (req, res) => {})

// handle registry account
router.post('/', validatePhoneNumber, (req, res) => {
    // Validate request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // Return a bad request status with the errors
        return res.status(400).json({ errors: errors.array() })
    }

    // get phone number, password, name from request body
    const { phone, password, name } = req.body

    // hash password
    bcrypt.hash(password, saltRounds, async function (err, hash) {
        // Store hash in your password DB.
        try {
            const account = await prisma.account.create({
                data: {
                    phone: phone,
                    password: hash,
                    name: name,
                },
            })
            res.status(201).json(account)
        } catch (error: any) {
            if (error.code === 'P2002')
                res.status(409).json({
                    message: 'Phone number already exists',
                })
        }
    })
})

// handle login
router.post('/login', validatePhoneNumber, async (req, res) => {
    // Validate request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // Return a bad request status with the errors
        res.status(404).json({ message: 'Account not found' })
        return
    }

    // get phone number, password from request body
    const { phone, password } = req.body

    // find account by phone number
    const account = await prisma.account
        .findUnique({
            where: {
                phone: phone,
            },

            // select password field
            select: {
                id: true,
                password: true,
            },
        })
        .catch((error) => {
            res.status(404).json({ message: 'Account not found' })
            return
        })

    if (!account) {
        res.status(404).json({ message: 'Account not found' })
        return
    } else {
        // compare password
        bcrypt.compare(password, account.password, function (err, result) {
            result
                ? jwt.sign(
                      { id: account.id },
                      process.env.JWT_SECRET as Secret,
                      { expiresIn: '30 days' },
                      (err, token) => {
                          if (!err)
                              res.header('Authorization', `Bearer ${token}`)
                                  .status(200)
                                  .json({
                                      message: 'Login successfully',
                                  })
                          else console.log(err.stack)
                      }
                  )
                : res.status(401).json({ message: 'Wrong password' })
        })
    }
})

// handle logout
router.post('/logout', (req, res) => {
    res.header('Authorization', '')
        .status(404)
        .json({ message: 'Logout successfully' })
})

// handle forgot password, user submit form with phone number
router.post('/forgot-password', (req, res) => {
    res.send('forgot password')
})

// handle reset password, user submit form that reset password with token sent from forgot password
router.patch('/reset-password', (req, res) => {
    res.send('reset password')
})

// handle update account, user submit form that update account
router.patch('/', upload.single('image'), async (req, res) => {
    const file = req.file

    console.log(file?.originalname)

    const { phone, password, name } = req.body

    if (file) {
        // concat current timestamp to file name
        const fileName = `${Date.now()}-${file.originalname}`
        const fileRef = ref(storage, 'images/' + fileName)
        const snapshot = await uploadBytes(fileRef, file.buffer, {
            contentType: file.mimetype,
        })
        const url = await getDownloadURL(snapshot.ref)
    }

    res.send('hihi')
})

// handle delete account
router.delete('/', (req, res) => {
    // res.send('delete account')
})

export default router
