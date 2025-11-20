import type { OrgChartNode, EmployeePath } from "@/types/employee.types";

export const flattenHierarchy = (root: OrgChartNode | null): OrgChartNode[] => {
  if (!root) return [];

  const result: OrgChartNode[] = [];
  const queue: OrgChartNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    if (node.children && Array.isArray(node.children)) {
      queue.push(...node.children);
    }
  }

  return result;
};

export const findNodeById = (
  root: OrgChartNode | null,
  id: number
): OrgChartNode | null => {
  if (!root) return null;
  if (root.id === id) return root;

  if (root.children && Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  return null;
};

/**
 * Get all descendants of a node (recursive)
 */
export const getAllDescendants = (node: OrgChartNode): number[] => {
  const descendants: number[] = [];

  const traverse = (n: OrgChartNode) => {
    if (n.children && Array.isArray(n.children)) {
      n.children.forEach((child) => {
        descendants.push(child.id);
        traverse(child);
      });
    }
  };

  traverse(node);
  return descendants;
};

/**
 * Calculate the depth/level of a node in the tree
 */
export const getNodeDepth = (root: OrgChartNode, targetId: number): number => {
  const helper = (node: OrgChartNode, depth: number): number => {
    if (node.id === targetId) return depth;

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = helper(child, depth + 1);
        if (found !== -1) return found;
      }
    }

    return -1;
  };

  return helper(root, 0);
};

/**
 * Get path from root to a specific node (breadcrumb)
 */
export const getPathToNode = (
  root: OrgChartNode | null,
  targetId: number
): OrgChartNode[] => {
  if (!root) return [];

  const path: OrgChartNode[] = [];

  const dfs = (node: OrgChartNode): boolean => {
    path.push(node);

    if (node.id === targetId) return true;

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (dfs(child)) return true;
      }
    }

    path.pop();
    return false;
  };

  dfs(root);
  return path;
};

export const buildReportingLineHierarchy = (
  path: EmployeePath[],
  subtree: OrgChartNode | null
): OrgChartNode | null => {
  if (!subtree) return null;
  if (path.length === 0) return subtree;

  if (path.length === 1 && path[0].id === subtree.id) {
    return subtree;
  }

  let currentNode: OrgChartNode | null = null;

  for (let i = path.length - 1; i >= 0; i--) {
    const pathNode = path[i];

    if (pathNode.id === subtree.id) {
      currentNode = subtree;
      continue;
    }

    const node: OrgChartNode = {
      id: pathNode.id,
      name: pathNode.name,
      title: pathNode.designation,
      level: pathNode.level,
      department: pathNode.department,
      departmentName: pathNode.departmentName,
      profileImage: pathNode.profileImage,
      status: 'active',
      managerId: i > 0 ? path[i - 1].id : null,
      directReportCount: 1,
      children: currentNode ? [currentNode] : [],
    };

    currentNode = node;
  }

  return currentNode;
};
