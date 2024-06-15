import 'dotenv/config'
import fastify from 'fastify'
import { faker } from '@faker-js/faker/locale/es'
import data, { CreatePersonInput } from './data'
const PORT = Number(process.env.PORT) || 3000
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`
const app = fastify({
  logger: true
})


app.get('/', async (request, reply) => {
  return await data.getPersonList();
});
app.get<{
  Params: { id: number }
}>('/:id', async function (request, reply) {
  const id = request.params.id;
  const person = await data.getPersonById(id);
  if (!person) {
    return reply.status(404).send({
      message: 'Person not found',
    });
  }
  return person;
});
app.post<{
  Body: CreatePersonInput,
  Params: { id: number }
}>('/:id', async (request, reply) => {
  const exists = data.getPersonById(request.params.id);
  if (!exists) {
    return reply.status(404).send({
      message: 'Person not found',
    });
  }

  const person = await data.updatePerson(request.params.id, request.body);

  return person;
});


app.get<{
  Params: { amount: number },
  Querystring: { key: string, append: string }
}>('/populate/:amount', async (request, reply) => {
  const key = request.query.key;
  if (key !== process.env.ADMIN_KEY) {
    return reply.status(401).send({
      message: 'Unauthorized'
    });
  }
  const append = request.query.append;
  if (append !== 'true') {
    //Clear all data
    await data.clearDB();
  }

  const amount = request.params.amount;
  for (let i = 0; i < amount; i++) {
    await data.createPerson({
      name: faker.person.firstName(),
      middleName: faker.person.middleName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.between({ from: '1950-01-01', to: '2000-01-01' }).toISOString()
    });
  }
  return {
    message: 'Populated'
  };
});


app.listen({
  port: PORT,
  host: host
}, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
});