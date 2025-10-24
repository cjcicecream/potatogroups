import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Student = () => {
  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [preferences, setPreferences] = useState<string[]>(["", "", ""]);
  const [comments, setComments] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    
    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    
    if (!classes[classCode]) {
      toast({
        title: "Class not found",
        description: "Please check the class code",
        variant: "destructive",
      });
      return;
    }

    setIsJoined(true);
    toast({
      title: "Welcome! 🥔",
      description: `Joined ${classes[classCode].name}`,
    });
  };

  const handleSubmitPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    
    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    
    if (!classes[classCode].students) {
      classes[classCode].students = [];
    }

    const studentIndex = classes[classCode].students.findIndex(
      (s: any) => s.name === name
    );

    const studentData = {
      name,
      preferences: preferences.filter(p => p.trim() !== ""),
      comments,
      submittedAt: new Date().toISOString(),
    };

    if (studentIndex >= 0) {
      classes[classCode].students[studentIndex] = studentData;
    } else {
      classes[classCode].students.push(studentData);
    }

    localStorage.setItem("classes", JSON.stringify(classes));

    toast({
      title: "Preferences saved! 🥔",
      description: "Your teacher will see your choices",
    });

    setPreferences(["", "", ""]);
    setComments("");
  };

  const updatePreference = (index: number, value: string) => {
    const newPreferences = [...preferences];
    newPreferences[index] = value;
    setPreferences(newPreferences);
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              🥔 Potato Groups 🥔
            </h1>
            <p className="text-muted-foreground">Student Portal</p>
          </div>

          <form onSubmit={handleJoinClass} className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="classCode">Class Code</Label>
              <Input
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                required
                className="mt-1"
                placeholder="Enter class code"
              />
            </div>
            <Button type="submit" className="w-full">
              Join Class
            </Button>
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Card className="p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🥔 Seating Preferences 🥔
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Tell us who you'd like to sit with!
          </p>

          <form onSubmit={handleSubmitPreferences} className="space-y-6">
            <div className="space-y-4">
              <Label>Who would you like to sit next to? (Rank in order)</Label>
              {preferences.map((pref, index) => (
                <div key={index}>
                  <Label htmlFor={`pref-${index}`} className="text-sm text-muted-foreground">
                    Choice #{index + 1}
                  </Label>
                  <Input
                    id={`pref-${index}`}
                    value={pref}
                    onChange={(e) => updatePreference(index, e.target.value)}
                    placeholder={`Student name (optional)`}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="comments">Additional Comments (Optional)</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any other seating preferences or concerns?"
                className="mt-1 min-h-24"
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Preferences
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => {
              setIsJoined(false);
              setName("");
              setClassCode("");
            }}
          >
            Leave Class
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Student;
