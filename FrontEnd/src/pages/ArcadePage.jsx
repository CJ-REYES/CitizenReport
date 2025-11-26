import React from 'react';
import MetalSlugger from '@/components/HorizonRacer';

const ArcadePage = ({ currentUser, onPointsUpdate }) => {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Arcade: Metal Slugger</h1>
                <p className="text-muted-foreground">Juega, diviértete y gana vidas extra</p>
            </div>
            <MetalSlugger currentUser={currentUser} onPointsUpdate={onPointsUpdate} />
        </div>
    );
};

export default ArcadePage;