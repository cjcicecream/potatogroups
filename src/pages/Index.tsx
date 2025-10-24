import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { UserCircle, Users, Layout } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent animate-fade-in">
            🥔 Potato Groups 🥔
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Smart seating charts that make everyone happy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Card 
            className="p-8 hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/teacher")}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <UserCircle className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold">Teacher Portal</h2>
              <p className="text-muted-foreground">
                Create classes, manage layouts, and generate seating charts
              </p>
              <Button className="w-full">Enter</Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/student")}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Users className="h-12 w-12 text-secondary" />
              </div>
              <h2 className="text-2xl font-semibold">Student Portal</h2>
              <p className="text-muted-foreground">
                Join your class and submit seating preferences
              </p>
              <Button variant="secondary" className="w-full">Enter</Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => navigate("/chart")}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Layout className="h-12 w-12 text-accent-foreground" />
              </div>
              <h2 className="text-2xl font-semibold">View Charts</h2>
              <p className="text-muted-foreground">
                See the current seating arrangements
              </p>
              <Button variant="outline" className="w-full">Enter</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
