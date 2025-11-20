import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/slices/auth.slice';
import {
  fetchHierarchyAsync,
  fetchMyTeamHierarchyAsync,
  clearTeamHierarchy,
  updateEmployeeManagerAsync,
  fetchEmployeeByIdAsync
} from '@/slices/employee.slice';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OrgChart } from '@/components/org-chart/OrgChart';
import type { OrgChartNode } from '@/types/employee.types';
import { Users, Building2, LogOut, Loader2, Network, User } from 'lucide-react';
import { APP_TITLE, LABELS, ERROR_MESSAGES, VIEW_MODES, ROUTES } from '@/constants/app.constants';
import { flattenHierarchy, buildReportingLineHierarchy } from '@/utils/hierarchy.utils';

type ViewMode = 'myTeam' | 'all';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const { hierarchy, employeePath, employeeSubtree, selectedEmployee, isLoading, error } = useAppSelector((state) => state.employee);
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.ALL as ViewMode);

  // Fetch current user's employee details
  useEffect(() => {
    if (user?.employeeId && token) {
      dispatch(fetchEmployeeByIdAsync({ employeeId: user.employeeId, token }));
    }
  }, [dispatch, user?.employeeId, token]);

  // Fetch data based on view mode
  useEffect(() => {
    if (!token) return;

    if (viewMode === VIEW_MODES.MY_TEAM) {
      if (user?.employeeId) {
        dispatch(fetchMyTeamHierarchyAsync({ employeeId: user.employeeId, token }));
      } else {
        dispatch(fetchHierarchyAsync(token));
      }
    } else if (viewMode === VIEW_MODES.ALL) {
      dispatch(clearTeamHierarchy());
      dispatch(fetchHierarchyAsync(token));
    }
  }, [dispatch, token, viewMode, user?.employeeId]);

  const reportingLineHierarchy = useMemo(() => {
    if (viewMode === VIEW_MODES.MY_TEAM && employeePath && employeePath.length > 0 && employeeSubtree) {
      return buildReportingLineHierarchy(employeePath, employeeSubtree);
    }
    return null;
  }, [employeePath, employeeSubtree, viewMode]);

  const displayHierarchy = viewMode === VIEW_MODES.MY_TEAM ? reportingLineHierarchy : hierarchy;

  const handleLogout = () => {
    dispatch(logout());
    navigate(ROUTES.LOGIN);
  };

  const handleEmployeeClick = (_employee: OrgChartNode) => {
    // Handle employee click
  };

  const handleReassignEmployee = async (employeeId: number, newManagerId: number | null) => {
    if (!token) {
      return;
    }
    
    try {
      await dispatch(updateEmployeeManagerAsync({ 
        employeeId, 
        managerId: newManagerId, 
        token 
      })).unwrap();
      
      if (viewMode === VIEW_MODES.MY_TEAM && user?.employeeId) {
        await dispatch(fetchMyTeamHierarchyAsync({ employeeId: user.employeeId, token })).unwrap();
      } else {
        await dispatch(fetchHierarchyAsync(token)).unwrap();
      }
    } catch {
      // TODO: Show error toast
    }
  };

  // Calculate stats based on current view
  const flatEmployees = displayHierarchy ? flattenHierarchy(displayHierarchy) : [];
  const totalEmployees = flatEmployees.length;
  const departmentCount = new Set(flatEmployees.map((e) => e.department)).size;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm z-50 shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">{APP_TITLE.MAIN}</h1>
              <p className="text-sm text-muted-foreground">{LABELS.ORGANIZATION_HIERARCHY}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {selectedEmployee?.name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedEmployee?.designation?.title || user?.role}
                {selectedEmployee?.designation?.department && ` • ${selectedEmployee.designation.department.name}`}
              </p>
            </div>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        {/* Organization Chart - Full Width */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
          {/* View Toggle - Floating in top left */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
            <Button
              variant={viewMode === VIEW_MODES.ALL ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(VIEW_MODES.ALL as ViewMode)}
              className="gap-2"
            >
              <Network className="w-4 h-4" />
              {LABELS.ALL_EMPLOYEES}
            </Button>
            <Button
              variant={viewMode === VIEW_MODES.MY_TEAM ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(VIEW_MODES.MY_TEAM as ViewMode)}
              className="gap-2"
              disabled={!user?.employeeId}
            >
              <User className="w-4 h-4" />
              {LABELS.MY_REPORTING_LINE}
            </Button>
          </div>

          {/* Stats Badges - Floating in top right */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{LABELS.EMPLOYEES}</p>
                  <p className="text-lg font-bold text-foreground">{totalEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">{LABELS.DEPARTMENTS}</p>
                  <p className="text-lg font-bold text-foreground">{departmentCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Content */}
          <div className="flex-1 overflow-hidden">
            {isLoading && !displayHierarchy ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    {ERROR_MESSAGES.LOADING_CHART}
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-destructive">
                <div className="text-center space-y-2">
                  <p className="font-medium">{ERROR_MESSAGES.ERROR_LOADING_CHART}</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : (
              <OrgChart 
                key={viewMode}
                root={displayHierarchy} 
                onEmployeeClick={handleEmployeeClick}
                currentUserId={user?.employeeId?.toString()}
                onReassignEmployee={handleReassignEmployee}
                currentUserRole={user?.role}
              />
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
