import { Router } from 'express'
import * as appointmentController from '../controllers/appointment-controller'
import { requireAuth } from '../middlewares/auth-middleware'
import { validateSchema } from '../middlewares/schema-middleware'
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../schema/appointment-schema'

const router = Router()

router.use(requireAuth)

router.get('/counselors', appointmentController.listCounselors)
router.get('/overview', appointmentController.overview)
router.get('/', appointmentController.listAppointments)
router.post(
  '/',
  validateSchema(createAppointmentSchema),
  appointmentController.createAppointment,
)
router.patch(
  '/:id',
  validateSchema(updateAppointmentSchema),
  appointmentController.updateAppointment,
)
router.delete('/:id', appointmentController.deleteAppointment)

export default router
