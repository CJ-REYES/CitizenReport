
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Medal } from 'lucide-react';

const LeaderboardPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        // Sort by points descending
        const sortedUsers = storedUsers.sort((a, b) => b.points - a.points);
        setUsers(sortedUsers);
    }, []);

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
        if (index === 1) return <Medal className="w-6 h-6 text-gray-300" />;
        if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
        return <span className="font-bold text-slate-400">#{index + 1}</span>;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-4xl mx-auto space-y-6"
        >
            <div>
                <h1 className="text-2xl font-bold text-white">Ranking de Ciudadanos</h1>
                <p className="text-slate-400">Los usuarios más activos y comprometidos con la ciudad</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-800/80 border-b border-slate-700 grid grid-cols-12 gap-4 font-semibold text-slate-300 text-sm">
                    <div className="col-span-1 text-center">Rango</div>
                    <div className="col-span-5">Usuario</div>
                    <div className="col-span-3">Nivel</div>
                    <div className="col-span-3 text-right">Puntos</div>
                </div>
                <div className="divide-y divide-slate-700">
                    {users.length === 0 ? (
                        <p className="p-8 text-center text-slate-400">No hay usuarios registrados aún.</p>
                    ) : (
                        users.map((user, index) => (
                            <div key={user.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-700/30 transition-colors">
                                <div className="col-span-1 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                        <p className="font-semibold text-white truncate">{user.username}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.reportsCount || 0} reportes</p>
                                    </div>
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Award className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-slate-300">{user.rank || 'Novato'}</span>
                                </div>
                                <div className="col-span-3 text-right font-bold text-yellow-400 text-lg">
                                    {user.points}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default LeaderboardPage;
