import { body } from 'express-validator'

const validatePhoneNumber = body('phone')
    // Phone number must exist
    .exists({ checkFalsy: true })
    .withMessage('Phone number is required')

    // Phone number must have 10 characters
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must have 10 characters')

    // Phone number must begin with 0
    .matches(/^0/)
    .withMessage('Phone number must begin with 0')

export { validatePhoneNumber }
