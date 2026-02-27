import { state } from "./state.js";
import { visibleColumns } from "./selectors.js";
import { getAnalysisRows } from "./selectors.js";
import { formatColumnLabel } from "./utils.js";
const statsCache = {
    key: null,
    value: null,
};

function statsKey() {
    return JSON.stringify({
        filter: state.globalFilter,
        visible: visibleColumns(),
        dataLength: state.data.length,
    });
}

export function getColumnStatistics() {
    const key = statsKey();

    if (statsCache.key === key) {
        return statsCache.value;
    }

    const rows = getAnalysisRows();
    const cols = visibleColumns();

    const stats = {};

    cols.forEach((col) => {
        const values = rows.map((r) => r[col]).filter((v) => v != null);
        if (!values.length) return;

        if (typeof values[0] === "number") {
            const sum = values.reduce((a, b) => a + b, 0);
            stats[col] = {
                type: "number",
                count: values.length,
                avg: sum / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
            };
        } else {
            const map = {};
            values.forEach((v) => (map[v] = (map[v] || 0) + 1));
            stats[col] = { type: "categorical", counts: map };
        }
    });

    statsCache.key = key;
    statsCache.value = stats;
    //   console.log("stats",stats);
    return stats;
}

export function groupStats(groupCol, metricCol) {
    const rows = getAnalysisRows();
    // console.log(rows);
    if (!rows.length) return null;

    const groups = {};

    rows.forEach((r) => {
        const key = r[groupCol] ?? "Unknown";
        groups[key] ??= [];
        groups[key].push(r);
    });

    const result = {};

    Object.entries(groups).forEach(([k, items]) => {
        if (metricCol) {
            const nums = items
                .map((r) => r[metricCol])
                .filter((v) => typeof v === "number");

            const sum = nums.reduce((a, b) => a + b, 0);

            result[k] = {
                count: items.length,
                avg: nums.length ? sum / nums.length : null,
            };
        } else {
            result[k] = { count: items.length };
        }
    });

    return result;
}

export function renderStats(stats) {
    const panel = document.getElementById("statsPanel");
    if (!panel) return;

    panel.innerHTML = "";
    panel.className = "stats-grid";

    Object.entries(stats).forEach(([col, data]) => {
        const card = document.createElement("div");
        card.className = "stat-card";

        card.innerHTML = `
      <div class="stat-title">${formatColumnLabel(col)}</div>
      ${renderStatBody(data)}
    `;

        panel.appendChild(card);
    });
}

function renderStatBody(data) {
    if (data.type === "number") {
        return `
      <div>Avg: ${data.avg?.toFixed(2)}</div>
      <div>Min: ${data.min}</div>
      <div>Max: ${data.max}</div>
    `;
    }

    if (data.type === "categorical") {
        const top = Object.entries(data.counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return top.map(([k, v]) => `<div>${k}: ${v}</div>`).join("");
    }

    return "";
}
export function renderGroupStats(result, groupCol, metricCol) {
    const panel = document.getElementById("groupPanel");
    if (!panel) return;

    panel.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = `${groupCol} → ${metricCol || "count"}`;

    panel.appendChild(title);

    Object.entries(result).forEach(([k, v]) => {
        const row = document.createElement("div");
        row.className = "group-row";

        row.textContent =
            metricCol
                ? `${k}: count ${v.count}, avg ${v.avg?.toFixed(2)}`
                : `${k}: ${v.count}`;

        panel.appendChild(row);
    });
}
export function populateGroupControls() {
    const groupSel = document.getElementById("groupBy");

    const metricSel = document.getElementById("metricBy");
    const stats = getColumnStatistics();


    groupSel.innerHTML = "";
    metricSel.innerHTML = "";

    Object.entries(stats).forEach(([col, data]) => {
        if (data.type === "number") {
            metricSel.add(new Option(formatColumnLabel(col), col));
        }
    });
    state.columns.forEach(col => {
        groupSel.append(new Option(formatColumnLabel(col), col));
        // metricSel.append(new Option(formatColumnLabel(col), col));
    });
}