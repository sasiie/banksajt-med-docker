"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("http://127.0.0.1:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    if (response.ok) {
      setMessage("Användaren har skapats");
      setUsername("");
      setPassword("");
    } else {
      setMessage("Kunde inte skapa användren");
    }
  }

  return (
    <main>
      <nav>
        <Link href="/">Hem</Link>
        <Link href="/login">Logga in</Link>
        <Link href="/register">Skapa användare</Link>
      </nav>
      <h1>Skapa användare</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Användarnamn</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Lösenord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit">Skapa användare</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
