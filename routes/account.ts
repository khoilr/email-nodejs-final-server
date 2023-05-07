import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import express from 'express'
import { validationResult } from 'express-validator'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import jwt, { Secret, VerifyErrors } from 'jsonwebtoken'
import multer, { memoryStorage } from 'multer'
import {
    validatePassword,
    validatePhoneNumber,
} from '../middleware/validations'

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
    .get((req, res) => {
        const bearerToken = req.headers.authorization
        if (bearerToken === undefined) {
            res.sendStatus(401)
            return
        }
        const token = bearerToken?.split(' ')[1]

        token
            ? jwt.verify(
                  token,
                  process.env.JWT_SECRET as Secret,
                  async (err: any, decoded: any) => {
                      if (err) {
                          res.sendStatus(403)
                          return
                      }

                      const account = await prisma.account.findUnique({
                          where: {
                              id: (decoded as any).id,
                          },
                          select: {
                              id: true,
                              phone: true,
                              name: true,
                              avatar: true,
                          },
                      })

                      if (account === null) {
                          res.sendStatus(404)
                          return
                      }

                      res.status(200).json(account)
                  }
              )
            : res.sendStatus(401)
    })
    .post(validatePhoneNumber, validatePassword, (req, res) => {
        // Validate request body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            // Return a bad request status with the errors
            return res.status(400).json({
                message: errors.array()[0].msg,
            })
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
                            message: 'Phone number or email already exists',
                        })
                }
            }
        )
    })
    .patch(validatePhoneNumber, async (req, res) => {
        const token = req.cookies.token
        const { id, phone, name, avatar } = req.body
        console.log(avatar)

        jwt.verify(
            token,
            process.env.JWT_SECRET as Secret,
            async (err: VerifyErrors | null, decoded: any) => {
                if (err) {
                    res.sendStatus(401)
                    return
                }
                const id = (decoded as any).id
                const account = await prisma.account.update({
                    where: {
                        id: id,
                    },
                    data: {
                        phone: phone,
                        name: name,
                        ...(avatar && {
                            avatar: avatar.file.url,
                        }),
                    },
                })
                res.status(202).json(account)
            }
        )
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

export default router
