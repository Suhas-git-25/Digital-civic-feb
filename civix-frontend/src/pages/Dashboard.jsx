import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import petitionService from "../services/petitionService";
import { Loader2, Edit, Trash2, XCircle, Eye } from "lucide-react";
import StatusBadge from "../components/petitions/StatusBadge";
import bannerImg from "../assets/image.png";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPetitions, setMyPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?._id) {
      fetchMyPetitions();
    }
  }, [user]);

  const fetchMyPetitions = async () => {
    try {
      setLoading(true);
      const params = user?.role === 'citizen' ? { user: user._id } : { location: user?.location };
      const data = await petitionService.getAllPetitions(params);
      setMyPetitions(data.petitions || []);
    } catch (err) {
      console.error("Error fetching petitions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this petition?")) {
      try {
        await petitionService.deletePetition(id);
        setMyPetitions(myPetitions.filter(p => p._id !== id));
      } catch (err) {
        alert(err.message || "Failed to delete petition");
      }
    }
  };

  const handleWithdraw = async (id) => {
    if (window.confirm("Are you sure you want to withdraw this petition? This will set its status to closed.")) {
      try {
        // We'll use updatePetition to set status to 'closed'
        await petitionService.updatePetition(id, { status: 'closed' });
        fetchMyPetitions(); // Refresh
      } catch (err) {
        alert(err.message || "Failed to withdraw petition");
      }
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar />
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
            <span className="role-badge" style={{ fontSize: '0.5em', background: '#e2e8f0', padding: '4px 8px', borderRadius: '12px', marginLeft: '10px', verticalAlign: 'middle' }}>
              {user?.role?.toUpperCase()}
            </span>
          </h2>
          {user?.role === 'citizen' ? (
            <Link to="/create-petition" className="primary-btn" style={{ textDecoration: 'none' }}>Create Petition</Link>
          ) : (
            <Link to="/petitions" className="primary-btn" style={{ background: '#4a5568', textDecoration: 'none' }}>Review Local Petitions</Link>
          )}
        </div>

        {/* Dashboard Vibrant Banner */}
        <div style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '40px',
          backgroundImage: `linear-gradient(135deg, rgba(79, 70, 229, 0.65), rgba(59, 130, 246, 0.85)), url(${bannerImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px',
          color: 'white',
          boxShadow: '0 15px 35px -10px rgba(59, 130, 246, 0.4)'
        }}>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-1px' }}>Make an Impact Today</h1>
          <p style={{ fontSize: '1.15rem', margin: 0, opacity: 0.95, maxWidth: '650px', lineHeight: 1.5, fontWeight: 500 }}>
            {user?.role === 'citizen' ? 'Your voice matters. Track local issues, engage with your community, and see the change happen directly from your dashboard.' : 'Manage public petitions effectively. Ensure transparency and deliver high-quality governance to your community.'}
          </p>
        </div>

        {/* Stats Cards - Role Based */}
        <div className="stats-grid">
          {user?.role === 'citizen' ? (
            <>
              <div className="card">
                <h3>{myPetitions.length}</h3>
                <p>My Petitions</p>
              </div>
              <div className="card">
                <h3>{myPetitions.reduce((acc, p) => acc + (p.signatureCount || 0), 0)}</h3>
                <p>Total Signatures</p>
              </div>
              <div className="card">
                <h3>0</h3>
                <p>Polls Answered</p>
              </div>
            </>
          ) : (
            <>
              <div className="card">
                <h3>{myPetitions.length}</h3>
                <p>Total Petitions</p>
              </div>
              <div className="card">
                <h3>{myPetitions.filter(p => p.status === 'active' || p.status === 'under_review').length}</h3>
                <p>Active & Under Review</p>
              </div>
              <div className="card">
                <h3>{myPetitions.filter(p => p.status === 'closed').length}</h3>
                <p>Closed Petitions</p>
              </div>
            </>
          )}
        </div>

        {/* Activity Section / My Petitions */}
        <div className="activity-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>{user?.role === 'citizen' ? 'My Petitions' : 'Unresolved Issues in Your Jurisdiction'}</h3>
            {user?.role === 'official' && (
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="under_review">Under Review</option>
                <option value="closed">Closed</option>
              </select>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 className="animate-spin" size={32} color="#3182ce" />
            </div>
          ) : user?.role === 'citizen' ? (
            myPetitions.length === 0 ? (
              <div className="empty-state">
                <p>You haven't raised any petitions yet.</p>
                <Link to="/create-petition" style={{ color: '#3182ce', fontWeight: 'bold' }}>Start your first petition</Link>
              </div>
            ) : (
              <div className="petitions-list" style={{ marginTop: '20px' }}>
                {myPetitions.map(petition => (
                  <div key={petition._id} className="card" style={{ marginBottom: '15px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{petition.title}</h4>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <StatusBadge status={petition.status} />
                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>{petition.signatureCount || 0} signatures</span>
                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>{new Date(petition.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigate(`/petitions/${petition._id}`)}
                        title="View"
                        style={{ background: '#edf2f7', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={18} color="#4a5568" />
                      </button>
                      <button
                        onClick={() => navigate(`/edit-petition/${petition._id}`)}
                        title="Edit"
                        style={{ background: '#ebf8ff', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Edit size={18} color="#3182ce" />
                      </button>
                      {petition.status !== 'closed' && (
                        <button
                          onClick={() => handleWithdraw(petition._id)}
                          title="Withdraw (Close)"
                          style={{ background: '#fff5f5', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <XCircle size={18} color="#e53e3e" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(petition._id)}
                        title="Delete Permanently"
                        style={{ background: '#fff5f5', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={18} color="#c53030" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            (statusFilter !== 'all' ? myPetitions.filter(p => p.status === statusFilter) : myPetitions).length === 0 ? (
              <div className="empty-state">
                <p>No issues found for {user?.location || 'your area'} with the selected filters.</p>
              </div>
            ) : (
              <div className="petitions-list" style={{ marginTop: '20px' }}>
                {(statusFilter !== 'all' ? myPetitions.filter(p => p.status === statusFilter) : myPetitions).map(petition => (
                  <div key={petition._id} className="card" style={{ marginBottom: '15px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{petition.title}</h4>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <StatusBadge status={petition.status} />
                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>{petition.signatureCount || 0} signatures</span>
                        <span style={{ fontSize: '0.85rem', color: '#718096' }}>{new Date(petition.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigate(`/petitions/${petition._id}`)}
                        title="View & Respond"
                        style={{ background: '#edf2f7', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Eye size={18} color="#4a5568" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
