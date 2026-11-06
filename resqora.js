/* ============================================================
   RESQORA – LifeLine AI | Emergency Response Platform
   resqora.js – Full Application Logic
   ============================================================ */

'use strict';

/* ════════════════════════════════════════════════════════════
   1. LOCAL STORAGE HELPERS
════════════════════════════════════════════════════════════ */
const LS = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch(e) { console.warn('LS.get error', key, e); return null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch(e) { console.warn('LS.set error', key, e); }
  },
  remove(key) { localStorage.removeItem(key); }
};

const KEYS = {
  requests:      'rsq_requests',
  ambulances:    'rsq_ambulances',
  hospitals:     'rsq_hospitals',
  patients:      'rsq_patients',
  assignments:   'rsq_assignments',
  history:       'rsq_history',
  notifications: 'rsq_notifications',
  corporate:     'rsq_corporate',
  activity:      'rsq_activity',
  counters:      'rsq_counters'
};

function getAll(key) { return LS.get(key) || []; }
function saveAll(key, arr) { LS.set(key, arr); }

function getCounters() {
  return LS.get(KEYS.counters) || { req:1001, amb:100, hosp:200, pat:300, assign:400, corp:500 };
}
function saveCounters(c) { LS.set(KEYS.counters, c); }

function nextId(type) {
  const c = getCounters();
  const prefixes = { req:'RESQ', amb:'AMB', hosp:'HOSP', pat:'PAT', assign:'ASGN', corp:'CORP' };
  const n = c[type]++;
  saveCounters(c);
  return `${prefixes[type]}-${n}`;
}

/* ════════════════════════════════════════════════════════════
   2. SAMPLE DATA INITIALISATION
════════════════════════════════════════════════════════════ */
function initSampleData() {
  if (LS.get('rsq_initialized')) return;

  /* Hospitals */
  const hospitals = [
    { id:'HOSP-201', name:'City Care Hospital', address:'No. 45, MG Road', city:'Bengaluru', contact:'080-22001100', emergencyDept:true, emergencyBeds:8, icuBeds:3, traumaCare:true, cardiacCare:true, strokeCare:true, receivingCapacity:10, lat:12.9716, lng:77.5946, status:'Accepting Emergency Patients', totalEmergencyBeds:12, totalIcuBeds:6 },
    { id:'HOSP-202', name:'Apollo Emergency Centre', address:'154/11, Bannerghatta Road', city:'Bengaluru', contact:'080-26304050', emergencyDept:true, emergencyBeds:5, icuBeds:2, traumaCare:true, cardiacCare:true, strokeCare:false, receivingCapacity:8, lat:12.9011, lng:77.5973, status:'Accepting Emergency Patients', totalEmergencyBeds:10, totalIcuBeds:5 },
    { id:'HOSP-203', name:'Fortis Trauma Unit', address:'154/9, Bannerghatta Road', city:'Bengaluru', contact:'080-66214444', emergencyDept:true, emergencyBeds:2, icuBeds:0, traumaCare:true, cardiacCare:false, strokeCare:false, receivingCapacity:4, lat:12.8980, lng:77.5977, status:'Limited Emergency Capacity', totalEmergencyBeds:8, totalIcuBeds:4 },
    { id:'HOSP-204', name:'Narayana Health', address:'258/A, Hosur Road', city:'Bengaluru', contact:'1800-102-0112', emergencyDept:true, emergencyBeds:10, icuBeds:5, traumaCare:true, cardiacCare:true, strokeCare:true, receivingCapacity:15, lat:12.8456, lng:77.6603, status:'Accepting Emergency Patients', totalEmergencyBeds:15, totalIcuBeds:8 },
    { id:'HOSP-205', name:'Manipal Hospital', address:'98, HAL Airport Road', city:'Bengaluru', contact:'080-25024444', emergencyDept:true, emergencyBeds:6, icuBeds:1, traumaCare:false, cardiacCare:true, strokeCare:true, receivingCapacity:8, lat:12.9592, lng:77.6484, status:'Accepting Emergency Patients', totalEmergencyBeds:10, totalIcuBeds:4 }
  ];
  saveAll(KEYS.hospitals, hospitals);

  /* Ambulances */
  const ambulances = [
    { id:'AMB-101', regNo:'KA01AB1234', type:'Advanced Life Support (ALS)', driver:'Raj Kumar', driverContact:'9876541001', medicalStaff:'Dr. Priya Singh', location:'MG Road, Bengaluru', lat:12.9741, lng:77.6097, equipment:'Defibrillator, Oxygen, IV Kit, Stretcher', assignedEmergency:'RESQ-1001', status:'On Emergency Duty' },
    { id:'AMB-102', regNo:'KA01AB5678', type:'Basic Life Support (BLS)', driver:'Suresh Patil', driverContact:'9876541002', medicalStaff:'Nurse Kavitha', location:'Whitefield, Bengaluru', lat:12.9698, lng:77.7499, equipment:'First Aid, Oxygen, Stretcher', assignedEmergency:'', status:'Available' },
    { id:'AMB-103', regNo:'KA01AB9012', type:'Advanced Life Support (ALS)', driver:'Meena Reddy', driverContact:'9876541003', medicalStaff:'Dr. Arjun Das', location:'Indiranagar, Bengaluru', lat:12.9784, lng:77.6408, equipment:'Defibrillator, Ventilator, IV Kit', assignedEmergency:'RESQ-1002', status:'On Emergency Duty' },
    { id:'AMB-104', regNo:'KA01AB3456', type:'Neonatal Ambulance', driver:'Arjun Das', driverContact:'9876541004', medicalStaff:'Dr. Sunita Rao', location:'HSR Layout, Bengaluru', lat:12.9116, lng:77.6474, equipment:'Incubator, Neonatal Ventilator', assignedEmergency:'', status:'Available' },
    { id:'AMB-105', regNo:'KA01AB7890', type:'Basic Life Support (BLS)', driver:'Priya Nair', driverContact:'9876541005', medicalStaff:'Nurse Ramesh', location:'Koramangala, Bengaluru', lat:12.9352, lng:77.6245, equipment:'First Aid, Oxygen, Stretcher', assignedEmergency:'', status:'Available' }
  ];
  saveAll(KEYS.ambulances, ambulances);

  /* Patients */
  const patients = [
    { id:'PAT-301', name:'Rahul Sharma', age:25, gender:'Male', contact:'9845001001', emergencyType:'Road Accident', condition:'Critical', assignedEmergencyId:'RESQ-1001', assignedAmbulance:'AMB-101', assignedHospital:'HOSP-201', status:'In Transit', regDate: new Date().toISOString() },
    { id:'PAT-302', name:'Anita Patel', age:52, gender:'Female', contact:'9845001002', emergencyType:'Cardiac Emergency', condition:'Critical', assignedEmergencyId:'RESQ-1002', assignedAmbulance:'AMB-103', assignedHospital:'HOSP-202', status:'In Transit', regDate: new Date().toISOString() },
    { id:'PAT-303', name:'Kiran Mehta', age:67, gender:'Male', contact:'9845001003', emergencyType:'Stroke', condition:'High', assignedEmergencyId:'RESQ-1003', assignedAmbulance:'AMB-102', assignedHospital:'HOSP-201', status:'Admitted', regDate: new Date().toISOString() },
    { id:'PAT-304', name:'Deepak Nair', age:38, gender:'Male', contact:'9845001004', emergencyType:'Medical Emergency', condition:'Stable', assignedEmergencyId:'RESQ-1000', assignedAmbulance:'AMB-102', assignedHospital:'HOSP-201', status:'Discharged', regDate: new Date().toISOString() }
  ];
  saveAll(KEYS.patients, patients);

  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0,10);
  const fmtT = (d) => d.toTimeString().slice(0,5);

  /* Emergency Requests */
  const requests = [
    { id:'RESQ-1001', patientName:'Rahul Sharma', age:25, gender:'Male', contact:'9845001001', emergencyType:'Road Accident', description:'Severe injuries sustained in road accident at MG Road junction.', condition:'Critical', priority:'Critical', location:'MG Road, Bengaluru', lat:12.9741, lng:77.6097, assignedAmbulance:'AMB-101', assignedHospital:'HOSP-201', date:fmt(now), time:fmtT(now), eta:'12 Minutes', status:'Patient In Transit', patientId:'PAT-301' },
    { id:'RESQ-1002', patientName:'Anita Patel', age:52, gender:'Female', contact:'9845001002', emergencyType:'Cardiac Emergency', description:'Chest pain and loss of consciousness.', condition:'Critical', priority:'Critical', location:'Indiranagar, Bengaluru', lat:12.9784, lng:77.6408, assignedAmbulance:'AMB-103', assignedHospital:'HOSP-202', date:fmt(now), time:fmtT(now), eta:'9 Minutes', status:'Ambulance Dispatched', patientId:'PAT-302' },
    { id:'RESQ-1003', patientName:'Kiran Mehta', age:67, gender:'Male', contact:'9845001003', emergencyType:'Stroke', description:'Sudden collapse, slurred speech, facial drooping.', condition:'High', priority:'High', location:'Koramangala, Bengaluru', lat:12.9352, lng:77.6245, assignedAmbulance:'AMB-102', assignedHospital:'HOSP-201', date:fmt(now), time:fmtT(now), eta:'Arrived', status:'Arrived at Hospital', patientId:'PAT-303' }
  ];
  saveAll(KEYS.requests, requests);

  /* Emergency History */
  const d1 = new Date(now); d1.setDate(d1.getDate()-1);
  const d2 = new Date(now); d2.setDate(d2.getDate()-2);
  const d3 = new Date(now); d3.setDate(d3.getDate()-2);
  const d4 = new Date(now); d4.setDate(d4.getDate()-3);
  const d5 = new Date(now); d5.setDate(d5.getDate()-4);
  const d6 = new Date(now); d6.setDate(d6.getDate()-5);

  const history = [
    { id:'RESQ-1000', patientName:'Deepak Nair', age:38, gender:'Male', emergencyType:'Medical Emergency', condition:'Stable', priority:'Medium', location:'Whitefield, Bengaluru', assignedAmbulance:'AMB-102', assignedHospital:'HOSP-201', hospitalName:'City Care Hospital', date:fmt(d1), time:'09:15', eta:'8 min', status:'Completed', responseTime:'8 min', completedAt: d1.toISOString() },
    { id:'RESQ-0999', patientName:'Sunita Rao', age:44, gender:'Female', emergencyType:'Trauma', condition:'High', priority:'High', location:'Rajajinagar, Bengaluru', assignedAmbulance:'AMB-104', assignedHospital:'HOSP-204', hospitalName:'Narayana Health', date:fmt(d2), time:'14:30', eta:'11 min', status:'Completed', responseTime:'11 min', completedAt: d2.toISOString() },
    { id:'RESQ-0998', patientName:'Mohit Sharma', age:29, gender:'Male', emergencyType:'Road Accident', condition:'Critical', priority:'Critical', location:'ORR Junction, Bengaluru', assignedAmbulance:'AMB-101', assignedHospital:'HOSP-202', hospitalName:'Apollo Emergency Centre', date:fmt(d3), time:'07:45', eta:'7 min', status:'Completed', responseTime:'7 min', completedAt: d3.toISOString() },
    { id:'RESQ-0997', patientName:'Priya Menon', age:60, gender:'Female', emergencyType:'Cardiac Emergency', condition:'Critical', priority:'Critical', location:'Jayanagar, Bengaluru', assignedAmbulance:'AMB-103', assignedHospital:'HOSP-203', hospitalName:'Fortis Trauma Unit', date:fmt(d4), time:'22:10', eta:'6 min', status:'Completed', responseTime:'6 min', completedAt: d4.toISOString() },
    { id:'RESQ-0996', patientName:'Vivek Kumar', age:34, gender:'Male', emergencyType:'Trauma', condition:'Medium', priority:'Medium', location:'Yeshwanthpur, Bengaluru', assignedAmbulance:'AMB-105', assignedHospital:'HOSP-205', hospitalName:'Manipal Hospital', date:fmt(d5), time:'11:55', eta:'13 min', status:'Completed', responseTime:'13 min', completedAt: d5.toISOString() },
    { id:'RESQ-0995', patientName:'Riya Desai', age:27, gender:'Female', emergencyType:'Respiratory Emergency', condition:'High', priority:'High', location:'Banashankari, Bengaluru', assignedAmbulance:'AMB-102', assignedHospital:'HOSP-201', hospitalName:'City Care Hospital', date:fmt(d6), time:'16:20', eta:'9 min', status:'Completed', responseTime:'9 min', completedAt: d6.toISOString() }
  ];
  saveAll(KEYS.history, history);

  /* Assignments */
  const assignments = [
    { id:'ASGN-401', emergencyId:'RESQ-1001', ambulanceId:'AMB-101', driver:'Raj Kumar', medicalStaff:'Dr. Priya Singh', hospital:'HOSP-201', date:fmt(now), time:fmtT(now), eta:'12 Minutes', status:'Active' },
    { id:'ASGN-402', emergencyId:'RESQ-1002', ambulanceId:'AMB-103', driver:'Meena Reddy', medicalStaff:'Dr. Arjun Das', hospital:'HOSP-202', date:fmt(now), time:fmtT(now), eta:'9 Minutes', status:'Active' }
  ];
  saveAll(KEYS.assignments, assignments);

  /* Notifications */
  const notifications = [
    { id:'N001', type:'Emergency Request Created', emergencyId:'RESQ-1001', patient:'Rahul Sharma', message:'Emergency RESQ-1001 created. Road Accident at MG Road, Bengaluru.', time: new Date(now.getTime()-20*60000).toISOString(), read:false },
    { id:'N002', type:'Ambulance Dispatched', emergencyId:'RESQ-1001', patient:'Rahul Sharma', message:'Ambulance AMB-101 dispatched for RESQ-1001.', time: new Date(now.getTime()-18*60000).toISOString(), read:false },
    { id:'N003', type:'Ambulance Assigned', emergencyId:'RESQ-1002', patient:'Anita Patel', message:'Ambulance AMB-103 assigned to RESQ-1002.', time: new Date(now.getTime()-10*60000).toISOString(), read:false }
  ];
  saveAll(KEYS.notifications, notifications);

  /* Corporate */
  const corporate = [
    { id:'CORP-501', orgName:'TechPark Solutions', location:'Electronic City, Bengaluru', contactPerson:'Rajesh Mehta', contact:'9876500001', emergencyType:'Medical Emergency', employeeCount:500, emergencyStatus:'Resolved', notes:'Employee collapse in cafeteria. Handled.' },
    { id:'CORP-502', orgName:'Infosys Campus', location:'Electronic City Phase 2, Bengaluru', contactPerson:'Ananya Kumar', contact:'9876500002', emergencyType:'Fire Emergency', employeeCount:2000, emergencyStatus:'Active', notes:'Smoke reported in Building C. Evacuation underway.' }
  ];
  saveAll(KEYS.corporate, corporate);

  /* Activity Feed */
  const activity = [
    { id:'A001', msg:'Emergency RESQ-1001 created — Road Accident, MG Road', type:'red', time: new Date(now.getTime()-20*60000).toISOString() },
    { id:'A002', msg:'Ambulance AMB-101 dispatched for RESQ-1001', type:'orange', time: new Date(now.getTime()-18*60000).toISOString() },
    { id:'A003', msg:'Patient Rahul Sharma in transit to City Care Hospital', type:'purple', time: new Date(now.getTime()-15*60000).toISOString() },
    { id:'A004', msg:'Emergency RESQ-1002 created — Cardiac Emergency', type:'red', time: new Date(now.getTime()-12*60000).toISOString() },
    { id:'A005', msg:'Hospital City Care notified for RESQ-1001', type:'blue', time: new Date(now.getTime()-10*60000).toISOString() }
  ];
  saveAll(KEYS.activity, activity);

  LS.set('rsq_initialized', true);
}

