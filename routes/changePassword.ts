import express from 'express'
import { Account, PrismaClient } from '@prisma/client'
import jwt, { Secret, VerifyErrors } from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validateNewPassword } from '../middleware/validations'
import { validationResult } from 'express-validator'

const router = express.Router()
const prisma = new PrismaClient()

router.patch('/', validateNewPassword, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: errors.array()[0].msg,
        })
        return
    }

    const token = req.cookies.token
    const { oldPassword, newPassword } = req.body

    if (token) {
        jwt.verify(
            token,
            process.env.JWT_SECRET as Secret,
            async (err: VerifyErrors | null, decoded: any) => {
                const account = await prisma.account.findUnique({
                    where: {
                        id: decoded.id,
                    },
                })

                if (account) {
                    bcrypt.compare(
                        oldPassword,
                        account.password,
                        async (err, result) => {
                            if (result) {
                                const hash = await bcrypt.hash(newPassword, 10)
                                await prisma.account.update({
                                    where: {
                                        id: decoded.id,
                                    },
                                    data: {
                                        password: hash,
                                    },
                                })
                                res.sendStatus(202)
                            } else {
                                res.sendStatus(401)
                            }
                        }
                    )
                }
            }
        )
    }
})

export default router
