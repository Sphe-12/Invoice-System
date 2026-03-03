const session = requireAuth();
renderTopbar("upload");

const form = document.getElementById("uploadForm");
const msg = document.getElementById("msg");

function isDuplicateCheck(newDoc){
  const docs = getDocuments();

  // Primary: invoice number
  if (newDoc.invoiceNumber){
    const hit = docs.find(d => (d.invoiceNumber || "").toLowerCase() === newDoc.invoiceNumber.toLowerCase());
    if (hit) return { dup:true, reason:"Invoice number already exists" };
  }

  // Secondary: vendor + amount
  const v = (newDoc.vendor || "").toLowerCase().trim();
  const a = Number(newDoc.amount || 0);
  if (v && a > 0){
    const hit2 = docs.find(d =>
      (d.vendor || "").toLowerCase().trim() === v &&
      Number(d.amount || 0) === a
    );
    if (hit2) return { dup:true, reason:"Vendor + amount match" };
  }

  return { dup:false, reason:"" };
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "msg";
  msg.textContent = "";

  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value.trim();
  const vendor = document.getElementById("vendor").value.trim();
  const invoiceNumber = document.getElementById("invoiceNumber").value.trim();
  const amount = Number(document.getElementById("amount").value || 0);
  const vat = Number(document.getElementById("vat").value || 0);
  const fileInput = document.getElementById("file");
  const file = fileInput.files?.[0];

  if (!vendor) return (msg.className="msg err", msg.textContent="Vendor is required.");
  if (!date) return (msg.className="msg err", msg.textContent="Date is required.");
  if (!file) return (msg.className="msg err", msg.textContent="File is required.");

  const doc = {
    id: uid("doc"),
    type,
    date,
    vendor,
    invoiceNumber,
    amount,
    vat,
    fileName: file.name,
    mimeType: file.type,

    // workflow
    stage: 1,
    status: "pending",
    uploadedBy: session.id,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    log: []
  };

  const dup = isDuplicateCheck(doc);
  doc.isDuplicate = dup.dup;
  doc.duplicateReason = dup.reason;

  // OPTIONAL preview for small images only (keeps it simple)
  if (file.type.startsWith("image/") && file.size < 350000){
    doc.fileBase64 = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
  }

  addDocument(doc);

  msg.className = doc.isDuplicate ? "msg warn" : "msg ok";
  msg.textContent = doc.isDuplicate
    ? `Saved, but DUPLICATE flagged: ${doc.duplicateReason}. It cannot be approved.`
    : "Saved ✅ Now go to Approvals to process it.";

  form.reset();
});