"use strict";

const uploadBtn = document.getElementById("uploadBtn");

uploadBtn.addEventListener("change", async (e) => {
    try {
        // const [handle] = await showOpenFilePicker();
        const file = await e.target.files[0];
        if(!file)return;
        const data = await file.text();

        // console.log(file);
        // console.log(data);
       const jsonData= convertCSVToJSON(data);
    //    console.log(jsonData);
        showData(jsonData);
    } catch (err) {
        console.error(err);
    }
});


function convertCSVToJSON(csvString){
    const rows = csvString.split("\n").filter( r =>r.trim()!=="");
    if(rows.length === 0)return [];
    const headers = rows[0].split(",").map(h=>h.trim());
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
  .filter(r => r.trim())
  .forEach(row => {
      const values = row.split(",");
      const obj = Object.fromEntries(
          headers.map((h, i) => [h, values[i]?.trim() ?? ""])
      );
      jsonData.push(obj);
  });
    // console.log(data[0])
    return jsonData;
}

function showData(jsonData){
    const table = document.getElementById("datatable");
    
    const headers = (Object.keys(jsonData[0]));
    console.log(headers)
    const headerRow= document.createElement("tr");
    headers.forEach(header=>{
        const th = document.createElement("th");
        th.textContent= header.replace("_"," ");
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    jsonData.forEach( data => {
        const tr = document.createElement("tr");
        Object.values(data).forEach(item=>{
            const td = document.createElement("td");
            td.textContent= item;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

}