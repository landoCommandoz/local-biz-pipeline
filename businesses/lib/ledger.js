/* Per-agent bookkeeping.
 *   sales.jsonl     - append-only revenue events
 *   expenses.jsonl  - append-only cost events
 *   ledger.json     - running P&L summary (always derivable from the two jsonl files)
 *
 * Safe to import. Does nothing until a method is called.
 */
const fs = require('fs');
const path = require('path');
const writeFileAtomic = require('write-file-atomic');

const BUSINESSES_DIR = path.resolve(__dirname, '..');

function ledgerFor(agentName) {
  const dir = path.join(BUSINESSES_DIR, agentName);
  if (!fs.existsSync(dir)) throw new Error(`[ledger] agent dir not found: ${dir}`);

  const salesPath = path.join(dir, 'sales.jsonl');
  const expensesPath = path.join(dir, 'expenses.jsonl');
  const ledgerPath = path.join(dir, 'ledger.json');

  function ensureFiles() {
    if (!fs.existsSync(salesPath)) fs.writeFileSync(salesPath, '', 'utf-8');
    if (!fs.existsSync(expensesPath)) fs.writeFileSync(expensesPath, '', 'utf-8');
    if (!fs.existsSync(ledgerPath)) {
      fs.writeFileSync(
        ledgerPath,
        JSON.stringify(emptyLedger(), null, 2) + '\n',
        'utf-8'
      );
    }
  }

  function emptyLedger() {
    return {
      since: new Date().toISOString(),
      income_total: 0,
      expense_total: 0,
      net: 0,
      sales_count: 0,
      expense_count: 0,
      last_sale_at: null,
      last_expense_at: null,
      last_reconciled_at: null,
      month_to_date: {
        month_key: new Date().toISOString().slice(0, 7),
        income: 0,
        expense: 0,
        net: 0
      }
    };
  }

  function readJSONL(p) {
    if (!fs.existsSync(p)) return [];
    const txt = fs.readFileSync(p, 'utf-8');
    return txt
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }

  function appendJSONL(p, obj) {
    fs.appendFileSync(p, JSON.stringify(obj) + '\n', 'utf-8');
  }

  async function reconcile() {
    ensureFiles();
    const sales = readJSONL(salesPath);
    const expenses = readJSONL(expensesPath);
    const monthKey = new Date().toISOString().slice(0, 7);

    const income_total = sales.reduce((s, r) => s + (Number(r.net || r.amount) || 0), 0);
    const expense_total = expenses.reduce((s, r) => s + (Number(r.amount) || 0), 0);
    const mtd_income = sales
      .filter((r) => (r.at || '').slice(0, 7) === monthKey)
      .reduce((s, r) => s + (Number(r.net || r.amount) || 0), 0);
    const mtd_expense = expenses
      .filter((r) => (r.at || '').slice(0, 7) === monthKey)
      .reduce((s, r) => s + (Number(r.amount) || 0), 0);

    const existing = fs.existsSync(ledgerPath)
      ? JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'))
      : emptyLedger();

    const next = {
      since: existing.since || new Date().toISOString(),
      income_total: Math.round(income_total * 100) / 100,
      expense_total: Math.round(expense_total * 100) / 100,
      net: Math.round((income_total - expense_total) * 100) / 100,
      sales_count: sales.length,
      expense_count: expenses.length,
      last_sale_at: sales.length ? sales[sales.length - 1].at : null,
      last_expense_at: expenses.length ? expenses[expenses.length - 1].at : null,
      last_reconciled_at: new Date().toISOString(),
      month_to_date: {
        month_key: monthKey,
        income: Math.round(mtd_income * 100) / 100,
        expense: Math.round(mtd_expense * 100) / 100,
        net: Math.round((mtd_income - mtd_expense) * 100) / 100
      }
    };
    await writeFileAtomic(ledgerPath, JSON.stringify(next, null, 2) + '\n', 'utf-8');
    return next;
  }

  return {
    ensureFiles,

    async recordSale(entry) {
      ensureFiles();
      const row = {
        at: entry.at || new Date().toISOString(),
        item_id: entry.item_id || null,
        item_name: entry.item_name || null,
        amount: entry.amount != null ? Number(entry.amount) : null,
        currency: entry.currency || 'USD',
        channel: entry.channel || null,
        transaction_id: entry.transaction_id || null,
        buyer_hint: entry.buyer_hint || null,
        gross: entry.gross != null ? Number(entry.gross) : Number(entry.amount || 0),
        fees: entry.fees != null ? Number(entry.fees) : 0,
        net: entry.net != null ? Number(entry.net) : Number(entry.amount || 0),
        note: entry.note || null
      };
      appendJSONL(salesPath, row);
      return reconcile();
    },

    async recordExpense(entry) {
      ensureFiles();
      const row = {
        at: entry.at || new Date().toISOString(),
        category: entry.category || 'infrastructure',
        item: entry.item || null,
        amount: entry.amount != null ? Number(entry.amount) : null,
        currency: entry.currency || 'USD',
        reference: entry.reference || null,
        note: entry.note || null
      };
      appendJSONL(expensesPath, row);
      return reconcile();
    },

    sales: () => readJSONL(salesPath),
    expenses: () => readJSONL(expensesPath),

    pnl() {
      ensureFiles();
      try {
        return JSON.parse(fs.readFileSync(ledgerPath, 'utf-8'));
      } catch {
        return emptyLedger();
      }
    },

    reconcile,

    async writeReport(slug, body) {
      const reportsDir = path.join(dir, 'reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
      const p = path.join(reportsDir, `${slug}.md`);
      fs.writeFileSync(p, body, 'utf-8');
      return p;
    }
  };
}

module.exports = { ledgerFor };
