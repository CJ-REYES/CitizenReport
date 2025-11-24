
import React from 'react';
import { Navigate } from 'react-router-dom';

// This page is deprecated, redirecting to Map
const ReportPage = () => {
    return <Navigate to="/map" replace />;
};

export default ReportPage;
