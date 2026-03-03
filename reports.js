requireAuth();
renderTopbar("reports");

const statusEl = document.getElementById("status");
const vendorEl = document.getElementById("vendor");
const fromEl = document.getElementById("from");
const toEl = document.getElementById("to");
const summary = document.getElementById("summary");
const vendorList = document.getElementById("vendorList");

let lastFiltered = [];

document.getElementById("runBtn").addEventListener("click", run);
document.getElementById("exportBtn").addEventListener("click", exportCSV);

function inRange(date, from, to){
  if (!from && !to) return true;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function run(){
  const docs = getDocuments();
  const st = statusEl.value.trim();
  const ven = vendorEl.value.trim().toLowerCase();
  const from = fromEl.value.trim();
  const to = toEl.value.trim();

  lastFiltered = docs.filter(d => {
    if (st && d.status !== st) return false;
    if (ven && (d.vendor||"").toLowerCase().indexOf(ven) === -1) return false;
    if (!inRange(d.date || "", from, to)) return false;
    return true;
  });

  const total = lastFiltered.reduce((a,d)=> a + Number(d.amount||0), 0);
  const totalVat = lastFiltered.reduce((a,d)=> a + Number(d.vat||0), 0);

  // Vendor totals
  const map = {};
  lastFiltered.forEach(d => {
    const v = d.vendor || "Unknown";
    map[v] = (map[v]||0) + Number(d.amount||0);
  });

  const top = Object.entries(map).sort((a,b)=> b[1]-a[1]).slice(0, 8);

  summary.className = "msg ok";
  summary.textContent = `Docs: ${lastFiltered.length} | Total Amount: ${total.toFixed(2)} | Total VAT: ${totalVat.toFixed(2)}`;

  vendorList.innerHTML = `
    <hr/>
    <b>Top Vendors</b>
    <ul>
      ${top.map(([v,amt]) => `<li>${v}: ${amt.toFixed(2)}</li>`).join("") || "<li>None</li>"}
    </ul>
    <small>Export uses CSV (Excel compatible).</small>
  `;
}

function csvEscape(value){
  const s = String(value ?? "");
  // wrap in quotes if contains comma/quote/newline
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportCSV(){
  // Ensure we have data even if they didn't click Generate
  if (!lastFiltered.length) run();

  const headers = [
    "id","type","date","vendor","invoiceNumber","amount","vat",
    "stage","status","isDuplicate","duplicateReason","fileName","createdAt"
  ];

  const rows = lastFiltered.map(d => ([
    d.id,
    d.type,
    d.date,
    d.vendor,
    d.invoiceNumber || "",
    Number(d.amount||0).toFixed(2),
    Number(d.vat||0).toFixed(2),
    d.stage,
    d.status,
    d.isDuplicate ? "YES" : "NO",
    d.duplicateReason || "",
    d.fileName || "",
    d.createdAt || ""
  ]));

  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map(r => r.map(csvEscape).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type:"text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

run();