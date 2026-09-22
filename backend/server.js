import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const app = express();
const port = process.env.PORT || 3001;

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST || "mysql",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "bank_app",
  password: process.env.DB_PASSWORD || "bank_password",
  database: process.env.DB_NAME || "bank",
});

const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(bodyParser.json());

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

app.post("/users", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        username,
        password,
        account: {
          create: {
            amount: 0,
          },
        },
      },
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte skapa användaren",
    });
  }
});

app.post("/sessions", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      username: username,
      password: password,
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const token = generateOTP();

  await prisma.session.create({
    data: {
      userId: user.id,
      token: token,
    },
  });

  res.json({
    token,
  });
});

app.post("/me/accounts", async (req, res) => {
  const { token } = req.body;

  const session = await prisma.session.findUnique({
    where: {
      token: token,
    },
  });

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const account = await prisma.account.findUnique({
    where: {
      userId: session.userId,
    },
  });

  res.json({
    amount: account.amount,
  });
});

app.post("/me/accounts/transactions", async (req, res) => {
  const { token, amount } = req.body;

  const session = await prisma.session.findUnique({
    where: {
      token: token,
    },
  });

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const account = await prisma.account.update({
    where: {
      userId: session.userId,
    },
    data: {
      amount: {
        increment: Number(amount),
      },
    },
  });

  res.json({
    amount: account.amount,
  });
});

app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
