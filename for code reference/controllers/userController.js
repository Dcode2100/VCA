const { PrismaClient } = require("../../prisma/src/generated/prisma-client");

const prisma = new PrismaClient();

async function getAllUsers(req, res) {
    const users = await prisma.user.findMany();
    res.json(users);
}

async function createUser(req, res) {
    const { username, email, password } = req.body;

    // Check if required fields are missing
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        // Attempt to create a new user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password,
            },
        });

        // Return the created user
        res.json(user);
    } catch (error) {
        // Handle Prisma or other errors
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    getAllUsers,
    createUser,
};
