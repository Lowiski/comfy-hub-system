import { Router } from 'express'
import * as authController from '../controllers/auth-controller'
import { requireAuth } from '../middlewares/auth-middleware'
import {
  accountRecoveryRateLimit,
  loginRateLimit,
  refreshRateLimit,
} from '../middlewares/rate-limit-middleware'
import { requireRole } from '../middlewares/role-validator-middleware'
import { validateSchema } from '../middlewares/schema-middleware'
import {
  birthdaySchema,
  loginSchema,
  profileSchema,
  resetPasswordSchema,
  schoolIdSchema,
  signupSchema,
} from '../schema/auth-schema'

const router = Router()

router.get('/csrf', authController.csrf)
router.post('/login', loginRateLimit, validateSchema(loginSchema), authController.login)
router.post('/lookup-school-id', accountRecoveryRateLimit, validateSchema(schoolIdSchema), authController.lookupSchoolId)
router.post('/verify-birthday', accountRecoveryRateLimit, validateSchema(birthdaySchema), authController.verifyBirthday)
router.post('/reset-password', accountRecoveryRateLimit, validateSchema(resetPasswordSchema), authController.resetPassword)
router.post('/refresh', refreshRateLimit, authController.refresh)
router.post('/logout', authController.logout)

router.get('/session', requireAuth, authController.session)
router.patch('/profile', requireAuth, validateSchema(profileSchema), authController.updateProfile)
router.post(
  '/signup',
  requireAuth,
  requireRole('admin'),
  validateSchema(signupSchema),
  authController.signup,
)

export default router
