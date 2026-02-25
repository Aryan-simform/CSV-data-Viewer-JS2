"use strict";
import { inferTypes, parseCSV, renderTable,formatColumnLabel } from "./utils.js";
//Date format is  YYYY-MM-DD

const state = {
    data: [],
    columns: [],
    page: 1,
    pageSize: 25,
    columnMeta: {

    }, // future: visibility, width, order
    sort: {
        column: "",
        direction: "", //"asc" | "desc"
    },
    globalFilter: "",
};
function reset() {
    setState({
        sort: { column: "", direction: "" },
        globalFilter: "",
        page: 1,
        pageSize: 25,
    });
}
function paginate(rows) {
    const start = (state.page - 1) * state.pageSize;
    return rows.slice(start, start + state.pageSize);
}

function showAllColumns(){
  const meta = Object.fromEntries(
    state.columns.map(c=>[c,{visible:true}])
  );

  setState({columnMeta:meta});
}
function visibleColumns() {
    return state.columns.filter((c) => state.columnMeta[c]?.visible !== false);
}
function toggleColumn(col){
  const current = state.columnMeta[col]?.visible !== false;

  const visibleCount = Object.values(state.columnMeta)
    .filter(m=>m.visible!==false).length;

  if(visibleCount===1 && current) return;

  setState({
    columnMeta:{
      ...state.columnMeta,
      [col]:{
        ...state.columnMeta[col],
        visible: !current
      }
    }
  });
}
function renderColumnPanel(){
  const list = document.getElementById("columnList");
  if(!list) return;

  list.innerHTML="";

  state.columns.forEach(col=>{
    const label = document.createElement("label");

    const input = document.createElement("input");
    input.type="checkbox";
    input.checked = state.columnMeta[col]?.visible !== false;

    input.dataset.action="toggleColumn";
    input.dataset.col=col;

    label.append(input," ",formatColumnLabel(col));
    list.appendChild(label);
  });
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

    return rows.filter((row) => {
        return state.columns.some((col) => {
            const v = row[col];
            if (v == null) return false;
            return String(v).toLowerCase().includes(q);
        });
    });
}

function setGlobalFilter(value) {
    setState({
        globalFilter: value,
        page: 1,
    });
}

function toggleSort(column) {
    const { column: current, direction } = state.sort;

    let nextDir = "asc";

    if (current === column) {
        if (direction === "asc") nextDir = "desc";
        else if (direction === "desc") nextDir = "";
    }

    setState({
        sort: {
            column: nextDir ? column : "",
            direction: nextDir,
        },
        page: 1,
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
        total: rows.length,
    };
}
/* ---------- RENDER ---------- */
function render() {
    const { rows, columns, total } = getViewData();
    renderTable(rows, columns, state.sort);
    renderColumnPanel()
    updatePageInfo(total);
}

function updatePageInfo(total) {
    const info = document.getElementById("pageInfo");
    if (!info) return;

    const max = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > max) {
        setState({ page: max });
        return;
    }
    info.textContent = `Page ${state.page} / ${max}`;
}

/* ---------- DATA PIPELINE ---------- */
function initData(csvText) {
    const clean = parseCSV(csvText);
    const typed = inferTypes(clean);

    const columns = Object.keys(typed[0] ?? {});
    const columnMeta = Object.fromEntries(
        columns.map((c) => [c, { visible: true }]),
    );

    setState({
        data: typed,
        columns,
        columnMeta,
        page: 1,
    });
}

const searchInput = document.getElementById("searchInput");
const pageSizeSel = document.getElementById("pageSize");
const resetBtn = document.getElementById("resetBtn");
const uploadBtn = document.getElementById("uploadBtn");
const thead = document.getElementById("dthead");
resetBtn.addEventListener("click", reset);
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

thead.addEventListener("click", (e) => {
    const th = e.target.closest("th");
    if (!th) return;

    const col = th.dataset.col;
    if (!col) return;

    toggleSort(col);
});

searchInput.addEventListener("input", (e) => {
    setGlobalFilter(e.target.value);
});

pageSizeSel.addEventListener("change", (e) => {
    setState({ pageSize: Number(e.target.value), page: 1 });
});

document.body.addEventListener("click", (e) => {
    if (e.target.id === "prevPage") {
        if (state.page > 1) setState({ page: state.page - 1 });
    }

    if (e.target.id === "nextPage") {
        const total = getViewData().total;
        const max = Math.ceil(total / state.pageSize);
        if (state.page < max) setState({ page: state.page + 1 });
    }

    if (e.target.id === "resetBtn") {
        reset();
    }
});

const toggleColumnsBtn = document.getElementById("toggleColumns");
const columnPanel = document.getElementById("columnPanel");

toggleColumnsBtn.addEventListener("click",()=>{
  columnPanel.hidden = !columnPanel.hidden;
});


document.addEventListener("change",(e)=>{
  const el = e.target.closest("[data-action]");
  if(!el) return;

  if(el.dataset.action==="toggleColumn"){
    toggleColumn(el.dataset.col);
  }
});

document.addEventListener("click",(e)=>{
  const el = e.target.closest("[data-action]");
  if(!el) return;

  if(el.dataset.action==="showAllColumns"){
    showAllColumns();
  }
});