import { Router } from 'express'
import { PrismaClient, RecipientType } from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.get('/getEmail/Emailsent/:id', async (req, res) => {
    type AttachmentInfo = {
        id: string
        emailID: string
        name: string
        size: number
        type: string
        path: string
    }
    type EmailInfo = {
        id: string
        senderId: string
        subject: string
        body: string
        draft: boolean
        createdAt: Date
        updatedAt: Date
        sentAt: String | null
        Attachment: AttachmentInfo[]
    }
    //Find account by id provided
    const Account = await prisma.account.findFirst({
        where: {
            id: req.params.id,
        },
        include: { sent: true },
    })
    //Check the account exists or not
    if (Account) {
        const ListEmail: EmailInfo[] = []

        // Get list of email id
        const existingEmailIds = Account?.sent.map((email) => email.id) || []
        existingEmailIds.forEach(async (emailID) => {
            //Find the email in email list
            const Email = await prisma.email.findFirst({
                where: {
                    id: emailID,
                },
                include: { Attachment: true },
            })
            if (Email) {
                // Get list of attachment id
                const ListAttachment: AttachmentInfo[] = []
                const existingAttachments =
                    Email?.Attachment.map((Attm) => Attm.id) || []
                // Find the attachment in attachment list
                existingAttachments.forEach(async (attId) => {
                    const Attachment = await prisma.attachment.findFirst({
                        where: {
                            id: attId,
                        },
                    })
                    if (Attachment) {
                        ListAttachment.push({
                            id: Attachment.id,
                            emailID: Attachment.emailId,
                            name: Attachment.name,
                            size: Attachment.size,
                            type: Attachment.type,
                            path: Attachment.path,
                        })
                    }
                })
                ListEmail.push({
                    id: Email.id,
                    senderId: Email.senderId,
                    subject: Email.subject,
                    body: Email.body,
                    draft: Email.draft,
                    createdAt: Email.createdAt,
                    updatedAt: Email.updateAt,
                    sentAt: Email.sentAt ? Email.sentAt.toISOString() : null,
                    Attachment: ListAttachment,
                })
            }
        })

        res.json({
            status: 200,
            message: 'get email successfully',
            data: ListEmail,
        })
    } else {
        res.json({
            status: 404,
            message: 'User not found',
        })
    }
})

router.get('/getEmail/recipcentEmail/:id', async (req, res) => {
    type AttachmentInfo = {
        id: string
        emailID: string
        name: string
        size: number
        type: string
        path: string
    }
    type EmailInfo = {
        id: string
        senderId: string
        subject: string
        body: string
        draft: boolean
        createdAt: Date
        updatedAt: Date
        sentAt: String | null
        Attachment: AttachmentInfo[]
    }
    //Find account by id provided
    const Account = await prisma.account.findFirst({
        where: {
            id: req.params.id,
        },
        include: { Recipient: true },
    })
    //Check the account exists or not
    if (Account) {
        const ListEmail: EmailInfo[] = []

        // Get list of email id
        const existingRecipientIds =
            Account?.Recipient.map((email) => email.recipientId) || []
        existingRecipientIds.forEach(async (emailID) => {
            //Find the Recipient  in Recipient  list
            const Recipient = await prisma.recipient.findFirst({
                where: {
                    recipientId: emailID,
                },
            })
            if (Recipient) {
                //Find the email in email list
                const Email = await prisma.email.findFirst({
                    where: {
                        id: Recipient.emailId,
                    },
                    include: { Attachment: true },
                })
                if (Email) {
                    // Get list of attachment id
                    const ListAttachment: AttachmentInfo[] = []
                    const existingAttachments =
                        Email?.Attachment.map((Attm) => Attm.id) || []
                    // Find the attachment in attachment list
                    existingAttachments.forEach(async (attId) => {
                        const Attachment = await prisma.attachment.findFirst({
                            where: {
                                id: attId,
                            },
                        })
                        if (Attachment) {
                            ListAttachment.push({
                                id: Attachment.id,
                                emailID: Attachment.emailId,
                                name: Attachment.name,
                                size: Attachment.size,
                                type: Attachment.type,
                                path: Attachment.path,
                            })
                        }
                    })
                    ListEmail.push({
                        id: Email.id,
                        senderId: Email.senderId,
                        subject: Email.subject,
                        body: Email.body,
                        draft: Email.draft,
                        createdAt: Email.createdAt,
                        updatedAt: Email.updateAt,
                        sentAt: Email.sentAt
                            ? Email.sentAt.toISOString()
                            : null,
                        Attachment: ListAttachment,
                    })
                }
            }
        })

        res.json({
            status: 200,
            message: 'get email successfully',
            data: ListEmail,
        })
    } else {
        res.json({
            status: 404,
            message: 'User not found',
        })
    }
})

