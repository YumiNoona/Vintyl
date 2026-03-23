import { login, signup } from '@/actions/auth'

export default function AuthPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <div className="w-full max-w-md space-y-8 bg-secondary/10 p-8 rounded-3xl border border-border backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground tracking-tighter">Vintyl Auth</h1>
          <p className="text-muted-foreground mt-2">Sign in or create an account to start recording</p>
        </div>

        {searchParams.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl text-center font-bold animate-shake">
            {searchParams.error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
           {/* Tab Logic can be added here, for now keeping it simple */}
        </div>

        <form action={login} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
              <input name="first_name" type="text" className="w-full bg-secondary/20 border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-bold" placeholder="Jane" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
              <input name="last_name" type="text" className="w-full bg-secondary/20 border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-bold" placeholder="Doe" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
            <input name="email" type="email" required className="w-full bg-secondary/20 border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-bold" placeholder="name@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <input name="password" type="password" required className="w-full bg-secondary/20 border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-bold" placeholder="••••••••" />
          </div>
          <button type="submit" formAction={login} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-95">
            Sign In
          </button>
          <button type="submit" formAction={signup} className="w-full bg-transparent border border-border hover:bg-white/5 text-white font-black py-4 rounded-xl transition-all active:scale-95">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  )
}
