import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/events", label: "Events" },
    { path: "/students", label: "Students" },
    { path: "/attendance", label: "Attendance" },
    { path: "/feedback", label: "Feedback" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-1">
            <h1 className="text-xl font-bold text-foreground">Campus Events</h1>
          </div>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;