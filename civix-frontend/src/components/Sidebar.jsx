import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, FileText, Vote, Users, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Home size={18} /> },
        { name: 'Petitions', path: '/petitions', icon: <FileText size={18} /> },
        { name: 'Polls', path: '/polls', icon: <Vote size={18} /> },
        { name: 'Reports', path: '/reports', icon: <MessageSquare size={18} /> }
        // Settings removed or hidden if unneeded, kept minimal
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <h2>Civix</h2>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.name}
                        className={location.pathname === item.path ? 'active' : ''}
                        onClick={() => item.path !== '#' && navigate(item.path)}
                        style={{ cursor: item.path !== '#' ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                        {item.icon}
                        {item.name}
                    </li>
                ))}

                <li
                    onClick={logout}
                    className="logout-item"
                    style={{ cursor: 'pointer', color: '#ff4d4d', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <LogOut size={18} />
                    Logout
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
