import { Router } from 'express'
import { PrismaClient, RecipientType } from '@prisma/client'
import jwt, { Secret } from 'jsonwebtoken'

const prisma = new PrismaClient()
const router = Router()

router.patch('/', async (req, res) => {
    const token = req.cookies.token

    const { starred, emailId } = req.body

    jwt.verify(
        token,
        process.env.JWT_SECRET as Secret,
        async (err: any, decoded: any) => {
            const id = (decoded as any).id
            const emails = await prisma.recipient.updateMany({
                where: {
                    emailId: emailId,
                    recipientId: id,
                },
                data: {
                    star: starred,
                },
            })

            res.status(200).json(emails)
        }
    )
})

export default router
