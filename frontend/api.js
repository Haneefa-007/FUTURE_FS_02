/*
 * LocalStorage mock API for the Mini CRM frontend.
 * This replaces the previous axios‑based implementation and stores
 * all lead data directly in the browser's localStorage under the key
 * "miniCRMLeads". It provides the same method signatures used
 * throughout the app (getAll, getById, create, update, delete,
 * getStats, getActivities) so no other component changes are needed.
 */

// Helper to safely parse JSON from localStorage
const getLeadsFromStorage = () => {
  try {
    const data = localStorage.getItem('miniCRMLeads');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse leads from localStorage', e);
    return [];
  }
};

const saveLeadsToStorage = (leads) => {
  try {
    localStorage.setItem('miniCRMLeads', JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads to localStorage', e);
  }
};

// Simple ID generator (incremental)
let nextId = (() => {
  const leads = getLeadsFromStorage();
  if (leads.length === 0) return 1;
  const maxId = Math.max(...leads.map((l) => Number(l._id) || 0));
  return maxId + 1;
})();

export const api = {
  leads: {
    // params are ignored for this mock – returns all leads
    getAll: async (params = {}) => {
      const leads = getLeadsFromStorage();
      return { success: true, data: leads };
    },
    getById: async (id) => {
      const leads = getLeadsFromStorage();
      const lead = leads.find((l) => l._id === id);
      if (!lead) throw new Error('Lead not found');
      return { success: true, data: lead };
    },
    create: async (data) => {
      const leads = getLeadsFromStorage();
      const newLead = { ...data, _id: String(nextId++), createdAt: new Date().toISOString() };
      leads.push(newLead);
      saveLeadsToStorage(leads);
      return { success: true, data: newLead };
    },
    update: async (id, data) => {
      const leads = getLeadsFromStorage();
      const index = leads.findIndex((l) => l._id === id);
      if (index === -1) throw new Error('Lead not found');
      const updated = { ...leads[index], ...data };
      leads[index] = updated;
      saveLeadsToStorage(leads);
      return { success: true, data: updated };
    },
    delete: async (id) => {
      let leads = getLeadsFromStorage();
      leads = leads.filter((l) => l._id !== id);
      saveLeadsToStorage(leads);
      return { success: true };
    },
    getStats: async () => {
      // Very simple stats derived from stored leads
      const leads = getLeadsFromStorage();
      const totalLeads = leads.length;
      const newLeads = leads.filter((l) => l.status === 'New').length;
      const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
      const pendingFollowups = leads.filter((l) => l.followUpDate && !l.followUpCompleted).length;
      const sourceBreakdown = Object.entries(
        leads.reduce((acc, l) => {
          acc[l.source] = (acc[l.source] || 0) + 1;
          return acc;
        }, {})
      ).map(([source, value]) => ({ name: source, value }));
      return {
        success: true,
        data: { totalLeads, newLeads, convertedLeads, pendingFollowups, sourceBreakdown },
      };
    },
    getActivities: async () => {
      // Mock empty activity log for demo purposes
      return { success: true, data: [] };
    },
  },
  notes: {
    getByLeadId: async (leadId) => {
      // No persistent notes in this demo – return empty array
      return { success: true, data: [] };
    },
    create: async (leadId, noteText) => {
      // No persistent storage – simply return a mock note
      return { success: true, data: { leadId, note: noteText, _id: Date.now().toString() } };
    },
  },
};

export default api;
