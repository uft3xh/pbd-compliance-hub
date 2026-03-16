/* ============================================================
   view.js — Rendering layer.
   Reads from Model. Writes HTML to DOM containers.
   No business logic. No data mutation.
   ============================================================ */

const View = (() => {

  // ── Private render helpers ───────────────────────────────

  const _statusBadge = (s) => {
    if (s === 'compliant') return `<span class="badge badge-green">Compliant</span>`;
    if (s === 'pending')   return `<span class="badge badge-amber">Pending</span>`;
    return `<span class="badge badge-red">Expired</span>`;
  };

  const _permitIcon = (s) => {
    if (s === 'done') return '&#10003;';
    if (s === 'warn') return '!';
    return '&#10007;';
  };

  const _barClass = (pct) => pct === 100 ? 'green' : pct >= 40 ? 'amber' : 'red';

  const _complexityBadge = (c) => {
    if (c === 'Low')    return `<span class="badge badge-green">Low complexity</span>`;
    if (c === 'Medium') return `<span class="badge badge-amber">Medium complexity</span>`;
    return `<span class="badge badge-red">High complexity</span>`;
  };

  // ── Shared partials ──────────────────────────────────────

  const _permitItemHtml = (p, townId, editable = true) => `
    <div class="permit-item ${p.status}">
      <div class="permit-icon ${p.status}">${_permitIcon(p.status)}</div>
      <div class="permit-name">${p.name}</div>
      <div class="permit-exp">${p.exp}</div>
      <span class="badge badge-gray">${p.type}</span>
      ${editable
        ? `<button class="btn btn-sm" onclick="Controller.openEditPermit(${townId}, ${p.id})">Edit</button>`
        : ''}
    </div>`;

  const _deadlineItemHtml = (d) => `
    <div class="deadline-item ${d.urgency}">
      <div class="deadline-date">${d.date.slice(5)}</div>
      <div style="flex:1">
        <div class="deadline-town">${d.town}</div>
        <div class="deadline-type">${d.type}</div>
      </div>
      <div class="deadline-days ${d.urgency}">${Model.daysLabel(d.date)}</div>
    </div>`;

  const _townRowHtml = (t, expandable = true) => {
    const bc    = _barClass(t.score);
    const tags  = t.permits.slice(0, 3).map(p =>
      `<span class="badge ${p.status === 'done' ? 'badge-green' : p.status === 'warn' ? 'badge-amber' : 'badge-red'}">
        ${p.name.length > 18 ? p.name.slice(0, 16) + '...' : p.name}
      </span>`
    ).join('');
    const extra = t.permits.length > 3
      ? `<span class="badge badge-gray">+${t.permits.length - 3}</span>`
      : '';

    const detailHtml = expandable ? `
      <div class="town-detail" id="detail-${t.id}">
        <div class="detail-grid">
          <div class="detail-item"><label>Contact</label><span>${t.contact}</span></div>
          <div class="detail-item"><label>Phone</label><span>${t.phone}</span></div>
          <div class="detail-item"><label>License fee</label><span>${t.fee || 'TBD'}</span></div>
          <div class="detail-item"><label>Beach badge</label><span>${t.badge}</span></div>
          <div class="detail-item"><label>Setup zones</label><span>${t.zones} location${t.zones !== 1 ? 's' : ''}</span></div>
          <div class="detail-item"><label>Compliance</label><span>${t.score}%</span></div>
        </div>
        <div class="section-label">Permits &amp; requirements</div>
        <div class="permit-list">
          ${t.permits.map(p => _permitItemHtml(p, t.id, true)).join('')}
        </div>
        <div class="inline-actions">
          <button class="btn btn-sm" onclick="Controller.openAddPermit(${t.id})">+ Add permit</button>
          <button class="btn btn-sm" onclick="Controller.markAllDone(${t.id})">Mark all compliant</button>
          <button class="btn btn-sm" style="margin-left:auto" onclick="Controller.openEditTown(${t.id})">Edit town</button>
        </div>
      </div>` : '';

    return `
      <div>
        <div class="town-row"
             id="row-${t.id}"
             onclick="${expandable ? `Controller.toggleDetail(${t.id})` : ''}"
             style="${expandable ? '' : 'cursor:default'}">
          <div>
            <div class="town-name">${t.name}</div>
            <div class="town-county">${t.county} Co.</div>
          </div>
          <div class="tag-row">${tags}${extra}</div>
          <div style="display:flex; align-items:center; gap:8px">
            <div>
              <div class="progress-bar">
                <div class="progress-fill ${bc}" style="width:${t.score}%"></div>
              </div>
              <div style="font-size:10px; color:var(--tx2); margin-top:2px; text-align:right">${t.score}%</div>
            </div>
            ${_statusBadge(t.status)}
          </div>
        </div>
        ${detailHtml}
      </div>`;
  };

  // ── Tab renderers ────────────────────────────────────────

  const renderDashboard = () => {
    const stats    = Model.getStats();
    const towns    = Model.getTowns();
    const licenses = Model.getStateLicenses();
    const urgent   = Model.getDeadlines().filter(d => d.urgency === 'urgent');

    document.getElementById('tab-dashboard').innerHTML = `
      <div class="stats-row">
        <div class="stat-card"><div class="stat-num ocean">${stats.total}</div><div class="stat-label">Active towns</div></div>
        <div class="stat-card"><div class="stat-num green">${stats.compliant}</div><div class="stat-label">Fully compliant</div></div>
        <div class="stat-card"><div class="stat-num amber">${stats.pending}</div><div class="stat-label">Action needed</div></div>
        <div class="stat-card"><div class="stat-num red">${stats.expired}</div><div class="stat-label">Expired / lapsed</div></div>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Urgent deadlines</span>
            <span class="badge badge-red">${urgent.length} urgent</span>
          </div>
          <div class="deadline-list">
            ${urgent.slice(0, 4).map(_deadlineItemHtml).join('')}
          </div>
          <button class="btn btn-sm btn-full" onclick="Controller.navigate('deadlines')">View all deadlines</button>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">State &amp; federal licenses</span>
            <span class="badge badge-ocean">NJ / US</span>
          </div>
          <div class="permit-list">
            ${licenses.map(p => _permitItemHtml(p, 0, false)).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Town compliance overview</span>
          <button class="btn btn-sm" onclick="Controller.navigate('towns')">Manage towns</button>
        </div>
        <div class="town-list">
          ${towns.map(t => _townRowHtml(t, false)).join('')}
        </div>
      </div>`;
  };

  const renderTowns = (search = '', statusFilter = 'all') => {
    const towns = Model.getTowns().filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.county.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });

    document.getElementById('tab-towns').innerHTML = `
      <div class="filter-bar">
        <input class="search-input" id="town-search" placeholder="Search towns or county..."
               value="${search}" oninput="Controller.onTownSearch(this.value)">
        <button class="chip ${statusFilter === 'all'       ? 'active' : ''}" onclick="Controller.setTownFilter('all', this)">All</button>
        <button class="chip ${statusFilter === 'compliant' ? 'active' : ''}" onclick="Controller.setTownFilter('compliant', this)">Compliant</button>
        <button class="chip ${statusFilter === 'pending'   ? 'active' : ''}" onclick="Controller.setTownFilter('pending', this)">Pending</button>
        <button class="chip ${statusFilter === 'expired'   ? 'active' : ''}" onclick="Controller.setTownFilter('expired', this)">Expired</button>
        <button class="btn btn-primary btn-sm" onclick="Controller.openModal('add-town')">+ Add town</button>
      </div>
      <div class="town-list">
        ${towns.length
          ? towns.map(t => _townRowHtml(t, true)).join('')
          : '<div class="empty">No towns match your filter.</div>'}
      </div>`;
  };

  const renderPermits = (townFilter = 'all', typeFilter = 'all') => {
    const towns   = Model.getTowns();
    const permits = Model.getAllPermits().filter(p => {
      const matchTown = townFilter === 'all' || String(p.townId) === townFilter;
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchTown && matchType;
    });

    const townOptions = towns.map(t =>
      `<option value="${t.id}" ${townFilter === String(t.id) ? 'selected' : ''}>${t.name}</option>`
    ).join('');

    document.getElementById('tab-permits').innerHTML = `
      <div class="filter-bar">
        <span style="font-size:11.5px; color:var(--tx2); font-weight:500">Town:</span>
        <select class="form-input" style="width:auto; padding:5px 8px; font-size:11.5px"
                id="permit-town-sel" onchange="Controller.setPermitTownFilter(this.value)">
          <option value="all" ${townFilter === 'all' ? 'selected' : ''}>All towns</option>
          ${townOptions}
        </select>
        <button class="chip ${typeFilter === 'all'       ? 'active' : ''}" onclick="Controller.setPermitTypeFilter('all', this)">All types</button>
        <button class="chip ${typeFilter === 'municipal' ? 'active' : ''}" onclick="Controller.setPermitTypeFilter('municipal', this)">Municipal</button>
        <button class="chip ${typeFilter === 'state'     ? 'active' : ''}" onclick="Controller.setPermitTypeFilter('state', this)">State</button>
        <button class="chip ${typeFilter === 'federal'   ? 'active' : ''}" onclick="Controller.setPermitTypeFilter('federal', this)">Federal</button>
      </div>
      <div class="permit-list">
        ${permits.length ? permits.map(p => `
          <div class="permit-item ${p.status}">
            <div class="permit-icon ${p.status}">${_permitIcon(p.status)}</div>
            <div class="permit-name" style="flex:1.5">${p.name}</div>
            <div style="flex:1; font-size:11px; color:var(--tx2)">${p.townName}</div>
            <div class="permit-exp">${p.exp}</div>
            <span class="badge badge-gray">${p.type}</span>
            <span class="badge ${p.status === 'done' ? 'badge-green' : p.status === 'warn' ? 'badge-amber' : 'badge-red'}">
              ${p.status === 'done' ? 'Active' : p.status === 'warn' ? 'Expiring' : 'Missing'}
            </span>
          </div>`).join('')
        : '<div class="empty">No permits match your filter.</div>'}
      </div>`;
  };

  const renderDeadlines = () => {
    document.getElementById('tab-deadlines').innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">All compliance deadlines</span>
          <div style="display:flex; gap:6px">
            <span class="badge badge-red">Urgent &lt;30d</span>
            <span class="badge badge-amber">Soon 30–90d</span>
            <span class="badge badge-green">On track</span>
          </div>
        </div>
        <div class="deadline-list">
          ${Model.getDeadlines().map(_deadlineItemHtml).join('')}
        </div>
      </div>`;
  };

  const renderExpansion = (selectedIndex = null) => {
    const prospects = Model.getProspects();

    const grid = prospects.map((p, i) => `
      <div class="prospect-card ${selectedIndex === i ? 'selected' : ''}" onclick="Controller.selectProspect(${i})">
        <div class="prospect-name">${p.name}</div>
        <div class="prospect-detail">${p.county} Co. &middot; ${p.len} &middot; Est. ${p.fee}/season</div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:7px">
          <div class="score-bar" style="flex:1"><div class="score-fill" style="width:${p.score}%"></div></div>
          <span style="font-size:12px; font-weight:500; color:var(--ocean)">${p.score}/100</span>
        </div>
        <div style="display:flex; gap:5px; flex-wrap:wrap">
          ${_complexityBadge(p.complexity)}
          <span class="badge badge-ocean">${p.badge}</span>
        </div>
      </div>`).join('');

    let detailHtml = '';
    if (selectedIndex !== null && prospects[selectedIndex]) {
      const p = prospects[selectedIndex];
      detailHtml = `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${p.name} — permit requirements</span>
            <button class="btn btn-primary btn-sm" onclick="Controller.addProspect(${selectedIndex})">Add to active towns</button>
          </div>
          <div class="stats-row" style="grid-template-columns:repeat(3,minmax(0,1fr))">
            <div class="stat-card"><div class="stat-num ocean">${p.score}</div><div class="stat-label">Feasibility score</div></div>
            <div class="stat-card">
              <div class="stat-num ${p.complexity === 'Low' ? 'green' : p.complexity === 'Medium' ? 'amber' : 'red'}">${p.complexity}</div>
              <div class="stat-label">Complexity</div>
            </div>
            <div class="stat-card"><div class="stat-num green">${p.fee}</div><div class="stat-label">Est. annual fee</div></div>
          </div>
          <div class="section-label" style="margin-bottom:8px">Required permits &amp; steps</div>
          <div class="permit-list">
            ${p.reqs.map(r => `
              <div class="permit-item">
                <div class="permit-icon" style="background:var(--ocean); color:#fff">&#8594;</div>
                <div class="permit-name">${r}</div>
              </div>`).join('')}
          </div>
          <div class="note-box"><strong>Notes:</strong> ${p.note}</div>
        </div>`;
    }

    document.getElementById('tab-expansion').innerHTML = `
      <div class="card" style="margin-bottom:10px">
        <div class="card-header">
          <span class="card-title">Prospect towns</span>
          <span style="font-size:11px; color:var(--tx2)">Ranked by feasibility &middot; click to see requirements</span>
        </div>
        <div class="prospect-grid">${grid}</div>
      </div>
      ${detailHtml}`;
  };

  // ── DOM helpers ──────────────────────────────────────────

  const toggleDetail = (id) => {
    const detail = document.getElementById(`detail-${id}`);
    const row    = document.getElementById(`row-${id}`);
    if (!detail) return;
    const isOpen = detail.classList.contains('open');
    detail.classList.toggle('open',    !isOpen);
    row.classList.toggle('expanded',   !isOpen);
  };

  // ── Public API ───────────────────────────────────────────
  return {
    renderDashboard,
    renderTowns,
    renderPermits,
    renderDeadlines,
    renderExpansion,
    toggleDetail,
  };

})();
