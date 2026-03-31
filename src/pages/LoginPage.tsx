import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-hover to-primary/80" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, hsl(224 76% 40% / 0.4) 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm mx-auto mb-6">
            <Factory className="h-9 w-9 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">ProFlow</h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Productivity Improvement & Collaboration Platform for Manufacturing Excellence
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-primary-foreground/60 text-sm">
            <div className="rounded-lg bg-primary-foreground/5 backdrop-blur-sm p-3">
              <p className="text-2xl font-bold text-primary-foreground">94%</p>
              <p>OEE Score</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/5 backdrop-blur-sm p-3">
              <p className="text-2xl font-bold text-primary-foreground">↓32%</p>
              <p>Waste Reduced</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/5 backdrop-blur-sm p-3">
              <p className="text-2xl font-bold text-primary-foreground">↑18%</p>
              <p>Throughput</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ProFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                defaultValue="ahmad@proflow.io"
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-ring focus:ring-2 focus:ring-offset-1 transition-shadow"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="password123"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none ring-ring focus:ring-2 focus:ring-offset-1 transition-shadow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" defaultChecked />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary font-medium hover:underline">Forgot password?</button>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors duration-200"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Demo credentials pre-filled. Click Sign in to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
