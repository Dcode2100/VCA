const { PrismaClient } = require("../prisma/src/generated/prisma-client");
const app = require("./app"); // Import the app instance

const prisma = new PrismaClient();

async function createUser(username, email, password) {
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });

  console.log("User created:", user);
}

// Example usage
createUser("john_doe", "john@example.com", "hashed_password");

// Close Prisma client when the app shuts down
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