/* ════════════════════════════════════════════════════════════
   3. UTILITY FUNCTIONS
════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

function priorityBadge(p) {
  const map = { Critical:'sb-critical', High:'sb-high', Medium:'sb-medium', Low:'sb-low' };
  return `<span class="sbadge ${map[p]||'sb-medium'}">${escapeHtml(p||'—')}</span>`;
}

function statusBadge(s) {
  const map = {
    'Available':'sb-available', 'Accepting Emergency Patients':'sb-available',
    'On Emergency Duty':'sb-on-duty', 'Dispatched':'sb-dispatched', 'Limited Emergency Capacity':'sb-limited',
    'Transporting Patient':'sb-transit', 'At Hospital':'sb-admitted',
    'Completed':'sb-completed', 'Cancelled':'sb-cancelled', 'Maintenance':'sb-maint',
    'Pending':'sb-pending', 'Ambulance Assigned':'sb-dispatched', 'Ambulance Dispatched':'sb-dispatched',
    'Patient Picked Up':'sb-transit', 'Hospital Assigned':'sb-dispatched',
    'Patient In Transit':'sb-transit', 'Arrived at Hospital':'sb-admitted',
    'Awaiting Ambulance':'sb-pending', 'In Transit':'sb-transit', 'Admitted':'sb-admitted',
    'Under Emergency Care':'sb-on-duty', 'Discharged':'sb-completed',
    'Active':'sb-on-duty', 'Resolved':'sb-completed', 'Emergency Department Full':'sb-full',
    'Temporarily Unavailable':'sb-cancelled'
  };
  return `<span class="sbadge ${map[s]||'sb-pending'}">${escapeHtml(s||'—')}</span>`;
}

function showToast(msg, type='success', duration=3000) {
  const icons = { success:'bi-check-circle-fill', danger:'bi-exclamation-triangle-fill', warning:'bi-exclamation-circle-fill', info:'bi-info-circle-fill' };
  const id = 'toast-'+Date.now();
  const div = document.createElement('div');
  div.className = `toast align-items-center text-white bg-${type} border-0 show mb-2`;
  div.setAttribute('role','alert'); div.setAttribute('id',id);
  div.innerHTML = `<div class="d-flex"><div class="toast-body d-flex align-items-center gap-2"><i class="bi ${icons[type]||icons.info}"></i>${escapeHtml(msg)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button></div>`;
  document.querySelector('.toast-container').appendChild(div);
  setTimeout(() => { try { document.getElementById(id).remove(); } catch(e){} }, duration);
}

function confirmDialog(msg) { return window.confirm(msg); }

function addActivity(msg, type='blue') {
  const act = getAll(KEYS.activity);
  act.unshift({ id:'A'+Date.now(), msg, type, time: new Date().toISOString() });
  if (act.length > 30) act.pop();
  saveAll(KEYS.activity, act);
}

function addNotification(type, emergencyId, patient, message) {
  const notifs = getAll(KEYS.notifications);
  notifs.unshift({ id:'N'+Date.now(), type, emergencyId, patient, message, time: new Date().toISOString(), read: false });
  saveAll(KEYS.notifications, notifs);
  updateNotifBadge();
}

function updateNotifBadge() {
  const count = getAll(KEYS.notifications).filter(n=>!n.read).length;
  const el = document.getElementById('notif-count');
  if (el) { el.textContent = count; el.style.display = count ? '' : 'none'; }
}

function getDashboardStats() {
  const requests   = getAll(KEYS.requests);
  const ambulances = getAll(KEYS.ambulances);
  const hospitals  = getAll(KEYS.hospitals);
  const patients   = getAll(KEYS.patients);
  const history    = getAll(KEYS.history);
  return {
    totalRequests:   requests.length,
    activeAmbulances: ambulances.filter(a=>a.status!=='Available'&&a.status!=='Maintenance').length,
    availableHospitals: hospitals.filter(h=>h.status==='Accepting Emergency Patients').length,
    patientsUnderCare: patients.filter(p=>p.status!=='Discharged').length,
    criticalCases: requests.filter(r=>r.priority==='Critical').length,
    completed: history.length
  };
}

/* ════════════════════════════════════════════════════════════
   4. NAVIGATION
════════════════════════════════════════════════════════════ */
const SECTION_META = {
  dashboard:         { label:'Dashboard',              icon:'bi-speedometer2' },
  requests:          { label:'Emergency Requests',     icon:'bi-exclamation-triangle-fill' },
  ambulances:        { label:'Ambulances',             icon:'bi-truck-front-fill' },
  hospitals:         { label:'Hospitals',              icon:'bi-hospital-fill' },
  patients:          { label:'Patients',               icon:'bi-person-heart' },
  assignments:       { label:'Emergency Assignments',  icon:'bi-calendar2-check-fill' },
  history:           { label:'Emergency History',      icon:'bi-clock-history' },
  notifications:     { label:'Family Notifications',   icon:'bi-bell-fill' },
  corporate:         { label:'Corporate Emergencies',  icon:'bi-building-fill' },
  settings:          { label:'Settings',               icon:'bi-gear-fill' }
};

let _currentSection = 'dashboard';

