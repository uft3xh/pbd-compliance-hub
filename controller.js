/* ============================================================
   controller.js — Event handling and coordination layer.
   The only layer that calls both Model and View.
   Owns lightweight UI state (current tab, filters, modal targets).
   No business logic. No HTML generation.
   ============================================================ */

const Controller = (() => {

  // ── UI state ─────────────────────────────────────────────
  let currentTab       = 'dashboard';
  let townSearchVal    = '';
  let townFilterVal    = 'all';
  let permitTownFilter = 'all';
  let permitTypeFilter = 'all';
  let selectedProspect = null;
  let editingTownId    = null;
  let editingPermitId  = null;
  let permitTargetId   = null;

  // ── Internal helpers ─────────────────────────────────────
  const _renderCurrentTab = () => {
    if (currentTab === 'dashboard') View.renderDashboard();
    if (currentTab === 'towns')     View.renderTowns(townSearchVal, townFilterVal);
    if (currentTab === 'permits')   View.renderPermits(permitTownFilter, permitTypeFilter);
    if (currentTab === 'deadlines') View.renderDeadlines();
    if (currentTab === 'expansion') View.renderExpansion(selectedProspect);
  };

  const _refreshAll = () => {
    _renderCurrentTab();
    if (currentTab !== 'dashboard') View.renderDashboard();
  };

  // ── Navigation ───────────────────────────────────────────
  const navigate = (tab) => {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    _renderCurrentTab();
  };

  // ── Season ───────────────────────────────────────────────
  const updateSeason = (val) => {
    const y = parseInt(val);
    if (y > 2020 && y < 2100) {
      Model.setSeason(y);
      document.getElementById('season-year').value = y;
    }
  };

  // ── Town detail expand / collapse ────────────────────────
  const toggleDetail = (id) => View.toggleDetail(id);

  // ── Town filters ─────────────────────────────────────────
  const onTownSearch  = (val) => {
    townSearchVal = val;
    View.renderTowns(townSearchVal, townFilterVal);
  };

  const setTownFilter = (f) => {
    townFilterVal = f;
    View.renderTowns(townSearchVal, townFilterVal);
  };

  // ── Permit filters ───────────────────────────────────────
  const setPermitTownFilter = (v) => {
    permitTownFilter = v;
    View.renderPermits(permitTownFilter, permitTypeFilter);
  };

  const setPermitTypeFilter = (v) => {
    permitTypeFilter = v;
    View.renderPermits(permitTownFilter, permitTypeFilter);
  };

  // ── Modals ───────────────────────────────────────────────
  const openModal  = (name) => document.getElementById(`modal-${name}`).classList.add('open');
  const closeModal = (name) => document.getElementById(`modal-${name}`).classList.remove('open');

  const overlayClick = (e, name) => {
    if (e.target === document.getElementById(`modal-${name}`)) closeModal(name);
  };

  // ── Add Town ─────────────────────────────────────────────
  const submitAddTown = () => {
    const name = document.getElementById('at-name').value.trim();
    if (!name) { alert('Please enter a town name.'); return; }

    Model.addTown({
      name,
      county:  document.getElementById('at-county').value,
      badge:   document.getElementById('at-badge').value,
      status:  document.getElementById('at-status').value,
      contact: document.getElementById('at-notes').value || 'TBD',
    });

    closeModal('add-town');
    document.getElementById('at-name').value  = '';
    document.getElementById('at-notes').value = '';
    _refreshAll();
  };

  // ── Edit Town ────────────────────────────────────────────
  const openEditTown = (id) => {
    editingTownId = id;
    const t = Model.getTown(id);
    document.getElementById('et-name').value    = t.name;
    document.getElementById('et-county').value  = t.county;
    document.getElementById('et-badge').value   = t.badge;
    document.getElementById('et-contact').value = t.contact;
    document.getElementById('et-phone').value   = t.phone;
    document.getElementById('et-fee').value     = t.fee || '';
    document.getElementById('et-zones').value   = t.zones || 1;
    openModal('edit-town');
  };

  const submitEditTown = () => {
    const current = Model.getTown(editingTownId);
    Model.updateTown(editingTownId, {
      name:    document.getElementById('et-name').value.trim()     || current.name,
      county:  document.getElementById('et-county').value,
      badge:   document.getElementById('et-badge').value,
      contact: document.getElementById('et-contact').value         || current.contact,
      phone:   document.getElementById('et-phone').value           || current.phone,
      fee:     document.getElementById('et-fee').value             || current.fee,
      zones:   parseInt(document.getElementById('et-zones').value) || current.zones,
    });
    closeModal('edit-town');
    _refreshAll();
  };

  const deleteTown = () => {
    if (!confirm('Delete this town and all its permits?')) return;
    Model.deleteTown(editingTownId);
    closeModal('edit-town');
    _refreshAll();
  };

  // ── Add Permit ───────────────────────────────────────────
  const openAddPermit = (townId) => {
    permitTargetId  = townId;
    editingPermitId = null;
    document.getElementById('permit-modal-title').textContent = 'Add permit';
    document.getElementById('pm-name').value   = '';
    document.getElementById('pm-type').value   = 'municipal';
    document.getElementById('pm-status').value = 'miss';
    document.getElementById('pm-exp').value    = '';
    openModal('permit');
  };

  // ── Edit Permit ──────────────────────────────────────────
  const openEditPermit = (townId, permitId) => {
    permitTargetId  = townId;
    editingPermitId = permitId;
    const t = Model.getTown(townId);
    const p = t.permits.find(p => p.id === permitId);
    document.getElementById('permit-modal-title').textContent = 'Edit permit';
    document.getElementById('pm-name').value   = p.name;
    document.getElementById('pm-type').value   = p.type;
    document.getElementById('pm-status').value = p.status;
    document.getElementById('pm-exp').value    = p.exp;
    openModal('permit');
  };

  const submitPermit = () => {
    const name = document.getElementById('pm-name').value.trim();
    if (!name) { alert('Please enter a permit name.'); return; }

    const data = {
      name,
      type:   document.getElementById('pm-type').value,
      status: document.getElementById('pm-status').value,
      exp:    document.getElementById('pm-exp').value || 'Required',
    };

    if (editingPermitId) {
      Model.updatePermit(permitTargetId, editingPermitId, data);
    } else {
      Model.addPermit(permitTargetId, data);
    }

    closeModal('permit');
    _refreshAll();
  };

  // ── Mark All Done ────────────────────────────────────────
  const markAllDone = (townId) => {
    Model.markAllDone(townId);
    _refreshAll();
  };

  // ── Expansion ────────────────────────────────────────────
  const selectProspect = (i) => {
    selectedProspect = i;
    View.renderExpansion(i);
  };

  const addProspect = (i) => {
    const town = Model.addProspectToTowns(i);
    if (!town) return;
    selectedProspect = null;
    alert(`${town.name} added to active towns. Visit the Towns tab to complete permit details.`);
    navigate('towns');
  };

  // ── Init ─────────────────────────────────────────────────
  const init = () => {
    navigate('dashboard');
  };

  // ── Public API ───────────────────────────────────────────
  return {
    navigate,
    updateSeason,
    toggleDetail,
    onTownSearch,
    setTownFilter,
    setPermitTownFilter,
    setPermitTypeFilter,
    openModal,
    closeModal,
    overlayClick,
    submitAddTown,
    openEditTown,
    submitEditTown,
    deleteTown,
    openAddPermit,
    openEditPermit,
    submitPermit,
    markAllDone,
    selectProspect,
    addProspect,
    init,
  };

})();

// Boot the app once the DOM is ready
document.addEventListener('DOMContentLoaded', () => Controller.init());
