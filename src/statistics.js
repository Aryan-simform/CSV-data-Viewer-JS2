import { state } from "./state.js";
import { visibleColumns } from "./selectors.js";
import { getAnalysisRows } from "./selectors.js";
const statsCache = {
    key:null,
    value:null
};

 function statsKey(){
  return JSON.stringify({
    filter:state.globalFilter,
    visible:visibleColumns(),
    dataLength:state.data.length
  });
}

export function getColumnStatistics(){
  const key = statsKey();

  if(statsCache.key===key){
    return statsCache.value;
  }

  const rows = getAnalysisRows();
  const cols = visibleColumns();

  const stats={};

  cols.forEach(col=>{
    const values = rows.map(r=>r[col]).filter(v=>v!=null);
    if(!values.length) return;

    if(typeof values[0]==="number"){
      const sum = values.reduce((a,b)=>a+b,0);
      stats[col]={type:"number",avg:sum/values.length};
    }else{
      const map={};
      values.forEach(v=>map[v]=(map[v]||0)+1);
      stats[col]={type:"categorical",counts:map};
    }
  });

  statsCache.key=key;
  statsCache.value=stats;

  return stats;
}

 export function groupStats(groupCol, metricCol){
  const rows = getAnalysisRows();

  if(!rows.length) return null;

  const groups={};

  rows.forEach(r=>{
    const key = r[groupCol] ?? "Unknown";
    groups[key] ??= [];
    groups[key].push(r);
  });

  const result={};

  Object.entries(groups).forEach(([k,items])=>{
    if(metricCol){
      const nums = items
        .map(r=>r[metricCol])
        .filter(v=>typeof v==="number");

      const sum = nums.reduce((a,b)=>a+b,0);

      result[k]={
        count:items.length,
        avg:nums.length? sum/nums.length:null
      };
    }else{
      result[k]={count:items.length};
    }
  });

  return result;
}