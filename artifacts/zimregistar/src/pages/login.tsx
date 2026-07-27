import { useState } from "react";
import { useLocation } from "wouter";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, mockLogin } from "@/lib/store";
import { toast } from "sonner";

export function LoginPage() {
  const [, navigate] = useLocation();
  const login = useAuth((s) => s.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim()) { setError("Employee number or phone number is required."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    setLoading(true);
    try {
      const user = await mockLogin(identifier.trim(), password);
      window.localStorage.setItem("rg-token", "mock-token");
      login(user);
      toast.success("Welcome back");
      navigate(user.role === "Super Administrator" ? "/super-admin" : "/dashboard");
    } catch {
      setError("Invalid credentials. Please check your employee number and password.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel - navy */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0F2342] p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img src="/logo.svg" alt="Zimbabwe" className="h-10 w-10 object-contain brightness-0 invert" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/60">Republic of Zimbabwe</p>
              <p className="text-sm font-semibold text-white">Registrar General's Office</p>
            </div>
          </div>
          <h1 className="text-[32px] font-semibold leading-tight text-white mb-4">Digital Document<br/>Management System</h1>
          <p className="text-sm text-white/60 max-w-sm leading-relaxed">
            Secure staff portal for processing Birth Certificate, National ID, and Document Recovery applications on behalf of citizens.
          </p>
        </div>
        <div className="space-y-3">
          {["Issue & verify citizen documents", "Approve applications with audit trail", "Print and dispatch identity documents"].map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="shrink-0 grid h-6 w-6 place-items-center rounded-sm bg-white/10 text-[11px] font-bold text-white/70">0{i+1}</span>
              <p className="text-[13px] text-white/70">{t}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6">
          <p className="text-[11px] text-white/40 uppercase tracking-[0.1em]">Ministry of Home Affairs & Cultural Heritage</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="Zimbabwe" className="h-8 w-8 object-contain" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Republic of Zimbabwe</p>
                <p className="text-sm font-semibold">Registrar General's Office</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">Staff Sign In</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your employee credentials to access the system.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="border-l-2 border-destructive bg-destructive/8 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="ident" className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Employee Number or Phone</Label>
              <Input id="ident" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="e.g. RG-00001 or +263 77 100 0001" autoComplete="username" className="h-9" />
              <p className="text-[11px] text-muted-foreground">You may sign in with either your employee number or registered phone number.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pwd" className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <div className="relative">
                <Input id="pwd" type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" className="pr-9 h-9" />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-9 mt-2" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Sign In Securely
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Demo: type any employee number (e.g. RG-00002 for admin) and any password (4+ chars).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}