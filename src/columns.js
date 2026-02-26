import { state,setState } from "./state.js";
import { formatColumnLabel } from "./utils.js";
export function showAllColumns() {
    const meta = Object.fromEntries(
        state.columns.map(c => [c, { visible: true }])
    );

    setState({ columnMeta: meta });
}

export function toggleColumn(col) {
    const current = state.columnMeta[col]?.visible !== false;

    const visibleCount = Object.values(state.columnMeta)
        .filter(m => m.visible !== false).length;

    if (visibleCount === 1 && current) return;

    setState({
        columnMeta: {
            ...state.columnMeta,
            [col]: {
                ...state.columnMeta[col],
                visible: !current
            }
        }
    });
}
export function renderColumnPanel() {
    const list = document.getElementById("columnList");
    if (!list) return;

    list.innerHTML = "";

    state.columns.forEach(col => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = state.columnMeta[col]?.visible !== false;

        input.dataset.action = "toggleColumn";
        input.dataset.col = col;

        label.append(input, " ", formatColumnLabel(col));
        list.appendChild(label);
    });
}

