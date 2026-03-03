renderTopbar("dash");
const docs = getDocuments();

const pending = docs.filter(d => d.status === "pending").length;
const approved = docs.filter(d => d.status === "approved").length;
const rejected = docs.filter(d => d.status === "rejected").length;

document.getElementById("pending").textContent = pending;
document.getElementById("approved").textContent = approved;
document.getElementById("rejected").textContent = rejected;

const list = document.getElementById("list");
if (!docs.length){
  list.innerHTML = `<p class="msg warn">No documents yet. Upload one.</p>`;
} else {
  const top = docs.slice(0, 8);
  list.innerHTML = `
    <div class="row head">
      <div>Type</div><div>Vendor</div><div>Invoice #</div><div>Amount</div>
      <div>Stage</div><div>Status</div><div>Duplicate</div><div>File</div>
    </div>
    ${top.map(d => `
      <div class="row">
        <div>${d.type}</div>
        <div>${d.vendor}</div>
        <div>${d.invoiceNumber || "-"}</div>
        <div>${Number(d.amount||0).toFixed(2)}</div>
        <div>${d.stage}</div>
        <div>${d.status}</div>
        <div>${d.isDuplicate ? "YES" : "NO"}</div>
        <div><small>${d.fileName || "-"}</small></div>
      </div>
    `).join("")}
  `;
}