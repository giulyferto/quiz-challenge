import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-heading font-medium">
          Quiz Challenge
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/attempts"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My Attempts
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Admin
                </Link>
              )}
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                {user.name}
                <Badge variant="secondary">{user.role}</Badge>
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
