import React, { useState, useEffect } from 'react';
import petitionService from '../../services/petitionService';
import PetitionCard from '../../components/petitions/PetitionCard';
import FilterBar from '../../components/petitions/FilterBar';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import '../../styles/dashboard.css';

const PetitionList = () => {
    const [petitions, setPetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        location: '',
        category: '',
        status: ''
    });

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPetitions();
    }, [filters]);

    const fetchPetitions = async () => {
        try {
            setLoading(true);
            const data = await petitionService.getAllPetitions(filters);

            let filteredData = data.petitions || [];

            // Officials: Only show petitions matching their location (frontend filtering as requested)
            if (user?.role === 'official' && user?.location) {
                filteredData = filteredData.filter(p => p.location.toLowerCase() === user.location.toLowerCase());
            }

            setPetitions(filteredData);
        } catch (err) {
            setError('Failed to fetch petitions. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />

            <main className="dashboard-content">
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Petitions Explorer</h2>
                    {user?.role === 'citizen' && (
                        <button
                            className="primary-btn"
                            onClick={() => navigate('/create-petition')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Create Petition
                        </button>
                    )}
                </div>

                <FilterBar filters={filters} onFilterChange={setFilters} />

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                    </div>
                ) : error ? (
                    <div className="empty-state" style={{ color: '#e53e3e' }}>{error}</div>
                ) : petitions.length === 0 ? (
                    <div className="empty-state">
                        <p>No petitions found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="petitions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                        {petitions.map(petition => (
                            <PetitionCard key={petition._id} petition={petition} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PetitionList;
