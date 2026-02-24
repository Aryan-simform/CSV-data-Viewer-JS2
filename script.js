"use strict";
import { inferTypes, parseCSV, renderTable, } from "./utils.js";
//Date format is  YYYY-MM-DD

const state = {
    data: [],
    columns: [],
    page: 1,
    pageSize: 20,
    columnMeta: {}, // future: visibility, width, order
    sort: {
        column: "country",
        direction: "desc", //"asc" | "desc"
    },
    globalFilter: "new york"
};

function paginate(rows) {
    const start = (state.page - 1) * state.pageSize;
    return rows.slice(start, start + state.pageSize);
}

function visibleColumns() {
    return state.columns.filter(
        c => state.columnMeta[c]?.visible !== false
    );
}

function sortRows(rows) {
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

function filterRows(rows) {
    const q = state.globalFilter.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter(row => {
        return state.columns.some(col => {
            const v = row[col];
            if (v == null) return false;
            return String(v).toLowerCase().includes(q);
        });
    });
}

function setGlobalFilter(value){
  setState({
    globalFilter:value,
    page:1
  });
}
function toggleSort(column){
  const {column:current, direction} = state.sort;

  let nextDir = "asc";

  if(current===column){
    if(direction==="asc") nextDir="desc";
    else if(direction==="desc") nextDir=null;
  }

  setState({
    sort:{
      column: nextDir ? column : null,
      direction: nextDir
    },
    page:1
  });
}

/* ---------- STATE ---------- */
function setState(patch) {
    Object.assign(state, patch);
    render();
}

/* ---------- SELECTOR ---------- */
function getViewData() {
    let rows = state.data;

    rows = filterRows(rows);
    rows = sortRows(rows);
    const paged = paginate(rows);

    return {
        rows: paged,
        columns: visibleColumns(),
        total: rows.length
    };
}
/* ---------- RENDER ---------- */
function render() {
    const { rows, columns } = getViewData();
    renderTable(rows, columns,state.sort);
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

