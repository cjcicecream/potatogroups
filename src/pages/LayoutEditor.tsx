import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Square, Save } from "lucide-react";
import { Canvas as FabricCanvas, Rect, Text, Group } from "fabric";

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

  const addDesk = () => {
    if (!fabricCanvas) return;

    const newDeskNumber = deskCount + 1;
    
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
      left: 30,
      top: 30,
      fontSize: 16,
      fontWeight: "bold",
      fill: "#1e293b",
      originX: "center",
      originY: "center",
    });

    const group = new Group([desk, label], {
      left: 100 + (deskCount % 5) * 80,
      top: 100 + Math.floor(deskCount / 5) * 80,
    });

    fabricCanvas.add(group);
    setDeskCount(newDeskNumber);

    toast({
      title: "Desk added! 🥔",
      description: `Desk ${newDeskNumber} has been added to the layout`,
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
            <Button onClick={addDesk}>
              <Square className="mr-2 h-4 w-4" />
              Add Desk
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
            Click "Add Desk" to add desks, then drag them to arrange your classroom layout.
            Total desks: {deskCount}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LayoutEditor;
