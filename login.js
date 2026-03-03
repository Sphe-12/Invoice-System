loadDB(); // ensure seed data exists

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.className = "msg";
  msg.textContent = "";

  const email = document.getElementById("email").value.trim();
  const pass  = document.getElementById("pass").value;

  const user = findUser(email, pass);
  if (!user){
    msg.className = "msg err";
    msg.textContent = "Invalid login. Try admin@test.com / 1234";
    return;
  }

  setSession(user);
  location.href = "dashboard.html";
});