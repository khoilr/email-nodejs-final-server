import { Router } from 'express'

const router = Router()

// handle get account
router.get('/', (req, res) => {
    res.send('get account')
})

// handle registry account
router.post('/register', (req, res) => {
    res.send('register')
})

// handle login
router.post('/login', (req, res) => {
    res.send('login')
})

// handle logout
router.post('/logout', (req, res) => {
    res.send('logout')
})

// handle forgot password, user submit form with phone number
router.post('/forgot-password', (req, res) => {
    res.send('forgot password')
})

// handle reset password, user submit form that reset password with token sent from forgot password
router.patch('/reset-password', (req, res) => {
    res.send('reset password')
})

// handle update account, user submit form that update account
router.patch('/update-account', (req, res) => {
    res.send('update account')
})

// handle delete account
router.delete('/delete-account', (req, res) => {
    res.send('delete account')
})

export default router
