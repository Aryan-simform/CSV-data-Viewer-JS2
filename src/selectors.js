import { state } from "./state.js";
export function getViewData() {
    let rows = state.data;

    rows = filterRows(rows);
    rows = sortRows(rows);
    const paged = paginate(rows);

    return {
        rows: paged,
        columns: visibleColumns(),
        total: rows.length,
    };
}
export function paginate(rows) {
    const start = (state.page - 1) * state.pageSize;
    return rows.slice(start, start + state.pageSize);
}
export function sortRows(rows) {
    const { column, direction } = state.sort;
    if (!column || !direction) return rows;

    const sorted = [...rows].sort((a, b) => {
        let va = a[column];
        let vb = b[column];

        if (va == null) return 1;
        if (vb == null) return -1;

        // numeric
        if (typeof va === "number" && typeof vb === "number") {
            return direction === "asc" ? va - vb : vb - va;
        }

        // date (ISO string safe)
        const da = Date.parse(va);
        const db = Date.parse(vb);
        if (!Number.isNaN(da) && !Number.isNaN(db)) {
            return direction === "asc" ? da - db : db - da;
        }

        // string
        return direction === "asc"
            ? String(va).localeCompare(String(vb))
            : String(vb).localeCompare(String(va));
    });

    return sorted;
}

export function filterRows(rows) {
    const q = state.globalFilter.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
        return state.columns.some((col) => {
            const v = row[col];
            if (v == null) return false;
            return String(v).toLowerCase().includes(q);
        });
    });
}

export function visibleColumns() {
    return state.columns.filter((c) => state.columnMeta[c]?.visible !== false);
}

export function getAnalysisRows(){
    let rows = state.data;
    rows= filterRows(rows)
    return rows;
}