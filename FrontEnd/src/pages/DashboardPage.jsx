
import React from 'react';
import { motion } from 'framer-motion';
import StatsWidgets from '@/components/StatsWidgets';
import UserProfile from '@/components/UserProfile';

const DashboardPage = ({ currentUser }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6"
        >
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white">Panel de Control</h1>
                <p className="text-slate-400">Resumen de la actividad de la ciudad y tu progreso</p>
            </div>
            <StatsWidgets />
            <div className="border-t border-slate-700 pt-6">
                <h2 className="text-xl font-bold text-white mb-4">Mi Progreso</h2>
                <UserProfile currentUser={currentUser} />
            </div>
        </motion.div>
    );
};

export default DashboardPage;
