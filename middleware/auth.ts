import { Request, Response, NextFunction } from 'express'
import jwt, { Secret } from 'jsonwebtoken'

const isAuthorization = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' })
        return
    } else {
        jwt.verify(token, process.env.JWT_SECRET as Secret, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: 'Unauthorized' })
                return
            } else {
                req.body.id = decoded
            }
        })
    }

    next()
}

export { isAuthorization }
