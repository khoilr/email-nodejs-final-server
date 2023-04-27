import { Router } from 'express'
import { isAuthorization } from '../middleware/auth'

const router = Router()

// handle get messages sent to account
router.get('/', isAuthorization, (req, res) => {
    res.send('get messages')
})

// handle send message
router.post('/send', (req, res) => {
    res.send('send message')
})

// handle delete message
router.delete('/delete', (req, res) => {
    res.send('delete message')
})

export default router
