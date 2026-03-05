import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import petitionService from '../../services/petitionService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowLeft, Send, Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import '../../styles/dashboard.css';

const CreatePetition = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: user?.location || ''
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');

    const categories = ['Infrastructure', 'Environment', 'Public Safety', 'Education', 'Healthcare', 'Others'];

    useEffect(() => {
        if (isEdit) {
            fetchPetition();
        }
    }, [id]);

    const fetchPetition = async () => {
        try {
            setFetching(true);
            const data = await petitionService.getPetitionById(id);
            // Check if user is creator
            if (data.creator?._id !== user?._id && data.creator !== user?._id) {
                setError('You are not authorized to edit this petition.');
                return;
            }
            setFormData({
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch petition details.');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.category || !formData.location) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            if (isEdit) {
                await petitionService.updatePetition(id, formData);
            } else {
                await petitionService.createPetition(formData);
            }
            // Success - redirect to dashboard or petitions list
            navigate(isEdit ? '/dashboard' : '/petitions');
        } catch (err) {
            setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} petition.`);
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'citizen') {
        return (
            <div className="dashboard-wrapper">
                <main className="dashboard-content">
                    <div className="empty-state">Only citizens can create or edit petitions.</div>
                </main>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="dashboard-wrapper">
                <Sidebar />
                <main className="dashboard-content">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <Sidebar />

            <main className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <button
                    onClick={() => navigate(isEdit ? '/dashboard' : '/petitions')}
                    style={{ background: 'none', border: 'none', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px', fontWeight: '600' }}
                >
                    <ArrowLeft size={18} /> Back to {isEdit ? 'Dashboard' : 'Petitions'}
                </button>

                <div className="card" style={{ padding: '25px', borderRadius: '16px' }}>
                    <h2 style={{ marginBottom: '17px', color: '#1a202c', textAlign: 'left' }}>
                        {isEdit ? 'Edit Petition' : 'Start a New Petition'}
                    </h2>

                    {error && <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #feb2b2' }}>{error}</div>}

                    {!error || !isEdit ? (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568', textAlign: 'left' }}>Petition Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="What do you want to change?"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568', textAlign: 'left' }}>Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568', textAlign: 'left' }}>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Affected area"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#4a5568', textAlign: 'left' }}>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Explain why this petition is important and what you hope to achieve..."
                                    rows="8"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate(isEdit ? '/dashboard' : '/petitions')}
                                    className="secondary-btn"
                                    style={{ padding: '12px 25px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="primary-btn"
                                    style={{ padding: '12px 30px', display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : (isEdit ? <Save size={20} /> : <Send size={20} />)}
                                    {loading ? 'Submitting...' : (isEdit ? 'Save Changes' : 'Launch Petition')}
                                </button>
                            </div>
                        </form>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default CreatePetition;
