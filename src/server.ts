import fastify from 'fastify'
import { usersRoutes } from './routes/users'
import fastifyCookie from '@fastify/cookie'

const app = fastify()

app.register(fastifyCookie)

app.register(usersRoutes, {
  prefix: '/users',
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('== HTTP Server Running ==')
  })
