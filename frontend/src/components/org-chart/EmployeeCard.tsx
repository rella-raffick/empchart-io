import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { OrgChartNode } from "@/types/employee.types";
import { LABELS } from "@/constants/app.constants";

interface EmployeeCardProps {
  employee: OrgChartNode;
  onClick?: () => void;
  canDrag?: boolean;
  isDropTarget?: boolean;
  isActiveDropTarget?: boolean;
  isBeingDragged?: boolean;
}

export const EmployeeCard = ({
  employee,
  onClick,
  canDrag,
  isDropTarget,
  isActiveDropTarget,
  isBeingDragged,
}: EmployeeCardProps) => {
  const initials = employee.name
    ? employee.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NA";

  return (
    <Card
      className={`employee-card w-64 transition-all duration-200 bg-card/90 backdrop-blur-sm border-2 ${
        isBeingDragged
          ? "opacity-50 cursor-grabbing border-primary shadow-2xl"
          : isActiveDropTarget
          ? "border-emerald-500 shadow-2xl scale-105 bg-emerald-500/10 ring-4 ring-emerald-500/30"
          : isDropTarget
          ? "border-emerald-400 bg-emerald-400/5 ring-2 ring-emerald-400/20 shadow-lg"
          : canDrag
          ? "cursor-grab hover:shadow-xl hover:-translate-y-1 border-border hover:border-primary/50"
          : "hover:shadow-lg hover:-translate-y-0.5 border-border"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex flex-col items-center gap-3 relative">
        {/* Avatar with level badge */}
        <div className="relative">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={employee.profileImage} alt={employee.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Level Badge - Custom CSS for purple glow */}
          {employee.level && (
            <div className="level-badge absolute -top-1 -right-1 w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-background">
              {employee.level}
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="text-center space-y-1 w-full">
          <h3 className="font-semibold text-base text-foreground truncate">
            {employee.name || LABELS.UNKNOWN_EMPLOYEE}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {employee.title || LABELS.NO_TITLE}
          </p>
          {/* Department Badge */}
          {employee.departmentName && (
            <div className="flex justify-center mt-2">
              <Badge
                variant="secondary"
                className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <span className="text-xs font-medium">{employee.departmentName}</span>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
