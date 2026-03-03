function setSession(user){
  localStorage.setItem("session_user", JSON.stringify({ id: user.id, role: user.role, name: user.name, email: user.email }));
}

function getSession(){
  const raw = localStorage.getItem("session_user");
  return raw ? JSON.parse(raw) : null;
}

function logout(){
  localStorage.removeItem("session_user");
  location.href = "login.html";
}

function requireAuth(){
  const s = getSession();
  if (!s) location.href = "login.html";
  return s;
}

function renderTopbar(active=""){
  const s = requireAuth();
  const top = document.getElementById("topbar");
  if (!top) return;

  top.innerHTML = `
    <div class="brand">Invoice System</div>
    <div class="pill">${s.name} • ${s.role}</div>
    <div class="nav">
      <a href="dashboard.html"${active==="dash"?' style="font-weight:700"':''}>Dashboard</a>
      <a href="upload.html"${active==="upload"?' style="font-weight:700"':''}>Upload</a>
      <a href="approvals.html"${active==="approvals"?' style="font-weight:700"':''}>Approvals</a>
      <a href="reports.html"${active==="reports"?' style="font-weight:700"':''}>Reports</a>
      <a href="insights.html"${active==="insights"?' style="font-weight:700"':''}>AI Insights</a>
    </div>
    <div style="margin-left:auto"></div>
    <button style="width:auto" id="logoutBtn">Logout</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", logout);
}