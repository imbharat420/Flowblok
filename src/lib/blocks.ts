// Immutable helpers for navigating/editing a BlockNode tree by path.
// A path is an array of child indices from the root (root itself = []).

import type { BlockNode } from "@/lib/types";

export type Path = number[];

export function pathEq(a: Path | null, b: Path | null): boolean {
  if (!a || !b) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function getNode(root: BlockNode, path: Path): BlockNode | null {
  let node: BlockNode = root;
  for (const idx of path) {
    const child = node.children?.[idx];
    if (!child) return null;
    node = child;
  }
  return node;
}

export function updateNode(root: BlockNode, path: Path, patch: Partial<BlockNode>): BlockNode {
  const clone: BlockNode = structuredClone(root);
  if (path.length === 0) return { ...clone, ...patch };
  let node = clone;
  for (let i = 0; i < path.length - 1; i++) node = node.children![path[i]];
  const last = path[path.length - 1];
  node.children![last] = { ...node.children![last], ...patch };
  return clone;
}

export function updateProps(
  root: BlockNode,
  path: Path,
  props: Record<string, unknown>,
): BlockNode {
  const node = getNode(root, path);
  if (!node) return root;
  return updateNode(root, path, { props: { ...node.props, ...props } });
}

export function addChild(root: BlockNode, parentPath: Path, child: BlockNode): BlockNode {
  const clone: BlockNode = structuredClone(root);
  let node = clone;
  for (const idx of parentPath) node = node.children![idx];
  node.children = [...(node.children ?? []), child];
  return clone;
}

export function removeNode(root: BlockNode, path: Path): BlockNode {
  if (path.length === 0) return root; // never remove root
  const clone: BlockNode = structuredClone(root);
  let node = clone;
  for (let i = 0; i < path.length - 1; i++) node = node.children![path[i]];
  node.children!.splice(path[path.length - 1], 1);
  return clone;
}
