// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Wallet, Eye, EyeOff, Github, Chrome } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res: any = await login(email, password); // returns user + token (cast to any to support different implementations)

      // DEBUG: Check token
      console.log("LOGIN RESPONSE:", res);
      console.log("Saving token:", res?.token);

      // Save token for dashboard if available
      if (res && res.token) {
        localStorage.setItem("jwtToken", res.token);
      }

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Card className="w-full max-w-md glass-card p-8 animate-scale-in">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="gradient-primary p-4 rounded-2xl shadow-lg">
            <Wallet className="h-10 w-10 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to manage your expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@expensetracker.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass border-border/40"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass border-border/40 pr-10"
                required
              />

              {/* Show/Hide password */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button variant="outline" className="glass">
              <Github className="mr-2 h-4 w-4" />
              Github
            </Button>
            <Button variant="outline" className="glass">
              <Chrome className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>
        </div>

        {/* Signup */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-center text-muted-foreground">
            Demo credentials: demo@expensetracker.com / demo123
          </p>
        </div>

      </Card>
    </div>
  );
};

export default Login;
