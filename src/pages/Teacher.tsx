import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Teacher = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem("currentTeacher")) {
      navigate("/teacher/dashboard");
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple localStorage-based auth
    const teachers = JSON.parse(localStorage.getItem("teachers") || "{}");
    
    if (teachers[email] && teachers[email].password === password) {
      localStorage.setItem("currentTeacher", email);
      toast({
        title: "Welcome back! 🥔",
        description: "Successfully logged in",
      });
      navigate("/teacher/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const teachers = JSON.parse(localStorage.getItem("teachers") || "{}");
    
    if (teachers[email]) {
      toast({
        title: "Account exists",
        description: "Please login instead",
        variant: "destructive",
      });
      return;
    }

    teachers[email] = {
      password,
      classes: [],
    };
    localStorage.setItem("teachers", JSON.stringify(teachers));
    localStorage.setItem("currentTeacher", email);
    toast({
      title: "Account created! 🥔",
      description: "Welcome to Potato Groups!",
    });
    navigate("/teacher/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🥔 Potato Groups 🥔
          </h1>
          <p className="text-muted-foreground">Teacher Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Login
            </Button>
            <Button type="button" onClick={handleSignup} variant="secondary" className="flex-1">
              Sign Up
            </Button>
          </div>
        </form>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default Teacher;