function showSection(name) {
  if (!SECTION_META[name]) return;
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById('section-'+name);
  if (sec) sec.classList.add('active');

  document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === name);
  });

  const meta = SECTION_META[name];
  document.getElementById('topbar-title').innerHTML = `<i class="bi ${meta.icon} me-1" style="color:var(--red)"></i>${escapeHtml(meta.label)}`;
  _currentSection = name;

  closeSidebar();
  window.scrollTo({ top:0, behavior:'smooth' });

  // Render the section
  const renders = {
    dashboard:     renderDashboard,
    requests:      renderRequests,
    ambulances:    renderAmbulances,
    hospitals:     renderHospitals,
    patients:      renderPatients,
    assignments:   renderAssignments,
    history:       renderHistory,
    notifications: renderNotifications,
    corporate:     renderCorporate,
    settings:      renderSettings
  };
  if (renders[name]) renders[name]();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('show');
  document.getElementById('sidebar-overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('show');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

/* ════════════════════════════════════════════════════════════
   5. CLOCK
════════════════════════════════════════════════════════════ */
function startClock() {
  const el = document.getElementById('topbar-clock');
  function tick() {
    const d = new Date();
    el.textContent = d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  }
  tick();
  setInterval(tick, 1000);
}

/* ════════════════════════════════════════════════════════════
   6. DASHBOARD
════════════════════════════════════════════════════════════ */
let _charts = {};

function renderDashboard() {
  const s = getDashboardStats();
  const el = id => document.getElementById(id);

  el('stat-total-req').textContent    = s.totalRequests;
  el('stat-active-amb').textContent   = s.activeAmbulances;
  el('stat-avail-hosp').textContent   = s.availableHospitals;
  el('stat-patients').textContent     = s.patientsUnderCare;
  el('stat-critical').textContent     = s.criticalCases;
  el('stat-completed').textContent    = s.completed;

  renderDashRecentRequests();
  renderDashAmbulances();
  renderDashHospitals();
  renderActivityFeed();
  renderAlerts();
  renderPriorityChart();
  renderStatusChart();
}

function renderDashRecentRequests() {
  const reqs = getAll(KEYS.requests).slice(0,5);
  const tbody = document.getElementById('dash-req-tbody');
  if (!tbody) return;
  if (!reqs.length) { tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-3">No active requests</td></tr>`; return; }
  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.id)}</strong></td>
      <td>${escapeHtml(r.patientName)}</td>
      <td>${escapeHtml(r.emergencyType)}</td>
      <td>${priorityBadge(r.priority)}</td>
      <td>${statusBadge(r.status)}</td>
      <td><button class="btn btn-sm btn-outline-primary py-0" style="font-size:0.72rem" onclick="viewRequestDetails('${r.id}')">View</button></td>
    </tr>`).join('');
}

function renderDashAmbulances() {
  const ambs = getAll(KEYS.ambulances);
  const el = document.getElementById('dash-amb-tbody');
  if (!el) return;
  el.innerHTML = ambs.slice(0,5).map(a=>`
    <tr>
      <td><strong>${escapeHtml(a.id)}</strong></td>
      <td>${escapeHtml(a.type.split('(')[0].trim())}</td>
      <td>${escapeHtml(a.driver)}</td>
      <td>${statusBadge(a.status)}</td>
    </tr>`).join('');
}

function renderDashHospitals() {
  const hosps = getAll(KEYS.hospitals);
  const el = document.getElementById('dash-hosp-tbody');
  if (!el) return;
  el.innerHTML = hosps.map(h => {
    const bedPct = Math.round((h.emergencyBeds / (h.totalEmergencyBeds||h.emergencyBeds||1))*100);
    const color = bedPct>60?'var(--green)':bedPct>30?'var(--orange)':'var(--red)';
    return `<tr>
      <td><strong>${escapeHtml(h.name)}</strong></td>
      <td>${escapeHtml(h.city)}</td>
      <td>
        <div style="font-size:0.78rem;font-weight:600;color:${color}">${h.emergencyBeds} beds</div>
        <div class="capacity-bar"><div class="capacity-fill" style="width:${bedPct}%;background:${color}"></div></div>
      </td>
      <td>${statusBadge(h.status)}</td>
    </tr>`;
  }).join('');
}

function renderActivityFeed() {
  const act = getAll(KEYS.activity).slice(0,8);
  const el = document.getElementById('activity-feed');
  if (!el) return;
  const colorMap = { red:'var(--red)', orange:'var(--orange)', blue:'var(--blue)', green:'var(--green)', purple:'#7c3aed' };
  el.innerHTML = act.length ? act.map(a=>`
    <div class="activity-item">
      <div class="activity-dot" style="background:${colorMap[a.type]||'#6b7280'}"></div>
      <div style="flex:1">
        <div style="font-size:0.8rem">${escapeHtml(a.msg)}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">${timeAgo(a.time)}</div>
      </div>
    </div>`).join('') : `<p class="text-muted text-center py-3" style="font-size:0.8rem">No recent activity</p>`;
}

function renderAlerts() {
  const reqs = getAll(KEYS.requests);
  const critical = reqs.filter(r=>r.priority==='Critical');
  const el = document.getElementById('alerts-panel');
  if (!el) return;
  if (!critical.length) { el.innerHTML = `<div class="alert-item" style="background:#f0fdf4"><i class="bi bi-check-circle-fill text-success"></i><span>No critical emergencies at the moment.</span></div>`; return; }
  el.innerHTML = critical.map(r=>`
    <div class="alert-item" style="background:#fef2f2;border:1px solid #fca5a5;">
      <i class="bi bi-exclamation-triangle-fill" style="color:var(--red);flex-shrink:0;margin-top:2px"></i>
      <div>
        <strong style="font-size:0.8rem">${escapeHtml(r.id)} – ${escapeHtml(r.patientName)}</strong><br>
        <span style="font-size:0.76rem;color:var(--text-muted)">${escapeHtml(r.emergencyType)} · ${escapeHtml(r.location)}</span>
      </div>
      <button class="btn btn-sm ms-auto py-0 px-2" style="font-size:0.7rem;background:#fef2f2;border:1px solid #fca5a5;color:var(--red)" onclick="viewRequestDetails('${r.id}')">View</button>
    </div>`).join('');
}

function renderPriorityChart() {
  const reqs = getAll(KEYS.requests);
  const counts = { Critical:0, High:0, Medium:0, Low:0 };
  reqs.forEach(r => { if(counts[r.priority]!==undefined) counts[r.priority]++; });
  const ctx = document.getElementById('chart-priority');
  if (!ctx) return;
  if (_charts.priority) { _charts.priority.destroy(); }
  _charts.priority = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor:['#d63031','#d97706','#f59e0b','#16a34a'], borderWidth:2 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{size:11}, padding:10 } } } }
  });
}

function renderStatusChart() {
  const reqs = getAll(KEYS.requests);
  const statusCounts = {};
  reqs.forEach(r => { statusCounts[r.status] = (statusCounts[r.status]||0)+1; });
  const labels = Object.keys(statusCounts);
  const data   = Object.values(statusCounts);
  const ctx = document.getElementById('chart-status');
  if (!ctx) return;
  if (_charts.status) { _charts.status.destroy(); }
  _charts.status = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label:'Requests', data, backgroundColor:'rgba(10,22,40,0.75)', borderRadius:5 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,ticks:{stepSize:1}}, x:{ticks:{font:{size:9}}} } }
  });
}

/* ════════════════════════════════════════════════════════════
   7. EMERGENCY REQUESTS MODULE
════════════════════════════════════════════════════════════ */
let _reqSearch='', _reqFilterPriority='', _reqFilterStatus='', _reqFilterType='', _reqSort='date-desc';

function renderRequests() {
  let reqs = getAll(KEYS.requests);
  if (_reqSearch) {
    const s = _reqSearch.toLowerCase();
    reqs = reqs.filter(r=>(r.id+r.patientName+r.emergencyType+r.location+r.status).toLowerCase().includes(s));
  }
  if (_reqFilterPriority) reqs = reqs.filter(r=>r.priority===_reqFilterPriority);
  if (_reqFilterStatus)   reqs = reqs.filter(r=>r.status===_reqFilterStatus);
  if (_reqFilterType)     reqs = reqs.filter(r=>r.emergencyType===_reqFilterType);

  if (_reqSort==='date-desc') reqs.sort((a,b)=>b.id.localeCompare(a.id));
  else if (_reqSort==='date-asc') reqs.sort((a,b)=>a.id.localeCompare(b.id));
  else if (_reqSort==='priority') {
    const po={Critical:0,High:1,Medium:2,Low:3};
    reqs.sort((a,b)=>(po[a.priority]??9)-(po[b.priority]??9));
  }

  const tbody = document.getElementById('req-tbody');
  if (!tbody) return;

  if (!reqs.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-inbox"></i><p>No emergency requests found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = reqs.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.id)}</strong></td>
      <td>${escapeHtml(r.patientName)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(r.age+'y • '+r.gender)}</span></td>
      <td>${escapeHtml(r.emergencyType)}</td>
      <td>${escapeHtml(r.location)}</td>
      <td>${priorityBadge(r.priority)}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${escapeHtml(r.assignedAmbulance||'—')}</td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.7rem" onclick="viewRequestDetails('${r.id}')"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.7rem" onclick="openEditRequest('${r.id}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.7rem" onclick="deleteRequest('${r.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddRequest() {
  document.getElementById('reqModalTitle').textContent = 'New Emergency Request';
  document.getElementById('reqForm').reset();
  document.getElementById('reqId').value = '';
  document.getElementById('reqIdDisplay').textContent = '(auto-generated)';
  const ambs = getAll(KEYS.ambulances).filter(a=>a.status==='Available');
  const hosps = getAll(KEYS.hospitals).filter(h=>h.status==='Accepting Emergency Patients'||h.status==='Limited Emergency Capacity');
  document.getElementById('reqAmbulance').innerHTML = '<option value="">-- Select Ambulance --</option>'+ambs.map(a=>`<option value="${a.id}">${a.id} – ${escapeHtml(a.driver)} (${escapeHtml(a.type)})</option>`).join('');
  document.getElementById('reqHospital').innerHTML = '<option value="">-- Select Hospital --</option>'+hosps.map(h=>`<option value="${h.id}">${escapeHtml(h.name)} (${h.emergencyBeds} beds)</option>`).join('');
  const m = new bootstrap.Modal(document.getElementById('reqModal'));
  m.show();
}

function openEditRequest(id) {
  const reqs = getAll(KEYS.requests);
  const r = reqs.find(x=>x.id===id);
  if (!r) return;
  document.getElementById('reqModalTitle').textContent = 'Edit Emergency Request';
  document.getElementById('reqId').value = r.id;
  document.getElementById('reqIdDisplay').textContent = r.id;
  const fields = ['patientName','age','gender','contact','emergencyType','description','condition','priority','location','lat','lng','eta','status'];
  fields.forEach(f => {
    const el = document.getElementById('req'+cap(f));
    if (el) el.value = r[f]||'';
  });
  const ambs = getAll(KEYS.ambulances);
  const hosps = getAll(KEYS.hospitals);
  document.getElementById('reqAmbulance').innerHTML = '<option value="">-- None --</option>'+ambs.map(a=>`<option value="${a.id}" ${a.id===r.assignedAmbulance?'selected':''}>${a.id} – ${escapeHtml(a.driver)}</option>`).join('');
  document.getElementById('reqHospital').innerHTML = '<option value="">-- None --</option>'+hosps.map(h=>`<option value="${h.id}" ${h.id===r.assignedHospital?'selected':''}>${escapeHtml(h.name)}</option>`).join('');
  const m = new bootstrap.Modal(document.getElementById('reqModal'));
  m.show();
}

function cap(s) { return s.charAt(0).toUpperCase()+s.slice(1); }

function saveRequest() {
  const form = document.getElementById('reqForm');
  if (!validateForm(form)) return;

  const id = document.getElementById('reqId').value;
  const data = {
    patientName: v('reqPatientName'), age: v('reqAge'), gender: v('reqGender'),
    contact: v('reqContact'), emergencyType: v('reqEmergencyType'),
    description: v('reqDescription'), condition: v('reqCondition'),
    priority: v('reqPriority'), location: v('reqLocation'),
    lat: v('reqLat')||'12.9716', lng: v('reqLng')||'77.5946',
    assignedAmbulance: v('reqAmbulance'), assignedHospital: v('reqHospital'),
    eta: v('reqEta'), status: v('reqStatus')
  };

  const reqs = getAll(KEYS.requests);
  if (id) {
    const idx = reqs.findIndex(r=>r.id===id);
    if (idx>-1) { reqs[idx] = {...reqs[idx], ...data}; }
    saveAll(KEYS.requests, reqs);
    showToast('Emergency request updated successfully.','success');
    addActivity(`Emergency ${id} updated — ${data.status}`,'blue');
  } else {
    const newId = nextId('req');
    const newReq = { id:newId, ...data, date:new Date().toISOString().slice(0,10), time:new Date().toTimeString().slice(0,5) };
    reqs.unshift(newReq);
    saveAll(KEYS.requests, reqs);
    // Update ambulance status
    if (data.assignedAmbulance) {
      const ambs = getAll(KEYS.ambulances);
      const ai = ambs.findIndex(a=>a.id===data.assignedAmbulance);
      if (ai>-1) { ambs[ai].status='On Emergency Duty'; ambs[ai].assignedEmergency=newId; saveAll(KEYS.ambulances,ambs); }
    }
    showToast(`Emergency ${newId} created successfully.`,'success');
    addActivity(`New emergency ${newId} — ${data.emergencyType} at ${data.location}`,'red');
    addNotification('Emergency Request Created', newId, data.patientName, `Emergency ${newId} created. ${data.emergencyType} at ${data.location}.`);
  }

  bootstrap.Modal.getInstance(document.getElementById('reqModal'))?.hide();
  renderRequests();
  updateNotifBadge();
}

function deleteRequest(id) {
  if (!confirmDialog(`Delete Emergency Request ${id}? This cannot be undone.`)) return;
  const reqs = getAll(KEYS.requests).filter(r=>r.id!==id);
  saveAll(KEYS.requests, reqs);
  // Free ambulance
  const ambs = getAll(KEYS.ambulances);
  ambs.forEach(a => { if(a.assignedEmergency===id){ a.assignedEmergency=''; a.status='Available'; } });
  saveAll(KEYS.ambulances, ambs);
  showToast(`Request ${id} deleted.`,'danger');
  addActivity(`Emergency ${id} deleted from system`,'red');
  renderRequests();
}

function viewRequestDetails(id) {
  const r = getAll(KEYS.requests).find(x=>x.id===id);
  if (!r) return;
  const hosps = getAll(KEYS.hospitals);
  const hospName = (hosps.find(h=>h.id===r.assignedHospital)||{}).name || r.assignedHospital || '—';
  document.getElementById('reqDetailBody').innerHTML = `
    <div class="detail-top rounded">
      <div class="dt-id">Emergency ID: ${escapeHtml(r.id)}</div>
      <h4>${escapeHtml(r.patientName)} <span class="sbadge sb-critical ms-2" style="font-size:0.72rem">${escapeHtml(r.priority)}</span></h4>
      <div class="dt-sub"><i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(r.location)}</div>
    </div>
    <div class="p-3">
      <div class="row g-0">
        <div class="col-md-6">
          ${dr('Emergency Type', r.emergencyType)}
          ${dr('Patient Age', r.age+' years')}
          ${dr('Gender', r.gender)}
          ${dr('Condition', r.condition)}
          ${dr('Contact', r.contact)}
          ${dr('Description', r.description)}
        </div>
        <div class="col-md-6">
          ${dr('Assigned Ambulance', r.assignedAmbulance||'—')}
          ${dr('Assigned Hospital', hospName)}
          ${dr('ETA', r.eta||'—')}
          ${dr('Date', r.date)}
          ${dr('Time', r.time)}
          ${dr('Status', statusBadge(r.status))}
        </div>
      </div>
      <hr>
      <h6 class="fw-700" style="font-size:0.85rem;color:var(--navy)">Response Timeline</h6>
      <ul class="timeline">
        <li><div class="tl-dot" style="background:#fef2f2;color:var(--red)"><i class="bi bi-telephone-fill"></i></div><div class="tl-content"><strong>Emergency Request Created</strong><span>${escapeHtml(r.date)} ${escapeHtml(r.time)}</span></div></li>
        ${r.assignedAmbulance?`<li><div class="tl-dot" style="background:#fff7ed;color:var(--orange)"><i class="bi bi-truck-front-fill"></i></div><div class="tl-content"><strong>Ambulance ${escapeHtml(r.assignedAmbulance)} Assigned</strong><span>AI-matched to nearest ALS unit</span></div></li>`:''}
        ${r.assignedHospital?`<li><div class="tl-dot" style="background:#eff6ff;color:var(--blue)"><i class="bi bi-hospital-fill"></i></div><div class="tl-content"><strong>${escapeHtml(hospName)} Notified</strong><span>Hospital alerted and trauma bay reserved</span></div></li>`:''}
        <li><div class="tl-dot" style="background:#faf5ff;color:#7c3aed"><i class="bi bi-activity"></i></div><div class="tl-content"><strong>Current Status: ${escapeHtml(r.status)}</strong><span>ETA: ${escapeHtml(r.eta||'—')}</span></div></li>
      </ul>
      <div class="d-flex gap-2 mt-3 flex-wrap">
        <button class="btn btn-sm btn-primary" onclick="openEditRequest('${r.id}'); bootstrap.Modal.getInstance(document.getElementById('reqDetailModal'))?.hide()"><i class="bi bi-pencil me-1"></i>Edit</button>
        <button class="btn btn-sm" style="background:#faf5ff;color:#7c3aed;border:1px solid #c4b5fd" onclick="openAIRecommendation('${r.id}'); bootstrap.Modal.getInstance(document.getElementById('reqDetailModal'))?.hide()"><i class="bi bi-stars me-1"></i>Find Best Hospital</button>
        <button class="btn btn-sm" style="background:#eff6ff;color:var(--blue);border:1px solid #93c5fd" onclick="openRouteModal('${r.id}'); bootstrap.Modal.getInstance(document.getElementById('reqDetailModal'))?.hide()"><i class="bi bi-map me-1"></i>View Route</button>
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('reqDetailModal')).show();
}

