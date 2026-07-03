import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          className="font-mono text-[15px] font-medium tracking-tight text-foreground"
        >
          quiz-challenge
          <span className="cursor-caret text-primary">_</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/attempts"
                className="font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              >
                attempts
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                >
                  admin
                </Link>
              )}
              <span className="hidden items-center gap-1.5 border-l border-border pl-4 font-mono text-xs text-muted-foreground sm:flex">
                {user.name}
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {user.role.toLowerCase()}
                </span>
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