router.post('/send', async (req, res) => {
    /**
    body request :
    {
        "SenderPhone" :@param {String} SenderMail,
        "Email" :{
            "senderId" @param {String} UserID,
            "subject" @param {String} Subject,
            "body" @param {String} body,
            "draft" @param {Boolean} draft,
            "createAt" @param {Date} createAt,
            "updateAt" @param {Date} updateAt,
            "sentAt" @param {Date} sentAt,
            "Recipient": [
                {
                    "recipient" : @param {String} recievePhone,
                    "type" :@param {String} type,
                }
            ],
            "Attachments": [
                {
                    name: @param {String} name,
                    size: @param {Number} size,
                    type: @param {String} type,
                    path : @param {String} path,
                }
            ]
        },
    }
    */
    const MailData = req.body
    //Verify that the user is exist
    const User = await prisma.account.findFirst({
        where: {
            phone: MailData.SenderPhone,
        },
        include: { sent: true },
    })
    if (User) {
        const Email = await prisma.email.create({
            data: {
                sender: { connect: { id: User.id } },
                subject: MailData.Email.subject,
                body: MailData.Email.body,
                draft: false,
                createdAt: MailData.Email.createdAt,
                updateAt: MailData.Email.updateAt,
                sentAt: MailData.Email.sentAt,
            },
        })
        //Add attachments
        interface AttachmentData {
            name: string
            size: number
            type: string
            path: string
        }

        const attachments: String[] = []
        MailData.Email.Attachments.forEach(async (attData: AttachmentData) => {
            // Verify that the email send is valid
            if (User) {
                const attachment = await prisma.attachment.create({
                    data: {
                        email: { connect: { id: Email.id } },
                        name: attData.name,
                        size: attData.size,
                        type: attData.type,
                        path: attData.path,
                    },
                })
                attachments.push(attachment.id)
            }
        })
        //Update Attachment in Email

        await prisma.email.update({
            where: {
                id: Email.id,
            },
            data: {
                Attachment: {
                    connect: attachments.map((id) => ({ id })),
                },
            },
        })

        //Update recipient in recievert
        interface RecipientElement {
            recipient: string
            type: string
        }

        MailData.Email.Recipient.forEach(async (Element: RecipientElement) => {
            const ReceiveAccount = await prisma.account.findFirst({
                where: {
                    phone: Element.recipient,
                },
                include: {
                    Recipient: true,
                },
            })
            if (ReceiveAccount) {
                //Create new recipient
                const newRecipient = await prisma.recipient.create({
                    data: {
                        email: { connect: { id: Email.id } },
                        recipient: { connect: { id: ReceiveAccount.id } },
                        type: EmailType(Element.type),
                        star: false,
                        deleted: false,
                    },
                })

                //Update reciever Recipients

                const existingRecipients =
                    ReceiveAccount?.Recipient.map((Rec) => Rec.recipientId) ||
                    []
                const updatedRecipientsIds = existingRecipients.concat(
                    newRecipient.recipientId
                )
                const updated = await prisma.account.update({
                    where: {
                        phone: Element.recipient,
                    },
                    data: {
                        Recipient: {
                            connect: updatedRecipientsIds.map((id) => ({ id })),
                        },
                    },
                })
            } else {
                res.json({
                    status: 404,
                    message: 'Receive user not found',
                })
            }
        })

        //UPDATE email in Account of sender
        const existingEmailIds = User?.sent.map((email) => email.id) || []
        const updatedEmailIds = existingEmailIds.concat(Email.id)
        await prisma.account.update({
            where: {
                phone: MailData.SenderPhone,
            },
            data: {
                sent: {
                    connect: updatedEmailIds.map((id) => ({ id })),
                },
            },
        })
    } else {
        res.json({
            status: 404,
            message: 'User not found',
        })
    }
})

function EmailType(type: String) {
    if (type == 'to') {
        return RecipientType.to
    } else if (type == 'cc') {
        return RecipientType.cc
    } else return RecipientType.bcc
}

export default router
