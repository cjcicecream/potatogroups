import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Square, Save, Users, Trash2, Merge } from "lucide-react";
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
  const [seatCount, setSeatCount] = useState("");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [tableCount, setTableCount] = useState("");
  const [seatsPerTable, setSeatsPerTable] = useState("");

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
      width: 1400,
      height: 900,
      backgroundColor: "#f8f9fa",
    });

    // Add keyboard delete support
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
        const activeObject = canvas.getActiveObject();
        canvas.remove(activeObject);
        canvas.renderAll();
        toast({
          title: "Table deleted",
          description: "The selected table has been removed",
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setFabricCanvas(canvas);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, [toast]);

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
    const spacing = 50;
    
    for (let i = 0; i < studentCount; i++) {
      const tableNumber = i + 1;
      const col = i % tablesPerRow;
      const row = Math.floor(i / tablesPerRow);
      
      createTableWithSeats(
        tableNumber,
        50 + col * (tableWidth + spacing),
        50 + row * (tableHeight + spacing),
        4
      );
    }
    
    setDeskCount(studentCount);
    fabricCanvas.renderAll();
  }, [fabricCanvas, classData?.students?.length]);

  const createTableWithSeats = (tableNumber: number, left: number, top: number, seatsCount: number = 4, studentNames: string[] = []) => {
    if (!fabricCanvas) return;

    const tableWidth = 100;
    const tableHeight = 140;
    const seatSize = 18;
    const seatOffset = 12;
    
    const elements = [];
    
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
    elements.push(tableTop);

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
    elements.push(tableBase);

    // Add seats around the table
    const topSeats = Math.ceil(seatsCount / 4);
    const bottomSeats = Math.ceil(seatsCount / 4);
    const leftSeats = Math.floor(seatsCount / 4);
    const rightSeats = Math.floor(seatsCount / 4);

    let seatIndex = 0;

    // Top seats
    for (let i = 0; i < topSeats && seatIndex < seatsCount; i++) {
      const seat = new Rect({
        left: (tableWidth / (topSeats + 1)) * (i + 1) - seatSize / 2,
        top: -seatOffset - seatSize,
        fill: "#fbbf24",
        width: seatSize,
        height: seatSize,
        stroke: "#f59e0b",
        strokeWidth: 1,
        rx: 3,
        ry: 3,
      });
      elements.push(seat);

      // Add student name if available
      if (studentNames[seatIndex]) {
        const nameLabel = new Text(studentNames[seatIndex], {
          fontSize: 8,
          fontWeight: "bold",
          fill: "#1e293b",
        });
        nameLabel.set({
          left: (tableWidth / (topSeats + 1)) * (i + 1) - (nameLabel.width || 0) / 2,
          top: -seatOffset - seatSize - 12,
        });
        elements.push(nameLabel);
      }
      seatIndex++;
    }

    // Bottom seats
    for (let i = 0; i < bottomSeats && seatIndex < seatsCount; i++) {
      const seat = new Rect({
        left: (tableWidth / (bottomSeats + 1)) * (i + 1) - seatSize / 2,
        top: tableHeight + seatOffset,
        fill: "#fbbf24",
        width: seatSize,
        height: seatSize,
        stroke: "#f59e0b",
        strokeWidth: 1,
        rx: 3,
        ry: 3,
      });
      elements.push(seat);

      // Add student name if available
      if (studentNames[seatIndex]) {
        const nameLabel = new Text(studentNames[seatIndex], {
          fontSize: 8,
          fontWeight: "bold",
          fill: "#1e293b",
        });
        nameLabel.set({
          left: (tableWidth / (bottomSeats + 1)) * (i + 1) - (nameLabel.width || 0) / 2,
          top: tableHeight + seatOffset + seatSize + 2,
        });
        elements.push(nameLabel);
      }
      seatIndex++;
    }

    // Left seats
    for (let i = 0; i < leftSeats && seatIndex < seatsCount; i++) {
      const seat = new Rect({
        left: -seatOffset - seatSize,
        top: (tableHeight / (leftSeats + 1)) * (i + 1) - seatSize / 2,
        fill: "#fbbf24",
        width: seatSize,
        height: seatSize,
        stroke: "#f59e0b",
        strokeWidth: 1,
        rx: 3,
        ry: 3,
      });
      elements.push(seat);

      // Add student name if available
      if (studentNames[seatIndex]) {
        const nameLabel = new Text(studentNames[seatIndex], {
          fontSize: 8,
          fontWeight: "bold",
          fill: "#1e293b",
        });
        nameLabel.set({
          left: -seatOffset - seatSize - (nameLabel.width || 0) - 2,
          top: (tableHeight / (leftSeats + 1)) * (i + 1) - (nameLabel.height || 0) / 2,
        });
        elements.push(nameLabel);
      }
      seatIndex++;
    }

    // Right seats
    for (let i = 0; i < rightSeats && seatIndex < seatsCount; i++) {
      const seat = new Rect({
        left: tableWidth + seatOffset,
        top: (tableHeight / (rightSeats + 1)) * (i + 1) - seatSize / 2,
        fill: "#fbbf24",
        width: seatSize,
        height: seatSize,
        stroke: "#f59e0b",
        strokeWidth: 1,
        rx: 3,
        ry: 3,
      });
      elements.push(seat);

      // Add student name if available
      if (studentNames[seatIndex]) {
        const nameLabel = new Text(studentNames[seatIndex], {
          fontSize: 8,
          fontWeight: "bold",
          fill: "#1e293b",
        });
        nameLabel.set({
          left: tableWidth + seatOffset + seatSize + 2,
          top: (tableHeight / (rightSeats + 1)) * (i + 1) - (nameLabel.height || 0) / 2,
        });
        elements.push(nameLabel);
      }
      seatIndex++;
    }

    // Table number label (larger)
    const label = new Text(`#${tableNumber}`, {
      fontSize: 22,
      fontWeight: "bold",
      fill: "#ffffff",
    });

    label.set({
      left: tableWidth / 2 - (label.width || 0) / 2,
      top: (tableHeight * 0.7) / 2 - (label.height || 0) / 2 - 10,
    });
    elements.push(label);

    // Seat count label (smaller, below table number)
    const seatLabel = new Text(`${seatsCount} seats`, {
      fontSize: 14,
      fontWeight: "normal",
      fill: "#ffffff",
    });

    seatLabel.set({
      left: tableWidth / 2 - (seatLabel.width || 0) / 2,
      top: (tableHeight * 0.7) / 2 - (seatLabel.height || 0) / 2 + 15,
    });
    elements.push(seatLabel);

    const group = new Group(elements, {
      left: left,
      top: top,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: false,
    });

    // Store seat count as custom property
    (group as any).seatCount = seatsCount;
    (group as any).tableNumber = tableNumber;

    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
  };

  const addDesks = (amount: number) => {
    if (!fabricCanvas || amount < 1) return;

    const currentCount = deskCount;
    const tablesPerRow = 6;
    const tableWidth = 80;
    const tableHeight = 120;
    const spacing = 50;
    
    for (let i = 0; i < amount; i++) {
      const newTableNumber = currentCount + i + 1;
      const totalTables = currentCount + i;
      const col = totalTables % tablesPerRow;
      const row = Math.floor(totalTables / tablesPerRow);
      
      createTableWithSeats(
        newTableNumber,
        50 + col * (tableWidth + spacing),
        50 + row * (tableHeight + spacing),
        4
      );
    }
    
    setDeskCount(currentCount + amount);
    fabricCanvas.renderAll();

    toast({
      title: `${amount} table${amount > 1 ? 's' : ''} added! 🪑`,
      description: `Added ${amount} resizable table${amount > 1 ? 's' : ''} with 4 seats each`,
    });
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      fabricCanvas.remove(activeObject);
      fabricCanvas.renderAll();
      toast({
        title: "Table deleted",
        description: "The selected table has been removed",
      });
    } else {
      toast({
        title: "No table selected",
        description: "Please select a table first",
        variant: "destructive",
      });
    }
  };

  const handleMergeTables = () => {
    if (!fabricCanvas) return;
    const activeSelection = fabricCanvas.getActiveObjects();
    
    if (activeSelection.length < 2) {
      toast({
        title: "Select multiple tables",
        description: "Please select at least 2 tables to merge",
        variant: "destructive",
      });
      return;
    }

    // Calculate total seats
    let totalSeats = 0;
    let avgLeft = 0;
    let avgTop = 0;
    
    activeSelection.forEach((obj: any) => {
      totalSeats += obj.seatCount || 4;
      avgLeft += obj.left || 0;
      avgTop += obj.top || 0;
    });

    avgLeft = avgLeft / activeSelection.length;
    avgTop = avgTop / activeSelection.length;

    // Remove old tables
    activeSelection.forEach(obj => fabricCanvas.remove(obj));

    // Create new merged table
    const newTableNumber = deskCount + 1;
    createTableWithSeats(newTableNumber, avgLeft, avgTop, totalSeats);
    setDeskCount(newTableNumber);

    toast({
      title: "Tables merged! 🪑",
      description: `Created merged table with ${totalSeats} total seats`,
    });
  };

  const handleAddTable = () => {
    const seats = parseInt(seatCount);
    if (isNaN(seats) || seats < 1) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid number of seats (minimum 1)",
        variant: "destructive",
      });
      return;
    }
    
    // Add one table with specified seats
    const newTableNumber = deskCount + 1;
    const spacing = 50;
    const tableWidth = 80;
    const tableHeight = 120;
    const tablesPerRow = 6;
    
    const col = deskCount % tablesPerRow;
    const row = Math.floor(deskCount / tablesPerRow);
    
    createTableWithSeats(
      newTableNumber,
      50 + col * (tableWidth + spacing),
      50 + row * (tableHeight + spacing),
      seats
    );
    
    setDeskCount(newTableNumber);
    fabricCanvas?.renderAll();
    
    setIsDialogOpen(false);
    setSeatCount("");
    
    toast({
      title: "Table added! 🪑",
      description: `Added table #${newTableNumber} with ${seats} seat${seats > 1 ? 's' : ''}`,
    });
  };

  const generateAllDesks = () => {
    setIsGenerateDialogOpen(true);
  };

  const handleGenerate = () => {
    if (!fabricCanvas || !classData) return;

    const tables = parseInt(tableCount);
    const seatsPerTbl = parseInt(seatsPerTable);
    
    if (isNaN(tables) || tables < 1 || isNaN(seatsPerTbl) || seatsPerTbl < 1) {
      toast({
        title: "Invalid input",
        description: "Please enter valid numbers for tables and seats",
        variant: "destructive",
      });
      return;
    }

    const studentCount = classData.students?.length || 0;
    
    if (studentCount === 0) {
      toast({
        title: "No students yet",
        description: "Add students to your class first",
        variant: "destructive",
      });
      return;
    }

    // Clear existing layout
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8f9fa";
    
    // Get student names
    const studentNames = classData.students.map((s: any) => s.name || "Student");
    let studentIndex = 0;

    // Generate tables with students
    const tablesPerRow = 5;
    const tableWidth = 120;
    const tableHeight = 160;
    const spacing = 80;
    
    for (let i = 0; i < tables; i++) {
      const tableNumber = i + 1;
      const col = i % tablesPerRow;
      const row = Math.floor(i / tablesPerRow);
      
      // Get student names for this table
      const tableStudents = [];
      for (let j = 0; j < seatsPerTbl && studentIndex < studentCount; j++) {
        tableStudents.push(studentNames[studentIndex]);
        studentIndex++;
      }
      
      createTableWithSeats(
        tableNumber,
        50 + col * (tableWidth + spacing),
        50 + row * (tableHeight + spacing),
        seatsPerTbl,
        tableStudents
      );
    }
    
    setDeskCount(tables);
    fabricCanvas.renderAll();

    setIsGenerateDialogOpen(false);
    setTableCount("");
    setSeatsPerTable("");

    toast({
      title: "Layout generated! 🎉",
      description: `Created ${tables} tables with student names on seats`,
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
              Generate Seats for All Students
            </Button>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              <Square className="mr-2 h-4 w-4" />
              Add One Table
            </Button>
            <Button onClick={handleDeleteSelected} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            <Button onClick={handleMergeTables} variant="outline">
              <Merge className="mr-2 h-4 w-4" />
              Merge Selected
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
            Generate tables with student names, or add custom tables. Drag to move, resize with corners, and rotate. Press Delete to remove selected table.
            Total tables: {deskCount} | Students: {classData.students?.length || 0}
          </p>
        </Card>
      </div>

      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Seats for All Students</DialogTitle>
            <DialogDescription>
              Configure how many tables and seats per table you want for your {classData.students?.length || 0} students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableCount">Number of tables</Label>
              <Input
                id="tableCount"
                type="number"
                min="1"
                placeholder="Enter number of tables"
                value={tableCount}
                onChange={(e) => setTableCount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="seatsPerTable">Seats per table</Label>
              <Input
                id="seatsPerTable"
                type="number"
                min="1"
                placeholder="Enter seats per table (e.g., 4, 6)"
                value={seatsPerTable}
                onChange={(e) => setSeatsPerTable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGenerate();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add One Table</DialogTitle>
            <DialogDescription>
              How many seats should this table have? (How many students can sit at this table?)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="seatCount">Number of seats</Label>
              <Input
                id="seatCount"
                type="number"
                min="1"
                placeholder="Enter number of seats (e.g., 4, 6, 8)"
                value={seatCount}
                onChange={(e) => setSeatCount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTable();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LayoutEditor;
