import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Shield, CheckCircle, Clock, Wrench, Trash2, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminPanel = ({ currentUser }) => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('reports');
  const { toast } = useToast();

  useEffect(() => {
    // Solo permitir a administradores acceder
    if (currentUser?.role !== 'admin') {
        toast({
            title: "Acceso Denegado",
            description: "Solo administradores pueden ver este panel.",
            variant: "destructive"
        });
        return;
    }
    loadData();
  }, [currentUser]);

  const loadData = () => {
    const storedReports = JSON.parse(localStorage.getItem('reports') || '[]');
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    setReports(storedReports);
    setUsers(storedUsers);
  };

  const updateReportStatus = (reportId, newStatus) => {
    const updatedReports = reports.map(r =>
      r.id === reportId ? { ...r, status: newStatus } : r
    );
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    
    toast({
      title: "Estado actualizado",
      description: `El reporte ha sido marcado como ${newStatus}`,
    });
    // Si la actualización es a 'completed', deberías manejar la adición de puntos al usuario reportador aquí.
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Wrench className="w-5 h-5 text-blue-500" />;
      case 'reviewed':
        return <Clock className="w-5 h-5 text-sky-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getReportClasses = (status) => {
    // Colores vivos sensibles al tema
    switch (status) {
        case 'completed':
            return 'border-green-500/30 bg-green-500/10 dark:bg-green-900/20';
        case 'in-progress':
            return 'border-blue-500/30 bg-blue-500/10 dark:bg-blue-900/20';
        case 'reviewed':
            return 'border-sky-500/30 bg-sky-500/10 dark:bg-sky-900/20';
        case 'pending':
        default:
            return 'border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-900/20';
    }
  }


  if (currentUser?.role !== 'admin') {
      return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center bg-card rounded-xl border border-border shadow-lg">
              <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h1 className="text-2xl font-bold text-foreground">Acceso No Autorizado</h1>
              <p className="text-muted-foreground mt-2">No tienes permiso para ver esta página.</p>
          </motion.div>
      );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6 max-w-6xl mx-auto"
    >
        <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Revisión y gestión de reportes y usuarios</p>
        </div>

      <div className="bg-card border border-border rounded-xl shadow-lg p-6">
        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-border">
          <Button
            variant={selectedTab === 'reports' ? 'default' : 'ghost'}
            className={selectedTab === 'reports' ? '' : 'text-muted-foreground'}
            onClick={() => setSelectedTab('reports')}
          >
            Reportes ({reports.length})
          </Button>
          <Button
            variant={selectedTab === 'users' ? 'default' : 'ghost'}
            className={selectedTab === 'users' ? '' : 'text-muted-foreground'}
            onClick={() => setSelectedTab('users')}
          >
            Usuarios ({users.length})
          </Button>
        </div>

        {/* Content */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
                <p className="text-center text-muted-foreground p-4">No hay reportes para revisar.</p>
            ) : (
                reports.map(report => (
                    <div 
                        key={report.id} 
                        className={`p-4 rounded-xl border transition-shadow ${getReportClasses(report.status)} hover:shadow-md`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-foreground flex items-center gap-3">
                                {getStatusIcon(report.status)}
                                {report.title} 
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${getReportClasses(report.status).split(' ').filter(c => c.startsWith('bg')).join(' ').replace('bg', 'text')}`.replace('/10', '/30')}>
                                    {report.status.replace('-', ' ')}
                                </span>
                            </h3>
                            {/* Texto: text-muted-foreground */}
                            <p className="text-sm text-muted-foreground">Por: {report.reporter || 'Anónimo'}</p>
                        </div>
                        <p className="text-muted-foreground mb-3 ml-8">{report.description}</p>
                        
                        {/* Location and Date */}
                        <div className="ml-8 text-xs flex items-center gap-4 text-muted-foreground mb-4">
                            <span>Ubicación: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
                            <span>Fecha: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="ml-8 flex gap-3 flex-wrap">
                            {/* Botones de acción: se ajusta text-white a text-primary-foreground */}
                            <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-primary-foreground" 
                                onClick={() => updateReportStatus(report.id, 'completed')}
                                disabled={report.status === 'completed'}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Completado
                            </Button>
                            <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-primary-foreground" 
                                onClick={() => updateReportStatus(report.id, 'in-progress')}
                                disabled={report.status === 'in-progress'}
                            >
                                <Wrench className="w-4 h-4 mr-2" /> En Progreso
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary"
                                className="text-foreground border-border hover:bg-muted"
                                onClick={() => updateReportStatus(report.id, 'reviewed')}
                                disabled={report.status === 'reviewed'}
                            >
                                <Clock className="w-4 h-4 mr-2" /> Revisado
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border border-border rounded-xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-foreground">¿Estás absolutamente seguro?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            Esta acción eliminará permanentemente este reporte.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-muted text-muted-foreground hover:bg-accent">Cancelar</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => { /* Implement delete logic */ }}>
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))
            )}
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
                <p className="text-center text-muted-foreground p-4">No hay usuarios registrados.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(user => (
                  // Fondo de tarjeta para cada usuario
                  <div key={user.id} className="bg-background border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {/* Texto principal: text-foreground */}
                        <p className="font-bold text-foreground">{user.username}</p>
                        {/* Texto secundario: text-muted-foreground */}
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rol:</span>
                        <span className={`font-semibold ${user.role === 'admin' ? 'text-red-500 dark:text-red-400' : 'text-primary dark:text-blue-400'}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Puntos:</span>
                        <span className="font-semibold text-yellow-500 dark:text-yellow-400">{user.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reportes:</span>
                        <span className="font-semibold text-green-500 dark:text-green-400">{user.reportsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rango:</span>
                        <span className="font-semibold text-primary dark:text-purple-400">{user.rank}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminPanel;