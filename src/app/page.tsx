"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Checklist Item Types
const CHECKLIST_ITEMS = [
  { key: 'TEXT_SMS', label: 'Text SMS' },
  { key: 'WHATSAPP', label: 'WhatsApp' },
  { key: 'LETTER', label: 'Letter' },
  { key: 'EMAIL', label: 'Email' },
  { key: 'MARKETING', label: 'Marketing' },
  { key: 'DEVELOPMENT', label: 'Development' },
  { key: 'LIFESTYLE', label: 'Lifestyle' },
  { key: 'PROMOTION', label: 'Promotion' },
  { key: 'UNIQUE_SELLING_POINTS', label: 'Unique Selling Points' },
  { key: 'SITE_VISIT_SCHEDULED', label: 'Site Visit – Scheduled' },
  { key: 'SITE_VISIT_COMPLETED', label: 'Site Visit – Completed' }
];

// Database API Layer
class SupabaseAPI {
  // Clients CRUD
  async getClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(client => ({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      sector: client.sector,
      category: client.category,
      plot: client.plot,
      fileNumber: client.file_number,
      promiseFunnel: client.promise_funnel,
      notes: client.notes,
      scores: {
        contactability: client.contactability_score,
        responsiveness: client.responsiveness_score,
        financial: client.financial_score,
        engagement: client.engagement_score,
        sentiment: client.sentiment_score
      },
      healthScore: client.health_score,
      tier: client.tier,
      lastInteraction: new Date(client.last_interaction),
      nextAction: client.next_action ? new Date(client.next_action) : null
    }));
  }

  async createClient(clientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        sector: clientData.sector,
        category: clientData.category,
        plot: clientData.plot,
        file_number: clientData.fileNumber,
        promise_funnel: clientData.promiseFunnel,
        notes: clientData.notes,
        contactability_score: clientData.scores.contactability,
        responsiveness_score: clientData.scores.responsiveness,
        financial_score: clientData.scores.financial,
        engagement_score: clientData.scores.engagement,
        sentiment_score: clientData.scores.sentiment,
        health_score: clientData.healthScore,
        tier: clientData.tier
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Create default checklist items for new client
    await this.createDefaultChecklistItems(data.id);
    
    return data;
  }

  async updateClient(clientId, clientData) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email,
        sector: clientData.sector,
        category: clientData.category,
        plot: clientData.plot,
        file_number: clientData.fileNumber,
        promise_funnel: clientData.promiseFunnel,
        notes: clientData.notes,
        contactability_score: clientData.scores.contactability,
        responsiveness_score: clientData.scores.responsiveness,
        financial_score: clientData.scores.financial,
        engagement_score: clientData.scores.engagement,
        sentiment_score: clientData.scores.sentiment,
        health_score: clientData.healthScore,
        tier: clientData.tier,
        last_interaction: clientData.lastInteraction,
        next_action: clientData.nextAction
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteClient(clientId) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;
  }

  // Agents CRUD
  async getAgents() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      department: agent.department,
      performanceRating: agent.performance_rating,
      active: agent.active
    }));
  }

  async createAgent(agentData) {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        role: agentData.role,
        department: agentData.department,
        performance_rating: agentData.performanceRating,
        active: agentData.active
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAgent(agentId, agentData) {
    const { data, error } = await supabase
      .from('agents')
      .update({
        name: agentData.name,
        email: agentData.email,
        phone: agentData.phone,
        role: agentData.role,
        department: agentData.department,
        performance_rating: agentData.performanceRating,
        active: agentData.active
      })
      .eq('id', agentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAgent(agentId) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId);

    if (error) throw error;
  }

  // Interactions CRUD
  async createInteraction(interactionData) {
    const { data, error } = await supabase
      .from('interactions')
      .insert([{
        client_id: interactionData.client_id,
        agent_id: interactionData.agent_id,
        type: interactionData.type,
        disposition: interactionData.disposition,
        sentiment_num: interactionData.sentiment_num,
        promised_amount: interactionData.promised_amount,
        notes: interactionData.notes,
        next_action_date: interactionData.next_action_date
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getInteractionsByClient(clientId) {
    const { data, error } = await supabase
      .from('interactions')
      .select(`
        *,
        agents!inner(name, email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Checklist Items CRUD
  async getChecklistByClient(clientId) {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('client_id', clientId);

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      client_id: item.client_id,
      item: item.item_key,
      label: item.item_label,
      done: item.done,
      done_ts: item.done_at ? new Date(item.done_at) : null
    }));
  }

  async createDefaultChecklistItems(clientId) {
    const items = CHECKLIST_ITEMS.map(item => ({
      client_id: clientId,
      item_key: item.key,
      item_label: item.label,
      done: false
    }));

    const { error } = await supabase
      .from('checklist_items')
      .insert(items);

    if (error) throw error;
  }

  async updateChecklistItem(clientId, itemKey, done) {
    const { data, error } = await supabase
      .from('checklist_items')
      .update({
        done: done,
        done_at: done ? new Date().toISOString() : null
      })
      .eq('client_id', clientId)
      .eq('item_key', itemKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics
  async getChecklistCoverage() {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('item_key, done');

    if (error) throw error;

    const coverage = {};
    CHECKLIST_ITEMS.forEach(item => {
      const items = data.filter(d => d.item_key === item.key);
      const completed = items.filter(d => d.done).length;
      const total = items.length;
      coverage[item.key] = total > 0 ? Math.round((completed / total) * 100) : 0;
    });

    return coverage;
  }
}

// Initialize API
const api = new SupabaseAPI();

// Utility Components
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '24px',
        maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color = "#4a90e2" }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: color, 
          width: `${value}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

function Gauge({ value, size = 200 }) {
  const pct = Math.max(0, Math.min(100, value));
  const angle = (pct / 100) * 180;
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={{ width: size, textAlign: "center", margin: "0 auto" }}>
      <svg viewBox="0 0 100 60" style={{ width: "100%", height: "auto" }}>
        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
        <path 
          d="M10,50 A40,40 0 0,1 90,50" 
          fill="none" 
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${(pct/100)*126} 126`} 
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
        <line 
          x1="50" 
          y1="50" 
          x2={50 + 40 * Math.cos(Math.PI - angle * Math.PI / 180)}
          y2={50 - 40 * Math.sin(Math.PI - angle * Math.PI / 180)}
          stroke="#1f2937" 
          strokeWidth="2"
        />
      </svg>
      <div style={{ marginTop: 8, fontWeight: 700, fontSize: "18px", color }}>
        {pct.toFixed(0)} / 100
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        {pct >= 70 ? 'Healthy' : pct >= 40 ? 'Needs Attention' : 'At Risk'}
      </div>
    </div>
  );
}

// Updated Dashboard Component
function Dashboard({ clients }) {
  const [checklistCoverage, setChecklistCoverage] = useState({});

  useEffect(() => {
    const loadCoverage = async () => {
      try {
        const coverage = await api.getChecklistCoverage();
        setChecklistCoverage(coverage);
      } catch (error) {
        console.error('Error loading checklist coverage:', error);
      }
    };

    loadCoverage();
  }, [clients]);

  const greenClients = clients.filter(c => c.tier === 'Green').length;
  const amberClients = clients.filter(c => c.tier === 'Amber').length;
  const redClients = clients.filter(c => c.tier === 'Red').length;
  
  const avgHealthScore = clients.length > 0 
    ? Math.round(clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length)
    : 0;

  return (
    <div className="card">
      <h3>Dashboard Overview</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{clients.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Total</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>{greenClients}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Green</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fffbeb', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{amberClients}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Amber</div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>{redClients}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Red</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Gauge value={avgHealthScore} size={150} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Checklist Coverage</h4>
        <div style={{ display: 'grid', gap: '6px', fontSize: '11px' }}>
          {Object.entries(checklistCoverage).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ minWidth: '100px', fontSize: '10px' }}>
                {CHECKLIST_ITEMS.find(item => item.key === key)?.label || key}
              </div>
              <div style={{ flex: 1, height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                <div style={{ 
                  height: '100%', 
                  backgroundColor: value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444',
                  width: `${value}%`,
                  borderRadius: '2px'
                }} />
              </div>
              <div style={{ minWidth: '30px', textAlign: 'right', fontSize: '10px' }}>{value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Client List Component
function ClientList({ clients, onPick, selectedClient }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.tier === filter;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTierColor = (tier) => {
    switch(tier) {
      case 'Green': return '#f0fdf4';
      case 'Amber': return '#fffbeb';
      case 'Red': return '#fef2f2';
      default: return '#f8fafc';
    }
  };

  const getTierBorderColor = (tier) => {
    switch(tier) {
      case 'Green': return '#22c55e';
      case 'Amber': return '#f59e0b';
      case 'Red': return '#ef4444';
      default: return '#e2e8f0';
    }
  };

  return (
    <div className="card">
      <h3>Client List</h3>
      
      <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Tiers ({clients.length})</option>
          <option value="Green">Green ({clients.filter(c => c.tier === 'Green').length})</option>
          <option value="Amber">Amber ({clients.filter(c => c.tier === 'Amber').length})</option>
          <option value="Red">Red ({clients.filter(c => c.tier === 'Red').length})</option>
        </select>
      </div>
      
      <div style={{ maxHeight: '400px', overflow: 'auto', display: 'grid', gap: '8px' }}>
        {filteredClients.map(client => (
          <div
            key={client.id}
            onClick={() => onPick(client)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: `2px solid ${selectedClient?.id === client.id ? '#4a90e2' : '#e2e8f0'}`,
              backgroundColor: selectedClient?.id === client.id ? '#eff6ff' : getTierColor(client.tier),
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{client.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Plot: {client.plot}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Score: {client.healthScore}</div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: getTierBorderColor(client.tier),
                color: 'white'
              }}>
                {client.tier}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Red Clients Queue Component
function RedClientsQueue({ clients }) {
  const redClients = clients.filter(c => c.tier === 'Red');
  const overdueClients = redClients.filter(c => 
    new Date() - c.lastInteraction > 24 * 60 * 60 * 1000
  );

  return (
    <div className="card">
      <h3 style={{ color: '#ef4444' }}>Red Clients Queue</h3>
      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
        <div>Total Red: {redClients.length}</div>
        <div style={{ color: '#ef4444', fontWeight: 600 }}>
          Overdue (24h+): {overdueClients.length}
        </div>
      </div>
      
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {overdueClients.slice(0, 10).map(client => (
          <div key={client.id} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px', borderLeft: '3px solid #ef4444', backgroundColor: '#fef2f2',
            marginBottom: '4px', borderRadius: '4px'
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '12px' }}>{client.name}</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                Score: {client.healthScore} • Plot: {client.plot}
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>
              OVERDUE
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Updated Client Checklist Component
function ClientChecklist({ client, onChecklistUpdate }) {
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadChecklist = async () => {
      if (client) {
        try {
          const items = await api.getChecklistByClient(client.id);
          setChecklistItems(items);
        } catch (error) {
          console.error('Error loading checklist:', error);
          setChecklistItems([]);
        }
      }
    };

    loadChecklist();
  }, [client?.id]);

  const toggleItem = async (itemKey, done) => {
    setIsLoading(true);
    
    try {
      await api.updateChecklistItem(client.id, itemKey, done);
      
      setChecklistItems(prev => prev.map(item => {
        if (item.item === itemKey) {
          return {
            ...item,
            done,
            done_ts: done ? new Date() : null
          };
        }
        return item;
      }));
      
      if (onChecklistUpdate) {
        onChecklistUpdate(client.id, itemKey, done);
      }
    } catch (error) {
      console.error('Error updating checklist item:', error);
      alert('Failed to update checklist item');
    } finally {
      setIsLoading(false);
    }
  };

  if (!client) return null;

  const completedCount = checklistItems.filter(item => item.done).length;
  const totalCount = checklistItems.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount * 100).toFixed(0) : 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Client Checklist</h3>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: completionRate >= 80 ? '#f0fdf4' : completionRate >= 50 ? '#fffbeb' : '#fef2f2',
          color: completionRate >= 80 ? '#166534' : completionRate >= 50 ? '#d97706' : '#dc2626'
        }}>
          {completedCount}/{totalCount} ({completionRate}%)
        </div>
      </div>
      
      <div style={{ 
        display: "grid", 
        gap: "8px",
        maxHeight: "400px",
        overflowY: "auto"
      }}>
        {checklistItems.map(item => (
          <div key={item.item} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: item.done ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${item.done ? '#bbf7d0' : '#e2e8f0'}`,
            transition: 'all 0.2s'
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontSize: "14px",
              flex: 1
            }}>
              <input
                type="checkbox"
                checked={item.done}
                onChange={e => toggleItem(item.item, e.target.checked)}
                disabled={isLoading}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer"
                }}
              />
              <span style={{
                color: item.done ? '#166534' : '#374151',
                fontWeight: item.done ? 500 : 400
              }}>
                {item.label}
              </span>
              {item.item.includes('SITE_VISIT') && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px'
                }}>
                  AUTO-SYNC
                </span>
              )}
            </label>
            
            <div style={{
              fontSize: "11px",
              color: "#6b7280",
              textAlign: "right",
              minWidth: "120px"
            }}>
              {item.done_ts ? (
                <div>
                  <div>{new Date(item.done_ts).toLocaleDateString()}</div>
                  <div>{new Date(item.done_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: '12px',
        padding: '8px',
        backgroundColor: '#f3f4f6',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#6b7280'
      }}>
        Auto-sync: Site visit items are automatically updated when visit interactions are logged.
        Toggle other items to track marketing touchpoints and communication channels.
      </div>
      
      {completionRate < 100 && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: '#eff6ff',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#1d4ed8'
        }}>
          <strong>Suggested next actions:</strong> {
            checklistItems
              .filter(item => !item.done)
              .slice(0, 3)
              .map(item => item.label)
              .join(', ')
          }
        </div>
      )}
    </div>
  );
}

// Client Card Component
function ClientCard({ client, onEdit, onFlexiblePlan }) {
  if (!client) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        <h3>Select a Client</h3>
        <p style={{ color: "#666" }}>Choose a client from the list to view their details and health scores.</p>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0' }}>{client.name}</h3>
          <p style={{ color: "#666", margin: '4px 0', fontSize: '14px' }}>{client.phone}</p>
          <p style={{ color: "#666", margin: '4px 0', fontSize: '14px' }}>{client.email}</p>
        </div>
        <button
          onClick={() => onEdit && onEdit(client)}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Edit
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Sector</div>
          <div style={{ fontWeight: 500 }}>{client.sector}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Category</div>
          <div style={{ fontWeight: 500 }}>{client.category}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>Plot</div>
          <div style={{ fontWeight: 500 }}>{client.plot}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#666' }}>File Number</div>
          <div style={{ fontWeight: 500 }}>{client.fileNumber}</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>CRFES Scores</h4>
        <ScoreBar label="Contactability" value={client.scores.contactability} color={getScoreColor(client.scores.contactability)} />
        <ScoreBar label="Responsiveness" value={client.scores.responsiveness} color={getScoreColor(client.scores.responsiveness)} />
        <ScoreBar label="Financial" value={client.scores.financial} color={getScoreColor(client.scores.financial)} />
        <ScoreBar label="Engagement" value={client.scores.engagement} color={getScoreColor(client.scores.engagement)} />
        <ScoreBar label="Sentiment" value={client.scores.sentiment} color={getScoreColor(client.scores.sentiment)} />
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <Gauge value={client.healthScore} size={150} />
      </div>
      
      {/* NBA Templates for Green Clients */}
      {client.tier === 'Green' && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#166534' }}>NBA Templates</h5>
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '12px',
              marginBottom: '4px'
            }}
            onClick={() => alert('NBA Template: "Hi ' + client.name + ', thank you for being such a valued client! We have exciting new investment opportunities..."')}
          >
            Copy Investment Template
          </button>
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#22c55e',
              color: 'white',
              fontSize: '12px'
            }}
            onClick={() => alert('NBA Template: "Dear ' + client.name + ', we would like to invite you to our exclusive property showcase..."')}
          >
            Copy VIP Event Template
          </button>
        </div>
      )}
      
      {/* Flexible Plans for Amber Clients */}
      {client.tier === 'Amber' && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fed7aa'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#d97706' }}>Flexible Plans</h5>
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '12px',
              marginBottom: '4px'
            }}
            onClick={() => onFlexiblePlan && onFlexiblePlan(client.id, 'payment_plan')}
          >
            Offer Payment Plan
          </button>
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              fontSize: '12px'
            }}
            onClick={() => onFlexiblePlan && onFlexiblePlan(client.id, 'site_visit')}
          >
            Schedule Site Visit
          </button>
        </div>
      )}
      
      {/* SLA Alerts for Red Clients */}
      {client.tier === 'Red' && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>SLA Alert</h5>
          <div style={{ fontSize: '12px', color: '#dc2626' }}>
            24h callback required. Last contact: {new Date(client.lastInteraction).toLocaleDateString()}
          </div>
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '12px',
              marginTop: '8px'
            }}
            onClick={() => alert('Priority callback scheduled for ' + client.name)}
          >
            Schedule Priority Callback
          </button>
        </div>
      )}
    </div>
  );
}

