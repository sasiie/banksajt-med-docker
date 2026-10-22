import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { validateAmount } from "./src/validateAmount.js";

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

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    console.error("Databasanslutningen misslyckades:", error);

    return res.status(503).json({
      status: "database unavailable",
    });
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    return res.status(201).json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte skapa användaren",
    });
  }
});

// Logga in
app.post("/sessions", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
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
        token,
      },
    });

    return res.json({ token });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte logga in",
    });
  }
});

// Hämta saldo
app.post("/me/accounts", async (req, res) => {
  const { token } = req.body;

  if (typeof token !== "string" || !token) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({
        message: "Ogiltig token",
      });
    }

    const account = await prisma.account.findUnique({
      where: { userId: session.userId },
    });

    if (!account) {
      return res.status(404).json({
        message: "Kontot hittades inte",
      });
    }

    return res.json({
      amount: account.amount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte hämta saldot",
    });
  }
});

// Sätt in pengar och spara transaktionen
app.post("/me/accounts/transactions", async (req, res) => {
  const { token, amount } = req.body;

  if (typeof token !== "string" || !token) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({
        message: "Ogiltig token",
      });
    }

    if (!validateAmount(amount) || Number(amount) > 2147483647) {
      return res.status(400).json({
        message:
          "Beloppet måste vara ett positivt heltal inom tillåtet intervall",
      });
    }

    const account = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.account.update({
        where: { userId: session.userId },
        data: {
          amount: {
            increment: Number(amount),
          },
        },
      });

      await tx.transaction.create({
        data: {
          amount: Number(amount),
          accountId: updatedAccount.id,
        },
      });

      return updatedAccount;
    });

    return res.json({
      amount: account.amount,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte genomföra insättningen",
    });
  }
});

// Hämta transaktionshistorik för inloggad användare
app.post("/me/accounts/transactions/history", async (req, res) => {
  const { token } = req.body;

  if (typeof token !== "string" || !token) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) {
      return res.status(401).json({
        message: "Ogiltig token",
      });
    }

    const account = await prisma.account.findUnique({
      where: { userId: session.userId },
    });

    if (!account) {
      return res.status(404).json({
        message: "Kontot hittades inte",
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: account.id,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        amount: true,
        createdAt: true,
      },
    });

    return res.json({ transactions });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte hämta transaktionshistoriken",
    });
  }
});

app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
