import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, Send, Calendar } from 'lucide-react';
import api from '../services/api';

const AddLeadModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
    followUpDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please provide name, email, and phone number.');
      return;
    }

    setLoading(true);
    try {
      // Persist lead using mock API
      await api.leads.create(formData);
      // Refresh parent data
      onSuccess();
      // Close modal
      onClose();
      // Reset form fields
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        status: 'New',
        followUpDate: '',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container glass" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">Generate New Lead</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ color: 'hsl(var(--destructive))', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-container">
                <User className="input-icon" size={16} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
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
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. john@company.com"
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
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 019-2834"
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
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="form-input form-input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Lead Source</label>
                <div className="input-container">
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <div className="input-container">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Follow-Up Date</label>
                <div className="input-container">
                  <Calendar className="input-icon" size={16} style={{ zIndex: 1 }} />
                  <input
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleChange}
                    className="form-input form-input-with-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} />
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