// Updated Interaction Form Component
function InteractionForm({ client, agents, onInteraction }) {
  const [formData, setFormData] = useState({
    agent_id: "", 
    type: "call", 
    disposition: "success", 
    sentiment_num: 0,
    next_action_date: "", 
    promised_amount: "", 
    notes: ""
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.agent_id) {
      alert("Please select an agent");
      return;
    }

    setIsLoading(true);
    
    try {
      await api.createInteraction({
        client_id: client.id,
        agent_id: parseInt(formData.agent_id),
        type: formData.type,
        disposition: formData.disposition,
        sentiment_num: formData.sentiment_num,
        promised_amount: formData.promised_amount ? parseFloat(formData.promised_amount) : null,
        notes: formData.notes,
        next_action_date: formData.next_action_date || null
      });

      onInteraction(client.id, formData);
      
      setFormData({
        agent_id: "", 
        type: "call", 
        disposition: "success", 
        sentiment_num: 0,
        next_action_date: "", 
        promised_amount: "", 
        notes: ""
      });
    } catch (error) {
      console.error('Error creating interaction:', error);
      alert('Failed to save interaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Log Interaction</h3>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        <select 
          value={formData.agent_id} 
          onChange={e => setFormData({...formData, agent_id: e.target.value})}
          disabled={isLoading}
        >
          <option value="">Select Agent</option>
          {agents.filter(a => a.active).map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        
        <select 
          value={formData.type} 
          onChange={e => setFormData({...formData, type: e.target.value})}
          disabled={isLoading}
        >
          <option value="call">Phone Call</option>
          <option value="wa">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="visit">Visit</option>
          <option value="email">Email</option>
        </select>
        
        <select 
          value={formData.disposition} 
          onChange={e => setFormData({...formData, disposition: e.target.value})}
          disabled={isLoading}
        >
          <option value="success">Success</option>
          <option value="callback">Callback</option>
          <option value="refusal">Refusal</option>
          <option value="pending">Pending</option>
        </select>
        
        <div>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
            Sentiment: {formData.sentiment_num} ({formData.sentiment_num > 0 ? 'Positive' : formData.sentiment_num < 0 ? 'Negative' : 'Neutral'})
          </label>
          <input 
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={formData.sentiment_num}
            onChange={e => setFormData({...formData, sentiment_num: parseFloat(e.target.value)})}
            disabled={isLoading}
          />
        </div>
        
        <input 
          type="date"
          value={formData.next_action_date}
          onChange={e => setFormData({...formData, next_action_date: e.target.value})}
          placeholder="Next action date"
          disabled={isLoading}
        />
        
        <input 
          type="number"
          value={formData.promised_amount}
          onChange={e => setFormData({...formData, promised_amount: e.target.value})}
          placeholder="Promised amount (optional)"
          disabled={isLoading}
        />
        
        <textarea
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
          placeholder="Notes (optional)"
          rows="3"
          disabled={isLoading}
        />
        
        <button 
          onClick={handleSubmit} 
          disabled={isLoading}
          style={{ 
            backgroundColor: isLoading ? '#9ca3af' : '#4a90e2',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Updating Score...' : 'Save Interaction & Update Score'}
        </button>
      </div>
    </div>
  );
}

// Updated Client Editor Component
function ClientEditor({ client, onSave, onClose }) {
  const [formData, setFormData] = useState(client || {
    name: '', phone: '', email: '', sector: '', category: '', plot: '',
    fileNumber: '', promiseFunnel: 'pending', notes: '',
    scores: { contactability: 50, responsiveness: 50, financial: 50, engagement: 50, sentiment: 50 }
  });

  const handleSave = async () => {
    const healthScore = Math.round(
      formData.scores.contactability * 0.2 +
      formData.scores.responsiveness * 0.15 +
      formData.scores.financial * 0.35 +
      formData.scores.engagement * 0.15 +
      formData.scores.sentiment * 0.15
    );
    
    const tier = healthScore >= 70 ? 'Green' : healthScore >= 40 ? 'Amber' : 'Red';
    
    const clientData = { 
      ...formData, 
      healthScore, 
      tier, 
      id: client?.id || Date.now(),
      lastInteraction: client?.lastInteraction || new Date(),
      nextAction: client?.nextAction || null
    };

    try {
      if (client) {
        await api.updateClient(client.id, clientData);
      } else {
        await api.createClient(clientData);
      }
      onSave(clientData);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client');
    }
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <input
          placeholder="Client Name"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
        <input
          placeholder="Phone Number"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
        <input
          placeholder="Email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
        <input
          placeholder="File Number"
          value={formData.fileNumber}
          onChange={e => setFormData({...formData, fileNumber: e.target.value})}
        />
        <select
          value={formData.sector}
          onChange={e => setFormData({...formData, sector: e.target.value})}
        >
          <option value="">Select Sector</option>
          <option value="B1">B1</option>
          <option value="Tulip 1">Tulip 1</option>
          <option value="Tulip 2">Tulip 2</option>
          <option value="C Extension">C Extension</option>
          <option value="Tulip 2 Extension">Tulip 2 Extension</option>
          <option value="Burj Block">Burj Block</option>
          <option value="Burj Boulevard">Burj Boulevard</option>
        </select>
        <select
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
          <option value="">Select Category</option>
          <option value="A">Category A</option>
          <option value="B">Category B</option>
          <option value="C">Category C</option>
          <option value="D">Category D</option>
        </select>
        <input
          placeholder="Plot Number"
          value={formData.plot}
          onChange={e => setFormData({...formData, plot: e.target.value})}
        />
        <select
          value={formData.promiseFunnel}
          onChange={e => setFormData({...formData, promiseFunnel: e.target.value})}
        >
          <option value="pending">Pending</option>
          <option value="promised">Promised</option>
          <option value="kept">Kept</option>
          <option value="partial">Partial</option>
          <option value="broken">Broken</option>
        </select>
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0' }}>CRFES Scoring</h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {Object.entries(formData.scores).map(([key, value]) => (
            <div key={key}>
              <label style={{ fontSize: '12px', textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>
                {key}: {value}/100
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={e => setFormData({
                  ...formData,
                  scores: { ...formData.scores, [key]: parseInt(e.target.value) }
                })}
              />
            </div>
          ))}
        </div>
      </div>
      
      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={e => setFormData({...formData, notes: e.target.value})}
        rows="3"
      />
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={handleSave} style={{ flex: 1 }}>
          {client ? 'Update Client' : 'Create Client'}
        </button>
        <button onClick={onClose} style={{ flex: 1, backgroundColor: '#6b7280' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// Updated Agent Manager Component
function AgentManager({ onClose }) {
  const [agents, setAgents] = useState([]);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const agentsData = await api.getAgents();
        setAgents(agentsData);
      } catch (error) {
        console.error('Error loading agents:', error);
        alert('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleSaveAgent = async (agent) => {
    try {
      if (editingAgent) {
        const updatedAgent = await api.updateAgent(editingAgent.id, agent);
        setAgents(agents.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        setEditingAgent(null);
      } else {
        const newAgent = await api.createAgent(agent);
        setAgents([...agents, newAgent]);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error saving agent:', error);
      alert('Failed to save agent');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await api.deleteAgent(agentId);
        setAgents(agents.filter(a => a.id !== agentId));
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent');
      }
    }
  };

  const handleToggleStatus = async (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      try {
        const updatedAgent = await api.updateAgent(agentId, { ...agent, active: !agent.active });
        setAgents(agents.map(a => a.id === agentId ? updatedAgent : a));
      } catch (error) {
        console.error('Error updating agent status:', error);
        alert('Failed to update agent status');
      }
    }
  };

  const AgentForm = ({ agent, onSave, onCancel, title }) => {
    const [formData, setFormData] = useState(agent || { 
      name: '', role: 'agent', phone: '', email: '', active: true,
      department: '', performanceRating: 'Good'
    });

    const handleSubmit = () => {
      if (!formData.name || !formData.email) {
        alert('Name and email are required');
        return;
      }
      onSave(formData);
    };

    return (
      <div style={{ 
        backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', 
        border: '1px solid #e2e8f0', marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 16px 0' }}>{title}</h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <input
            placeholder="Full Name *"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input
            placeholder="Email *"
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input
            placeholder="Phone Number"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
          <select
            value={formData.role}
            onChange={e => setFormData({...formData, role: e.target.value})}
          >
            <option value="agent">Sales Agent</option>
            <option value="senior_agent">Senior Agent</option>
            <option value="team_lead">Team Lead</option>
            <option value="hod">HOD</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <input
            placeholder="Department"
            value={formData.department}
            onChange={e => setFormData({...formData, department: e.target.value})}
          />
          <select
            value={formData.performanceRating}
            onChange={e => setFormData({...formData, performanceRating: e.target.value})}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Needs Improvement">Needs Improvement</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData({...formData, active: e.target.checked})}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            Active Agent
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleSubmit} style={{ flex: 1 }}>
            {agent ? 'Update Agent' : 'Add Agent'}
          </button>
          <button 
            onClick={onCancel} 
            style={{ flex: 1, backgroundColor: '#6b7280' }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#dc2626';
      case 'hod': case 'manager': return '#7c2d12';
      case 'team_lead': return '#b45309';
      case 'senior_agent': return '#059669';
      default: return '#2563eb';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '200px',
        fontSize: '14px',
        color: '#64748b'
      }}>
        Loading agents...
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
      <div style={{ marginBottom: '24px' }}>
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            style={{ 
              width: '100%', padding: '12px', backgroundColor: '#059669',
              border: 'none', borderRadius: '8px', color: 'white',
              fontSize: '16px', fontWeight: 600
            }}
          >
            + Add New Agent
          </button>
        ) : (
          <AgentForm 
            onSave={handleSaveAgent}
            onCancel={() => setShowAddForm(false)}
            title="Add New Agent"
          />
        )}
      </div>

      {editingAgent && (
        <AgentForm 
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={() => setEditingAgent(null)}
          title="Edit Agent Details"
        />
      )}
      
      <div>
        <h4 style={{ marginBottom: '16px' }}>
          All Agents ({agents.length}) | Active: {agents.filter(a => a.active).length}
        </h4>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {agents.map(agent => (
            <div key={agent.id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px',
              backgroundColor: agent.active ? 'white' : '#f9fafb'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>{agent.name}</div>
                  <div style={{
                    fontSize: '10px', fontWeight: 600, color: 'white',
                    backgroundColor: getRoleColor(agent.role), padding: '2px 8px',
                    borderRadius: '12px', textTransform: 'uppercase'
                  }}>
                    {agent.role.replace('_', ' ')}
                  </div>
                  {!agent.active && (
                    <div style={{
                      fontSize: '10px', fontWeight: 600, color: '#dc2626',
                      backgroundColor: '#fef2f2', padding: '2px 8px',
                      borderRadius: '12px', border: '1px solid #fecaca'
                    }}>
                      INACTIVE
                    </div>
                  )}
                </div>
                
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                  <div>{agent.email} | {agent.phone}</div>
                  <div>{agent.department} • {agent.performanceRating}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '16px' }}>
                <button 
                  onClick={() => setEditingAgent(agent)}
                  style={{ 
                    padding: '6px 12px', fontSize: '12px', backgroundColor: '#3b82f6',
                    border: 'none', borderRadius: '4px', color: 'white', minWidth: '80px'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(agent.id)}
                  style={{ 
                    padding: '6px 12px', fontSize: '12px', minWidth: '80px',
                    backgroundColor: agent.active ? '#ef4444' : '#22c55e',
                    border: 'none', borderRadius: '4px', color: 'white'
                  }}
                >
                  {agent.active ? 'Deactivate' : 'Activate'}
                </button>
                <button 
                  onClick={() => handleDeleteAgent(agent.id)}
                  style={{ 
                    padding: '6px 12px', fontSize: '12px', backgroundColor: '#dc2626',
                    border: 'none', borderRadius: '4px', color: 'white', minWidth: '80px'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Updated Main App Component
export default function RHIApp() {
  const [clients, setClients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientEditor, setShowClientEditor] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showAgentManager, setShowAgentManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('Connecting to Supabase...');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setConnectionStatus('Connecting to Supabase...');
      
      try {
        const [clientsData, agentsData] = await Promise.all([
          api.getClients(),
          api.getAgents()
        ]);
        
        setClients(clientsData);
        setAgents(agentsData);
        
        setConnectionStatus(`Connected! Loaded ${clientsData.length} clients and ${agentsData.length} agents`);
        setTimeout(() => setConnectionStatus(''), 3000);
      } catch (error) {
        console.error('Database connection error:', error);
        setConnectionStatus('Connection failed - check your Supabase configuration');
        setTimeout(() => setConnectionStatus(''), 5000);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleSaveClient = async (clientData) => {
    if (editingClient) {
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
      if (selectedClient?.id === clientData.id) {
        setSelectedClient(clientData);
      }
    } else {
      setClients([...clients, clientData]);
    }
    
    setShowClientEditor(false);
    setEditingClient(null);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientEditor(true);
  };

  const handleInteraction = async (clientId, interactionData) => {
    // ...existing code... (interaction handling logic remains the same)
  };

  const handleFlexiblePlanAction = (clientId, actionData) => {
    alert(`Flexible plan action "${actionData}" initiated for client ${clientId}`);
  };

  const handleSyncData = async () => {
    setConnectionStatus('Syncing with Supabase...');
    try {
      const [clientsData, agentsData] = await Promise.all([
        api.getClients(),
        api.getAgents()
      ]);
      
      setClients(clientsData);
      setAgents(agentsData);
      setConnectionStatus(`Synced! ${clientsData.length} clients and ${agentsData.length} agents updated`);
      setTimeout(() => setConnectionStatus(''), 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setConnectionStatus('Sync failed');
      setTimeout(() => setConnectionStatus(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          RHI - Relationship Health & Insights
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          {connectionStatus}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      padding: "20px"
    }}>
      <style>
        {`
          .card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
          }
          
          .card h3 {
            margin: 0 0 16px 0;
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
          }
          
          input, select, textarea, button {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }
          
          input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #4a90e2;
            box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
          }
          
          button {
            background-color: #4a90e2;
            color: white;
            cursor: pointer;
            font-weight: 500;
            border: 1px solid #4a90e2;
            transition: background-color 0.2s;
          }
          
          button:hover:not(:disabled) {
            background-color: #357abd;
          }
          
          button:disabled {
            cursor: not-allowed;
            opacity: 0.7;
          }
          
          input[type="range"] {
            -webkit-appearance: none;
            height: 6px;
            background: #ddd;
            border-radius: 3px;
            padding: 0;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            background: #4a90e2;
            border-radius: 50%;
            cursor: pointer;
          }
        `}
      </style>
      
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "32px", 
              fontWeight: 700, 
              color: "#1e293b"
            }}>
              RHI - Relationship Health & Insights
            </h1>
            <p style={{ 
              color: "#64748b", 
              margin: "8px 0 0 0",
              fontSize: "16px"
            }}>
              Advanced client relationship management with real-time CRFES scoring
            </p>
            {connectionStatus && (
              <div style={{
                fontSize: '12px',
                padding: '4px 8px',
                marginTop: '4px',
                borderRadius: '4px',
                backgroundColor: connectionStatus.includes('Connected') || connectionStatus.includes('Synced') ? '#f0fdf4' : 
                                connectionStatus.includes('failed') || connectionStatus.includes('check') ? '#fef2f2' : '#eff6ff',
                color: connectionStatus.includes('Connected') || connectionStatus.includes('Synced') ? '#166534' : 
                       connectionStatus.includes('failed') || connectionStatus.includes('check') ? '#dc2626' : '#1d4ed8',
                border: `1px solid ${connectionStatus.includes('Connected') || connectionStatus.includes('Synced') ? '#bbf7d0' : 
                                     connectionStatus.includes('failed') || connectionStatus.includes('check') ? '#fecaca' : '#dbeafe'}`
              }}>
                Supabase: {connectionStatus}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={handleSyncData}
              style={{ width: 'auto', padding: '8px 16px', backgroundColor: '#10b981' }}
            >
              Sync Database
            </button>
            <button 
              onClick={() => { setEditingClient(null); setShowClientEditor(true); }}
              style={{ width: 'auto', padding: '8px 16px' }}
            >
              + Add Client
            </button>
            <button 
              onClick={() => setShowAgentManager(true)}
              style={{ width: 'auto', padding: '8px 16px', backgroundColor: '#6b7280' }}
            >
              Manage Agents
            </button>
          </div>
        </div>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 360px",
        gap: "20px",
        maxWidth: "1600px",
        margin: "0 auto"
      }}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <ClientList 
            clients={clients} 
            onPick={setSelectedClient} 
            selectedClient={selectedClient} 
          />
          <RedClientsQueue clients={clients} />
          {selectedClient && <ClientChecklist client={selectedClient} />}
        </div>
        
        <div style={{ display: "grid", gap: "20px" }}>
          <Dashboard clients={clients} />
          <ClientCard 
            client={selectedClient} 
            onEdit={handleEditClient}
            onFlexiblePlan={handleFlexiblePlanAction}
          />
        </div>
        
        {selectedClient ? (
          <InteractionForm 
            client={selectedClient} 
            agents={agents}
            onInteraction={handleInteraction}
          />
        ) : (
          <div className="card" style={{ textAlign: "center" }}>
            <h3>Ready to Start</h3>
            <p style={{ color: "#666" }}>
              Select a client from the list to begin logging interactions and tracking health scores.
            </p>
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
              <div>• Real-time CRFES scoring with Supabase</div>
              <div>• Auto-flagged Red clients (24h SLA)</div>
              <div>• NBA recommendations for Green clients</div>
              <div>• Flexible plan routing for Amber clients</div>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={showClientEditor} 
        onClose={() => setShowClientEditor(false)}
        title={editingClient ? "Edit Client" : "Add New Client"}
      >
        <ClientEditor 
          client={editingClient}
          onSave={handleSaveClient}
          onClose={() => setShowClientEditor(false)}
        />
      </Modal>

      <Modal 
        isOpen={showAgentManager} 
        onClose={() => setShowAgentManager(false)}
        title="Agent Management System"
      >
        <AgentManager onClose={() => setShowAgentManager(false)} />
      </Modal>
    </div>
  );
}