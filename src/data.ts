import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const libsql = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

export type CreatePersonInput = {
  name: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
};

async function getPersonList() {
  return await prisma.persons.findMany();
}

async function getPersonById(id: number) {
  id = parseInt(id.toString());
  return await prisma.persons.findUnique({
    where: {
      id
    }
  });
}

async function createPerson(person: CreatePersonInput) {
  //Dirty solution but f this
  const currentCount = await prisma.persons.count();
  return await prisma.persons.create({
    data: {
      id: currentCount + 1,
      ...person
    }
  });
}

async function updatePerson(id: number, person: CreatePersonInput) {
  id = parseInt(id.toString());
  const personUpdated = await prisma.persons.update({
    where: { id },
    data: {
      dateOfBirth: person.dateOfBirth,
      lastName: person.lastName,
      middleName: person.middleName,
      name: person.name
    }
  });
  return personUpdated;
}

async function saveEncryptionKey(key: string) {
  const currentCount = await prisma.apiKeys.count();

  return await prisma.apiKeys.create({
    data: {
      id: currentCount + 1,
      key
    }
  })
}

async function deletePerson(id: number) {
  id = parseInt(id.toString());
  return await prisma.persons.delete({
    where: {
      id
    }
  });
}

async function clearDB() {
  return await prisma.persons.deleteMany();
}

async function getEncryptionKey(
  key: string
) {
  return await prisma.apiKeys.findFirst({
    where: {
      key
    }
  });
}

export default {
  getPersonList,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  clearDB,
  saveEncryptionKey,
  getEncryptionKey
};
