import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const Chart = () => {
  const [classCode, setClassCode] = useState("");
  const [showChart, setShowChart] = useState(false);
  const navigate = useNavigate();

  const handleViewChart = (e: React.FormEvent) => {
    e.preventDefault();
    const classes = JSON.parse(localStorage.getItem("classes") || "{}");
    
    if (classes[classCode]) {
      setShowChart(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            🥔 Potato Groups 🥔
          </h1>
          <p className="text-muted-foreground">View Seating Chart</p>
        </div>

        {!showChart ? (
          <form onSubmit={handleViewChart} className="space-y-4">
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
              View Chart
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Seating chart functionality will be available once your teacher creates a layout!
            </p>
            <Button onClick={() => setShowChart(false)} variant="outline" className="w-full">
              Back
            </Button>
          </div>
        )}

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

export default Chart;
