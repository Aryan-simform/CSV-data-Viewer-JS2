"use strict";

import { parseCSV, inferTypes, renderTable } from "./src/utils.js";
import { state, setState, bindRender } from "./src/state.js"
import { getViewData } from "./src/selectors.js";
import { renderColumnPanel, toggleColumn } from "./src/columns.js";
import { getColumnStatistics, groupStats, renderStats, renderGroupStats, populateGroupControls } from "./src/statistics.js";
import { exportCSV, exportJSON } from "./src/export.js";

// ---------- actions ----------

function reset() {
    setState({
        sort: { column: "", direction: "" },
        globalFilter: "",
        page: 1,
        pageSize: 25
    });
}

function setGlobalFilter(value) {
    setState({ globalFilter: value, page: 1 });
}

function toggleSort(column) {
    const { column: current, direction } = state.sort;

    let nextDir = "asc";

    if (current === column) {
        if (direction === "asc") nextDir = "desc";
        else if (direction === "desc") nextDir = "";
    }

    setState({
        sort: { column: nextDir ? column : "", direction: nextDir },
        page: 1
    });
}


// ---------- render ----------

function render() {
    const { rows, columns, total } = getViewData();

    renderTable(rows, columns, state.sort);
    renderColumnPanel();

    const stats = getColumnStatistics();

    renderStats(stats)

    updatePageInfo(total);
}

bindRender(render);

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

// ---------- data init ----------

function initData(csvText) {
    const clean = parseCSV(csvText);
    const typed = inferTypes(clean);

    const columns = Object.keys(typed[0] ?? {});
    const columnMeta = Object.fromEntries(
        columns.map(c => [c, { visible: true }])
    );
    setState({ data: typed, columns, columnMeta, page: 1 });
    populateGroupControls();
}

// ---------- DOM wiring ----------

document.getElementById("uploadBtn")
    .addEventListener("change", async e => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        initData(text);
    });

document.getElementById("searchInput")
    .addEventListener("input", e => setGlobalFilter(e.target.value));

document.getElementById("pageSize")
    .addEventListener("change", e => {
        setState({ pageSize: Number(e.target.value), page: 1 });
    });

document.getElementById("dthead")
    .addEventListener("click", e => {
        const th = e.target.closest("th");
        if (!th) return;
        toggleSort(th.dataset.col);
    });

document.body.addEventListener("click", e => {
    if (e.target.id === "prevPage" && state.page > 1)
        setState({ page: state.page - 1 });

    if (e.target.id === "nextPage")
        setState({ page: state.page + 1 });

    if (e.target.id === "resetBtn") reset();
    if (e.target.id === "exportCSV") exportCSV();
    if (e.target.id === "exportJSON") exportJSON();
});

const rungroup = document.getElementById("runGroup")
const toggleColumnsBtn = document.getElementById("toggleColumns");
const columnPanel = document.getElementById("columnPanel");

toggleColumnsBtn.addEventListener("click", () => {
    columnPanel.hidden = !columnPanel.hidden;
});


document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;

    if (el.dataset.action === "toggleColumn") {
        toggleColumn(el.dataset.col);
    }
});

document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;

    if (el.dataset.action === "showAllColumns") {
        showAllColumns();
    }
});

rungroup.addEventListener("click", () => {
    const g = document.getElementById("groupBy").value;
    const m = document.getElementById("metricBy").value;

    const result = groupStats(g, m);
    renderGroupStats(result, g, m);
});
