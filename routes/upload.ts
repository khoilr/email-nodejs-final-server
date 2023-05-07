import express from 'express'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import multer, { memoryStorage } from 'multer'

const router = express.Router()
const upload = multer({ storage: memoryStorage() })
const storage = getStorage()

router.post('/', upload.single('file'), async (req, res) => {
    const file = req.file as Express.Multer.File
    if (file) {
        // const urls: String[] = await Promise.all(
        //     files.map(async (file): Promise<string> => {
        const fileName = `${Date.now()}-${file.originalname}`
        const fileRef = ref(storage, fileName)
        const snapshot = await uploadBytes(fileRef, file.buffer, {
            contentType: file.mimetype,
        })
        const url = await getDownloadURL(snapshot.ref)

        res.status(200).json({ url })
    }
})

export default router
