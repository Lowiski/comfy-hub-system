import { Router } from 'express'
import * as adminController from '../controllers/admin-controller'
import { requireAuth } from '../middlewares/auth-middleware'
import { bulkImportRateLimit } from '../middlewares/rate-limit-middleware'
import { requireRole } from '../middlewares/role-validator-middleware'
import { validateSchema } from '../middlewares/schema-middleware'
import { adminAccountSchema, adminBulkAccountSchema } from '../schema/admin-schema'

const router = Router()

router.use(requireAuth, requireRole('admin'))

router.get('/accounts', adminController.listAccounts)
router.post('/accounts/bulk', bulkImportRateLimit, validateSchema(adminBulkAccountSchema), adminController.bulkCreateAccounts)
router.post('/accounts', validateSchema(adminAccountSchema), adminController.createAccount)
router.patch('/accounts/:id', validateSchema(adminAccountSchema), adminController.updateAccount)
router.delete('/accounts/:id', adminController.deleteAccount)

export default router
