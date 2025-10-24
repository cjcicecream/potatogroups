import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users, Trash2 } from "lucide-react";

interface Student {
  name: string;
  preferences: string[];
  comments: string;
  submittedAt: string;
}

interface Class {
  code: string;
  name: string;
  students: Student[];
  layouts: any[];
}

const ClassView = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classData, setClassData] = useState<Class | null>(null);

  useEffect(() => {
    const currentTeacher = localStorage.getItem("currentTeacher");
    if (!currentTeacher) {
      navigate("/teacher");
      return;
    }

    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    
    if (!code || !classes[code]) {
      toast({
        title: "Class not found",
        description: "This class doesn't exist",
        variant: "destructive",
      });
      navigate("/teacher/dashboard");
      return;
    }

    setClassData(classes[code]);
  }, [code, navigate, toast]);

  const handleRemoveStudent = (studentName: string) => {
    if (!code || !classData) return;

    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    classes[code].students = classes[code].students.filter(
      (s: Student) => s.name !== studentName
    );
    
    localStorage.setItem("classes", JSON.stringify(classes));
    setClassData(classes[code]);

    toast({
      title: "Student removed 🥔",
      description: `${studentName} has been removed from the class`,
    });
  };

  const handleRemovePreference = (studentName: string, preferenceIndex: number) => {
    if (!code || !classData) return;

    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    const studentIndex = classes[code].students.findIndex(
      (s: Student) => s.name === studentName
    );
    
    if (studentIndex !== -1) {
      classes[code].students[studentIndex].preferences.splice(preferenceIndex, 1);
      localStorage.setItem("classes", JSON.stringify(classes));
      setClassData(classes[code]);

      toast({
        title: "Preference removed",
        description: "Seating preference has been deleted",
      });
    }
  };

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/teacher/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            {classData.name}
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Class Code:</p>
              <p className="text-3xl font-bold tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {code}
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="text-lg">{classData.students?.length || 0} students</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Student Preferences</h2>
          
          {classData.students && classData.students.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {classData.students.map((student, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{student.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStudent(student.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {student.preferences && student.preferences.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Seating Preferences:
                      </p>
                      <ol className="list-decimal list-inside space-y-2">
                        {student.preferences.map((pref, i) => (
                          <li key={i} className="text-sm flex items-center justify-between">
                            <span>{pref}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePreference(student.name, i)}
                              className="h-6 w-6 p-0 ml-2"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {student.comments && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Comments:
                      </p>
                      <p className="text-sm italic">{student.comments}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-3">
                    Submitted: {new Date(student.submittedAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No students have submitted preferences yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Share the class code <span className="font-bold">{code}</span> with your students
              </p>
            </Card>
          )}
        </div>

        <div className="flex gap-4">
          <Button size="lg" className="flex-1">
            Create Seating Chart
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            Manage Layout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClassView;
