import React from 'react'; 
import { motion } from 'framer-motion'; 
import StatsWidgets from '@/components/StatsWidgets'; 
import UserProfile from '@/components/UserProfile'; 

const DashboardPage = ({ currentUser }) => { 
    
    // Simulación de reportes recientes
    const recentReports = [
      { id: 1, title: "Bache", description: "Se rompió la calle frente a la casa #23", status: "pending", date: "25/11/2025" },
      { id: 2, title: "Fuga de Agua", description: "Fuga importante en la avenida principal desde hace 3 días", status: "completed", date: "24/11/2025" },
      { id: 3, title: "Basura", description: "Contenedor de reciclaje desbordado en la esquina", status: "in-progress", date: "23/11/2025" },
    ];

    // Helper para las clases de estado (Ajustadas para el tema oscuro/claro)
    const getStatusClasses = (status) => {
        switch (status) {
            case 'pending':
                // Amarillo vivo
                // Se usa bg-yellow-100 para claro y bg-yellow-900/50 para oscuro, junto con sus textos
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-500/30';
            case 'in-progress':
                // Azul vivo
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-500/30';
            case 'completed':
                // Verde vivo (usa el verde más brillante para el estado finalizado)
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border border-emerald-500/30';
            default:
                return 'bg-muted text-muted-foreground border border-border';
        }
    };

    return ( 
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-6" 
        > 
            <div className="mb-4"> 
                {/* CORRECCIÓN: Usar text-foreground y text-muted-foreground */}
                <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1> 
                <p className="text-muted-foreground">Resumen de la actividad de la ciudad y tu progreso</p> 
            </div> 
            
            {/* Widgets de Estadísticas */}
            <StatsWidgets /> 
            
            {/* 1. MI PROGRESO (Recuadro como Card) */}
            {/* CORRECCIÓN: Usar bg-card y border-border */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Mi Progreso</h2> 
                <UserProfile currentUser={currentUser} /> 
            </div>

            {/* 2. MIS REPORTES RECIENTES (Recuadro como Card) */}
            {/* CORRECCIÓN: Usar bg-card y border-border */}
            <div className="bg-card border border-border rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Mis Reportes Recientes</h2>
                <div className="space-y-3">
                    {recentReports.map(report => (
                        <div 
                            key={report.id} 
                            // CORRECCIÓN: Usar bg-background y border-border para los items de la lista
                            className="p-3 bg-background border border-border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-foreground">{report.title}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-xs">{report.description}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex items-center space-x-3">
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusClasses(report.status)}`}>
                                    {report.status.toUpperCase().replace('-', ' ')}
                                </span>
                                <p className="text-xs text-muted-foreground hidden md:block">{report.date}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div> 
    ); 
}; 

export default DashboardPage;