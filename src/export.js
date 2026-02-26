import { state } from "./state.js";
import { filterRows, visibleColumns } from "./selectors.js";

//export functions 
function getExportRows() {
    let rows = state.data;
    rows = filterRows(rows);
    return rows;
}

function buildExportData() {
    const rows = getExportRows();
    const col = visibleColumns();
    return rows.map(r => {
        const obj = {};
        col.forEach(c => {
            obj[c] = r[c];
        });
        return obj;
    });
}

export function exportJSON() {
    const data = buildExportData();
    const blob = new Blob(
        [JSON.stringify(data, null, 2)], { type: "application/json" }
    );
    downloadBlob(blob, "data.json");
}

function toCSV(data) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);

    const rows = data.map(row =>
        headers.map(h => {
            const v = row[h] ?? "";
            const s = String(v).replace(/"/g, '""');
            return `"${s}"`;
        }).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
}

export function exportCSV() {
    const data = buildExportData();
    const csvData = toCSV(data);
    const blob = new Blob(
        [csvData],
        { type: "text/csv" }
    );

    downloadBlob(blob, "data.csv");
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(blob);
}