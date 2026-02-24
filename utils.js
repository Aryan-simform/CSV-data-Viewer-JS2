
export function parseCSV(csvString) {
    const rows = csvString.split("\n").filter((r) => r.trim() !== "");
    if (rows.length === 0) return [];
    const headers = rows[0].split(",").map((h) => h.trim());
    const jsonData = [];

    // for(let i =1;i<rows.length;i++){
    //     const val= rows[i].split(",")
    //     const obj ={};
    //     for(let j =0; j<headers.length;j++){
    //         obj[headers[j]] = val[j].trim();
    //     }
    //     // // headers.forEach((head,idx)=>{
    //     // //     ojb[head]=val[idx]?.trim()??"";
    //     // });

    //     jsonData.push(obj);
    // }
    // rows.forEach((row,ridx)=>{
    //     if(ridx === 0 ||!row.trim())  return;
    //     const val = row.split(",");
    //     const obj = {};
    //     headers.forEach((header,cidx)=>{
    //         obj[header]=val[cidx]?.trim()??"";
    //     })
    //     jsonData.push(obj);
    // });

    rows
        .slice(1)
        .filter((r) => r.trim())
        .forEach((row) => {
            const values = row.split(",");
            const obj = Object.fromEntries(
                headers.map((h, i) => {
                    const val = values[i]?.trim() ?? "";
                    return [h, (val)];
                }),
            );
            jsonData.push(obj);
        });

    return jsonData;
}
function validateDate(date) {
    if (!date || date === undefined) return null;
    const d = date.trim();
    const sep = d.includes("/") ? "/" : d.includes("-") ? "-" : null;
    if (!sep) return null;
    const parts = d.split(sep);
    const nums = parts.map((num) => Number(num));
    if (nums.some((num) => Number.isNaN(num))) return null;
    let year, month, day;
    if (parts[0].length === 4) {
        // YYYY-MM-DD
        [year, month, day] = nums;
    } else if (parts[2].length === 4) {
        // DD/MM/YYYY (default India style)
        [day, month, year] = nums;
    } else {
        return null;
    }

    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;

    return new Date(year, month - 1, day).toISOString().slice(0, 10);
}

function convertValues(value) {

    if (!value || value === undefined) return null;
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    const date = validateDate(value);
    if (date) return date;

    if (!isNaN(value) && value !== "") return Number(value);

    return value;
}

export function inferTypes(rows) {
    return rows.map(row =>
        Object.fromEntries(
            Object.entries(row).map(([k, v]) => [k, convertValues(v)])
        )
    );
}
export function renderTable(rows, columns) {
    const table = document.getElementById("datatable");
    table.innerHTML = "";

    const headerRow = document.createElement("tr");

    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.replace("_", " ");
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    const frag = document.createDocumentFragment();

    rows.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(col => {
            const td = document.createElement("td");
            td.textContent = row[col];
            tr.appendChild(td);
        });

        frag.appendChild(tr);
    });

    table.appendChild(frag);
}