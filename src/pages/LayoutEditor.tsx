import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Square, Save, Users } from "lucide-react";
import { Canvas as FabricCanvas, Rect, Text, Group } from "fabric";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Class {
  code: string;
  name: string;
  students: any[];
  layouts: any[];
}

const LayoutEditor = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [deskCount, setDeskCount] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deskAmount, setDeskAmount] = useState("");

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

    // Poll for changes in student count
    const interval = setInterval(() => {
      const updatedClasses = JSON.parse(localStorage.getItem("classes") || "{}");
      if (updatedClasses[code]) {
        setClassData(updatedClasses[code]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [code, navigate, toast]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#f8f9fa",
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Automatically arrange desks when student count changes
  useEffect(() => {
    if (!fabricCanvas || !classData) return;

    const studentCount = classData.students?.length || 0;
    
    if (studentCount === 0) return;

    // Clear and regenerate desks
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8f9fa";
    
    // Generate desks for all students
    for (let i = 0; i < studentCount; i++) {
      const deskNumber = i + 1;
      
      const desk = new Rect({
        left: 0,
        top: 0,
        fill: "#e0e7ff",
        width: 60,
        height: 60,
        stroke: "#6366f1",
        strokeWidth: 2,
        rx: 4,
        ry: 4,
      });

      const label = new Text(`${deskNumber}`, {
        fontSize: 16,
        fontWeight: "bold",
        fill: "#1e293b",
      });

      label.set({
        left: 30 - (label.width || 0) / 2,
        top: 30 - (label.height || 0) / 2,
      });

      const group = new Group([desk, label], {
        left: 100 + (i % 5) * 80,
        top: 100 + Math.floor(i / 5) * 80,
      });

      fabricCanvas.add(group);
    }
    
    setDeskCount(studentCount);
    fabricCanvas.renderAll();
  }, [fabricCanvas, classData?.students?.length]);

  const addDesks = (amount: number) => {
    if (!fabricCanvas || amount < 1) return;

    const currentCount = deskCount;
    
    for (let i = 0; i < amount; i++) {
      const newDeskNumber = currentCount + i + 1;
      
      const desk = new Rect({
        left: 0,
        top: 0,
        fill: "#e0e7ff",
        width: 60,
        height: 60,
        stroke: "#6366f1",
        strokeWidth: 2,
        rx: 4,
        ry: 4,
      });

      const label = new Text(`${newDeskNumber}`, {
        fontSize: 16,
        fontWeight: "bold",
        fill: "#1e293b",
      });

      label.set({
        left: 30 - (label.width || 0) / 2,
        top: 30 - (label.height || 0) / 2,
      });

      const totalDesks = currentCount + i;
      const group = new Group([desk, label], {
        left: 100 + (totalDesks % 5) * 80,
        top: 100 + Math.floor(totalDesks / 5) * 80,
      });

      fabricCanvas.add(group);
    }
    
    setDeskCount(currentCount + amount);
    fabricCanvas.renderAll();

    toast({
      title: `${amount} desk${amount > 1 ? 's' : ''} added! 🥔`,
      description: `Added ${amount} desk${amount > 1 ? 's' : ''} to the layout`,
    });
  };

  const handleAddDesks = () => {
    const amount = parseInt(deskAmount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of desks",
        variant: "destructive",
      });
      return;
    }
    
    addDesks(amount);
    setIsDialogOpen(false);
    setDeskAmount("");
  };

  const generateAllDesks = () => {
    if (!fabricCanvas || !classData) return;

    const studentCount = classData.students?.length || 0;
    
    if (studentCount === 0) {
      toast({
        title: "No students yet",
        description: "Add students to your class first",
        variant: "destructive",
      });
      return;
    }

    // Clear existing desks
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8f9fa";
    
    // Generate desks for all students
    for (let i = 0; i < studentCount; i++) {
      const deskNumber = i + 1;
      
      const desk = new Rect({
        left: 0,
        top: 0,
        fill: "#e0e7ff",
        width: 60,
        height: 60,
        stroke: "#6366f1",
        strokeWidth: 2,
        rx: 4,
        ry: 4,
      });

      const label = new Text(`${deskNumber}`, {
        fontSize: 16,
        fontWeight: "bold",
        fill: "#1e293b",
      });

      // Position label at center of desk
      label.set({
        left: 30 - (label.width || 0) / 2,
        top: 30 - (label.height || 0) / 2,
      });

      const group = new Group([desk, label], {
        left: 100 + (i % 5) * 80,
        top: 100 + Math.floor(i / 5) * 80,
      });

      fabricCanvas.add(group);
    }
    
    setDeskCount(studentCount);
    fabricCanvas.renderAll();

    toast({
      title: "Desks generated! 🥔",
      description: `Created ${studentCount} desks for your students`,
    });
  };

  const handleSave = () => {
    if (!fabricCanvas || !code) return;

    const layoutData = fabricCanvas.toJSON();
    
    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    if (!classes[code].layouts) {
      classes[code].layouts = [];
    }
    
    classes[code].layouts.push({
      data: layoutData,
      createdAt: new Date().toISOString(),
      deskCount: deskCount,
    });

    localStorage.setItem("classes", JSON.stringify(classes));

    toast({
      title: "Layout saved! 🥔",
      description: "Your classroom layout has been saved",
    });

    navigate(`/teacher/class/${code}`);
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8f9fa";
    fabricCanvas.renderAll();
    setDeskCount(0);
    toast({
      title: "Layout cleared",
      description: "All desks have been removed",
    });
  };

  if (!classData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/teacher/class/${code}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>

        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Layout Editor
        </h1>
        <p className="text-muted-foreground mb-8">{classData.name}</p>

        <Card className="p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <Button onClick={generateAllDesks} variant="default">
              <Users className="mr-2 h-4 w-4" />
              Generate Desks for All Students
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Square className="mr-2 h-4 w-4" />
              Add Desks
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear All
            </Button>
            <Button onClick={handleSave} variant="default" className="ml-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Layout
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} />
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Click "Generate Desks for All Students" to create numbered desks (1-{classData.students?.length || 0}), then drag them to arrange your classroom layout.
            Total desks: {deskCount}
          </p>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Desks</DialogTitle>
            <DialogDescription>
              How many desks would you like to add to the layout?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deskAmount">Number of desks</Label>
              <Input
                id="deskAmount"
                type="number"
                min="1"
                placeholder="Enter number of desks"
                value={deskAmount}
                onChange={(e) => setDeskAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddDesks();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDesks}>Add Desks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LayoutEditor;
