
import React, { useState } from 'react';
import MapView from '@/components/MapView';
import ReportModal from '@/components/ReportModal';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const MapPage = ({ currentUser, onPointsEarned }) => {
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const handleReportSubmit = () => {
        // Update timestamp to trigger map refresh
        setLastUpdate(Date.now());
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mapa de Reportes</h1>
                    <p className="text-slate-400">Visualiza los problemas reportados en tu ciudad</p>
                </div>
                <ReportModal 
                    currentUser={currentUser} 
                    onReportSubmit={handleReportSubmit}
                    onPointsEarned={onPointsEarned}
                    trigger={
                        <Button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white border-0">
                            <FileText className="w-4 h-4" />
                            Nuevo Reporte
                        </Button>
                    }
                />
            </div>
            <MapView currentUser={currentUser} lastUpdate={lastUpdate} />
        </div>
    );
};

export default MapPage;
