/* ============================================================
   model.js — Data layer and business logic.
   No DOM access. No rendering. Pure data in, pure data out.
   ============================================================ */

const Model = (() => {

  // ── State ────────────────────────────────────────────────
  let season = 2026;

  const stateLicenses = [
    { id: 's1', name: 'NJ Business Registration',         status: 'done', exp: '2026-12-31', type: 'state'   },
    { id: 's2', name: 'NJ DEP Coastal Zone Permit',        status: 'done', exp: '2026-10-01', type: 'state'   },
    { id: 's3', name: 'NJ Sales Tax Certificate',          status: 'done', exp: 'Permanent',  type: 'state'   },
    { id: 's4', name: 'General Liability Insurance ($2M)', status: 'done', exp: '2026-12-01', type: 'state'   },
    { id: 's5', name: 'Federal EIN / Worker Permits',      status: 'done', exp: 'Permanent',  type: 'federal' },
  ];

  let towns = [
    { id: 1,  name: 'Point Pleasant Beach', county: 'Ocean',    status: 'compliant', score: 100, badge: 'Seasonal',         contact: 'Jennifer Walsh',     phone: '732-892-1118', fee: '$2,400/season', zones: 3, permits: [
      { id: 101, name: 'Beach Vendor License',        status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 102, name: 'Special Event Permit',         status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 103, name: 'Zoning Approval - Boardwalk',  status: 'done', exp: '2026-12-31', type: 'municipal' },
    ]},
    { id: 2,  name: 'Seaside Heights',      county: 'Ocean',    status: 'compliant', score: 100, badge: 'Seasonal',         contact: 'Mark DeVito',        phone: '732-793-9100', fee: '$1,800/season', zones: 4, permits: [
      { id: 201, name: 'Beach Vendor License',           status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 202, name: 'Amusement / Recreation Permit',  status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 203, name: 'Fire Marshal Inspection',         status: 'done', exp: '2026-06-01', type: 'municipal' },
    ]},
    { id: 3,  name: 'Asbury Park',          county: 'Monmouth', status: 'compliant', score: 100, badge: 'Free beach',       contact: 'City Clerk Office',  phone: '732-775-2100', fee: '$3,100/season', zones: 2, permits: [
      { id: 301, name: 'Beach Operator Permit',    status: 'done', exp: '2026-10-31', type: 'municipal' },
      { id: 302, name: 'Commercial Use Agreement', status: 'done', exp: '2026-12-31', type: 'municipal' },
      { id: 303, name: 'ADA Compliance Cert.',     status: 'done', exp: '2026-12-31', type: 'state'    },
    ]},
    { id: 4,  name: 'Belmar',               county: 'Monmouth', status: 'pending',   score: 60,  badge: 'Seasonal',         contact: 'Borough Hall',       phone: '732-681-3700', fee: '$1,950/season', zones: 3, permits: [
      { id: 401, name: 'Beach Vendor License',    status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 402, name: 'Health Dept Inspection',  status: 'warn', exp: '2026-06-30', type: 'municipal' },
      { id: 403, name: 'DPW Encroachment Permit', status: 'miss', exp: 'Required',   type: 'municipal' },
    ]},
    { id: 5,  name: 'Spring Lake',          county: 'Monmouth', status: 'compliant', score: 100, badge: 'Seasonal',         contact: 'Borough Clerk',      phone: '732-449-0800', fee: '$2,200/season', zones: 2, permits: [
      { id: 501, name: 'Commercial Beach Permit',     status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 502, name: 'Seasonal Concession License', status: 'done', exp: '2026-09-30', type: 'municipal' },
    ]},
    { id: 6,  name: 'Lavallette',           county: 'Ocean',    status: 'pending',   score: 67,  badge: 'Seasonal',         contact: "Mayor's Office",     phone: '732-793-7477', fee: '$1,600/season', zones: 2, permits: [
      { id: 601, name: 'Beach Vendor License',           status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 602, name: 'Seasonal Business Registration', status: 'warn', exp: '2026-06-20', type: 'municipal' },
      { id: 603, name: 'Insurance Certificate on File',  status: 'done', exp: '2026-12-01', type: 'municipal' },
    ]},
    { id: 7,  name: 'Manasquan',            county: 'Monmouth', status: 'compliant', score: 100, badge: 'Seasonal',         contact: "Clerk's Office",     phone: '732-223-0544', fee: '$1,750/season', zones: 2, permits: [
      { id: 701, name: 'Beach Operator License', status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 702, name: 'Municipal Court Bond',   status: 'done', exp: '2026-12-31', type: 'municipal' },
    ]},
    { id: 8,  name: 'LBI / Ship Bottom',    county: 'Ocean',    status: 'pending',   score: 33,  badge: 'Daily / Seasonal', contact: 'Ship Bottom Borough', phone: '609-494-2171', fee: '$2,800/season', zones: 5, permits: [
      { id: 801, name: 'LBI Joint Beach Commission Permit', status: 'warn', exp: '2026-07-01', type: 'municipal' },
      { id: 802, name: 'Beach Chair/Umbrella License',      status: 'miss', exp: 'Required',   type: 'municipal' },
      { id: 803, name: 'Liability Waiver on File',          status: 'done', exp: '2026-12-01', type: 'municipal' },
      { id: 804, name: 'Seasonal Storage Agreement',        status: 'miss', exp: 'Required',   type: 'municipal' },
    ]},
    { id: 9,  name: 'Avalon',               county: 'Cape May', status: 'compliant', score: 100, badge: 'Seasonal',         contact: 'Borough Hall',       phone: '609-967-3066', fee: '$3,400/season', zones: 3, permits: [
      { id: 901, name: 'Beach Concession License',   status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 902, name: 'Dune Protection Compliance', status: 'done', exp: '2026-12-31', type: 'state'    },
      { id: 903, name: 'Seasonal Employee Reg.',     status: 'done', exp: '2026-12-31', type: 'state'    },
    ]},
    { id: 10, name: 'Wildwood',             county: 'Cape May', status: 'compliant', score: 100, badge: 'Free beach',       contact: 'City Business Office', phone: '609-522-2444', fee: '$2,100/season', zones: 6, permits: [
      { id: 1001, name: 'Beach Equipment Vendor License', status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 1002, name: 'Boardwalk Operator Permit',      status: 'done', exp: '2026-09-30', type: 'municipal' },
      { id: 1003, name: 'Cape May Co. Health Cert.',      status: 'done', exp: '2026-12-31', type: 'state'    },
    ]},
    { id: 11, name: 'Sea Isle City',        county: 'Cape May', status: 'expired',   score: 0,   badge: 'Seasonal',         contact: 'City Hall',          phone: '609-263-4461', fee: '$1,900/season', zones: 2, permits: [
      { id: 1101, name: 'Beach Vendor License',    status: 'miss', exp: 'EXPIRED 2025-09-30', type: 'municipal' },
      { id: 1102, name: 'Annual Business Renewal', status: 'miss', exp: 'EXPIRED 2026-01-15', type: 'municipal' },
      { id: 1103, name: 'Liability Insurance',     status: 'warn', exp: '2026-08-01',         type: 'municipal' },
    ]},
  ];

  let prospects = [
    { name: 'Mantoloking',    county: 'Ocean',    len: '1.2mi', fee: '~$3,200', complexity: 'Low',    score: 88, badge: 'Seasonal',
      reqs: ['Private beach comm. approval', 'Ocean Co. health cert.', 'Liability insurance $2M+', 'DPW coordination'],
      note: 'Very small, affluent community. Limited spots but high revenue per unit.' },
    { name: 'Bay Head',       county: 'Ocean',    len: '0.8mi', fee: '~$2,800', complexity: 'Low',    score: 82, badge: 'Seasonal',
      reqs: ['Bay Head Beach Assoc. vote', 'Annual vendor license', 'DPW permit', 'Insurance on file'],
      note: 'Semi-private beach association controls access. Relationship-driven approval.' },
    { name: 'Ortley Beach',   county: 'Ocean',    len: '1.8mi', fee: '~$2,100', complexity: 'Medium', score: 79, badge: 'Seasonal',
      reqs: ['Toms River Township approval', 'Ocean Co. health cert.', 'DPW encroachment permit', 'Seasonal registration'],
      note: 'Part of Toms River Township. Single municipal contact simplifies process.' },
    { name: 'Normandy Beach', county: 'Ocean',    len: '1.4mi', fee: '~$1,600', complexity: 'Medium', score: 76, badge: 'Seasonal',
      reqs: ['Borough vendor license', 'Ocean Co. health inspection', 'Fire marshal OK', 'Seasonal storage permit'],
      note: 'Quieter market, lower competition. Streamlined permit process.' },
    { name: 'Brigantine',     county: 'Atlantic', len: '7mi',   fee: '~$2,400', complexity: 'Medium', score: 74, badge: 'Seasonal',
      reqs: ['Brigantine vendor license', 'Atlantic Co. health cert.', 'Zone-specific approval', 'Seasonal employee reg.'],
      note: 'Long beachfront with good density. Atlantic Co. health dept required.' },
    { name: 'Cape May City',  county: 'Cape May', len: '2.5mi', fee: '~$4,100', complexity: 'High',   score: 71, badge: 'Seasonal',
      reqs: ['Historic preservation review', 'Beach Comm. approval', 'Cape May City vendor license', 'NJ DEP dune cert.', 'NPS consultation (federal)'],
      note: 'Highest revenue potential. Complex: historic district + NPS involvement.' },
  ];

  const deadlines = [
    { town: 'Lavallette',       type: 'Seasonal Business Registration renewal',  date: '2026-06-20', urgency: 'urgent' },
    { town: 'Belmar',           type: 'Health Dept Inspection due',              date: '2026-06-30', urgency: 'urgent' },
    { town: 'LBI / Ship Bottom',type: 'Joint Beach Commission Permit deadline',  date: '2026-07-01', urgency: 'urgent' },
    { town: 'Sea Isle City',    type: 'Business license reinstatement required', date: '2026-07-15', urgency: 'urgent' },
    { town: 'Belmar',           type: 'DPW Encroachment Permit filing',          date: '2026-07-20', urgency: 'soon'   },
    { town: 'LBI / Ship Bottom',type: 'Beach Chair/Umbrella License filing',     date: '2026-07-25', urgency: 'soon'   },
    { town: 'LBI / Ship Bottom',type: 'Seasonal Storage Agreement',              date: '2026-07-25', urgency: 'soon'   },
    { town: 'Sea Isle City',    type: 'Liability Insurance renewal',             date: '2026-08-01', urgency: 'soon'   },
    { town: 'All towns',        type: 'Municipal permits annual renewal',        date: '2026-09-30', urgency: 'ok'     },
    { town: 'NJ DEP',           type: 'Coastal Zone Permit renewal',            date: '2026-10-01', urgency: 'ok'     },
    { town: 'General Liability',type: 'Annual insurance renewal',               date: '2026-12-01', urgency: 'ok'     },
  ];

  // ── Private helpers ──────────────────────────────────────
  const _recalcTown = (t) => {
    if (!t.permits.length) { t.score = 0; t.status = 'pending'; return; }
    const done = t.permits.filter(p => p.status === 'done').length;
    t.score  = Math.round(done / t.permits.length * 100);
    t.status = t.score === 100 ? 'compliant' : t.score > 0 ? 'pending' : 'expired';
  };

  // ── Getters ──────────────────────────────────────────────
  const getSeason        = ()   => season;
  const getTowns         = ()   => towns;
  const getTown          = (id) => towns.find(t => t.id === id);
  const getStateLicenses = ()   => stateLicenses;
  const getProspects     = ()   => prospects;

  const getDeadlines = () =>
    [...deadlines].sort((a, b) => new Date(a.date) - new Date(b.date));

  const getStats = () => ({
    total:     towns.length,
    compliant: towns.filter(t => t.status === 'compliant').length,
    pending:   towns.filter(t => t.status === 'pending').length,
    expired:   towns.filter(t => t.status === 'expired').length,
  });

  const getAllPermits = () => {
    const state = stateLicenses.map(p => ({ ...p, townName: 'State / Federal', townId: 0 }));
    const muni  = towns.flatMap(t => t.permits.map(p => ({ ...p, townName: t.name, townId: t.id })));
    return [...state, ...muni];
  };

  // ── Mutators ─────────────────────────────────────────────
  const setSeason = (y) => { season = y; };

  const addTown = (data) => {
    const id = Date.now();
    const town = {
      id,
      name:    data.name,
      county:  data.county,
      badge:   data.badge,
      status:  data.status,
      contact: data.contact || 'TBD',
      phone:   data.phone   || 'TBD',
      fee:     data.fee     || 'TBD',
      zones:   data.zones   || 1,
      score:   data.status === 'compliant' ? 100 : data.status === 'pending' ? 50 : 0,
      permits: [{
        id:     id + 1,
        name:   'Municipal Vendor License',
        status: data.status === 'compliant' ? 'done' : data.status === 'pending' ? 'warn' : 'miss',
        exp:    data.status === 'compliant' ? `${season}-09-30` : 'Required',
        type:   'municipal',
      }],
    };
    towns.push(town);
    return town;
  };

  const updateTown = (id, data) => {
    const t = getTown(id);
    if (!t) return null;
    Object.assign(t, data);
    return t;
  };

  const deleteTown = (id) => {
    towns = towns.filter(t => t.id !== id);
  };

  const addPermit = (townId, data) => {
    const t = getTown(townId);
    if (!t) return null;
    const permit = { id: Date.now(), ...data };
    t.permits.push(permit);
    _recalcTown(t);
    return permit;
  };

  const updatePermit = (townId, permitId, data) => {
    const t = getTown(townId);
    if (!t) return null;
    const p = t.permits.find(p => p.id === permitId);
    if (!p) return null;
    Object.assign(p, data);
    _recalcTown(t);
    return p;
  };

  const markAllDone = (townId) => {
    const t = getTown(townId);
    if (!t) return;
    t.permits.forEach(p => { p.status = 'done'; });
    _recalcTown(t);
  };

  const addProspectToTowns = (index) => {
    const p = prospects[index];
    if (!p) return null;
    const id = Date.now();
    const town = {
      id,
      name:    p.name,
      county:  p.county,
      status:  'pending',
      score:   0,
      badge:   p.badge,
      contact: 'TBD',
      phone:   'TBD',
      fee:     p.fee + '/season',
      zones:   1,
      permits: p.reqs.map((r, j) => ({
        id:     id * 100 + j,
        name:   r,
        status: 'miss',
        exp:    'Required',
        type:   'municipal',
      })),
    };
    towns.push(town);
    prospects.splice(index, 1);
    return town;
  };

  // ── Date helpers ─────────────────────────────────────────
  const REF_DATE = new Date('2026-03-16');

  const daysUntil = (dateStr) => {
    if (!dateStr || dateStr === 'Permanent' || dateStr.includes('EXPIRED') || dateStr === 'Required') return null;
    return Math.round((new Date(dateStr) - REF_DATE) / 86400000);
  };

  const daysLabel = (dateStr) => {
    const d = daysUntil(dateStr);
    if (d === null) return '';
    if (d < 0)     return 'Past due';
    if (d === 0)   return 'Today';
    return d + 'd left';
  };

  // ── Public API ───────────────────────────────────────────
  return {
    getSeason, setSeason,
    getTowns, getTown, getStateLicenses, getDeadlines, getProspects, getStats, getAllPermits,
    addTown, updateTown, deleteTown,
    addPermit, updatePermit, markAllDone,
    addProspectToTowns,
    daysUntil, daysLabel,
  };

})();
