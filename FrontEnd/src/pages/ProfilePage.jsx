
import React from 'react';
import { motion } from 'framer-motion';
import UserProfile from '@/components/UserProfile';

const ProfilePage = ({ currentUser }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
                <p className="text-slate-400">Gestiona tu cuenta y revisa tus logros</p>
            </div>
            <UserProfile currentUser={currentUser} />
        </motion.div>
    );
};

export default ProfilePage;
