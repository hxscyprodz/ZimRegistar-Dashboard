import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";
import { loginApi } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign In — Registrar General Zimbabwe" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const setAuthUser = useAuth((s) => s.login);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ emp?: string; pwd?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: typeof errors = {};
    if (!phone.trim()) errs.emp = "Phone number is required.";
    if (password.length < 4) errs.pwd = "Password must be at least 4 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { user, token } = await loginApi(phone.trim(), password);
      window.localStorage.setItem("rg-token", token);
      setAuthUser(user);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch (error) {
      const msg =
        "Invalid credentials. Please check your employee number or phone number and password.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gov via-gov to-[oklch(0.22_0.08_260)]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 py-12 lg:grid-cols-2">
        <div className="hidden text-gov-foreground lg:block">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20">
            <img src="/logo.svg" alt="Zimbabwe Coat of Arms" className="h-4 w-4 object-contain" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Republic of Zimbabwe
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Registrar General's Office
          </h1>
          <p className="mt-3 max-w-md text-white/80">
            Secure access for staff to manage Birth Certificates, National IDs and Document Recovery
            applications.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
            {["Issue", "Approve", "Print"].map((t, i) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-gold">0{i + 1}</p>
                <p className="mt-1 text-white/80">{t} citizen documents securely</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="Zimbabwe Coat of Arms"
              className="h-11 w-11 shrink-0 rounded-xl object-contain"
            />
            <div>
              <h2 className="font-display text-xl font-bold">Staff Sign In</h2>
              <p className="text-xs text-muted-foreground">Use your Employee credentials</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {formError ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="emp">Employee Number or Phone Number</Label>
              <Input
                id="emp"
                placeholder="RG-04821 or +263 772 100 003"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="username"
              />
              {errors.emp ? (
                <p className="text-xs text-destructive">{errors.emp}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  You can sign in with either your employee number or registered phone number.
                </p>
              )}
            </div>
            <div className="space-y-1.5 mb-10">
              <Label htmlFor="pwd">Password</Label>
              <div className="relative">
                <Input
                  id="pwd"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pwd ? <p className="text-xs text-destructive">{errors.pwd}</p> : null}
            </div>
            <Button
              type="submit"
              className="w-full bg-gov text-gov-foreground hover:bg-gov/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in securely
            </Button>
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs">
              <p className="mb-1 font-semibold text-foreground">Demo credentials</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>
                  <span className="font-mono">RG-00001</span> /{" "}
                  <span className="font-mono">root1234</span> · Super Administrator
                </li>
                <li>
                  <span className="font-mono">RG-01902</span> /{" "}
                  <span className="font-mono">admin1234</span> · Administrator
                </li>
                <li>
                  <span className="font-mono">RG-03317</span> /{" "}
                  <span className="font-mono">super1234</span> · Supervisor
                </li>
                <li>
                  <span className="font-mono">RG-04821</span> /{" "}
                  <span className="font-mono">officer1234</span> · Registrar Officer
                </li>
              </ul>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              By signing in you agree to the official conduct policy of the RG Office.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
