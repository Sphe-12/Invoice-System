requireAuth();
renderTopbar("insights");

const totalSpendEl = document.getElementById("totalSpend");
const avgAmountEl = document.getElementById("avgAmount");
const anomalyCountEl = document.getElementById("anomalyCount");
const topVendorsEl = document.getElementById("topVendors");
const trendEl = document.getElementById("trend");
const anomaliesEl = document.getElementById("anomalies");

function ym(dateStr){
  
  if (!dateStr || dateStr.length < 7) return "Unknown";
  return dateStr.slice(0,7);
}

function money(n){
  return Number(n || 0).toFixed(2);
}

function render(){
  const docs = getDocuments();


  const approved = docs.filter(d => d.status === "approved" && !d.isDuplicate);

  if (!approved.length){
    totalSpendEl.textContent = "0.00";
    avgAmountEl.textContent = "0.00";
    anomalyCountEl.textContent = "0";
    topVendorsEl.innerHTML = `<p class="msg warn">No approved documents yet. Approve some invoices first.</p>`;
    trendEl.innerHTML = "";
    anomaliesEl.innerHTML = "";
    return;
  }

  const amounts = approved.map(d => Number(d.amount || 0));
  const totalSpend = amounts.reduce((a,b)=>a+b,0);
  const avg = totalSpend / approved.length;

  // Anomalies: > 2× average
  const anomalies = approved.filter(d => Number(d.amount||0) > avg * 2);

  totalSpendEl.textContent = money(totalSpend);
  avgAmountEl.textContent = money(avg);
  anomalyCountEl.textContent = String(anomalies.length);

  // Top vendors by spend
  const vendorSpend = {};
  approved.forEach(d => {
    const v = d.vendor || "Unknown";
    vendorSpend[v] = (vendorSpend[v] || 0) + Number(d.amount||0);
  });

  const top = Object.entries(vendorSpend)
    .sort((a,b)=>b[1]-a[1])
    .slice(0, 8);

  topVendorsEl.innerHTML = `
    <ul>
      ${top.map(([v,amt]) => `<li>${v}: ${money(amt)}</li>`).join("")}
    </ul>
  `;

 
  const monthly = {};
  approved.forEach(d => {
    const key = ym(d.date);
    monthly[key] = (monthly[key] || 0) + Number(d.amount||0);
  });

  const trend = Object.entries(monthly).sort((a,b)=> a[0].localeCompare(b[0]));
  trendEl.innerHTML = `
    <div class="row head" style="grid-template-columns: 1fr 1fr;">
      <div>Month</div><div>Total Spend</div>
    </div>
    ${trend.map(([m,amt]) => `
      <div class="row" style="grid-template-columns: 1fr 1fr;">
        <div>${m}</div><div>${money(amt)}</div>
      </div>
    `).join("")}
  `;


  anomaliesEl.innerHTML = anomalies.length ? `
    <div class="row head" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
      <div>Vendor</div><div>Invoice #</div><div>Amount</div><div>Date</div>
    </div>
    ${anomalies.map(d => `
      <div class="row" style="grid-template-columns: 1fr 1fr 1fr 1fr;">
        <div>${d.vendor}</div>
        <div>${d.invoiceNumber || "-"}</div>
        <div>${money(d.amount)}</div>
        <div>${d.date || "-"}</div>
      </div>
    `).join("")}
  ` : `<p class="msg ok">No anomalies found ✅</p>`;
}

render();