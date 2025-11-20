interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: string;
}

export const CustomOrgChartEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: CustomEdgeProps) => {
  // Create a stepped path (vertical down, horizontal across, vertical down)
  // This mimics the org chart CSS with vertical and horizontal lines

  const midY = (sourceY + targetY) / 2;

  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${midY}
    L ${targetX} ${midY}
    L ${targetX} ${targetY}
  `;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          stroke: "#6366f1",
          strokeWidth: 2,
          fill: "none",
          ...style,
        }}
        markerEnd={markerEnd}
      />
    </>
  );
};
