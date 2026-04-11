const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function readCSV(filePath) {
  const absPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(absPath)) return [];

  const content = fs.readFileSync(absPath, 'utf-8').trim();
  if (!content) return [];

  const lines = content.split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function escapeCSV(value) {
  const str = String(value || '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function writeCSV(filePath, rows, columns) {
  const absPath = path.resolve(__dirname, filePath);
  const header = columns.join(',');
  const lines = rows.map(row =>
    columns.map(col => escapeCSV(row[col])).join(',')
  );
  fs.writeFileSync(absPath, [header, ...lines].join('\n') + '\n', 'utf-8');
}

module.exports = { readCSV, writeCSV };
