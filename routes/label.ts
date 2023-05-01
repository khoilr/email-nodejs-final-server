import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router
    .route('/')
    .get((req, res) => {
        const { accountId } = req.body

        // get all labels of this account
        prisma.label
            .findMany({
                where: {
                    accountId: accountId,
                },
            })
            .then((labels) => {
                res.status(200).json(labels)
            })
    })
    .post((req, res) => {
        const { accountId, name, color } = req.body

        // create new label
        prisma.label
            .create({
                data: {
                    name: name,
                    color: color,
                    account: {
                        connect: {
                            id: accountId,
                        },
                    },
                },

                // select id, name, color field
                select: {
                    name: true,
                    color: true,
                },
            })
            .then((label) => {
                res.status(201).json(label)
            })
    })
    .put((req, res) => {
        const { id, name, color } = req.body

        // update label
        prisma.label
            .update({
                where: {
                    id: id,
                },
                data: {
                    name: name,
                    color: color,
                },

                // select id, name, color field
                select: {
                    name: true,
                    color: true,
                },
            })
            .then((label) => {
                res.status(202).json(label)
            })
    })
    .delete((req, res) => {
        const { id } = req.body

        // delete label
        prisma.label
            .delete({
                where: {
                    id: id,
                },
            })
            .then((label) => {
                res.status(204).json(label)
            })
    })
