const KEY = "invoice_system_db_v1";

function nowISO(){
  return new Date().toISOString();
}

function loadDB(){
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);

  // Seed: 4 users (passwords simple for school demo)
  const db = {
    users: [
      { id:"u1", name:"Admin",   email:"admin@test.com",   pass:"1234", role:"admin"   },
      { id:"u2", name:"Reviewer",email:"reviewer@test.com",pass:"1234", role:"reviewer"},
      { id:"u3", name:"Manager", email:"manager@test.com", pass:"1234", role:"manager" },
      { id:"u4", name:"Finance", email:"finance@test.com", pass:"1234", role:"finance" }
    ],
    documents: []
  };
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

function saveDB(db){
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid(prefix="id"){
  return prefix + "_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

// Documents
function addDocument(doc){
  const db = loadDB();
  db.documents.unshift(doc);
  saveDB(db);
  return doc;
}

function updateDocument(id, patch){
  const db = loadDB();
  const i = db.documents.findIndex(d => d.id === id);
  if (i === -1) return null;
  db.documents[i] = { ...db.documents[i], ...patch, updatedAt: nowISO() };
  saveDB(db);
  return db.documents[i];
}

function getDocuments(){
  return loadDB().documents;
}

function getDocument(id){
  return loadDB().documents.find(d => d.id === id) || null;
}

// Users
function findUser(email, pass){
  const db = loadDB();
  return db.users.find(u => u.email.toLowerCase() === (email||"").toLowerCase() && u.pass === pass) || null;
}

function getUserById(id){
  return loadDB().users.find(u => u.id === id) || null;
}