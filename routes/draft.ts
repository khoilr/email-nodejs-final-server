import express from 'express'
import { Account, PrismaClient } from '@prisma/client'
import jwt, { Secret, VerifyErrors } from 'jsonwebtoken'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/', async (req, res) => {
    const token = req.cookies.token
    let { emailId, subject, sendTo, body, cc, bcc } = req.body

    let sendTos: any = []
    if (sendTo !== undefined) {
        sendTos = await prisma.account.findMany({
            where: {
                phone: {
                    in: sendTo,
                },
            },
        })
    }

    let ccs: any = []
    if (cc !== undefined) {
        ccs = await prisma.account.findMany({
            where: {
                phone: {
                    in: cc,
                },
            },
        })
    }

    let bccs: any = []
    if (bcc !== undefined) {
        bccs = await prisma.account.findMany({
            where: {
                phone: {
                    in: bcc,
                },
            },
        })
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET as Secret,
        async (err: VerifyErrors | null, decoded: any) => {
            if (err) {
                res.sendStatus(401)
                return
            }
            const senderId = (decoded as any).id

            const email = await prisma.email.upsert({
                where: {
                    id: emailId ? emailId : '0',
                },
                create: {
                    sender: {
                        connect: {
                            id: senderId,
                        },
                    },
                    subject: subject,
                    body: body,
                    draft: true,
                    ...(sendTos.length != 0 && {
                        SendTo: {
                            connect: sendTos?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                    ...(ccs.length != 0 && {
                        CC: {
                            connect: ccs?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                    ...(bccs.length != 0 && {
                        BCC: {
                            connect: bccs?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                },
                update: {
                    sender: {
                        connect: {
                            id: senderId,
                        },
                    },
                    subject: subject,
                    body: body,
                    ...(sendTos.length != 0 && {
                        SendTo: {
                            connect: sendTos?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                    ...(ccs.length != 0 && {
                        CC: {
                            connect: ccs?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                    ...(bccs.length != 0 && {
                        BCC: {
                            connect: bccs?.map((account: Account) => {
                                return { id: account.id }
                            }),
                        },
                    }),
                },
            })
            res.status(200).json(email)
        }
    )
})

router.get('/', async (req, res) => {
    const token = req.cookies.token
    console.log(token)
    jwt.verify(
        token,
        process.env.JWT_SECRET as Secret,
        async (err: VerifyErrors | null, decoded: any) => {
            if (err) {
                res.sendStatus(401)
                return
            }
            const senderId = (decoded as any).id
            const emails = await prisma.email.findMany({
                where: {
                    senderId: senderId,
                    draft: true,
                },
                include: {
                    SendTo: true,
                    CC: true,
                    BCC: true,
                    sender: true,
                },
            })
            res.status(200).json(emails)
        }
    )
})

export default router
