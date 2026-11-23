import { Router } from 'express'
import { env, isDatabaseConfigured } from '../config/env'
import { ok, sendResult } from '../utils/api-result'
import * as appointmentController from '../controllers/appointment-controller'
import adminRoutes from './admin-routes'
import appointmentRoutes from './appointment-routes'
import authRoutes from './auth-routes'
import messageRoutes from './message-routes'
import notificationRoutes from './notification-routes'

const router = Router()

router.get('/health', (_req, res) => {
  sendResult(res, ok({
    ok: true,
    database: isDatabaseConfigured ? 'neon' : 'memory',
    environment: env.NODE_ENV,
  }))
})

router.get('/public/counselors', appointmentController.listPublicCounselors)

router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/messages', messageRoutes)
router.use('/notifications', notificationRoutes)
router.use('/appointments', appointmentRoutes)

export default router
