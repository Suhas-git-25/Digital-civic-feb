import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import petitionService from "../services/petitionService";
import { Loader2, Edit, Trash2, XCircle, Eye } from "lucide-react";
import StatusBadge from "../components/petitions/StatusBadge";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myPetitions, setMyPetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchMyPetitions();
    }
  }, [user]);

  const fetchMyPetitions = async () => {
    try {
      setLoading(true);
      const data = await petitionService.getAllPetitions({ user: user._id });
      setMyPetitions(data.petitions || []);
    } catch (err) {
      console.error("Error fetching my petitions:", err);
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
                <h3>0</h3>
                <p>Pending Petitions</p>
              </div>
              <div className="card">
                <h3>0</h3>
                <p>Official Responses</p>
              </div>
              <div className="card">
                <h3>0</h3>
                <p>Local User Base</p>
              </div>
            </>
          )}
        </div>

        {/* Activity Section / My Petitions */}
        <div className="activity-section">
          <h3>{user?.role === 'citizen' ? 'My Petitions' : 'Unresolved Issues in Your Jurisdiction'}</h3>

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
            <div className="empty-state">
              <p>No issues found for {user?.location || 'your area'}.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
