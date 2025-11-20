import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  Position,
  Handle,
  type Node,
  type Edge,
  ConnectionLineType,
  ReactFlowProvider,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { EmployeeCard } from "./EmployeeCard";
import { CustomOrgChartEdge } from "./CustomEdge";
import type { OrgChartNode } from "@/types/employee.types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react";
import { canDragAndDrop, canReassignToManager, roleToLevel, type UserRole, type EmployeeLevel } from "@/utils/levelValidation.utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ORG_CHART_LAYOUT, ZOOM_CONFIG } from "@/constants/defaults.constants";
import { BUTTON_LABELS, CONFIRMATION_MESSAGES, ERROR_MESSAGES } from "@/constants/app.constants";

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: false,
  style: {
    stroke: '#6366f1',
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
  },
};

interface OrgChartProps {
  root: OrgChartNode | null;
  onEmployeeClick?: (employee: OrgChartNode) => void;
  currentUserId?: string;
  onReassignEmployee?: (employeeId: number, newManagerId: number | null) => void;
  currentUserRole?: UserRole;
}

// Custom node component wrapper
const EmployeeNodeComponent = ({ data }: { data: any }) => {
  return (
    <div className="employee-node" style={{ pointerEvents: 'auto' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <EmployeeCard
        employee={data.employee}
        onClick={data.onClick}
        canDrag={data.canDrag}
        isDropTarget={data.isDropTarget}
        isBeingDragged={data.isBeingDragged}
      />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = {
  employee: EmployeeNodeComponent,
};

const edgeTypes = {
  orgchart: CustomOrgChartEdge,
};

const convertHierarchyToFlow = (
  root: OrgChartNode,
  onEmployeeClick?: (employee: OrgChartNode) => void
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const { NODE_WIDTH, NODE_HEIGHT, HORIZONTAL_SPACING, VERTICAL_SPACING } = ORG_CHART_LAYOUT;

  const getSubtreeWidth = (node: OrgChartNode): number => {
    if (!node.children || node.children.length === 0) {
      return NODE_WIDTH;
    }

    const childrenWidth = node.children.reduce((sum, child) => {
      return sum + getSubtreeWidth(child);
    }, 0);

    const spacingWidth = (node.children.length - 1) * HORIZONTAL_SPACING;
    return Math.max(NODE_WIDTH, childrenWidth + spacingWidth);
  };

  const positionNode = (
    node: OrgChartNode,
    x: number,
    y: number,
    parentId?: string
  ) => {
    const nodeId = `node-${node.id}`;
    const subtreeWidth = getSubtreeWidth(node);
    const nodeX = x + subtreeWidth / 2 - NODE_WIDTH / 2;

    nodes.push({
      id: nodeId,
      type: "employee",
      position: { x: nodeX, y },
      data: {
        employee: node,
        onClick: () => onEmployeeClick?.(node),
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      draggable: false, // Will be set dynamically based on permissions
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: "orgchart",
        animated: false,
        style: {
          stroke: "#6366f1",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#6366f1",
        },
      });
    }

    if (node.children && node.children.length > 0) {
      let currentX = x;
      const childY = y + NODE_HEIGHT + VERTICAL_SPACING;

      node.children.forEach((child) => {
        const childSubtreeWidth = getSubtreeWidth(child);
        positionNode(child, currentX, childY, nodeId);
        currentX += childSubtreeWidth + HORIZONTAL_SPACING;
      });
    }
  };

  positionNode(root, 0, 0);

  return { nodes, edges };
};

const CustomControls = () => {
  const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const updateZoom = () => {
      const viewport = getViewport();
      setZoom(Math.round(viewport.zoom * 100));
    };

    updateZoom();
    const interval = setInterval(updateZoom, 100);
    return () => clearInterval(interval);
  }, [getViewport]);

  return (
    <div className="fixed bottom-8 right-8 z-50 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-xl">
      <div className="flex flex-col gap-1 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomIn()}
          className="h-10 w-10 hover:bg-primary/10"
          title={BUTTON_LABELS.ZOOM_IN}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoomOut()}
          className="h-10 w-10 hover:bg-primary/10"
          title={BUTTON_LABELS.ZOOM_OUT}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <div className="border-t border-border my-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => fitView()}
          className="h-10 w-10 hover:bg-primary/10"
          title={BUTTON_LABELS.RESET_VIEW}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>

        <div className="border-t border-border my-1" />

        <div className="px-2 py-1 text-xs font-medium text-center text-muted-foreground">
          {zoom}%
        </div>
      </div>
    </div>
  );
};

const OrgChartInner = ({ root, onEmployeeClick, currentUserId, onReassignEmployee, currentUserRole }: OrgChartProps) => {
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);
  const [dropTargetId, setDropTargetId] = useState<number | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const [hasZoomedToUser, setHasZoomedToUser] = useState(false);
  const [pendingReassignment, setPendingReassignment] = useState<{
    draggedId: number;
    targetId: number;
    draggedEmployee: OrgChartNode;
    targetEmployee: OrgChartNode;
  } | null>(null);

  const userLevel = currentUserRole ? roleToLevel(currentUserRole) : null;
  const { fitView } = useReactFlow();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!root) return { nodes: [], edges: [] };
    return convertHierarchyToFlow(root, onEmployeeClick);
  }, [root, onEmployeeClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Initial zoom to current user's card (only once)
  useEffect(() => {
    if (!hasZoomedToUser && currentUserId && nodes.length > 0) {
      const currentUserNode = nodes.find(node => {
        const employee = node.data?.employee as OrgChartNode;
        return employee?.id.toString() === currentUserId;
      });

      if (currentUserNode) {
        // Wait a bit for the chart to render, then zoom to user
        setTimeout(() => {
          fitView({
            nodes: [currentUserNode],
            duration: 800,
            padding: 0.5,
            maxZoom: 1.2,
          });
          setHasZoomedToUser(true);
        }, 100);
      } else {
        // If user not found, just fit view normally
        setHasZoomedToUser(true);
      }
    }
  }, [currentUserId, nodes, hasZoomedToUser, fitView]);

  // Update nodes with drag permissions and visual states
  useEffect(() => {
    const updatedNodes = initialNodes.map((node) => {
      const employee = node.data?.employee as OrgChartNode;
      if (!employee) return node;

      const isCurrentUser = currentUserId && employee.id.toString() === currentUserId;

      // Check if current user can drag this employee
      const canDrag = userLevel && !isCurrentUser
        ? canDragAndDrop(userLevel, employee.level as EmployeeLevel)
        : false;

      // Check if this is a valid drop target (show all valid targets while dragging)
      let isValidDropTarget = false;
      if (draggedNode && userLevel) {
        const draggedEmployee = draggedNode.data?.employee as OrgChartNode | undefined;

        if (draggedEmployee && draggedEmployee.id !== employee.id) {
          isValidDropTarget = canReassignToManager(
            userLevel,
            draggedEmployee.level as EmployeeLevel,
            employee.level as EmployeeLevel
          );
        }
      }

      // Check if this node is the current active drop target (being hovered over)
      const isActiveDropTarget = dropTargetId === employee.id;

      return {
        ...node,
        draggable: canDrag,
        data: {
          ...node.data,
          canDrag,
          isDropTarget: isValidDropTarget, // Show all valid targets
          isActiveDropTarget: isActiveDropTarget, // Highlight the one being hovered
          isBeingDragged: draggedNode?.id === node.id,
        },
      };
    });
    setNodes(updatedNodes);
  }, [initialNodes, draggedNode, dropTargetId, setNodes, userLevel, currentUserId]);

  // Handle drag start
  const onNodeDragStart: NodeMouseHandler = useCallback((_event: React.MouseEvent, node: Node) => {
    setDraggedNode(node);
  }, []);

  // Handle drag - detect overlaps during drag
  const onNodeDrag: NodeMouseHandler = useCallback((_event: React.MouseEvent, node: Node) => {
    // Find overlapping nodes based on position
    const draggedRect = {
      x: node.position.x,
      y: node.position.y,
      width: 256, // w-64 = 256px
      height: 180, // approximate card height
    };

    // Find if dragged node overlaps with any other node
    let foundOverlap = false;
    for (const otherNode of nodes) {
      if (otherNode.id === node.id) continue;

      const otherRect = {
        x: otherNode.position.x,
        y: otherNode.position.y,
        width: 256,
        height: 180,
      };

      // Check for overlap
      const overlaps = !(
        draggedRect.x + draggedRect.width < otherRect.x ||
        draggedRect.x > otherRect.x + otherRect.width ||
        draggedRect.y + draggedRect.height < otherRect.y ||
        draggedRect.y > otherRect.y + otherRect.height
      );

      if (overlaps) {
        const draggedEmployee = node.data?.employee as OrgChartNode;
        const otherEmployee = otherNode.data?.employee as OrgChartNode;

        // Check if this is a valid drop target
        if (draggedEmployee && otherEmployee && userLevel) {
          const isValid = canReassignToManager(
            userLevel,
            draggedEmployee.level as EmployeeLevel,
            otherEmployee.level as EmployeeLevel
          );

          if (isValid) {
            console.log('Valid drop target found:', otherEmployee.name);
            setDropTargetId(otherEmployee.id);
            foundOverlap = true;
            break;
          }
        }
      }
    }

    if (!foundOverlap) {
      setDropTargetId(null);
    }
  }, [nodes, userLevel]);

  // Handle drag stop
  const onNodeDragStop: NodeMouseHandler = useCallback((_event: React.MouseEvent, node: Node) => {
    const draggedEmployee = node.data?.employee as OrgChartNode;

    console.log('Drag stopped. Drop target ID:', dropTargetId);

    // If dropped on a valid target, show confirmation
    if (dropTargetId && draggedEmployee && onReassignEmployee) {
      const targetNode = nodes.find(n => {
        const emp = n.data?.employee as OrgChartNode;
        return emp?.id === dropTargetId;
      });

      if (targetNode) {
        const targetEmployee = targetNode.data?.employee as OrgChartNode;

        console.log('Attempting reassignment:', {
          from: draggedEmployee.name,
          to: targetEmployee.name,
        });

        if (targetEmployee && draggedEmployee.id !== targetEmployee.id) {
          setPendingReassignment({
            draggedId: draggedEmployee.id,
            targetId: targetEmployee.id,
            draggedEmployee,
            targetEmployee,
          });
        }
      }
    }

    setDraggedNode(null);
    setDropTargetId(null);
  }, [dropTargetId, nodes, onReassignEmployee]);

  const handleConfirmReassignment = async () => {
    if (pendingReassignment && onReassignEmployee) {
      setIsReassigning(true);
      try {
        await onReassignEmployee(pendingReassignment.draggedId, pendingReassignment.targetId);
      } finally {
        setIsReassigning(false);
        setPendingReassignment(null);
      }
    }
  };

  const handleCancelReassignment = () => {
    if (!isReassigning) {
      setPendingReassignment(null);
    }
  };

  if (!root) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {ERROR_MESSAGES.NO_ORG_DATA}
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full h-full border border-border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          minZoom={ZOOM_CONFIG.MIN_ZOOM}
          maxZoom={ZOOM_CONFIG.MAX_ZOOM}
          proOptions={{ hideAttribution: true }}
          elementsSelectable={true}
          nodesConnectable={false}
          nodesDraggable={true}
          panOnDrag={true}
          panOnScroll={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
        >
          <Background color="hsl(var(--muted-foreground))" gap={20} size={1} />
          <CustomControls />
        </ReactFlow>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingReassignment} onOpenChange={(open) => !open && handleCancelReassignment()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CONFIRMATION_MESSAGES.REASSIGNMENT_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReassignment && (
                <>
                  Are you sure you want to reassign <strong>{pendingReassignment.draggedEmployee.name}</strong> to report to <strong>{pendingReassignment.targetEmployee.name}</strong>?
                  <br /><br />
                  This will change the organizational hierarchy.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelReassignment} disabled={isReassigning}>
              {BUTTON_LABELS.CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReassignment} disabled={isReassigning}>
              {isReassigning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {BUTTON_LABELS.PROCESSING}
                </>
              ) : (
                BUTTON_LABELS.CONFIRM
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Loading Overlay */}
      {isReassigning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-100">
          <div className="bg-card p-8 rounded-lg shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-lg font-medium">{CONFIRMATION_MESSAGES.UPDATING_ORG_CHART}</p>
          </div>
        </div>
      )}
    </>
  );
};

export const OrgChart = (props: OrgChartProps) => {
  return (
    <ReactFlowProvider>
      <OrgChartInner {...props} />
    </ReactFlowProvider>
  );
};
