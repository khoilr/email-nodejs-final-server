import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.route('/').get((req, res) => {
    const { accountId } = req.body

    // get all labels of this account 
    prisma.label.findMany({
        where: {
            accountId: accountId
        }
    }).then(labels => {
        res.status(200).json(labels)
    }
    
})
