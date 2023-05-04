import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import express from 'express'
import { validationResult } from 'express-validator'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import jwt, { Secret } from 'jsonwebtoken'
import multer, { memoryStorage } from 'multer'
import { validatePhoneNumber } from '../middleware/validations'

// Prisma ORM
const prisma = new PrismaClient()

// Get a reference to the firebase storage service
const storage = getStorage()

// Create a multer instance with disk storage
const upload = multer({ storage: memoryStorage() })

// router
const router = express.Router()
router
    .route('/')
    .get((req, res) => {})
    .post(validatePhoneNumber, (req, res) => {
        // Validate request body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // Return a bad request status with the errors
            return res.status(400).json({ errors: errors.array() })
        }

        // get phone number, password, name from request body
        const { phone, password, name } = req.body

        // hash password
        bcrypt.hash(
            password,
            Number(process.env.SALT_ROUNDS),
            async function (err, hash) {
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
            }
        )
    })
    .patch(upload.single('image'), async (req, res) => {
        const file = req.file

        console.log(file?.originalname)

        const { id, phone, password, name } = req.body

        if (file) {
            // concat current timestamp to file name
            const fileName = `${Date.now()}-${file.originalname}`
            const fileRef = ref(storage, 'images/' + fileName)
            const snapshot = await uploadBytes(fileRef, file.buffer, {
                contentType: file.mimetype,
            })
            const url = await getDownloadURL(snapshot.ref)

            if (password) {
                // hash password and update
                bcrypt.hash(
                    password,
                    Number(process.env.SALT_ROUNDS),
                    async function (err, hash) {
                        // Store hash in your password DB.
                        try {
                            const account = await prisma.account.update({
                                where: {
                                    id: id,
                                },
                                data: {
                                    phone: phone,
                                    password: hash,
                                    name: name,
                                    avatar: url,
                                },
                            })
                            res.status(202).json(account)
                        } catch (error: any) {
                            if (error.code === 'P2002')
                                res.status(409).json({
                                    message: 'Phone number already exists',
                                })
                        }
                    }
                )
            } else {
                const account = await prisma.account.update({
                    where: {
                        id: id,
                    },
                    data: {
                        phone: phone,
                        name: name,
                        avatar: url,
                    },
                })
                res.status(202).json(account)
            }
        }
    })
    .delete((req, res) => {
        const userId = req.body.id

        prisma.account
            .delete({
                where: {
                    id: userId,
                },
            })
            .then((account) => {
                res.status(204).json(account)
            })
            .catch((error) => {
                res.status(404).json({ message: 'Account not found' })
            })
    })

// TODO: implement this feature
// handle forgot password, user submit form with phone number

export default router
