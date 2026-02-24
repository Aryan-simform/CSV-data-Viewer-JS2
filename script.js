"use strict";
import { inferTypes, parseCSV, renderTable, } from "./utils.js";
//Date format is  YYYY-MM-DD

const state = {
    data: [],
    columns: [],
    page: 1,
    pageSize: 20,
    columnMeta: {} // future: visibility, width, order
};

/* ---------- STATE ---------- */
function setState(patch) {
    Object.assign(state, patch);
    render();
}

/* ---------- SELECTOR ---------- */
function getViewData() {
    const start = (state.page - 1) * state.pageSize;
    const rows = state.data.slice(start, start + state.pageSize);

    const visibleColumns = state.columns.filter(
        c => state.columnMeta[c]?.visible !== false
    );

    return { rows, columns: visibleColumns };
}

/* ---------- RENDER ---------- */
function render() {
    const { rows, columns } = getViewData();
    renderTable(rows, columns);
}
/* ---------- DATA PIPELINE ---------- */
function initData(csvText) {
    const clean = parseCSV(csvText);
    const typed = inferTypes(clean);

    const columns = Object.keys(typed[0] ?? {});
    const columnMeta = Object.fromEntries(
        columns.map(c => [c, { visible: true }])
    );

    setState({
        data: typed,
        columns,
        columnMeta,
        page: 1
    });
}
const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("change", async (e) => {
    try {
        // const [handle] = await showOpenFilePicker();
        const file = await e.target.files[0];
        if (!file) return;
        const data = await file.text();


        initData(data);

    } catch (err) {
        console.error(err);
    }
});

