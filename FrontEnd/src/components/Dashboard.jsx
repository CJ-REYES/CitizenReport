
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Award, TrendingUp, MapPin, Gamepad2, BarChart, Map, Clock } from 'lucide-react';

// Simulated regions for Candelaria, Campeche
const regions = [
    { name: 'Centro', bounds: { minLat: 19.26, maxLat: 19.27, minLng: -90.41, maxLng: -90.39 } },
    { name: 'San Martín', bounds: { minLat: 19.27, maxLat: 19.28, minLng: -90.41, maxLng: -90.39 } },
    { name: 'Guadalupe', bounds: { minLat: 19.26, maxLat: 19.27, minLng: -90.42, maxLng: -90.41 } },
    { name: 'Fátima', bounds: { minLat: 19.25, maxLat: 19.26, minLng: -90.41, maxLng: -90.39 } },
];

const getRegionFromCoords = (lat, lng) => {
    for (const region of regions) {
        if (
            lat >= region.bounds.minLat &&
            lat < region.bounds.maxLat &&
            lng >= region.bounds.minLng &&
            lng < region.bounds.maxLng
        ) {
            return region.name;
        }
    }
    return 'Fuera de Zona';
};

const Dashboard = ({ currentUser }) => {
    const [userStats, setUserStats] = useState(currentUser);
    const [userReports, setUserReports] = useState([]);
    const [reportStats, setReportStats] = useState({
        byRegion: {},
        byType: {},
        mostActiveZone: { name: 'N/A', count: 0 },
    });

    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.id === currentUser.id);
        if (user) {
            setUserStats(user);
        }

        const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
        const myReports = allReports.filter(r => r.userId === currentUser.id);
        setUserReports(myReports);

        // Calculate global report stats
        const byRegion = {};
        const byType = {};
        const byRegionLastMonth = {};
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        allReports.forEach(report => {
            // Stats by type
            byType[report.type] = (byType[report.type] || 0) + 1;

            // Stats by region
            const regionName = getRegionFromCoords(report.location.lat, report.location.lng);
            byRegion[regionName] = (byRegion[regionName] || 0) + 1;

            // Stats for last month
            if (new Date(report.createdAt) > oneMonthAgo) {
                byRegionLastMonth[regionName] = (byRegionLastMonth[regionName] || 0) + 1;
            }
        });

        const mostActiveZone = Object.entries(byRegionLastMonth).reduce(
            (max, [name, count]) => (count > max.count ? { name, count } : max),
            { name: 'N/A', count: 0 }
        );

        setReportStats({ byRegion, byType, mostActiveZone });
    }, [currentUser]);

    const getRankInfo = (points) => {
        if (points >= 500) return { rank: 'Ciudadano Héroe', color: 'from-cyan-400 to-teal-500', icon: '🏆' };
        if (points >= 300) return { rank: 'Ciudadano Ejemplar', color: 'from-sky-400 to-blue-500', icon: '⭐' };
        if (points >= 150) return { rank: 'Ciudadano Vigía', color: 'from-emerald-400 to-green-500', icon: '👁️' };
        if (points >= 50) return { rank: 'Ciudadano Activo', color: 'from-violet-400 to-purple-500', icon: '🎯' };
        return { rank: 'Ciudadano Novato', color: 'from-slate-500 to-slate-600', icon: '🌱' };
    };

    const rankInfo = getRankInfo(userStats.points);
    const nextRankPoints = userStats.points >= 500 ? 500 :
                        userStats.points >= 300 ? 500 :
                        userStats.points >= 150 ? 300 :
                        userStats.points >= 50 ? 150 : 50;
    const progress = (userStats.points / nextRankPoints) * 100;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto space-y-6">
            
            {/* New Statistics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Map className="w-5 h-5 text-teal-400" />Reportes por Zona</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(reportStats.byRegion).map(([region, count]) => (
                            <div key={region} className="flex justify-between items-center text-slate-300">
                                <span>{region}</span>
                                <span className="font-bold text-white bg-teal-500/20 px-2 py-1 rounded">{count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart className="w-5 h-5 text-sky-400" />Reportes por Tipo</h3>
                    <div className="space-y-2 text-sm">
                        {Object.entries(reportStats.byType).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center text-slate-300">
                                <span>{type}</span>
                                <span className="font-bold text-white bg-sky-500/20 px-2 py-1 rounded">{count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-violet-400" />Zona más activa (Mes)</h3>
                    <p className="text-3xl font-extrabold text-violet-400">{reportStats.mostActiveZone.name}</p>
                    <p className="text-slate-400">{reportStats.mostActiveZone.count} reportes</p>
                </motion.div>
            </div>

            {/* Profile Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className={`w-24 h-24 bg-gradient-to-br ${rankInfo.color} rounded-full flex items-center justify-center text-4xl shadow-lg`}>
                        {rankInfo.icon}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">{userStats.username}</h2>
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <span className="text-xl text-yellow-400 font-semibold">{rankInfo.rank}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-400">
                                <span>Progreso al siguiente rango</span>
                                <span>{userStats.points} / {nextRankPoints} puntos</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={`h-full bg-gradient-to-r ${rankInfo.color}`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-sky-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-6 border border-sky-500/30">
                    <div className="flex items-center gap-3 mb-2"><Trophy className="w-8 h-8 text-sky-400" /><span className="text-slate-400">Puntos</span></div>
                    <p className="text-3xl font-bold text-white">{userStats.points}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-500/30">
                    <div className="flex items-center gap-3 mb-2"><MapPin className="w-8 h-8 text-emerald-400" /><span className="text-slate-400">Reportes</span></div>
                    <p className="text-3xl font-bold text-white">{userReports.length}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-6 border border-violet-500/30">
                    <div className="flex items-center gap-3 mb-2"><Gamepad2 className="w-8 h-8 text-violet-400" /><span className="text-slate-400">Vidas</span></div>
                    <p className="text-3xl font-bold text-white">{userStats.gameStats?.lives || 5}</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
                    <div className="flex items-center gap-3 mb-2"><Star className="w-8 h-8 text-amber-400" /><span className="text-slate-400">High Score</span></div>
                    <p className="text-3xl font-bold text-white">{userStats.gameStats?.highScore || 0}</p>
                </motion.div>
            </div>

            {/* Recent Reports */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Mis Reportes Recientes</h3>
                {userReports.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No has creado reportes aún</p>
                ) : (
                    <div className="space-y-3">
                        {userReports.slice(0, 5).map(report => (
                            <div key={report.id} className="bg-slate-700/30 hover:bg-slate-700/50 transition-colors rounded-lg p-4 flex items-center gap-4">
                                {report.photo && (<img src={report.photo} alt="Report" className="w-16 h-16 object-cover rounded-lg" />)}
                                <div className="flex-1">
                                    <p className="font-semibold text-white">{report.type}</p>
                                    <p className="text-sm text-slate-400 line-clamp-1">{report.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs ${report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : report.status === 'reviewed' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                    {report.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Dashboard;
