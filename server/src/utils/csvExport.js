/**
 * Converts an array of flat objects to a CSV string.
 * Handles values with commas, quotes, and newlines safely.
 */
const toCSV = (rows, columns) => {
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    return /[",\n\r]/.test(str) ? `"${str}"` : str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(","))
    .join("\n");

  return `${header}\n${body}`;
};

module.exports = { toCSV };
