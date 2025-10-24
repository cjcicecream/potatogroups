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
    
    // Generate tables for all students
    const tablesPerRow = 6;
    const tableWidth = 80;
    const tableHeight = 120;
    const spacing = 30;
    
    for (let i = 0; i < studentCount; i++) {
      const tableNumber = i + 1;
      
      // Table top
      const tableTop = new Rect({
        left: 0,
        top: 0,
        fill: "#8b5cf6",
        width: tableWidth,
        height: tableHeight * 0.7,
        stroke: "#6d28d9",
        strokeWidth: 2,
        rx: 6,
        ry: 6,
      });

      // Table base
      const tableBase = new Rect({
        left: tableWidth * 0.25,
        top: tableHeight * 0.7,
        fill: "#7c3aed",
        width: tableWidth * 0.5,
        height: tableHeight * 0.3,
        stroke: "#6d28d9",
        strokeWidth: 2,
        rx: 4,
        ry: 4,
      });

      // Table number label
      const label = new Text(`${tableNumber}`, {
        fontSize: 20,
        fontWeight: "bold",
        fill: "#ffffff",
      });

      label.set({
        left: tableWidth / 2 - (label.width || 0) / 2,
        top: (tableHeight * 0.7) / 2 - (label.height || 0) / 2,
      });

      const col = i % tablesPerRow;
      const row = Math.floor(i / tablesPerRow);
      
      const group = new Group([tableTop, tableBase, label], {
        left: 50 + col * (tableWidth + spacing),
        top: 50 + row * (tableHeight + spacing),
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: false,
      });

      fabricCanvas.add(group);
    }
    
    setDeskCount(studentCount);
    fabricCanvas.renderAll();
  }, [fabricCanvas, classData?.students?.length]);

  const addDesks = (amount: number) => {
    if (!fabricCanvas || amount < 1) return;

    const currentCount = deskCount;
    const tablesPerRow = 6;
    const tableWidth = 80;
    const tableHeight = 120;
    const spacing = 30;
    
    for (let i = 0; i < amount; i++) {
      const newTableNumber = currentCount + i + 1;
      
      // Table top (wider rectangle)
      const tableTop = new Rect({
        left: 0,
        top: 0,
        fill: "#8b5cf6",
        width: tableWidth,
        height: tableHeight * 0.7,
        stroke: "#6d28d9",
        strokeWidth: 2,
        rx: 6,
        ry: 6,
      });

      // Table base (smaller rectangle)
      const tableBase = new Rect({
        left: tableWidth * 0.25,
        top: tableHeight * 0.7,
        fill: "#7c3aed",
        width: tableWidth * 0.5,
        height: tableHeight * 0.3,
        stroke: "#6d28d9",
        strokeWidth: 2,
        rx: 4,
        ry: 4,
      });

      // Table number label
      const label = new Text(`${newTableNumber}`, {
        fontSize: 20,
        fontWeight: "bold",
        fill: "#ffffff",
      });

      label.set({
        left: tableWidth / 2 - (label.width || 0) / 2,
        top: (tableHeight * 0.7) / 2 - (label.height || 0) / 2,
      });

      const totalTables = currentCount + i;
      const col = totalTables % tablesPerRow;
      const row = Math.floor(totalTables / tablesPerRow);
      
      const group = new Group([tableTop, tableBase, label], {
        left: 50 + col * (tableWidth + spacing),
        top: 50 + row * (tableHeight + spacing),
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: false,
      });

      fabricCanvas.add(group);
    }
    
    setDeskCount(currentCount + amount);
    fabricCanvas.renderAll();

    toast({
      title: `${amount} table${amount > 1 ? 's' : ''} added! 🪑`,
      description: `Added ${amount} draggable table${amount > 1 ? 's' : ''} to the layout`,
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
      description: "All tables have been removed",
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
              Generate Tables for All Students
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Square className="mr-2 h-4 w-4" />
              Add Tables
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
            Drag and drop tables to arrange your classroom layout. Click and drag to move, rotate handles to turn tables.
            Total tables: {deskCount}
          </p>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tables</DialogTitle>
            <DialogDescription>
              How many tables would you like to add to the layout? You can add as many as you need.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="deskAmount">Number of tables</Label>
              <Input
                id="deskAmount"
                type="number"
                min="1"
                placeholder="Enter number of tables (unlimited)"
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
            <Button onClick={handleAddDesks}>Add Tables</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LayoutEditor;
