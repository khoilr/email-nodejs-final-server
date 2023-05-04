import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import express from 'express'
import { validationResult } from 'express-validator'
import jwt, { Secret } from 'jsonwebtoken'
import { validatePhoneNumber } from '../middleware/validations'

const prisma = new PrismaClient()

// handle login
const router = express.Router()
router.post('/', validatePhoneNumber, async (req, res) => {
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

export default router
