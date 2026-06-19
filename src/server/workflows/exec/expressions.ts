// Expression evaluation for node parameters — n8n-style {{ ... }} templates.
//
// Inside an expression you can reference:
//   $json   — the current item's data object
//   $item   — the current item ({ json })
//   $now    — current ISO timestamp
//   $vars   — workflow/run variables (reserved; currently the trigger payload)
//
// SECURITY NOTE: expressions (and the Code node) execute author-written
// JavaScript on the server. This engine is for authenticated users with the
// `manage_workflows` capability authoring their own automations — the same
// trust model as n8n's Code node. The evaluator only *injects* a small scope
// and never passes Node globals in, but it is not a hardened sandbox.

import type { ExecItem } from "@/lib/types";

export interface ExprScope {
  item: ExecItem;
  now: string;
  vars: Record<string, unknown>;
}

function evalExpr(code: string, scope: ExprScope): unknown {
  // eslint-disable-next-line no-new-func
  const fn = new Function(
    "$json",
    "$item",
    "$now",
    "$vars",
    `"use strict"; return ( ${code} );`,
  );
  return fn(scope.item.json, scope.item, scope.now, scope.vars);
}

/**
 * Resolve a single parameter value. Strings may contain {{ expr }} templates:
 *  - a string that is exactly one expression returns the typed value
 *    ("{{ 1 + 2 }}" -> 3)
 *  - otherwise expressions are interpolated into the surrounding string
 *    ("Hi {{ $json.name }}" -> "Hi Ada")
 * Non-string values pass through untouched.
 */
export function resolveValue(value: unknown, scope: ExprScope): unknown {
  if (typeof value !== "string" || !value.includes("{{")) return value;

  // Whole-string single expression: the entire value is ONE {{ … }} with no
  // other delimiters inside (so "{{a}} text {{b}}" does NOT match here — it
  // falls through to interpolation below).
  const whole = value.match(/^\s*\{\{((?:(?!\}\})[\s\S])*)\}\}\s*$/);
  if (whole) {
    try {
      return evalExpr(whole[1], scope);
    } catch (err) {
      throw new Error(`Expression error in "${value.trim()}": ${(err as Error).message}`);
    }
  }

  return value.replace(/\{\{([\s\S]+?)\}\}/g, (_m, code: string) => {
    try {
      const out = evalExpr(code, scope);
      return out === undefined || out === null ? "" : String(out);
    } catch (err) {
      throw new Error(`Expression error in "{{${code}}}": ${(err as Error).message}`);
    }
  });
}

/** Resolve every value in a node's config against the given item. */
export function resolveParams(
  config: Record<string, unknown> | undefined,
  item: ExecItem,
  vars: Record<string, unknown>,
  now: string,
): Record<string, unknown> {
  const scope: ExprScope = { item, now, vars };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(config ?? {})) out[k] = resolveValue(v, scope);
  return out;
}