function dr(label, val) {
  return `<div class="detail-row"><span class="dl">${escapeHtml(label)}</span><span class="dv">${val}</span></div>`;
}

function v(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

/* ════════════════════════════════════════════════════════════
   8. AMBULANCES MODULE
════════════════════════════════════════════════════════════ */
let _ambSearch='', _ambFilterStatus='';

function renderAmbulances() {
  let ambs = getAll(KEYS.ambulances);
  if (_ambSearch) {
    const s = _ambSearch.toLowerCase();
    ambs = ambs.filter(a=>(a.id+a.driver+a.type+a.location+a.status).toLowerCase().includes(s));
  }
  if (_ambFilterStatus) ambs = ambs.filter(a=>a.status===_ambFilterStatus);

  const tbody = document.getElementById('amb-tbody');
  if (!tbody) return;

  if (!ambs.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-truck-front"></i><p>No ambulances found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = ambs.map(a=>`
    <tr>
      <td><strong>${escapeHtml(a.id)}</strong><br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(a.regNo)}</span></td>
      <td>${escapeHtml(a.type)}</td>
      <td>${escapeHtml(a.driver)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(a.driverContact)}</span></td>
      <td>${escapeHtml(a.location)}</td>
      <td>${escapeHtml(a.assignedEmergency||'—')}</td>
      <td>${statusBadge(a.status)}</td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.7rem" onclick="viewAmbDetails('${a.id}')"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.7rem" onclick="openEditAmb('${a.id}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.7rem" onclick="deleteAmb('${a.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddAmb() {
  document.getElementById('ambModalTitle').textContent = 'Add Ambulance';
  document.getElementById('ambForm').reset();
  document.getElementById('ambId').value = '';
  document.getElementById('ambIdDisplay').textContent = '(auto-generated)';
  new bootstrap.Modal(document.getElementById('ambModal')).show();
}

function openEditAmb(id) {
  const a = getAll(KEYS.ambulances).find(x=>x.id===id);
  if (!a) return;
  document.getElementById('ambModalTitle').textContent = 'Edit Ambulance';
  document.getElementById('ambId').value = a.id;
  document.getElementById('ambIdDisplay').textContent = a.id;
  ['regNo','type','driver','driverContact','medicalStaff','location','lat','lng','equipment','status'].forEach(f=>{
    const el = document.getElementById('amb'+cap(f));
    if (el) el.value = a[f]||'';
  });
  new bootstrap.Modal(document.getElementById('ambModal')).show();
}

function saveAmb() {
  const form = document.getElementById('ambForm');
  if (!validateForm(form)) return;
  const id = document.getElementById('ambId').value;
  const data = {
    regNo:v('ambRegNo'), type:v('ambType'), driver:v('ambDriver'), driverContact:v('ambDriverContact'),
    medicalStaff:v('ambMedicalStaff'), location:v('ambLocation'), lat:v('ambLat')||'12.9716', lng:v('ambLng')||'77.5946',
    equipment:v('ambEquipment'), status:v('ambStatus')
  };
  const ambs = getAll(KEYS.ambulances);
  if (id) {
    const idx = ambs.findIndex(a=>a.id===id);
    if (idx>-1) ambs[idx] = {...ambs[idx], ...data};
    saveAll(KEYS.ambulances, ambs);
    showToast(`Ambulance ${id} updated.`,'success');
  } else {
    const newId = nextId('amb');
    ambs.push({id:newId, ...data, assignedEmergency:''});
    saveAll(KEYS.ambulances, ambs);
    showToast(`Ambulance ${newId} added.`,'success');
    addActivity(`Ambulance ${newId} added to fleet`,'orange');
  }
  bootstrap.Modal.getInstance(document.getElementById('ambModal'))?.hide();
  renderAmbulances();
}

function deleteAmb(id) {
  const a = getAll(KEYS.ambulances).find(x=>x.id===id);
  if (a && a.assignedEmergency) { showToast('Cannot delete — ambulance is on active duty.','warning'); return; }
  if (!confirmDialog(`Delete Ambulance ${id}?`)) return;
  saveAll(KEYS.ambulances, getAll(KEYS.ambulances).filter(a=>a.id!==id));
  showToast(`Ambulance ${id} removed.`,'danger');
  renderAmbulances();
}

function viewAmbDetails(id) {
  const a = getAll(KEYS.ambulances).find(x=>x.id===id);
  if (!a) return;
  document.getElementById('ambDetailBody').innerHTML = `
    <div class="detail-top rounded">
      <div class="dt-id">Ambulance ID: ${escapeHtml(a.id)}</div>
      <h4><i class="bi bi-truck-front-fill me-2"></i>${escapeHtml(a.id)}</h4>
      <div class="dt-sub">${escapeHtml(a.type)}</div>
    </div>
    <div class="p-3">
      ${dr('Registration No.', a.regNo)}
      ${dr('Driver', a.driver)}
      ${dr('Driver Contact', a.driverContact)}
      ${dr('Medical Staff', a.medicalStaff||'—')}
      ${dr('Location', a.location)}
      ${dr('Equipment', a.equipment||'—')}
      ${dr('Assigned Emergency', a.assignedEmergency||'—')}
      ${dr('Status', statusBadge(a.status))}
    </div>`;
  new bootstrap.Modal(document.getElementById('ambDetailModal')).show();
}

/* ════════════════════════════════════════════════════════════
   9. HOSPITALS MODULE
════════════════════════════════════════════════════════════ */
let _hospSearch='', _hospFilterStatus='';

function renderHospitals() {
  let hosps = getAll(KEYS.hospitals);
  if (_hospSearch) {
    const s = _hospSearch.toLowerCase();
    hosps = hosps.filter(h=>(h.id+h.name+h.city+h.status).toLowerCase().includes(s));
  }
  if (_hospFilterStatus) hosps = hosps.filter(h=>h.status===_hospFilterStatus);

  const tbody = document.getElementById('hosp-tbody');
  if (!tbody) return;

  if (!hosps.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-hospital"></i><p>No hospitals found.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = hosps.map(h=>{
    const bedPct = Math.round((h.emergencyBeds/(h.totalEmergencyBeds||h.emergencyBeds||1))*100);
    const c = bedPct>60?'var(--green)':bedPct>30?'var(--orange)':'var(--red)';
    return `<tr>
      <td><strong>${escapeHtml(h.id)}</strong></td>
      <td>${escapeHtml(h.name)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(h.city)}</span></td>
      <td>${escapeHtml(h.contact)}</td>
      <td>
        <div style="font-size:0.8rem;font-weight:600">${h.emergencyBeds} <span style="font-size:0.7rem;color:var(--text-muted)">/ ${h.totalEmergencyBeds||h.emergencyBeds}</span></div>
        <div class="capacity-bar"><div class="capacity-fill" style="width:${bedPct}%;background:${c}"></div></div>
      </td>
      <td style="font-size:0.8rem">${h.icuBeds}</td>
      <td>${statusBadge(h.status)}</td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.7rem" onclick="viewHospDetails('${h.id}')"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.7rem" onclick="openEditHosp('${h.id}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.7rem" onclick="deleteHosp('${h.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function openAddHosp() {
  document.getElementById('hospModalTitle').textContent = 'Add Hospital';
  document.getElementById('hospForm').reset();
  document.getElementById('hospId').value = '';
  document.getElementById('hospIdDisplay').textContent = '(auto-generated)';
  new bootstrap.Modal(document.getElementById('hospModal')).show();
}

function openEditHosp(id) {
  const h = getAll(KEYS.hospitals).find(x=>x.id===id);
  if (!h) return;
  document.getElementById('hospModalTitle').textContent = 'Edit Hospital';
  document.getElementById('hospId').value = h.id;
  document.getElementById('hospIdDisplay').textContent = h.id;
  ['name','address','city','contact','emergencyBeds','icuBeds','receivingCapacity','lat','lng','status','totalEmergencyBeds','totalIcuBeds'].forEach(f=>{
    const el=document.getElementById('hosp'+cap(f)); if(el) el.value=h[f]||'';
  });
  ['emergencyDept','traumaCare','cardiacCare','strokeCare'].forEach(f=>{
    const el=document.getElementById('hosp'+cap(f)); if(el) el.checked=!!h[f];
  });
  new bootstrap.Modal(document.getElementById('hospModal')).show();
}

function saveHosp() {
  const form = document.getElementById('hospForm');
  if (!validateForm(form)) return;
  const id = document.getElementById('hospId').value;
  const data = {
    name:v('hospName'), address:v('hospAddress'), city:v('hospCity'), contact:v('hospContact'),
    emergencyBeds:parseInt(v('hospEmergencyBeds'))||0, icuBeds:parseInt(v('hospIcuBeds'))||0,
    receivingCapacity:parseInt(v('hospReceivingCapacity'))||0, lat:v('hospLat')||'12.9716', lng:v('hospLng')||'77.5946',
    status:v('hospStatus'), totalEmergencyBeds:parseInt(v('hospTotalEmergencyBeds'))||parseInt(v('hospEmergencyBeds'))||10,
    totalIcuBeds:parseInt(v('hospTotalIcuBeds'))||parseInt(v('hospIcuBeds'))||6,
    emergencyDept:document.getElementById('hospEmergencyDept')?.checked||false,
    traumaCare:document.getElementById('hospTraumaCare')?.checked||false,
    cardiacCare:document.getElementById('hospCardiacCare')?.checked||false,
    strokeCare:document.getElementById('hospStrokeCare')?.checked||false
  };
  const hosps = getAll(KEYS.hospitals);
  if (id) {
    const idx = hosps.findIndex(h=>h.id===id); if(idx>-1) hosps[idx]={...hosps[idx],...data};
    saveAll(KEYS.hospitals, hosps); showToast(`Hospital ${id} updated.`,'success');
  } else {
    const newId = nextId('hosp'); hosps.push({id:newId,...data});
    saveAll(KEYS.hospitals, hosps); showToast(`Hospital ${newId} added.`,'success');
    addActivity(`Hospital ${newId} (${data.name}) added to network`,'green');
  }
  bootstrap.Modal.getInstance(document.getElementById('hospModal'))?.hide();
  renderHospitals();
}

function deleteHosp(id) {
  if (!confirmDialog(`Delete Hospital ${id}? Patients assigned here will need reassignment.`)) return;
  saveAll(KEYS.hospitals, getAll(KEYS.hospitals).filter(h=>h.id!==id));
  showToast(`Hospital ${id} removed.`,'danger');
  renderHospitals();
}

function viewHospDetails(id) {
  const h = getAll(KEYS.hospitals).find(x=>x.id===id);
  if (!h) return;
  const bedPct=Math.round((h.emergencyBeds/(h.totalEmergencyBeds||h.emergencyBeds||1))*100);
  const icuPct=Math.round((h.icuBeds/(h.totalIcuBeds||h.icuBeds||1))*100);
  const c=bedPct>60?'var(--green)':bedPct>30?'var(--orange)':'var(--red)';
  const patients = getAll(KEYS.patients).filter(p=>p.assignedHospital===id&&p.status!=='Discharged');
  document.getElementById('hospDetailBody').innerHTML = `
    <div class="detail-top rounded">
      <div class="dt-id">Hospital ID: ${escapeHtml(h.id)}</div>
      <h4><i class="bi bi-hospital-fill me-2"></i>${escapeHtml(h.name)}</h4>
      <div class="dt-sub"><i class="bi bi-geo-alt-fill me-1"></i>${escapeHtml(h.address)}, ${escapeHtml(h.city)}</div>
    </div>
    <div class="p-3">
      <div class="row g-3 mb-3">
        <div class="col-6">
          <div class="info-item">
            <div class="ii-label">Emergency Beds</div>
            <div class="ii-value" style="color:${c}">${h.emergencyBeds} / ${h.totalEmergencyBeds}</div>
            <div class="capacity-bar"><div class="capacity-fill" style="width:${bedPct}%;background:${c}"></div></div>
          </div>
        </div>
        <div class="col-6">
          <div class="info-item">
            <div class="ii-label">ICU Beds</div>
            <div class="ii-value">${h.icuBeds} / ${h.totalIcuBeds}</div>
            <div class="capacity-bar"><div class="capacity-fill" style="width:${icuPct}%;background:var(--blue)"></div></div>
          </div>
        </div>
      </div>
      ${dr('Contact', h.contact)}
      ${dr('Trauma Care', h.traumaCare?'<span class="sbadge sb-available">Available</span>':'<span class="sbadge sb-cancelled">Not Available</span>')}
      ${dr('Cardiac Care', h.cardiacCare?'<span class="sbadge sb-available">Available</span>':'<span class="sbadge sb-cancelled">Not Available</span>')}
      ${dr('Stroke Care', h.strokeCare?'<span class="sbadge sb-available">Available</span>':'<span class="sbadge sb-cancelled">Not Available</span>')}
      ${dr('Status', statusBadge(h.status))}
      <hr>
      <div style="font-size:0.85rem;font-weight:700;color:var(--navy);margin-bottom:8px">Current Patients (${patients.length})</div>
      ${patients.length?patients.map(p=>`<div style="font-size:0.8rem;padding:4px 0;border-bottom:1px solid var(--border)">${escapeHtml(p.name)} — ${statusBadge(p.status)}</div>`).join(''):`<p class="text-muted" style="font-size:0.78rem">No active patients assigned.</p>`}
    </div>`;
  new bootstrap.Modal(document.getElementById('hospDetailModal')).show();
}

/* ════════════════════════════════════════════════════════════
   10. PATIENTS MODULE
════════════════════════════════════════════════════════════ */
let _patSearch='', _patFilterStatus='';

function renderPatients() {
  let pats = getAll(KEYS.patients);
  if (_patSearch) {
    const s=_patSearch.toLowerCase();
    pats=pats.filter(p=>(p.id+p.name+p.emergencyType+p.condition+p.status).toLowerCase().includes(s));
  }
  if (_patFilterStatus) pats=pats.filter(p=>p.status===_patFilterStatus);

  const tbody=document.getElementById('pat-tbody');
  if (!tbody) return;
  if (!pats.length) {
    tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><i class="bi bi-person"></i><p>No patients found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML=pats.map(p=>`
    <tr>
      <td><strong>${escapeHtml(p.id)}</strong></td>
      <td>${escapeHtml(p.name)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(p.age+'y • '+p.gender)}</span></td>
      <td>${escapeHtml(p.emergencyType)}</td>
      <td>${escapeHtml(p.condition)}</td>
      <td>${escapeHtml(p.assignedAmbulance||'—')}</td>
      <td>${escapeHtml(p.assignedHospital||'—')}</td>
      <td>${statusBadge(p.status)}</td>
      <td>
        <div class="d-flex gap-1 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary py-0 px-2" style="font-size:0.7rem" onclick="viewPatDetails('${p.id}')"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.7rem" onclick="openEditPat('${p.id}')"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.7rem" onclick="deletePat('${p.id}')"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

function openAddPat() {
  document.getElementById('patModalTitle').textContent = 'Add Patient';
  document.getElementById('patForm').reset();
  document.getElementById('patId').value = '';
  document.getElementById('patIdDisplay').textContent = '(auto-generated)';
  populatePatDropdowns('','');
  new bootstrap.Modal(document.getElementById('patModal')).show();
}

function openEditPat(id) {
  const p=getAll(KEYS.patients).find(x=>x.id===id);
  if (!p) return;
  document.getElementById('patModalTitle').textContent='Edit Patient';
  document.getElementById('patId').value=p.id;
  document.getElementById('patIdDisplay').textContent=p.id;
  ['name','age','gender','contact','emergencyType','condition','assignedEmergencyId','status'].forEach(f=>{
    const el=document.getElementById('pat'+cap(f)); if(el) el.value=p[f]||'';
  });
  populatePatDropdowns(p.assignedAmbulance, p.assignedHospital);
  new bootstrap.Modal(document.getElementById('patModal')).show();
}

function populatePatDropdowns(selAmb, selHosp) {
  const ambs=getAll(KEYS.ambulances);
  const hosps=getAll(KEYS.hospitals);
  document.getElementById('patAssignedAmbulance').innerHTML='<option value="">-- None --</option>'+ambs.map(a=>`<option value="${a.id}" ${a.id===selAmb?'selected':''}>${a.id} – ${escapeHtml(a.driver)}</option>`).join('');
  document.getElementById('patAssignedHospital').innerHTML='<option value="">-- None --</option>'+hosps.map(h=>`<option value="${h.id}" ${h.id===selHosp?'selected':''}>${escapeHtml(h.name)}</option>`).join('');
}

function savePat() {
  const form=document.getElementById('patForm');
  if (!validateForm(form)) return;
  const id=document.getElementById('patId').value;
  const data={
    name:v('patName'), age:v('patAge'), gender:v('patGender'), contact:v('patContact'),
    emergencyType:v('patEmergencyType'), condition:v('patCondition'),
    assignedEmergencyId:v('patAssignedEmergencyId'), assignedAmbulance:v('patAssignedAmbulance'),
    assignedHospital:v('patAssignedHospital'), status:v('patStatus')
  };
  const pats=getAll(KEYS.patients);
  if (id) {
    const idx=pats.findIndex(p=>p.id===id); if(idx>-1) pats[idx]={...pats[idx],...data};
    saveAll(KEYS.patients,pats); showToast(`Patient ${id} updated.`,'success');
  } else {
    const newId=nextId('pat'); pats.push({id:newId,...data,regDate:new Date().toISOString()});
    saveAll(KEYS.patients,pats); showToast(`Patient ${newId} registered.`,'success');
    addActivity(`Patient ${data.name} registered (${newId})`,'blue');
  }
  bootstrap.Modal.getInstance(document.getElementById('patModal'))?.hide();
  renderPatients();
}

function deletePat(id) {
  if (!confirmDialog(`Delete Patient ${id}?`)) return;
  saveAll(KEYS.patients,getAll(KEYS.patients).filter(p=>p.id!==id));
  showToast(`Patient ${id} deleted.`,'danger');
  renderPatients();
}

function viewPatDetails(id) {
  const p=getAll(KEYS.patients).find(x=>x.id===id);
  if (!p) return;
  const hospName=(getAll(KEYS.hospitals).find(h=>h.id===p.assignedHospital)||{}).name||p.assignedHospital||'—';
  document.getElementById('patDetailBody').innerHTML=`
    <div class="detail-top rounded">
      <div class="dt-id">Patient ID: ${escapeHtml(p.id)}</div>
      <h4><i class="bi bi-person-fill me-2"></i>${escapeHtml(p.name)}</h4>
      <div class="dt-sub">${escapeHtml(p.age+'y • '+p.gender)}</div>
    </div>
    <div class="p-3">
      ${dr('Emergency Type', p.emergencyType)}
      ${dr('Condition', p.condition)}
      ${dr('Contact', p.contact)}
      ${dr('Emergency ID', p.assignedEmergencyId||'—')}
      ${dr('Ambulance', p.assignedAmbulance||'—')}
      ${dr('Hospital', hospName)}
      ${dr('Status', statusBadge(p.status))}
      ${dr('Registered', fmtDate(p.regDate))}
    </div>`;
  new bootstrap.Modal(document.getElementById('patDetailModal')).show();
}

/* ════════════════════════════════════════════════════════════
   11. AI HOSPITAL RECOMMENDATION
════════════════════════════════════════════════════════════ */
function openAIRecommendation(reqId) {
  const r = getAll(KEYS.requests).find(x=>x.id===reqId);
  if (!r) { showSection('requests'); return; }
  const hosps = getAll(KEYS.hospitals).filter(h=>h.status!=='Temporarily Unavailable');

  const scored = hosps.map(h=>{
    let score=0, reasons=[];
    // Availability
    if (h.status==='Accepting Emergency Patients') { score+=30; reasons.push('Accepting emergency patients'); }
    else if (h.status==='Limited Emergency Capacity') { score+=10; reasons.push('Limited capacity available'); }
    // Beds
    if (h.emergencyBeds>5) { score+=20; reasons.push(`${h.emergencyBeds} emergency beds available`); }
    else if (h.emergencyBeds>0) { score+=10; reasons.push(`${h.emergencyBeds} emergency beds available`); }
    // ICU
    if (h.icuBeds>0) { score+=15; reasons.push(`ICU beds: ${h.icuBeds}`); }
    // Type-specific
    if (r.emergencyType==='Road Accident'||r.emergencyType==='Trauma') {
      if (h.traumaCare) { score+=25; reasons.push('Trauma care facility available'); }
    }
    if (r.emergencyType==='Cardiac Emergency') {
      if (h.cardiacCare) { score+=25; reasons.push('Cardiac care available'); }
    }
    if (r.emergencyType==='Stroke') {
      if (h.strokeCare) { score+=25; reasons.push('Stroke treatment facility available'); }
    }
    // Simulated distance
    const dLat=Math.abs((parseFloat(r.lat)||12.9716)-(h.lat||12.9716));
    const dLng=Math.abs((parseFloat(r.lng)||77.5946)-(h.lng||77.5946));
    const dist=Math.round((Math.sqrt(dLat*dLat+dLng*dLng)*111)*10)/10;
    const eta=Math.round(dist/0.5+2);
    if (dist<3) { score+=10; reasons.push('Closest hospital'); }
    else if (dist<7) { score+=5; reasons.push('Moderate distance'); }
    return { ...h, score:Math.min(score,100), reasons, dist, eta };
  });

  scored.sort((a,b)=>b.score-a.score);

  document.getElementById('aiReqInfo').innerHTML=`
    <div class="alert alert-warning py-2 px-3 mb-3" style="font-size:0.78rem">
      <i class="bi bi-stars me-1"></i><strong>DEMO AI SIMULATION</strong> — Recommendations are generated by local rule-based logic. Not connected to any real hospital system. Always verify with actual emergency dispatch.
    </div>
    <div class="mb-3" style="font-size:0.82rem"><strong>Request:</strong> ${escapeHtml(r.id)} — ${escapeHtml(r.patientName)} | ${escapeHtml(r.emergencyType)} | Priority: ${escapeHtml(r.priority)}</div>`;

  document.getElementById('aiResults').innerHTML = scored.map((h,i)=>`
    <div class="ai-card">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <div>
          ${i===0?'<span class="ai-label me-2">TOP MATCH</span>':''}
          <strong style="font-size:0.9rem">${escapeHtml(h.name)}</strong>
          <span class="text-muted ms-2" style="font-size:0.75rem">${escapeHtml(h.city)}</span>
        </div>
        <div style="font-size:0.8rem;font-weight:700;color:#7c3aed">${h.score}%</div>
      </div>
      <div class="ai-score-bar"><div class="ai-score-fill" style="width:${h.score}%"></div></div>
      <div class="row g-2 mt-2" style="font-size:0.78rem">
        <div class="col-4"><i class="bi bi-geo-alt text-muted me-1"></i>~${h.dist} km</div>
        <div class="col-4"><i class="bi bi-clock text-muted me-1"></i>ETA ~${h.eta} min</div>
        <div class="col-4"><i class="bi bi-hospital text-muted me-1"></i>${h.emergencyBeds} beds</div>
      </div>
      <div class="mt-2" style="font-size:0.74rem;color:var(--text-muted)">
        ${h.reasons.map(r=>`<span class="me-2"><i class="bi bi-check2 text-success"></i> ${escapeHtml(r)}</span>`).join('')}
      </div>
      <button class="btn btn-sm mt-3 w-100" style="background:linear-gradient(90deg,#7c3aed,#2563eb);color:#fff;font-size:0.78rem" onclick="assignHospitalFromAI('${r.id}','${h.id}')">
        <i class="bi bi-check-circle me-1"></i>Assign ${escapeHtml(h.name)} to ${escapeHtml(r.id)}
      </button>
    </div>`).join('');

  new bootstrap.Modal(document.getElementById('aiModal')).show();
}

function assignHospitalFromAI(reqId, hospId) {
  const reqs=getAll(KEYS.requests);
  const idx=reqs.findIndex(r=>r.id===reqId);
  if (idx>-1) { reqs[idx].assignedHospital=hospId; saveAll(KEYS.requests,reqs); }
  const h=(getAll(KEYS.hospitals).find(x=>x.id===hospId)||{}).name||hospId;
  showToast(`Hospital assigned: ${h} → ${reqId}`,'success');
  addActivity(`AI recommended ${h} assigned to ${reqId}`,'purple');
  addNotification('Hospital Assigned', reqId, reqs[idx]?.patientName||'', `${h} assigned to ${reqId} via AI recommendation.`);
  bootstrap.Modal.getInstance(document.getElementById('aiModal'))?.hide();
  updateNotifBadge();
  if (_currentSection==='requests') renderRequests();
}

/* ════════════════════════════════════════════════════════════
   12. AMBULANCE ROUTE SIMULATION
════════════════════════════════════════════════════════════ */
let _leafletMap=null;

function openRouteModal(reqId) {
  const r=getAll(KEYS.requests).find(x=>x.id===reqId);
  if (!r) return;
  const hosp=(getAll(KEYS.hospitals).find(h=>h.id===r.assignedHospital)||{});
  const amb=(getAll(KEYS.ambulances).find(a=>a.id===r.assignedAmbulance)||{});

  document.getElementById('routeInfo').innerHTML=`
    <div class="alert alert-info py-2 px-3 mb-3" style="font-size:0.78rem">
      <i class="bi bi-info-circle me-1"></i><strong>SIMULATED ROUTE</strong> — Routes and travel times are simulated. No real GPS or live traffic data is used.
    </div>
    <div class="row g-2 mb-3" style="font-size:0.82rem">
      <div class="col-md-4"><strong>Emergency:</strong><br>${escapeHtml(r.id)}</div>
      <div class="col-md-4"><strong>From (Ambulance):</strong><br>${escapeHtml(amb.location||r.location||'—')}</div>
      <div class="col-md-4"><strong>To (Hospital):</strong><br>${escapeHtml(hosp.name||r.assignedHospital||'—')}</div>
    </div>`;

  const eLatLng=[parseFloat(r.lat)||12.9716, parseFloat(r.lng)||77.6097];
  const hLatLng=[hosp.lat||12.9716, hosp.lng||77.5946];
  const aLatLng=[parseFloat(amb.lat)||eLatLng[0]+0.005, parseFloat(amb.lng)||eLatLng[1]+0.005];

  const dDirect=Math.round(Math.sqrt(Math.pow((hLatLng[0]-eLatLng[0])*111,2)+Math.pow((hLatLng[1]-eLatLng[1])*111,2))*10)/10;
  const routes=[
    { name:'Route A – Direct (Recommended)', dist:dDirect, time:Math.round(dDirect*2+2), traffic:'Low Traffic', color:'#2563eb' },
    { name:'Route B – Via Ring Road', dist:Math.round((dDirect*1.25)*10)/10, time:Math.round(dDirect*2.5+3), traffic:'Moderate Traffic', color:'#d97706' },
    { name:'Route C – Alternate Highway', dist:Math.round((dDirect*1.4)*10)/10, time:Math.round(dDirect*1.8+4), traffic:'High Traffic', color:'#d63031' }
  ];

  document.getElementById('routeCards').innerHTML=routes.map((rt,i)=>`
    <div class="route-card ${i===0?'selected':''}" onclick="selectRoute(this,'${rt.name}')">
      <div class="d-flex justify-content-between align-items-center">
        <h6>${escapeHtml(rt.name)}</h6>
        ${i===0?'<span class="sbadge sb-available">Recommended</span>':''}
      </div>
      <div class="d-flex gap-3 mt-1" style="font-size:0.78rem;color:var(--text-muted)">
        <span><i class="bi bi-geo-alt me-1"></i>${rt.dist} km</span>
        <span><i class="bi bi-clock me-1"></i>~${rt.time} min</span>
        <span><i class="bi bi-traffic-cone me-1"></i>${escapeHtml(rt.traffic)}</span>
      </div>
    </div>`).join('');

  new bootstrap.Modal(document.getElementById('routeModal')).show();

  setTimeout(()=>{
    const mapDiv=document.getElementById('route-map');
    if (!mapDiv) return;
    if (_leafletMap) { _leafletMap.remove(); _leafletMap=null; }
    if (typeof L==='undefined') {
      mapDiv.innerHTML='<div class="d-flex align-items-center justify-content-center h-100"><div class="text-center text-muted"><i class="bi bi-map" style="font-size:2rem"></i><p style="font-size:0.8rem;margin-top:8px">Map not available — offline or map library loading.</p></div></div>';
      return;
    }
    try {
      _leafletMap=L.map('route-map').setView(eLatLng,13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(_leafletMap);
      L.marker(eLatLng).addTo(_leafletMap).bindPopup(`<b>Emergency</b><br>${escapeHtml(r.location||r.id)}`).openPopup();
      if (hosp.lat) L.marker(hLatLng,{icon:L.divIcon({html:'<i class="bi bi-hospital-fill" style="color:var(--red);font-size:1.2rem"></i>',iconSize:[24,24]})}).addTo(_leafletMap).bindPopup(`<b>${escapeHtml(hosp.name)}</b>`);
      L.polyline([aLatLng,eLatLng,hLatLng],{color:'#2563eb',weight:4,dashArray:'8,4'}).addTo(_leafletMap);
    } catch(e) {
      mapDiv.innerHTML='<div class="d-flex align-items-center justify-content-center h-100"><p class="text-muted" style="font-size:0.8rem">Map rendering failed. Route data shown above.</p></div>';
    }
  },400);
}

function selectRoute(el, name) {
  document.querySelectorAll('.route-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  showToast(`Route selected: ${name}`,'info');
}

/* ════════════════════════════════════════════════════════════
   13. ASSIGNMENTS MODULE
════════════════════════════════════════════════════════════ */
function renderAssignments() {
  let asgns = getAll(KEYS.assignments);
  const tbody=document.getElementById('asgn-tbody');
  if (!tbody) return;
  if (!asgns.length) {
    tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><i class="bi bi-calendar2-x"></i><p>No assignments found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML=asgns.map(a=>{
    const hospName=(getAll(KEYS.hospitals).find(h=>h.id===a.hospital)||{}).name||a.hospital||'—';
    return `<tr>
      <td><strong>${escapeHtml(a.id)}</strong></td>
      <td>${escapeHtml(a.emergencyId)}</td>
      <td>${escapeHtml(a.ambulanceId)}</td>
      <td>${escapeHtml(a.driver)}</td>
      <td>${escapeHtml(hospName)}</td>
      <td>${escapeHtml(a.date)} ${escapeHtml(a.time)}</td>
      <td>${escapeHtml(a.eta)}</td>
      <td>${statusBadge(a.status)}
        <button class="btn btn-sm btn-outline-danger py-0 px-2 ms-1" style="font-size:0.7rem" onclick="deleteAssignment('${a.id}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;}).join('');
}

function openAddAssignment() {
  document.getElementById('asgnForm').reset();
  document.getElementById('asgnId').value='';
  const reqs=getAll(KEYS.requests);
  const ambs=getAll(KEYS.ambulances).filter(a=>a.status==='Available');
  const hosps=getAll(KEYS.hospitals);
  document.getElementById('asgnEmergencyId').innerHTML='<option value="">-- Select Emergency --</option>'+reqs.map(r=>`<option value="${r.id}">${r.id} – ${escapeHtml(r.patientName)}</option>`).join('');
  document.getElementById('asgnAmbulanceId').innerHTML='<option value="">-- Select Ambulance --</option>'+ambs.map(a=>`<option value="${a.id}">${a.id} – ${escapeHtml(a.driver)}</option>`).join('');
  document.getElementById('asgnHospital').innerHTML='<option value="">-- Select Hospital --</option>'+hosps.map(h=>`<option value="${h.id}">${escapeHtml(h.name)}</option>`).join('');
  new bootstrap.Modal(document.getElementById('asgnModal')).show();
}

function saveAssignment() {
  const form=document.getElementById('asgnForm');
  if (!validateForm(form)) return;
  const data={
    emergencyId:v('asgnEmergencyId'), ambulanceId:v('asgnAmbulanceId'),
    driver:v('asgnDriver'), medicalStaff:v('asgnMedicalStaff'),
    hospital:v('asgnHospital'), date:v('asgnDate'), time:v('asgnTime'),
    eta:v('asgnEta'), status:v('asgnStatus')
  };
  const newId=nextId('assign');
  const asgns=getAll(KEYS.assignments);
  asgns.push({id:newId,...data});
  saveAll(KEYS.assignments,asgns);
  // Update ambulance
  if (data.ambulanceId) {
    const ambs=getAll(KEYS.ambulances);
    const ai=ambs.findIndex(a=>a.id===data.ambulanceId);
    if (ai>-1) { ambs[ai].status='On Emergency Duty'; ambs[ai].assignedEmergency=data.emergencyId; saveAll(KEYS.ambulances,ambs); }
  }
  showToast(`Assignment ${newId} created.`,'success');
  addActivity(`Assignment ${newId} created for ${data.emergencyId}`,'blue');
  bootstrap.Modal.getInstance(document.getElementById('asgnModal'))?.hide();
  renderAssignments();
}

function deleteAssignment(id) {
  if (!confirmDialog(`Delete Assignment ${id}?`)) return;
  const asgns=getAll(KEYS.assignments).filter(a=>a.id!==id);
  saveAll(KEYS.assignments,asgns);
  showToast(`Assignment ${id} deleted.`,'danger');
  renderAssignments();
}

/* ════════════════════════════════════════════════════════════
   14. HISTORY MODULE
════════════════════════════════════════════════════════════ */
let _histSearch='', _histFilterType='', _histFilterPriority='';

function renderHistory() {
  let hist=getAll(KEYS.history);
  if (_histSearch) {
    const s=_histSearch.toLowerCase();
    hist=hist.filter(h=>(h.id+h.patientName+h.emergencyType+h.assignedHospital+h.hospitalName).toLowerCase().includes(s));
  }
  if (_histFilterType)     hist=hist.filter(h=>h.emergencyType===_histFilterType);
  if (_histFilterPriority) hist=hist.filter(h=>h.priority===_histFilterPriority);

  const tbody=document.getElementById('hist-tbody');
  if (!tbody) return;
  if (!hist.length) {
    tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><i class="bi bi-clock-history"></i><p>No history records found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML=hist.map(h=>`
    <tr>
      <td><strong>${escapeHtml(h.id)}</strong></td>
      <td>${escapeHtml(h.patientName)}</td>
      <td>${escapeHtml(h.emergencyType)}</td>
      <td>${escapeHtml(h.hospitalName||h.assignedHospital||'—')}</td>
      <td>${escapeHtml(h.assignedAmbulance||'—')}</td>
      <td>${escapeHtml(h.responseTime||'—')}</td>
      <td>${escapeHtml(h.date)}</td>
      <td>${statusBadge(h.status)}</td>
    </tr>`).join('');

  // Stats
  const el=id=>document.getElementById(id);
  const avg=hist.reduce((s,h)=>s+(parseInt(h.responseTime)||0),0)/hist.length;
  if(el('hist-stat-count')) el('hist-stat-count').textContent=hist.length;
  if(el('hist-stat-avg'))   el('hist-stat-avg').textContent=(isNaN(avg)?'—':avg.toFixed(1)+' min');
}

function completeRequest(reqId) {
  const reqs=getAll(KEYS.requests);
  const idx=reqs.findIndex(r=>r.id===reqId);
  if (idx<0) return;
  const r=reqs[idx];
  const hospName=(getAll(KEYS.hospitals).find(h=>h.id===r.assignedHospital)||{}).name||r.assignedHospital||'—';
  const hist=getAll(KEYS.history);
  hist.unshift({...r, hospitalName:hospName, status:'Completed', responseTime:r.eta||'—', completedAt:new Date().toISOString()});
  saveAll(KEYS.history, hist);
  reqs.splice(idx,1);
  saveAll(KEYS.requests, reqs);
  // Free ambulance
  if (r.assignedAmbulance) {
    const ambs=getAll(KEYS.ambulances);
    const ai=ambs.findIndex(a=>a.id===r.assignedAmbulance);
    if (ai>-1){ ambs[ai].status='Available'; ambs[ai].assignedEmergency=''; saveAll(KEYS.ambulances,ambs); }
  }
  showToast(`Emergency ${reqId} marked as completed.`,'success');
  addActivity(`Emergency ${reqId} completed — ${r.patientName}`,'green');
  addNotification('Emergency Completed', reqId, r.patientName, `Emergency ${reqId} has been completed successfully.`);
  updateNotifBadge();
  if (_currentSection==='requests') renderRequests();
  else if (_currentSection==='history') renderHistory();
}

/* ════════════════════════════════════════════════════════════
   15. FAMILY NOTIFICATIONS MODULE
════════════════════════════════════════════════════════════ */
function renderNotifications() {
  const notifs=getAll(KEYS.notifications);
  // Mark all read
  notifs.forEach(n=>n.read=true);
  saveAll(KEYS.notifications,notifs);
  updateNotifBadge();

  const el=document.getElementById('notif-list');
  if (!el) return;
  if (!notifs.length) {
    el.innerHTML=`<div class="empty-state"><i class="bi bi-bell-slash"></i><p>No notifications.</p></div>`;
    return;
  }
  const typeIcons={ 'Emergency Request Created':'bi-plus-circle-fill', 'Ambulance Assigned':'bi-truck-front-fill', 'Ambulance Dispatched':'bi-send-fill', 'Patient Picked Up':'bi-person-fill', 'Hospital Assigned':'bi-hospital-fill', 'Patient Arrived at Hospital':'bi-check-circle-fill', 'Emergency Completed':'bi-check2-all' };
  const typeColors={ 'Emergency Request Created':'var(--red)', 'Ambulance Assigned':'var(--orange)', 'Ambulance Dispatched':'var(--orange)', 'Patient Picked Up':'#7c3aed', 'Hospital Assigned':'var(--blue)', 'Patient Arrived at Hospital':'var(--green)', 'Emergency Completed':'var(--green)' };
  el.innerHTML=notifs.map(n=>`
    <div class="d-flex gap-3 align-items-start p-3 border-bottom" style="font-size:0.82rem">
      <div style="width:34px;height:34px;border-radius:50%;background:${(typeColors[n.type]||'#6b7280')}20;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="bi ${typeIcons[n.type]||'bi-bell'}" style="color:${typeColors[n.type]||'#6b7280'}"></i>
      </div>
      <div style="flex:1">
        <div style="font-weight:600;color:var(--navy)">${escapeHtml(n.type)}</div>
        <div>${escapeHtml(n.message)}</div>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:3px"><i class="bi bi-clock me-1"></i>${timeAgo(n.time)} &nbsp;·&nbsp; ${escapeHtml(n.emergencyId)}</div>
      </div>
      <button class="btn btn-sm btn-outline-danger py-0 px-2" style="font-size:0.68rem" onclick="deleteNotif('${n.id}')"><i class="bi bi-trash"></i></button>
    </div>`).join('');

  // Simulate notification
  document.getElementById('notif-sim-body').innerHTML = getAll(KEYS.requests).map(r=>`
    <div class="d-flex align-items-center justify-content-between py-2 border-bottom" style="font-size:0.82rem">
      <div><strong>${escapeHtml(r.id)}</strong> — ${escapeHtml(r.patientName)}</div>
      <div class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-primary py-0 px-2" style="font-size:0.7rem" onclick="simulateNotification('${r.id}','Ambulance Dispatched','${r.patientName}')">Simulate Dispatch</button>
        <button class="btn btn-sm btn-outline-success py-0 px-2" style="font-size:0.7rem" onclick="simulateNotification('${r.id}','Emergency Completed','${r.patientName}')">Simulate Complete</button>
      </div>
    </div>`).join('')||`<p class="text-muted text-center py-3" style="font-size:0.8rem">No active requests to simulate.</p>`;
}

function deleteNotif(id) {
  saveAll(KEYS.notifications, getAll(KEYS.notifications).filter(n=>n.id!==id));
  renderNotifications();
}

function simulateNotification(reqId, type, patient) {
  addNotification(type, reqId, patient, `[SIMULATED] ${type} for ${reqId} — ${patient}`);
  showToast(`Notification simulated: ${type}`,'info');
  renderNotifications();
}

/* ════════════════════════════════════════════════════════════
   16. CORPORATE MODULE
════════════════════════════════════════════════════════════ */
let _corpSearch='';

function renderCorporate() {
  let corps=getAll(KEYS.corporate);
  if (_corpSearch) {
    const s=_corpSearch.toLowerCase();
    corps=corps.filter(c=>(c.id+c.orgName+c.location+c.contactPerson+c.emergencyStatus).toLowerCase().includes(s));
  }
  const tbody=document.getElementById('corp-tbody');
  if (!tbody) return;
  if (!corps.length) {
    tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state"><i class="bi bi-building"></i><p>No corporate organizations found.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML=corps.map(c=>`
    <tr>
      <td><strong>${escapeHtml(c.id)}</strong></td>
      <td>${escapeHtml(c.orgName)}</td>
      <td>${escapeHtml(c.location)}</td>
      <td>${escapeHtml(c.contactPerson)}<br><span style="font-size:0.7rem;color:var(--text-muted)">${escapeHtml(c.contact)}</span></td>
      <td>${escapeHtml(c.emergencyType)}</td>
      <td>${escapeHtml(c.employeeCount)}</td>
      <td>${statusBadge(c.emergencyStatus)}
        <button class="btn btn-sm btn-outline-primary py-0 px-2 ms-1" style="font-size:0.7rem" onclick="openEditCorp('${c.id}')"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger py-0 px-2 ms-1" style="font-size:0.7rem" onclick="deleteCorp('${c.id}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`).join('');
}

function openAddCorp() {
  document.getElementById('corpForm').reset();
  document.getElementById('corpId').value='';
  document.getElementById('corpIdDisplay').textContent='(auto-generated)';
  new bootstrap.Modal(document.getElementById('corpModal')).show();
}

function openEditCorp(id) {
  const c=getAll(KEYS.corporate).find(x=>x.id===id);
  if (!c) return;
  document.getElementById('corpId').value=c.id;
  document.getElementById('corpIdDisplay').textContent=c.id;
  ['orgName','location','contactPerson','contact','emergencyType','employeeCount','emergencyStatus','notes'].forEach(f=>{
    const el=document.getElementById('corp'+cap(f)); if(el) el.value=c[f]||'';
  });
  new bootstrap.Modal(document.getElementById('corpModal')).show();
}

function saveCorp() {
  const form=document.getElementById('corpForm');
  if (!validateForm(form)) return;
  const id=document.getElementById('corpId').value;
  const data={
    orgName:v('corpOrgName'), location:v('corpLocation'), contactPerson:v('corpContactPerson'),
    contact:v('corpContact'), emergencyType:v('corpEmergencyType'), employeeCount:v('corpEmployeeCount'),
    emergencyStatus:v('corpEmergencyStatus'), notes:v('corpNotes')
  };
  const corps=getAll(KEYS.corporate);
  if (id) {
    const idx=corps.findIndex(c=>c.id===id); if(idx>-1) corps[idx]={...corps[idx],...data};
    saveAll(KEYS.corporate,corps); showToast(`Organization ${id} updated.`,'success');
  } else {
    const newId=nextId('corp'); corps.push({id:newId,...data});
    saveAll(KEYS.corporate,corps); showToast(`Organization ${newId} added.`,'success');
    addActivity(`Corporate org ${data.orgName} registered`,'blue');
  }
  bootstrap.Modal.getInstance(document.getElementById('corpModal'))?.hide();
  renderCorporate();
}

function deleteCorp(id) {
  if (!confirmDialog(`Delete Organization ${id}?`)) return;
  saveAll(KEYS.corporate,getAll(KEYS.corporate).filter(c=>c.id!==id));
  showToast(`Organization ${id} deleted.`,'danger');
  renderCorporate();
}

/* ════════════════════════════════════════════════════════════
   17. SETTINGS MODULE
════════════════════════════════════════════════════════════ */
function renderSettings() { /* Settings rendered statically in HTML */ }

function resetDemoData() {
  if (!confirmDialog('Reset to sample data? All your changes will be lost. This cannot be undone.')) return;
  Object.values(KEYS).forEach(k=>LS.remove(k));
  LS.remove('rsq_initialized');
  initSampleData();
  showToast('Demo data has been reset to defaults.','info');
  renderDashboard();
}

function clearAllData() {
  if (!confirmDialog('CLEAR ALL DATA? This will delete every record permanently. Type "CONFIRM" in the next prompt.')) return;
  const check=window.prompt('Type CONFIRM to permanently clear all data:');
  if (check!=='CONFIRM') { showToast('Cancelled — data not cleared.','info'); return; }
  Object.values(KEYS).forEach(k=>LS.remove(k));
  LS.remove('rsq_initialized');
  initSampleData();
  showToast('All data cleared and reset.','danger');
  showSection('dashboard');
}

/* ════════════════════════════════════════════════════════════
   18. CSV EXPORT
════════════════════════════════════════════════════════════ */
function csvExport(data, filename, keys) {
  if (!data.length) { showToast('No data to export.','warning'); return; }
  const headers=keys||Object.keys(data[0]);
  const rows=[headers.join(','),...data.map(row=>headers.map(k=>JSON.stringify(String(row[k]??''))).join(','))];
  const blob=new Blob([rows.join('\n')],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
  showToast(`Exported ${data.length} records to ${filename}.`,'success');
}

function exportRequests()   { csvExport(getAll(KEYS.requests),   'emergency_requests.csv'); }
function exportAmbulances() { csvExport(getAll(KEYS.ambulances), 'ambulances.csv'); }
function exportHospitals()  { csvExport(getAll(KEYS.hospitals),  'hospitals.csv'); }
function exportPatients()   { csvExport(getAll(KEYS.patients),   'patients.csv'); }
function exportAssignments(){ csvExport(getAll(KEYS.assignments),'emergency_assignments.csv'); }
function exportHistory()    { csvExport(getAll(KEYS.history),    'emergency_history.csv'); }
function exportCorporate()  { csvExport(getAll(KEYS.corporate),  'corporate_emergencies.csv'); }

/* ════════════════════════════════════════════════════════════
   19. CSV IMPORT
════════════════════════════════════════════════════════════ */
function importCSV(type) {
  const input=document.createElement('input'); input.type='file'; input.accept='.csv';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      try {
        const lines=ev.target.result.split('\n').filter(l=>l.trim());
        const headers=lines[0].split(',').map(h=>h.replace(/"/g,'').trim());
        const rows=lines.slice(1).map(line=>{
          const vals=line.match(/(".*?"|[^,]+)/g)||[];
          const obj={};
          headers.forEach((h,i)=>{ obj[h]=(vals[i]||'').replace(/^"|"$/g,'').trim(); });
          return obj;
        });
        const existing=getAll(KEYS[type]);
        const idKey=({ambulances:'id',hospitals:'id',patients:'id'})[type]||'id';
        let added=0, skipped=0;
        rows.forEach(row=>{
          if (!row[idKey]) { skipped++; return; }
          if (existing.find(x=>x[idKey]===row[idKey])) { skipped++; return; }
          existing.push(row); added++;
        });
        saveAll(KEYS[type],existing);
        showToast(`Import complete: ${added} added, ${skipped} skipped.`,'success');
        if (_currentSection===type) {
          const fns={ambulances:renderAmbulances,hospitals:renderHospitals,patients:renderPatients};
          if (fns[type]) fns[type]();
        }
      } catch(err) {
        showToast('CSV import failed: '+err.message,'danger');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ════════════════════════════════════════════════════════════
   20. GLOBAL SEARCH
════════════════════════════════════════════════════════════ */
function doGlobalSearch(query) {
  const dd=document.getElementById('search-results-dropdown');
  if (!query || query.length<2) { dd.classList.remove('show'); return; }
  const q=query.toLowerCase();
  const results=[];

  getAll(KEYS.requests).forEach(r=>{ if((r.id+r.patientName+r.emergencyType+r.location).toLowerCase().includes(q)) results.push({type:'Emergency',id:r.id,label:`${r.id} — ${r.patientName}`,section:'requests',icon:'bi-exclamation-triangle-fill',color:'var(--red)'}); });
  getAll(KEYS.ambulances).forEach(a=>{ if((a.id+a.driver+a.location).toLowerCase().includes(q)) results.push({type:'Ambulance',id:a.id,label:`${a.id} — ${a.driver}`,section:'ambulances',icon:'bi-truck-front-fill',color:'var(--orange)'}); });
  getAll(KEYS.hospitals).forEach(h=>{ if((h.id+h.name+h.city).toLowerCase().includes(q)) results.push({type:'Hospital',id:h.id,label:`${h.id} — ${h.name}`,section:'hospitals',icon:'bi-hospital-fill',color:'var(--blue)'}); });
  getAll(KEYS.patients).forEach(p=>{ if((p.id+p.name+p.emergencyType).toLowerCase().includes(q)) results.push({type:'Patient',id:p.id,label:`${p.id} — ${p.name}`,section:'patients',icon:'bi-person-heart',color:'#7c3aed'}); });
  getAll(KEYS.history).forEach(h=>{ if((h.id+h.patientName).toLowerCase().includes(q)) results.push({type:'History',id:h.id,label:`${h.id} — ${h.patientName}`,section:'history',icon:'bi-clock-history',color:'var(--green)'}); });
  getAll(KEYS.corporate).forEach(c=>{ if((c.id+c.orgName).toLowerCase().includes(q)) results.push({type:'Corporate',id:c.id,label:`${c.id} — ${c.orgName}`,section:'corporate',icon:'bi-building-fill',color:'var(--navy-light)'}); });

  if (!results.length) {
    dd.innerHTML=`<div class="search-result-item"><span style="color:var(--text-muted);font-size:0.8rem">No results found for "${escapeHtml(query)}"</span></div>`;
  } else {
    dd.innerHTML=results.slice(0,10).map(r=>`
      <div class="search-result-item" onclick="goToSearchResult('${r.section}')">
        <i class="bi ${r.icon}" style="color:${r.color}"></i>
        <div><div style="font-size:0.82rem;font-weight:600">${escapeHtml(r.label)}</div><div class="sri-type">${escapeHtml(r.type)}</div></div>
      </div>`).join('');
  }
  dd.classList.add('show');
}

function goToSearchResult(section) {
  document.getElementById('search-results-dropdown').classList.remove('show');
  document.getElementById('global-search').value='';
  showSection(section);
}

/* ════════════════════════════════════════════════════════════
   21. FORM VALIDATION
════════════════════════════════════════════════════════════ */
function validateForm(form) {
  form.querySelectorAll('[required]').forEach(el=>{
    el.classList.remove('is-invalid');
    if (!el.value.trim()) el.classList.add('is-invalid');
  });
  // Phone validation
  form.querySelectorAll('[data-phone]').forEach(el=>{
    el.classList.remove('is-invalid');
    if (el.value && !/^[\d\s\+\-\(\)]{7,15}$/.test(el.value)) el.classList.add('is-invalid');
  });
  return !form.querySelector('.is-invalid');
}

/* ════════════════════════════════════════════════════════════
   22. NOTIFICATION BELL DROPDOWN
════════════════════════════════════════════════════════════ */
function toggleNotifPanel() {
  const panel=document.getElementById('notif-panel');
  if (!panel) return;
  panel.classList.toggle('show');
  if (panel.classList.contains('show')) {
    const notifs=getAll(KEYS.notifications).slice(0,5);
    const typeColors={'Emergency Request Created':'var(--red)','Ambulance Assigned':'var(--orange)','Ambulance Dispatched':'var(--orange)','Hospital Assigned':'var(--blue)','Emergency Completed':'var(--green)'};
    panel.innerHTML=`
      <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:700;font-size:0.9rem;color:var(--navy);display:flex;justify-content:space-between;align-items:center">
        Notifications
        <button class="btn btn-sm btn-link p-0" style="font-size:0.72rem" onclick="showSection('notifications');toggleNotifPanel()">See all</button>
      </div>
      ${notifs.length?notifs.map(n=>`
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);font-size:0.8rem">
          <div style="font-weight:600;color:${typeColors[n.type]||'var(--navy)'}">${escapeHtml(n.type)}</div>
          <div style="color:var(--text-muted)">${escapeHtml(n.message)}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px">${timeAgo(n.time)}</div>
        </div>`).join('') : '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.82rem">No notifications</div>'}`;
  }
}

/* ════════════════════════════════════════════════════════════
   23. QUICK ACTIONS (Dashboard)
════════════════════════════════════════════════════════════ */
function quickNewRequest() { showSection('requests'); setTimeout(openAddRequest,200); }
function quickNewAmbulance(){ showSection('ambulances'); setTimeout(openAddAmb,200); }
function quickNewHospital() { showSection('hospitals'); setTimeout(openAddHosp,200); }
function quickNewPatient()  { showSection('patients'); setTimeout(openAddPat,200); }

/* ════════════════════════════════════════════════════════════
   24. INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', ()=>{
  initSampleData();
  startClock();
  updateNotifBadge();

  // Sidebar nav
  document.querySelectorAll('.sidebar-nav .nav-link[data-section]').forEach(link=>{
    link.addEventListener('click',()=>showSection(link.dataset.section));
  });

  // Hamburger
  document.getElementById('btn-hamburger')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', closeSidebar);

  // Global search
  const gs=document.getElementById('global-search');
  gs?.addEventListener('input',e=>doGlobalSearch(e.target.value));
  document.addEventListener('click', e=>{
    if (!e.target.closest('.topbar-search-wrap')) {
      document.getElementById('search-results-dropdown')?.classList.remove('show');
    }
  });

  // Notification bell
  document.getElementById('notif-bell')?.addEventListener('click', toggleNotifPanel);
  document.addEventListener('click', e=>{
    if (!e.target.closest('#notif-bell') && !e.target.closest('#notif-panel')) {
      document.getElementById('notif-panel')?.classList.remove('show');
    }
  });

  // Form filter/search listeners (requests)
  document.getElementById('req-search')?.addEventListener('input', e=>{ _reqSearch=e.target.value; renderRequests(); });
  document.getElementById('req-filter-priority')?.addEventListener('change', e=>{ _reqFilterPriority=e.target.value; renderRequests(); });
  document.getElementById('req-filter-status')?.addEventListener('change', e=>{ _reqFilterStatus=e.target.value; renderRequests(); });
  document.getElementById('req-filter-type')?.addEventListener('change', e=>{ _reqFilterType=e.target.value; renderRequests(); });
  document.getElementById('req-sort')?.addEventListener('change', e=>{ _reqSort=e.target.value; renderRequests(); });

  // Ambulance filter/search
  document.getElementById('amb-search')?.addEventListener('input', e=>{ _ambSearch=e.target.value; renderAmbulances(); });
  document.getElementById('amb-filter-status')?.addEventListener('change', e=>{ _ambFilterStatus=e.target.value; renderAmbulances(); });

  // Hospital filter/search
  document.getElementById('hosp-search')?.addEventListener('input', e=>{ _hospSearch=e.target.value; renderHospitals(); });
  document.getElementById('hosp-filter-status')?.addEventListener('change', e=>{ _hospFilterStatus=e.target.value; renderHospitals(); });

  // Patient filter/search
  document.getElementById('pat-search')?.addEventListener('input', e=>{ _patSearch=e.target.value; renderPatients(); });
  document.getElementById('pat-filter-status')?.addEventListener('change', e=>{ _patFilterStatus=e.target.value; renderPatients(); });

  // History filter/search
  document.getElementById('hist-search')?.addEventListener('input', e=>{ _histSearch=e.target.value; renderHistory(); });
  document.getElementById('hist-filter-type')?.addEventListener('change', e=>{ _histFilterType=e.target.value; renderHistory(); });
  document.getElementById('hist-filter-priority')?.addEventListener('change', e=>{ _histFilterPriority=e.target.value; renderHistory(); });

  // Corporate search
  document.getElementById('corp-search')?.addEventListener('input', e=>{ _corpSearch=e.target.value; renderCorporate(); });

  // Form save buttons
  document.getElementById('btn-save-req')?.addEventListener('click', saveRequest);
  document.getElementById('btn-save-amb')?.addEventListener('click', saveAmb);
  document.getElementById('btn-save-hosp')?.addEventListener('click', saveHosp);
  document.getElementById('btn-save-pat')?.addEventListener('click', savePat);
  document.getElementById('btn-save-asgn')?.addEventListener('click', saveAssignment);
  document.getElementById('btn-save-corp')?.addEventListener('click', saveCorp);

  // Show dashboard on load
  showSection('dashboard');
});
