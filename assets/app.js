const API_URL = "https://script.google.com/macros/s/AKfycbwmj-IL0MhmdwRLOA5fDs0Dw3So2BE7bMgnHVI2_MgO6y-XFlBZcXNqeLXNGgQo4t1vig/exec";

/***************
 * أدوات عامة
 ***************/
function qs(id){ return document.getElementById(id); }

function setText(id, v){
  const el = qs(id);
  if (!el) return;
  const txt = (v !== undefined && v !== null && String(v).trim() !== "") ? v : "-";
  el.textContent = txt;
}

function showError(id, msg){
  const el = qs(id);
  if (!el) return;
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

/***************
 * Session
 ***************/
function saveSession(trainee){
  localStorage.setItem("trainee_session", JSON.stringify(trainee));
}
function getSession(){
  const raw = localStorage.getItem("trainee_session");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
function clearSession(){
  localStorage.removeItem("trainee_session");
}
function requireSession(){
  const s = getSession();
  if (!s || !s.id) { window.location.href = "index.html"; return null; }
  return s;
}

/***************
 * Header
 ***************/
function renderHeaderSession(){
  const s = getSession();
  if (!s) return;
  setText("vName", s.name);
  setText("vId", s.id);
  setText("vAdvisor", s.advisor);
}
function fillHeaderFromSession(){ renderHeaderSession(); }

/***************
 * API
 ***************/
async function apiGet(params){
  if (!API_URL || !API_URL.startsWith("http")) throw new Error("API_URL not set");
  params._t = Date.now(); // كسر كاش
  const url = API_URL + "?" + new URLSearchParams(params).toString();
  const res = await fetch(url, { method:"GET" });
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { throw new Error("API not JSON: " + text.slice(0,120)); }
}

/***************
 * Auth/Search
 ***************/
async function searchTraineeById(id){
  const data = await apiGet({ action:"trainee", id });
  if (data?.ok && data?.trainee) return data.trainee;
  return null;
}

/***************
 * Services
 ***************/
async function getSchedule(id){ return await apiGet({ action:"schedule", id }); }
async function getViolations(id){ return await apiGet({ action:"violations", id }); }
async function getActivities(id){ return await apiGet({ action:"activities", id }); }
async function getExcuses(id){ return await apiGet({ action:"excuses", id }); }

// profile/contact ترجع trainee من Trainees
async function getProfile(id){ return await apiGet({ action:"trainee", id }); }
async function getContact(id){ return await apiGet({ action:"trainee", id }); }

/***************
 * Table renderer
 ***************/
function renderTable(tableId, columns, rows){
  const table = qs(tableId);
  if (!table) return;

  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  if (!thead || !tbody) return;

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const trh = document.createElement("tr");
  columns.forEach(c=>{
    const th = document.createElement("th");
    th.textContent = c.label;
    trh.appendChild(th);
  });
  thead.appendChild(trh);

  if (!rows || !rows.length){
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length;
    td.textContent = "لا توجد بيانات.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  rows.forEach(r=>{
    const tr = document.createElement("tr");
    columns.forEach(c=>{
      const td = document.createElement("td");
      td.textContent = (r[c.key] ?? "").toString();
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}
