import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

// Icons
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Plus,
  Clock,
  Sparkles,
  ClipboardList
} from 'lucide-react';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State managers
  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activities, setActivities] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    followUpDate: '',
  });

  // Pull individual lead profiles
  const fetchLeadDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [leadRes, notesRes, activitiesRes] = await Promise.all([
        api.leads.getById(id),
        api.notes.getByLeadId(id),
        api.leads.getActivities()
      ]);

      if (leadRes.success) {
        const leadData = leadRes.data;
        setLead(leadData);
        setEditForm({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company || '',
          source: leadData.source,
          status: leadData.status,
          followUpDate: leadData.followUpDate ? new Date(leadData.followUpDate).toISOString().split('T')[0] : '',
        });
      }

      if (notesRes.success) {
        setNotes(notesRes.data);
      }

      if (activitiesRes.success) {
        // Filter actions belonging strictly to this lead
        const filteredLogs = activitiesRes.data.filter(act => act.leadId?._id === id || act.leadId === id);
        setActivities(filteredLogs);
      }
    } catch (error) {
      console.error('Error fetching lead data profile:', error);
      alert('Lead profile not found or server is offline.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  // Handle Note Submission
  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNoteLoading(true);
    try {
      const res = await api.notes.create(id, newNote.trim());
      if (res.success) {
        setNotes(prev => [res.data, ...prev]);
        setNewNote('');
        
        // Refresh activity logs list
        const activitiesRes = await api.leads.getActivities();
        if (activitiesRes.success) {
          const filteredLogs = activitiesRes.data.filter(act => act.leadId?._id === id || act.leadId === id);
          setActivities(filteredLogs);
        }
      }
    } catch (error) {
      console.error('Failed to create interaction note:', error);
      alert('Could not post internal comment.');
    } finally {
      setNoteLoading(false);
    }
  };

  // Toggle follow-up completion status directly
  const handleFollowUpCompletedToggle = async () => {
    if (!lead) return;
    
    try {
      const nextCompletedState = !lead.followUpCompleted;
      const res = await api.leads.update(id, { followUpCompleted: nextCompletedState });
      if (res.success) {
        setLead(res.data);
        
        // Refresh activities log
        const activitiesRes = await api.leads.getActivities();
        if (activitiesRes.success) {
          const filteredLogs = activitiesRes.data.filter(act => act.leadId?._id === id || act.leadId === id);
          setActivities(filteredLogs);
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow-up task status:', error);
    }
  };

  // Submit Profile Edits
  const handleProfileEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        followUpDate: editForm.followUpDate ? new Date(editForm.followUpDate) : null,
      };

      const res = await api.leads.update(id, payload);
      if (res.success) {
        setLead(res.data);
        setIsEditing(false);
        
        // Refresh details & activities log
        const activitiesRes = await api.leads.getActivities();
        if (activitiesRes.success) {
          const filteredLogs = activitiesRes.data.filter(act => act.leadId?._id === id || act.leadId === id);
          setActivities(filteredLogs);
        }
      }
    } catch (error) {
      console.error('Failed to update lead contact details:', error);
      alert('Error updating profile information.');
    }
  };

  // Delete Lead Handler
  const handleDeleteClick = async () => {
    const confirmation = window.confirm(`Are you absolutely sure you want to permanently delete lead "${lead?.name}"? All notes and activities will be destroyed.`);
    if (!confirmation) return;

    try {
      const res = await api.leads.delete(id);
      if (res.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Could not delete lead profile:', error);
      alert('Failed to delete lead contact profile.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main panel content */}
      <main className="main-content">
        <Navbar title="Lead Insights Profile" />

        {/* Back Link Nav button */}
        <div className="back-link" onClick={() => navigate('/')}>
          <ChevronLeft size={16} />
          <span>Back to Console</span>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Fetching Profile Data...</span>
          </div>
        ) : !lead ? (
          <div className="empty-state">
            <User className="empty-state-icon" />
            <h3 className="empty-state-title">Lead details unavailable</h3>
          </div>
        ) : (
          <div className="lead-detail-grid">
            
            {/* Left Column: Core profile form / details card */}
            <div className="lead-profile-card glass">
              
              {/* Profile Card Header row */}
              <div className="profile-avatar-row">
                <div className="profile-avatar">
                  {lead.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="profile-meta">
                  <h2 className="profile-name">{lead.name}</h2>
                  <div className="profile-badges">
                    <StatusBadge status={lead.status} />
                    <span className="source-badge">{lead.source}</span>
                  </div>
                </div>
              </div>

              {/* Editing Form State Toggle */}
              {isEditing ? (
                <form onSubmit={handleProfileEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <div className="input-container">
                      <User className="input-icon" size={16} />
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="form-input form-input-with-icon"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <div className="input-container">
                        <Mail className="input-icon" size={16} />
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="form-input form-input-with-icon"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <div className="input-container">
                        <Phone className="input-icon" size={16} />
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          className="form-input form-input-with-icon"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Company Name</label>
                      <div className="input-container">
                        <Building className="input-icon" size={16} />
                        <input
                          type="text"
                          name="company"
                          value={editForm.company}
                          onChange={handleEditChange}
                          className="form-input form-input-with-icon"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Lead Source</label>
                      <select
                        name="source"
                        value={editForm.source}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="Website">Website</option>
                        <option value="Instagram">Instagram</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Referral">Referral</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Lead Status</label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Follow-Up Date</label>
                      <div className="input-container">
                        <Calendar className="input-icon" size={16} style={{ zIndex: 1 }} />
                        <input
                          type="date"
                          name="followUpDate"
                          value={editForm.followUpDate}
                          onChange={handleEditChange}
                          className="form-input form-input-with-icon"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Check size={16} />
                      <span>Save Profile</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Detailed Information Grid */}
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Email Address</span>
                      <span className="info-value">{lead.email}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{lead.phone}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Company Name</span>
                      <span className="info-value">{lead.company || <span style={{ color: 'hsl(var(--muted-foreground)/0.5)' }}>Not specified</span>}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Lead Source</span>
                      <span className="info-value" style={{ fontWeight: 600 }}>{lead.source}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Date Generated</span>
                      <span className="info-value">{new Date(lead.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Follow-Up Date</span>
                      <span className="info-value">
                        {lead.followUpDate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} style={{ color: 'hsl(var(--primary))' }} />
                            {new Date(lead.followUpDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span style={{ color: 'hsl(var(--muted-foreground)/0.5)' }}>No date assigned</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Follow up completed check option */}
                  {lead.followUpDate && (
                    <div style={{ 
                      padding: '1rem', 
                      borderRadius: 'var(--radius)', 
                      backgroundColor: 'hsl(var(--muted) / 0.3)',
                      border: '1px solid hsl(var(--border))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div className="checkbox-container" onClick={handleFollowUpCompletedToggle}>
                        <input 
                          type="checkbox" 
                          checked={lead.followUpCompleted} 
                          onChange={() => {}} // Controlled via container click
                          className="checkbox-input" 
                        />
                        <span className="checkbox-label">Mark follow-up completed</span>
                      </div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 700, 
                        color: lead.followUpCompleted ? 'hsl(var(--status-qualified-fg))' : 'hsl(var(--status-contacted-fg))'
                      }}>
                        {lead.followUpCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  )}

                  {/* Bottom details action row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--border))', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                      <Edit2 size={15} />
                      <span>Edit Details</span>
                    </button>

                    <button className="btn btn-danger" onClick={handleDeleteClick}>
                      <Trash2 size={15} />
                      <span>Permanently Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Interaction notes & Activity trail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Internal notes widget */}
              <div className="lead-profile-card glass">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: 'hsl(var(--primary))' }} />
                  Internal Ledger Notes
                </h3>

                {/* Add new note input form */}
                <form onSubmit={handleAddNoteSubmit} className="note-input-container">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type in follow-up minutes, meeting comments, or qualification remarks..."
                    className="note-textarea"
                    required
                  ></textarea>
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }} disabled={noteLoading}>
                    <Plus size={15} />
                    {noteLoading ? 'Posting...' : 'Add Note'}
                  </button>
                </form>

                {/* Notes historical trail list */}
                <div className="notes-timeline-container" style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '1.25rem' }}>
                  <div className="timeline">
                    {notes.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                        No notes written yet. Add a note to record contact history.
                      </div>
                    ) : (
                      notes.map((n) => (
                        <div className="timeline-item" key={n._id}>
                          <div className="timeline-header">
                            <span className="timeline-author">{n.author}</span>
                            <span className="timeline-time">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="timeline-content">{n.note}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lead-specific Activity logs */}
              <div className="lead-profile-card glass">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={18} style={{ color: 'hsl(var(--primary))' }} />
                  Lead Action History
                </h3>

                <div className="activity-list" style={{ maxHeight: '250px' }}>
                  {activities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'hsl(var(--muted-foreground))', fontSize: '0.85rem' }}>
                      No activity logs recorded.
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div className="activity-item" key={act._id}>
                        <div className="activity-icon-wrapper">
                          <Clock size={12} />
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
          </div>
        )}
      </main>
    </div>
  );
};

export default LeadDetails;
