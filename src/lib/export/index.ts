/**
 * Universal Marketing Export Engine
 * Provides client-side helpers to export marketing deliverables to CSV, Markdown, and JSON.
 * Includes UTF-8 BOM (\uFEFF) for seamless opening in Microsoft Excel with Thai text.
 */

export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports an array of objects to a CSV file with UTF-8 BOM for Thai Excel compatibility
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === "object") {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 text (Thai, etc.) without garbling
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  downloadFile(csvContent, filename.endsWith(".csv") ? filename : `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Exports text or markdown document
 */
export function exportToMarkdown(content: string, filename: string) {
  downloadFile(content, filename.endsWith(".md") ? filename : `${filename}.md`, "text/markdown;charset=utf-8;");
}

/**
 * Exports formatted JSON
 */
export function exportToJSON(data: any, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, filename.endsWith(".json") ? filename : `${filename}.json`, "application/json;charset=utf-8;");
}
