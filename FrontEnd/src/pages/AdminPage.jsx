
import React from 'react';
import AdminPanel from '@/components/AdminPanel';
import { Navigate } from 'react-router-dom';

const AdminPage = ({ currentUser }) => {
    if (currentUser.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-white">Administración</h1>
                <p className="text-slate-400">Panel de control para administradores</p>
            </div>
            <AdminPanel />
        </div>
    );
};

export default AdminPage;
