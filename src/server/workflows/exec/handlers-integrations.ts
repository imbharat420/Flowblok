// Action & integration node handlers.
//
// External providers (email, SMS, Slack, Stripe) have no real credentials in
// this build, so these "execute" by resolving their parameters, logging the
// effect, and emitting an enriched item — the workflow still runs end-to-end
// and the run log shows exactly what would have been sent. Compute-ish nodes
// (loop, db) transform items locally.

import type { ExecItem } from "@/lib/types";
import { registerHandler, type NodeHandler } from "./handlers";

function mapItems(
  items: ExecItem[],
  fn: (item: ExecItem, i: number) => Record<string, unknown>,
): ExecItem[] {
  const src = items.length ? items : [{ json: {} }];
  return src.map((item, i) => ({ json: { ...item.json, ...fn(item, i) } }));
}

const sendEmail: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item) => {
      const to = String(getParam("to", item) ?? "");
      const subject = String(getParam("subject", item) ?? "");
      log(`email → ${to || "(no recipient)"} · "${subject}"`);
      return { _email: { to, subject, sent: true } };
    }),
  });

const sendSms: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item) => {
      const to = String(getParam("to", item) ?? "");
      log(`sms → ${to || "(no number)"}`);
      return { _sms: { to, sent: true } };
    }),
  });

const slack: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item) => {
      const channel = String(getParam("channel", item) ?? "#general");
      const message = String(getParam("message", item) ?? "");
      log(`slack ${channel}: ${message.slice(0, 60)}`);
      return { _slack: { channel, posted: true } };
    }),
  });

const dbWrite: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item) => {
      const table = String(getParam("table", item) ?? "");
      const operation = String(getParam("operation", item) ?? "insert");
      log(`db ${operation} → ${table || "(no table)"}`);
      return { _db: { table, operation, ok: true } };
    }),
  });

const crmLead: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item, i) => {
      const name = String(getParam("name", item) ?? "");
      const email = String(getParam("email", item) ?? "");
      log(`crm lead → ${name} <${email}>`);
      return { _lead: { id: `lead_${Date.now().toString(36)}${i}`, name, email } };
    }),
  });

const stripe: NodeHandler = ({ items, getParam, log }) =>
  ({
    items: mapItems(items, (item, i) => {
      const action = String(getParam("action", item) ?? "charge");
      const amount = Number(getParam("amount", item) ?? 0);
      log(`stripe ${action} · ${amount}`);
      return { _stripe: { id: `ch_${Date.now().toString(36)}${i}`, action, amount } };
    }),
  });

// Loop: passes items through to the loop body. Batch size is informational in
// this single-pass engine (full iterative batching is a Phase-4 follow-up).
const loop: NodeHandler = ({ items, getParam, log }) => {
  const batch = Number(getParam("batchSize", items[0]) ?? 1);
  log(`loop over ${items.length} item(s), batch ${batch}`);
  return { items };
};

registerHandler("send_email", sendEmail);
registerHandler("send_sms", sendSms);
registerHandler("slack", slack);
registerHandler("db_write", dbWrite);
registerHandler("crm_lead", crmLead);
registerHandler("stripe", stripe);
registerHandler("loop", loop);
