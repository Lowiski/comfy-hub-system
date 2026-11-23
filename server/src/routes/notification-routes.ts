import { Router } from 'express'
import * as notificationController from '../controllers/notification-controller'
import { requireAuth } from '../middlewares/auth-middleware'

const router = Router()

router.use(requireAuth)
router.get('/', notificationController.listNotifications)

export default router
