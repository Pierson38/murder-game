import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary p-4">
        <h1 className="text-primary-foreground text-2xl font-bold text-center">Murder Game</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-4xl font-bold">Bienvenue au Murder Game</h2>
          <p className="text-muted-foreground">
            Un jeu d'assassinat où vous devez accomplir des missions tout en restant en vie.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/admin/login">
            <Button variant="outline" size="lg">
              Administration
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg">Connexion Joueur</Button>
          </Link>
        </div>
      </main>
      <footer className="py-4 text-center text-muted-foreground border-t">
        Murder Game Manager &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

