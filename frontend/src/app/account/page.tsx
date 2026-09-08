"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

export default function AccountPage() {
  const [amount, setAmount] = useState<number | null>(null);
  const [deposit, setDeposit] = useState("");
  const [message, setMessage] = useState("");

  async function fetchBalance() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Du är inte inloggad");
      return;
    }
    const response = await fetch(`${API_URL}/me/accounts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();

    if (response.ok) {
      setAmount(data.amount);
    } else {
      setMessage("Kunde inte hämta saldo");
    }
  }
  async function handleDeposit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("du är inte inloggad");
      return;
    }
    const response = await fetch(`${API_URL}/me/accounts/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        amount: Number(deposit),
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setAmount(data.amount);
      setDeposit("");
      setMessage("insättnngen lyckades");
    } else {
      setMessage("Kunde inte sätta in pengarna");
    }
  }

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <main>
      <nav>
        <Link href="/">Hem</Link>
        <Link href="/login">Logga in</Link>
        <Link href="/register">Skapa användare</Link>
      </nav>

      <h1>Miitt konto</h1>
      <p> Saldo: {amount !== null ? `${amount} kr` : "Laddar..."}</p>

      <form onSubmit={handleDeposit}>
        <label htmlFor="deposit">Belopp</label>
        <input
          id="deposit"
          type="number"
          value={deposit}
          onChange={(event) => setDeposit(event.target.value)}
          required
        />

        <button type="submit">Sätt in pengar</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
