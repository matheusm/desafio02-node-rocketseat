import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async (req, res) => {
    const users = await knex('users').select()

    return { users }
  })

  app.post('/signup', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(req.body)

    const { sessionId } = req.cookies

    if (sessionId)
      return res.status(400).send({
        error: 'You cannot create an account if you are logged in',
      })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password,
    })

    return res.status(201).send()
  })

  app.post('/signin', async (req, res) => {
    const signInUserBodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = signInUserBodySchema.parse(req.body)

    let { sessionId } = req.cookies

    const user = await knex('users')
      .select()
      .where({
        email,
        password,
      })
      .first()

    if (!user)
      return res.status(400).send({
        error: 'You should create an account first',
      })

    sessionId = randomUUID()
    res.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    await knex('users').where('id', user.id).update('session_id', sessionId)
  })
}
