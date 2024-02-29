const { PrismaClient } = require("../../prisma/src/generated/prisma-client");

const prisma = new PrismaClient();

async function getAllUsers(req, res) {
  const users = await prisma.user.findMany();
  res.json(users);
}

async function createUser(req, res) {
  const { username, email, password } = req.body;

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });

  res.json(user);
}

module.exports = {
  getAllUsers,
  createUser,
};
