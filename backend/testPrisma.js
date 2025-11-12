import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany() // change 'user' to your actual model name
  console.log(users)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
