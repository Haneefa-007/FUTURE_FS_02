import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import AddLeadModal from '../components/AddLeadModal';
import api from '../services/api';

// Icons
import { 
  Users, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Search, 
  Plus, 
  Download, 
  RefreshCw,
  FolderOpen,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';

// Recharts components for analytics
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();

  // State Management
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    pendingFollowups: 0,
    sourceBreakdown: []
  });
  const [activities, setActivities] = useState([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sort, setSort] = useState('newest');
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all dashboard components
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Query parameters
      const params = {
        sort,
      };
      if (statusFilter !== 'All') params.status = statusFilter;
      if (sourceFilter !== 'All') params.source = sourceFilter;
      if (search.trim()) params.search = search;

      // Parallel data fetching for performance
      const [leadsRes, statsRes, activitiesRes] = await Promise.all([
        api.leads.getAll(params),
        api.leads.getStats(),
        api.leads.getActivities()
      ]);

      if (leadsRes.success) setLeads(leadsRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (activitiesRes.success) setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard datasets:', error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, sort]);

  // Hook datasets into lifecycle
  useEffect(() => {
    // Implement debounce for live typing search
    const delayDebounce = setTimeout(() => {
      fetchDashboardData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [fetchDashboardData]);

  // CSV Export Utility
  const handleCSVExport = () => {
    if (leads.length === 0) {
      alert('No lead data available to export.');
      return;
    }

    // Define CSV Headers
    const headers = ['Full Name', 'Email', 'Phone', 'Company', 'Lead Source', 'Status', 'Follow-Up Date', 'Follow-Up Completed', 'Created At'];
    
    // Process Rows
    const rows = leads.map(lead => [
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.email.replace(/"/g, '""')}"`,
      `"${lead.phone.replace(/"/g, '""')}"`,
      `"${(lead.company || '').replace(/"/g, '""')}"`,
      `"${lead.source}"`,
      `"${lead.status}"`,
      lead.followUpDate ? `"${new Date(lead.followUpDate).toLocaleDateString()}"` : '""',
      `"${lead.followUpCompleted ? 'Yes' : 'No'}"`,
      `"${new Date(lead.createdAt).toLocaleDateString()}"`
    ]);

    // Build CSV string
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // Trigger Browser Download Link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadcenter_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recharts color mapping
  const COLORS = ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Panel Content */}
      <main className="main-content">
        <Navbar title="Console Dashboard" />

        {/* Dynamic Stat cards */}
        <section className="stats-grid">
          <StatCard 
            label="Total Leads" 
            value={stats.totalLeads} 
            icon={<Users size={20} />} 
          />
          <StatCard 
            label="New Leads" 
            value={stats.newLeads} 
            icon={<Sparkles size={20} />} 
          />
          <StatCard 
            label="Converted Leads" 
            value={stats.convertedLeads} 
            icon={<CheckCircle size={20} />} 
          />
          <StatCard 
            label="Pending Follow-Ups" 
            value={stats.pendingFollowups} 
            icon={<Clock size={20} />} 
          />
        </section>

        {/* Visual Analytics Chart Block */}
        <section className="dashboard-grid">
          {/* Main Table area */}
          <div className="dashboard-panel glass">
            <div className="panel-header">
              <h2 className="panel-title">Active Contacts</h2>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={handleCSVExport}>
                  <Download size={15} />
                  <span>Export</span>
                </button>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={15} />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

            {/* Table Search & Filter Controls */}
            <div className="table-controls">
              <div className="search-wrapper">
                <Search className="input-icon" size={16} />
                <input 
                  type="text" 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, company..." 
                  className="form-input form-input-with-icon"
                />
              </div>

              <div className="filter-actions">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>

                <select 
                  value={sourceFilter} 
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Instagram">Instagram</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Other">Other</option>
                </select>

                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>

                <button 
                  className="theme-toggle" 
                  style={{ padding: '0.5rem' }} 
                  onClick={fetchDashboardData}
                  title="Refresh leads"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Table element */}
            {loading && leads.length === 0 ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Syncing Database...</span>
              </div>
            ) : leads.length === 0 ? (
              <div className="empty-state">
                <FolderOpen className="empty-state-icon" />
                <h3 className="empty-state-title">No leads found</h3>
                <p>Try modifying your searches, active filters or add a new lead contact profile.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Lead Source</th>
                      <th>Current Status</th>
                      <th>Follow-Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead._id} onClick={() => navigate(`/leads/${lead._id}`)}>
                        <td>
                          <div className="lead-name-cell">
                            <span className="lead-name-text">{lead.name}</span>
                            {lead.company && <span className="lead-company-text">{lead.company}</span>}
                          </div>
                        </td>
                        <td>{lead.email}</td>
                        <td>{lead.phone}</td>
                        <td>
                          <span className="source-badge">{lead.source}</span>
                        </td>
                        <td>
                          <StatusBadge status={lead.status} />
                        </td>
                        <td>
                          {lead.followUpDate ? (
                            <span style={{ 
                              fontSize: '0.8rem', 
                              fontWeight: 500,
                              color: lead.followUpCompleted ? 'hsl(var(--status-qualified-fg))' : 'hsl(var(--muted-foreground))',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {new Date(lead.followUpDate).toLocaleDateString()}
                              {lead.followUpCompleted && ' (Done)'}
                            </span>
                          ) : (
                            <span style={{ color: 'hsl(var(--muted-foreground) / 0.6)', fontSize: '0.8rem' }}>None Set</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar Widgets (Charts & Audit log) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Lead source Pie chart */}
            <div className="dashboard-panel glass">
              <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieIcon size={18} style={{ color: 'hsl(var(--primary))' }} />
                  Source Volume
                </h2>
              </div>
              
              <div style={{ width: '100%', height: 220, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {stats.totalLeads === 0 ? (
                  <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>No data to graph</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.sourceBreakdown.filter(s => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {stats.sourceBreakdown.filter(s => s.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))', 
                          borderRadius: '8px', 
                          color: 'hsl(var(--foreground))' 
                        }} 
                      />
                      <Legend 
                        iconSize={8}
                        iconType="circle"
                        layout="horizontal"
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Global activity stream */}
            <div className="dashboard-panel glass">
              <div className="panel-header" style={{ marginBottom: '0.75rem' }}>
                <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'hsl(var(--primary))' }} />
                  Audit Trail
                </h2>
              </div>

              <div className="activity-list">
                {activities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                    No operations logged yet
                  </div>
                ) : (
                  activities.map((act) => (
                    <div className="activity-item" key={act._id}>
                      <div className="activity-icon-wrapper">
                        <Activity size={12} />
                      </div>
                      <div className="activity-details">
                        <span className="activity-desc">{act.description}</span>
                        <div className="activity-time">
                          {new Date(act.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Slideup AddLead Modal dialog */}
      <AddLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
    </div>
  );
};

export default Dashboard;
