import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav>
        <Link href="/">Hem</Link>
        <Link href="/login">Logga in</Link>
        <Link href="/register">Skapa användare</Link>
      </nav>
      <section>
        <h1> Välkommen till banken</h1>
        <p>Skapa ett konto för att komma igång med din internetbank.</p>
        <Link href="/register">Skapa användare</Link>
      </section>
    </main>
  );
}
