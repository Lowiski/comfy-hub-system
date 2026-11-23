import { Router } from 'express'
import * as messageController from '../controllers/message-controller'
import { requireAuth } from '../middlewares/auth-middleware'
import { messageRateLimit } from '../middlewares/rate-limit-middleware'
import { validateSchema } from '../middlewares/schema-middleware'
import {
  createConversationSchema,
  editMessageSchema,
  messagesQuerySchema,
  sendMessageSchema,
} from '../schema/message-schema'

const router = Router()

router.use(requireAuth)

router.get('/people', messageController.listPeople)
router.get('/conversations', messageController.listConversations)
router.post(
  '/conversations',
  messageRateLimit,
  validateSchema(createConversationSchema),
  messageController.createConversation,
)
router.get(
  '/conversations/:id/messages',
  validateSchema(messagesQuerySchema, 'query'),
  messageController.listMessages,
)
router.post(
  '/conversations/:id/messages',
  messageRateLimit,
  validateSchema(sendMessageSchema),
  messageController.sendMessage,
)
router.patch(
  '/conversations/:id/messages/:messageId',
  validateSchema(editMessageSchema),
  messageController.editMessage,
)
router.delete(
  '/conversations/:id/messages/:messageId',
  messageController.deleteMessage,
)
router.post('/conversations/:id/read', messageController.markRead)
router.delete('/conversations/:id', messageController.deleteConversation)

export default router
