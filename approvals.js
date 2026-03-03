const session = requireAuth();
renderTopbar("approvals");

const list = document.getElementById("list");
const msg = document.getElementById("msg");
document.getElementById("refreshBtn").addEventListener("click", render);

function canAct(stage, role){
  if (role === "admin") return true;
  if (stage === 1 && role === "reviewer") return true;
  if (stage === 2 && role === "manager") return true;
  if (stage === 3 && role === "finance") return true;
  return false;
}

function act(docId, action){
  msg.className = "msg";
  msg.textContent = "";

  const doc = getDocument(docId);
  if (!doc) return;

  if (doc.status !== "pending"){
    msg.className = "msg err";
    msg.textContent = "This document is already finished.";
    return;
  }

  if (doc.isDuplicate){
    msg.className = "msg err";
    msg.textContent = `Duplicate flagged: ${doc.duplicateReason}. Cannot approve.`;
    return;
  }

  if (!canAct(doc.stage, session.role)){
    msg.className = "msg err";
    msg.textContent = `You cannot act on Stage ${doc.stage} as ${session.role}.`;
    return;
  }

  const logEntry = {
    at: nowISO(),
    by: session.id,
    role: session.role,
    stage: doc.stage,
    action
  };

  if (action === "rejected"){
    updateDocument(docId, { status:"rejected", log: [...doc.log, logEntry] });
  } else {
    // approved
    if (doc.stage < 3){
      updateDocument(docId, { stage: doc.stage + 1, log: [...doc.log, logEntry] });
    } else {
      updateDocument(docId, { status:"approved", log: [...doc.log, logEntry] });
    }
  }

  msg.className = "msg ok";
  msg.textContent = `Saved ✅ ${action}`;
  render();
}

function render(){
  const docs = getDocuments();

  if (!docs.length){
    list.innerHTML = `<p class="msg warn">No documents yet. Upload first.</p>`;
    return;
  }

  list.innerHTML = `
    <div class="row head">
      <div>Type</div><div>Vendor</div><div>Invoice #</div><div>Amount</div>
      <div>Stage</div><div>Status</div><div>Duplicate</div><div>Actions</div>
    </div>
    ${docs.map(d => {
      const allow = canAct(d.stage, session.role) && d.status === "pending" && !d.isDuplicate;
      const preview = d.fileBase64 ? `<br/><small><a href="${d.fileBase64}" target="_blank">Preview</a></small>` : "";
      return `
        <div class="row">
          <div>${d.type}${preview}</div>
          <div>${d.vendor}</div>
          <div>${d.invoiceNumber || "-"}</div>
          <div>${Number(d.amount||0).toFixed(2)}</div>
          <div>${d.stage}</div>
          <div>${d.status}</div>
          <div>${d.isDuplicate ? "YES" : "NO"}</div>
          <div>
            <button ${allow ? "" : "disabled"} onclick="act('${d.id}','approved')">Approve</button>
            <button ${d.status==="pending" ? "" : "disabled"} onclick="act('${d.id}','rejected')">Reject</button>
          </div>
        </div>
      `;
    }).join("")}
  `;
}

window.act = act;
render();