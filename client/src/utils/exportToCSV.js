/**
 * Converts an array of objects into CSV format and triggers a client-side browser download.
 * 
 * @param {Array<Object>} data - The dataset to export.
 * @param {string} filename - The desired download filename (e.g., 'attendance.csv').
 * @param {Array<Object|string>} headers - Array of header definitions ({ label, key }) or key strings.
 */
export const exportToCSV = (data, filename = 'export.csv', headers = null) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  let csvRows = [];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const str = String(value);
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return `"${str}"`;
  };

  if (headers && Array.isArray(headers) && headers.length > 0) {
    if (typeof headers[0] === 'object') {
      const headerRow = headers.map(h => escapeCSV(h.label)).join(',');
      csvRows.push(headerRow);

      data.forEach(item => {
        const row = headers.map(h => {
          if (typeof h.key === 'function') {
            return escapeCSV(h.key(item));
          }
          return escapeCSV(item[h.key]);
        });
        csvRows.push(row.join(','));
      });
    } else {
      const headerRow = headers.map(h => escapeCSV(h)).join(',');
      csvRows.push(headerRow);

      data.forEach(item => {
        const row = headers.map(h => escapeCSV(item[h]));
        csvRows.push(row.join(','));
      });
    }
  } else {
    const keys = Object.keys(data[0]);
    csvRows.push(keys.map(escapeCSV).join(','));

    data.forEach(item => {
      const row = keys.map(k => escapeCSV(item[k]));
      csvRows.push(row.join(','));
    });
  }

  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportToCSV;
