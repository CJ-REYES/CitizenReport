
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, BarChart, Clock } from 'lucide-react';

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

const StatsWidgets = () => {
    const [reportStats, setReportStats] = useState({
        byRegion: {},
        byType: {},
        mostActiveZone: { name: 'N/A', count: 0 },
    });

    useEffect(() => {
        const allReports = JSON.parse(localStorage.getItem('reports') || '[]');

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
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Map className="w-5 h-5 text-teal-400" />Reportes por Zona</h3>
                <div className="space-y-2 text-sm">
                    {Object.keys(reportStats.byRegion).length === 0 ? (
                        <p className="text-slate-500">Sin datos</p>
                    ) : (
                        Object.entries(reportStats.byRegion).map(([region, count]) => (
                            <div key={region} className="flex justify-between items-center text-slate-300">
                                <span>{region}</span>
                                <span className="font-bold text-white bg-teal-500/20 px-2 py-1 rounded">{count}</span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><BarChart className="w-5 h-5 text-sky-400" />Reportes por Tipo</h3>
                <div className="space-y-2 text-sm">
                    {Object.keys(reportStats.byType).length === 0 ? (
                        <p className="text-slate-500">Sin datos</p>
                    ) : (
                        Object.entries(reportStats.byType).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center text-slate-300">
                                <span>{type}</span>
                                <span className="font-bold text-white bg-sky-500/20 px-2 py-1 rounded">{count}</span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 flex flex-col justify-center items-center text-center">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Clock className="w-5 h-5 text-violet-400" />Zona más activa (Mes)</h3>
                <p className="text-3xl font-extrabold text-violet-400">{reportStats.mostActiveZone.name}</p>
                <p className="text-slate-400">{reportStats.mostActiveZone.count} reportes</p>
            </motion.div>
        </div>
    );
};

export default StatsWidgets;
