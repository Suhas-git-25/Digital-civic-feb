import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPolls } from '../../services/api';
import petitionService from '../../services/petitionService';
import Sidebar from '../../components/Sidebar';
import { INDIAN_STATES } from '../../constants/locations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Download, Calendar, MapPin } from 'lucide-react';
import '../../styles/dashboard.css';

const COLORS = ['#3182ce', '#48bb78', '#e53e3e', '#ed8936'];

const ReportsDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [petitions, setPetitions] = useState([]);
    const [polls, setPolls] = useState([]);
    
    const [locationFilter, setLocationFilter] = useState('');
    const [dateRange, setDateRange] = useState('30'); // '30', '90', 'all'

    useEffect(() => {
        if (user && user.role === 'official' && locationFilter === '') {
            setLocationFilter(user.location || '');
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all petitions (or filter by location via API)
                const petitionParams = locationFilter ? { location: locationFilter } : {};
                const petitionsData = await petitionService.getAllPetitions(petitionParams);
                
                // Fetch polls
                const pollLocation = locationFilter || 'All';
                const pollsData = await getPolls(pollLocation);

                setPetitions(petitionsData.petitions || []);
                setPolls(pollsData || []);
            } catch (err) {
                console.error("Failed to fetch report data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, locationFilter]);

    // Apply date filtering and aggregation
    const getFilteredData = () => {
        const now = new Date();
        const pastDate = new Date();
        if (dateRange !== 'all') {
            pastDate.setDate(now.getDate() - parseInt(dateRange));
        } else {
            pastDate.setFullYear(2000); // effectively no limit
        }

        const filteredPetitions = petitions.filter(p => new Date(p.createdAt) >= pastDate);
        const filteredPolls = polls.filter(p => new Date(p.createdAt) >= pastDate);

        const totalPetitions = filteredPetitions.length;
        const resolvedPetitions = filteredPetitions.filter(p => p.status === 'closed').length;
        const pendingPetitions = filteredPetitions.filter(p => p.status !== 'closed').length;
        const totalSignatures = filteredPetitions.reduce((sum, p) => sum + (p.signatureCount || 0), 0);
        const totalVotes = filteredPolls.reduce((sum, p) => sum + p.options.reduce((s, o) => s + (o.votes || 0), 0), 0);

        // Chart Data Prep
        const statusData = [
            { name: 'Active', count: filteredPetitions.filter(p => p.status === 'active').length },
            { name: 'Under Review', count: filteredPetitions.filter(p => p.status === 'under_review').length },
            { name: 'Closed', count: resolvedPetitions }
        ];

        // Petitions over time (group by day)
        const dateMap = {};
        filteredPetitions.forEach(p => {
            const dateStr = new Date(p.createdAt).toLocaleDateString();
            dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
        });

        const trendData = Object.keys(dateMap).map(date => ({
            date,
            count: dateMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            filteredPetitions,
            totalPetitions,
            resolvedPetitions,
            pendingPetitions,
            totalSignatures,
            totalVotes,
            statusData,
            trendData
        };
    };

    const metrics = getFilteredData();

    const handleExportCSV = () => {
        const rows = [
            ["ID", "Title", "Category", "Location", "Status", "Signatures", "Created At"]
        ];

        metrics.filteredPetitions.forEach(p => {
            rows.push([
                p._id,
                `"${p.title.replace(/"/g, '""')}"`,
                p.category,
                p.location,
                p.status,
                p.signatureCount || 0,
                new Date(p.createdAt).toLocaleDateString()
            ]);
        });

        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `civix_petitions_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="dashboard-wrapper">
            <Sidebar />
            <main className="dashboard-content" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', color: '#1a202c', margin: '0 0 5px 0' }}>Reports & Analytics</h2>
                        <p style={{ color: '#718096', margin: 0 }}>View insights on civic engagement and petition statuses.</p>
                    </div>

                    {user?.role === 'official' && (
                        <button
                            onClick={handleExportCSV}
                            className="primary-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#38a169', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            <Download size={18} /> Export CSV
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4a5568', fontWeight: 'bold', marginBottom: '8px' }}>
                            <Calendar size={18} /> Time Period
                        </label>
                        <select 
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none' }}
                        >
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4a5568', fontWeight: 'bold', marginBottom: '8px' }}>
                            <MapPin size={18} /> Location
                        </label>
                        <select 
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', outline: 'none' }}
                        >
                            <option value="">All Locations</option>
                            {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                        <Loader2 className="animate-spin" size={40} color="#3182ce" />
                    </div>
                ) : (
                    <>
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#3182ce' }}>{metrics.totalPetitions}</h3>
                                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', fontWeight: '600' }}>Total Petitions</p>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#d69e2e' }}>{metrics.pendingPetitions}</h3>
                                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', fontWeight: '600' }}>Pending</p>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#38a169' }}>{metrics.resolvedPetitions}</h3>
                                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', fontWeight: '600' }}>Resolved</p>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#805ad5' }}>{metrics.totalSignatures}</h3>
                                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', fontWeight: '600' }}>Total Signatures</p>
                            </div>
                            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', color: '#e53e3e' }}>{metrics.totalVotes}</h3>
                                <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem', fontWeight: '600' }}>Total Votes</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                            <div className="card" style={{ flex: 1, padding: '20px', minHeight: '350px' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem' }}>Petition Status Breakdown</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={metrics.statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <RechartsTooltip cursor={{ fill: '#edf2f7' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="count" fill="#3182ce" radius={[4, 4, 0, 0]}>
                                            {metrics.statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="card" style={{ flex: 1.5, padding: '20px', minHeight: '350px' }}>
                                <h3 style={{ margin: '0 0 20px 0', color: '#2d3748', fontSize: '1.1rem' }}>Petitions Created Over Time</h3>
                                {metrics.trendData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart data={metrics.trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f7" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                                            <Line type="monotone" dataKey="count" stroke="#3182ce" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#a0aec0' }}>
                                        No trend data available for this range.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default ReportsDashboard;
