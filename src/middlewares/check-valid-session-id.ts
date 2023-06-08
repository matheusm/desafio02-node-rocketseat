import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function checkValidSessionId(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const { sessionId } = req.cookies

  if (!sessionId) {
    return res.status(401).send({
      error: 'Unauthorired',
    })
  }

  const user = await knex('users').where('session_id', sessionId).first()

  if (!user)
    return res.status(401).send({
      error: 'Invalid session id token',
    })
}
