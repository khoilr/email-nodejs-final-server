import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import express from 'express'
import jwt, { Secret } from 'jsonwebtoken'

const prisma = new PrismaClient()
const router = express.Router()

router
    .route('/')
    .post((req, res) => {
        // get user phone and create a token to let user reset password
        const { phone } = req.body

        // find account by phone number
        prisma.account
            .findUnique({
                where: {
                    phone: phone,
                },

                select: {
                    id: true,
                },
            })
            .then((account) => {
                // create a token with account id
                const token = jwt.sign(
                    { id: account?.id },
                    process.env.JWT_SECRET as Secret,
                    { expiresIn: '1 day' }
                )

                // async..await is not allowed in global scope, must use a wrapper
                res.status(200).json({ message: 'Reset password token sent' })
            })
            .catch((error) => {
                res.status(404).json({ message: 'Account not found' })
            })
    })
    .patch((req, res) => {
        // get token and new password from request body
        const { token, password } = req.body

        // verify token
        jwt.verify(
            token,
            process.env.JWT_SECRET as Secret,

            async (err: any, decoded: any) => {
                if (err) {
                    res.status(401).json({ message: 'Invalid token' })
                    return
                }

                // hash password
                bcrypt.hash(
                    password,
                    Number(process.env.SALT_ROUND),
                    async function (err, hash) {
                        // Store hash in your password DB.
                        try {
                            const account = await prisma.account.update({
                                where: {
                                    id: decoded.id,
                                },
                                data: {
                                    password: hash,
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
            }
        )
    })

export default router
