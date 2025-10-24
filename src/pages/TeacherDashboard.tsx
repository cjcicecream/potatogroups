import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, LogOut, Copy } from "lucide-react";

interface Class {
  code: string;
  name: string;
  students: any[];
  layouts: any[];
}

const TeacherDashboard = () => {
  const [classes, setClasses] = useState<Record<string, Class>>({});
  const [newClassName, setNewClassName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentTeacher = localStorage.getItem("currentTeacher");
    if (!currentTeacher) {
      navigate("/teacher");
      return;
    }

    const storedClasses = JSON.parse(localStorage.getItem("classes") || "{}");
    setClasses(storedClasses);
  }, [navigate]);

  const generateClassCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = generateClassCode();
    const newClass: Class = {
      code,
      name: newClassName,
      students: [],
      layouts: [],
    };

    const updatedClasses = { ...classes, [code]: newClass };
    setClasses(updatedClasses);
    localStorage.setItem("classes", JSON.stringify(updatedClasses));

    toast({
      title: "Class created! 🥔",
      description: `Class code: ${code}`,
    });

    setNewClassName("");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentTeacher");
    navigate("/teacher");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied! 🥔",
      description: `Class code ${code} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🥔 Teacher Dashboard 🥔
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card className="p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Create New Class</h2>
          <form onSubmit={handleCreateClass} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="e.g., Period 3 Math"
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="self-end">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </form>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(classes).map(([code, classData]) => (
            <Card
              key={code}
              className="p-6 hover:shadow-xl transition-shadow"
            >
              <div onClick={() => navigate(`/teacher/class/${code}`)} className="cursor-pointer">
                <h3 className="text-xl font-semibold mb-4">{classData.name}</h3>
              </div>
              
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Class Code:</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-4xl font-bold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {code}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(code);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {classData.students?.length || 0} students
              </div>
            </Card>
          ))}
        </div>

        {Object.keys(classes).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No classes yet. Create your first class to get started!</p>
          </div>
        )}

        <Button
          variant="ghost"
          className="mt-8 w-full"
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
