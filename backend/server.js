import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Din kod här. Skriv dina arrayer
const users = [];
const accounts = [];
const sessions = [];

// Din kod här. Skriv dina routes:
app.post("/users", (req, res) => {
  const { username, password } = req.body;

  const user = {
    id: users.length + 101,
    username,
    password,
  };

  users.push(user);

  const account = {
    id: accounts.length + 1,
    userId: user.id,
    amount: 0,
  };

  accounts.push(account);

  res.status(201).json({
    id: user.id,
    username: user.username,
  });
});

// Logga in
app.post("/sessions", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (user) => user.username === username && user.password === password,
  );

  if (!user) {
    return res.status(401).json({
      message: "Fel användarnamn eller lösenord",
    });
  }

  const token = generateOTP();

  const session = {
    userId: user.id,
    token,
  };

  sessions.push(session);

  res.json({
    token,
  });
});

// Visa saldo
app.post("/me/accounts", (req, res) => {
  const { token } = req.body;

  const session = sessions.find((session) => session.token === token);

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const account = accounts.find((account) => account.userId === session.userId);

  res.json({
    amount: account.amount,
  });
});

// Sätt in pengar
app.post("/me/accounts/transactions", (req, res) => {
  const { token, amount } = req.body;

  const session = sessions.find((session) => session.token === token);

  if (!session) {
    return res.status(401).json({
      message: "Ogiltig token",
    });
  }

  const account = accounts.find((account) => account.userId === session.userId);

  account.amount += Number(amount);

  res.json({
    amount: account.amount,
  });
});

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
