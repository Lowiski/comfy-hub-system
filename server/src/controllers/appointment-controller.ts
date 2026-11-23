import type { Request, Response } from 'express'
import type { User } from '../db/schema'
import * as appointmentService from '../services/appointments'
import type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../schema/appointment-schema'
import { fail, sendResult } from '../utils/api-result'

const viewer = (res: Response) => res.locals.user as User
const input = <T>(res: Response): T => res.locals.validated as T
const param = (req: Request, name: string) => String(req.params[name] ?? '')

export async function listAppointments(_req: Request, res: Response) {
  sendResult(res, await appointmentService.listAppointmentsService(viewer(res)))
}

export async function listCounselors(_req: Request, res: Response) {
  sendResult(res, await appointmentService.listCounselorsService())
}

export async function listPublicCounselors(_req: Request, res: Response) {
  const result = await appointmentService.listCounselorsService()
  if (result.success) {
    sendResult(res, {
      ...result,
      data: {
        counselors: result.data.counselors.map((item) => ({
          id: item.id,
          name: item.name,
          schoolId: item.schoolId,
          department: item.department,
        })),
      },
    })
    return
  }
  sendResult(res, result)
}

export async function overview(_req: Request, res: Response) {
  sendResult(res, await appointmentService.overviewService())
}

export async function createAppointment(_req: Request, res: Response) {
  sendResult(res, await appointmentService.createAppointmentService(
    viewer(res),
    input<CreateAppointmentInput>(res),
  ))
}

export async function updateAppointment(req: Request, res: Response) {
  const id = param(req, 'id')
  if (!id) {
    sendResult(res, fail('VALIDATION_ERROR', 'Appointment ID is required.', 400))
    return
  }
  sendResult(res, await appointmentService.updateAppointmentService(
    viewer(res),
    id,
    input<UpdateAppointmentInput>(res),
  ))
}

export async function deleteAppointment(req: Request, res: Response) {
  const id = param(req, 'id')
  if (!id) {
    sendResult(res, fail('VALIDATION_ERROR', 'Appointment ID is required.', 400))
    return
  }
  sendResult(res, await appointmentService.deleteAppointmentService(viewer(res), id))
}
