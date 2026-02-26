export const state = {
  data: [],
  columns: [],
  page: 1,
  pageSize: 25,
  columnMeta: {},
  sort: { column: "", direction: "" },
  globalFilter: ""
};

let renderFn = null;

export function bindRender(fn) {
  renderFn = fn;
}

export function setState(patch) {
  Object.assign(state, patch);
  renderFn?.();
}