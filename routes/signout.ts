import express from 'express'

const router = express.Router()
router.post('/', (req, res) => {
    res.clearCookie('token')
    res.status(204).json({ message: 'Sign out successfully' })
})

export default router
