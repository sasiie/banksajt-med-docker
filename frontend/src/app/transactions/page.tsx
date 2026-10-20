"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";

type Transaction = {
  id: number;
  amount: number;
  createdAt: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Du måste logga in för att se dina transaktioner.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/me/accounts/transactions/history`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          },
        );

        if (response.status === 401) {
          setMessage("Din inloggning är ogiltig. Logga in igen.");
          return;
        }

        if (!response.ok) {
          throw new Error("Kunde inte hämta transaktioner");
        }

        const data = await response.json();
        setTransactions(data.transactions);
      } catch {
        setMessage("Något gick fel när transaktionerna hämtades.");
      } finally {
        setLoading(false);
      }
    }

    void fetchTransactions();
  }, []);

  return (
    <main>
      <nav>
        <Link href="/">Hem</Link> <Link href="/account">Mitt konto</Link>{" "}
        <Link href="/login">Logga in</Link>
      </nav>

      <h1>Transaktionshistorik</h1>

      {loading ? (
        <p>Laddar transaktioner...</p>
      ) : message ? (
        <p role="alert">{message}</p>
      ) : transactions.length === 0 ? (
        <p>Du har inga transaktioner ännu.</p>
      ) : (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>+{transaction.amount} kr</strong>
              {" – "}
              <time dateTime={transaction.createdAt}>
                {new Date(transaction.createdAt).toLocaleString("sv-SE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}

      <Link href="/account">Tillbaka till mitt konto</Link>
    </main>
  );
}
