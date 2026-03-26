import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import petitionService from '../../services/petitionService';
import StatusBadge from '../../components/petitions/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { Loader2, MapPin, Tag, Users, Calendar, ArrowLeft } from 'lucide-react';
import RoleGuard from '../../components/RoleGuard';
import Sidebar from '../../components/Sidebar';
import '../../styles/dashboard.css';
import { toast } from 'react-toastify';

const PetitionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [petition, setPetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseStatus, setResponseStatus] = useState('under_review');
    const [submittingResponse, setSubmittingResponse] = useState(false);

    useEffect(() => {
        fetchPetition();
    }, [id]);

    const fetchPetition = async () => {
        try {
            setLoading(true);
            const data = await petitionService.getPetitionById(id);
            setPetition(data);
        } catch (err) {
            setError('Failed to load petition details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSign = async () => {
        try {
            setSigning(true);
            await petitionService.signPetition(id);

            // Optimistic UI update
            setPetition(prev => ({
                ...prev,
                signatureCount: (prev.signatureCount || 0) + 1,
                isSigned: true // Assuming backend returns this or we track it
            }));
            
            toast.success('Successfully signed the petition!');

            // Re-fetch to be sure
            // fetchPetition(); 
        } catch (err) {
            toast.error(err.message || 'Failed to sign petition.');
        } finally {
            setSigning(false);
        }
    };

    const handleOfficialResponse = async (e) => {
        e.preventDefault();
        if (!responseMessage.trim()) {
            toast.error('Response message is required.');
            return;
        }

        try {
            setSubmittingResponse(true);
            await petitionService.respondToPetition(id, {
                message: responseMessage,
                status: responseStatus
            });
            toast.success('Official response submitted successfully.');
            // Optimistic UI update
            setPetition(prev => ({
                ...prev,
                status: responseStatus,
                officialResponse: {
                    message: responseMessage,
                    createdAt: new Date().toISOString()
                }
            }));
            fetchPetition();
        } catch (err) {
            toast.error(err.message || 'Failed to submit response.');
        } finally {
            setSubmittingResponse(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Loader2 className="animate-spin" size={40} color="#3182ce" />
            </div>
        );
    }

    if (error || !petition) {
        return (
            <div className="dashboard-wrapper">
                <main className="dashboard-content">
                    <button onClick={() => navigate('/petitions')} className="secondary-btn" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowLeft size={18} /> Back to Petitions
                    </button>
                    <div className="empty-state">{error || 'Petition not found.'}</div>
                </main>
            </div>
        );
    }

    const isSigned = petition.isSigned || false;
    const canSign = user?.role === 'citizen' && petition.status === 'active' && !isSigned;

    return (
        <div className="dashboard-wrapper">
            <Sidebar />

            <main className="dashboard-content" style={{ maxWidth: '1000px', margin: '0', width: '100%' }}>
                <button
                    onClick={() => navigate('/petitions')}
                    style={{ background: 'none', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '18px', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to Petitions
                </button>

                <div className="card" style={{ padding: '25px 25px', borderRadius: '12px', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1a202c' }}>{petition.title}</h1>
                        <StatusBadge status={petition.status} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '25px', marginBottom: '25px', padding: '12px 20px', background: '#f8fafc', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4a5568' }}>
                            <Tag size={18} />
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#718096' }}>Category:</span>
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>{petition.category}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4a5568' }}>
                            <MapPin size={18} />
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#718096' }}>Location:</span>
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>{petition.location}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4a5568' }}>
                            <Users size={18} />
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#718096' }}>Signatures:</span>
                                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#2d3748' }}>{petition.signatureCount || 0}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4a5568' }}>
                            <Calendar size={18} />
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#718096' }}>Created:</span>
                                <span style={{ fontWeight: '600', fontSize: '1rem' }}>{new Date(petition.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#2d3748', marginBottom: '15px', borderBottom: '2px solid #edf2f7', paddingBottom: '10px' }}>Description</h3>
                        <p style={{ color: '#4a5568', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }}>{petition.description}</p>
                    </div>

                    {/* Official Response View */}
                    {petition.officialResponse && (
                        <div style={{ marginBottom: '40px', padding: '20px', background: '#e6fffa', borderLeft: '4px solid #38b2ac', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#234e52', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ padding: '4px 10px', background: '#319795', color: 'white', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Official Response</span>
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: '#285e61' }}>
                                    {new Date(petition.officialResponse?.createdAt || petition.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <p style={{ margin: 0, color: '#285e61', lineHeight: '1.6' }}>{typeof petition.officialResponse === 'string' ? petition.officialResponse : petition.officialResponse?.message}</p>
                        </div>
                    )}

                    {/* Official Action Form */}
                    {user?.role === 'official' && !petition.officialResponse && (
                        <div style={{ marginBottom: '40px', padding: '25px', background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.25rem', color: '#2d3748' }}>Submit Official Response</h3>
                            <form onSubmit={handleOfficialResponse}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Update Petition Status</label>
                                    <select
                                        value={responseStatus}
                                        onChange={(e) => setResponseStatus(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none' }}
                                    >
                                        <option value="under_review">Under Review</option>
                                        <option value="closed">Closed / Resolved</option>
                                        <option value="active">Active (No status change)</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Response Message</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={responseMessage}
                                        onChange={(e) => setResponseMessage(e.target.value)}
                                        placeholder="Explain the action being taken or the reason for closure..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none', resize: 'vertical' }}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingResponse}
                                    className="primary-btn"
                                    style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {submittingResponse ? <Loader2 className="animate-spin" size={18} /> : null}
                                    Submit Response
                                </button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '30px', borderTop: '1px solid #edf2f7' }}>
                        <div style={{ color: '#718096' }}>
                            <span style={{ fontSize: '0.875rem' }}>Created by</span>
                            <p style={{ margin: 0, fontWeight: '600', color: '#2d3748' }}>{petition.creator?.name || 'Anonymous'}</p>
                        </div>

                        <RoleGuard role="citizen">
                            <button
                                onClick={handleSign}
                                disabled={!canSign || signing}
                                className="primary-btn"
                                style={{
                                    padding: '12px 30px',
                                    fontSize: '1rem',
                                    opacity: canSign ? 1 : 0.6,
                                    cursor: canSign ? 'pointer' : 'not-allowed',
                                    backgroundColor: isSigned ? '#48bb78' : '#3182ce'
                                }}
                            >
                                {signing ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Loader2 className="animate-spin" size={18} /> Signing...</span>
                                ) : isSigned ? (
                                    'Already Signed'
                                ) : petition.status !== 'active' ? (
                                    'Petition Closed'
                                ) : (
                                    'Sign this Petition'
                                )}
                            </button>
                        </RoleGuard>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PetitionDetail;
