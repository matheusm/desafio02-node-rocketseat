import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkValidSessionId } from '../middlewares/check-valid-session-id'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: checkValidSessionId }, async (req, res) => {
    const { sessionId } = req.cookies

    const { id: userId } = await knex('users')
      .where('session_id', sessionId)
      .first()

    const meals = await knex('meals').select().where('user_id', userId)

    return { meals }
  })

  app.post('/', { preHandler: checkValidSessionId }, async (req, res) => {
    const { sessionId } = req.cookies

    const { id: userId } = await knex('users')
      .where('session_id', sessionId)
      .first()

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_the_diet: z.boolean(),
      selected_date: z.coerce.date(),
    })

    const {
      name,
      description,
      is_on_the_diet: isOnTheDiet,
      selected_date: selectedDate,
    } = createMealBodySchema.parse(req.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_the_diet: isOnTheDiet,
      selected_date: selectedDate,
      user_id: userId,
    })

    return res.status(201).send()
  })
}
