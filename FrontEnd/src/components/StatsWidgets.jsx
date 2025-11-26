import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, BarChart, Clock, CheckCircle } from 'lucide-react';

// Simulated regions for Candelaria, Campeche
const regions = [
    { name: 'Centro', bounds: { minLat: 18.18, maxLat: 18.20, minLng: -91.06, maxLng: -91.04 } },
    { name: 'San Martín', bounds: { minLat: 18.17, maxLat: 18.19, minLng: -91.04, maxLng: -91.02 } },
    { name: 'Guadalupe', bounds: { minLat: 18.19, maxLat: 18.21, minLng: -91.08, maxLng: -91.06 } },
    { name: 'Fátima', bounds: { minLat: 18.16, maxLat: 18.18, minLng: -91.06, maxLng: -91.04 } },
];

// Helper function to get region from coordinates (adjusted to Candelaria's approximate coords)
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
    return 'Zona Desconocida';
};

const calculateReportStats = (allReports) => {
    // 1. Total Reports
    const totalReports = allReports.length;

    // 2. Resolved Percentage
    const resolvedReports = allReports.filter(r => r.status === 'resolved').length;
    const resolvedPercentage = totalReports === 0 ? 0 : Math.round((resolvedReports / totalReports) * 100);

    // 3. Reports by Type
    const byType = allReports.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1;
        return acc;
    }, {});

    // 4. Most Active Zone (simplified by recent reports)
    const byZone = allReports.reduce((acc, report) => {
        const zone = getRegionFromCoords(report.location.lat, report.location.lng);
        acc[zone] = (acc[zone] || 0) + 1;
        return acc;
    }, {});

    let mostActiveZone = { name: 'N/A', count: 0 };
    for (const zone in byZone) {
        if (byZone[zone] > mostActiveZone.count) {
            mostActiveZone = { name: zone, count: byZone[zone] };
        }
    }

    return { totalReports, resolvedPercentage, byType, mostActiveZone };
};

const StatsWidgets = () => {
    const [reportStats, setReportStats] = useState({
        totalReports: 0,
        resolvedPercentage: 0,
        byType: {},
        mostActiveZone: { name: 'N/A', count: 0 },
    });

    useEffect(() => {
        const storedReports = JSON.parse(localStorage.getItem('reports') || '[]');
        setReportStats(calculateReportStats(storedReports));
    }, []);

    return (
        <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            {/* TARJETA 1 */}
            <motion.div 
                whileHover={{ scale: 1.02, y: -5 }} 
                className="bg-card rounded-xl p-6 border border-border shadow-md"
            >
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Reportes Totales
                </h3>

                <p className="text-5xl font-extrabold text-primary mb-2">
                    {reportStats.totalReports}
                </p>
                <div className='flex items-center gap-2 text-muted-foreground'>
                    <CheckCircle className='w-4 h-4 text-green-500' />
                    <span className="font-semibold text-lg">{reportStats.resolvedPercentage}% resueltos</span>
                </div>
            </motion.div>

            {/* TARJETA 2 */}
            <motion.div 
                whileHover={{ scale: 1.02, y: -5 }} 
                className="bg-card rounded-xl p-6 border border-border shadow-md"
            >
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <BarChart className="w-5 h-5 text-primary" />
                    Distribución por Tipo
                </h3>

                <div className="space-y-3">
                    {Object.keys(reportStats.byType).length === 0 ? (
                        <p className="text-muted-foreground">Sin datos</p>
                    ) : (
                        Object.entries(reportStats.byType).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center text-foreground">
                                <span>{type}</span>
                                <span className="font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                    {count}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* TARJETA 3 */}
            <motion.div 
                whileHover={{ scale: 1.02, y: -5 }} 
                className="bg-card rounded-xl p-6 border border-border shadow-md text-center flex flex-col justify-center"
            >
                <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2 justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                    Zona más activa (Reportes)
                </h3>

                <p className="text-3xl font-extrabold text-primary">
                    {reportStats.mostActiveZone.name}
                </p>
                <p className="text-muted-foreground">
                    {reportStats.mostActiveZone.count} reportes
                </p>
            </motion.div>
        </motion.div>
    );
};

export default StatsWidgets;