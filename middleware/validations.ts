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

    // Phone number must be numeric
    .isNumeric()
    .withMessage('Phone number must be numeric')

const validatePassword = body('password')
    // Password must exist
    .exists({ checkFalsy: true })
    .withMessage('Password is required')

    // Password must have at least 6 characters
    .isLength({ min: 6 })
    .withMessage('Password must have at least 6 characters')

const validateNewPassword = body('newPassword')
    // Password must exist
    .exists({ checkFalsy: true })
    .withMessage('Password is required')

    // Password must have at least 6 characters
    .isLength({ min: 6 })
    .withMessage('Password must have at least 6 characters')

export { validatePhoneNumber, validatePassword, validateNewPassword }
