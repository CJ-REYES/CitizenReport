
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

const AdminPanel = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('reports');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

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
  };

  const deleteReport = (reportId) => {
    const updatedReports = reports.filter(r => r.id !== reportId);
    setReports(updatedReports);
    localStorage.setItem('reports', JSON.stringify(updatedReports));
    
    toast({
      title: "Reporte eliminado",
      description: "El reporte ha sido eliminado exitosamente",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'reviewed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'repaired':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Panel de Administración</h2>
            <p className="text-slate-400 text-sm">Gestiona reportes y usuarios</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('reports')}
          >
            Reportes ({reports.length})
          </Button>
          <Button
            variant={selectedTab === 'users' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('users')}
          >
            <Users className="w-4 h-4 mr-2" />
            Usuarios ({users.length})
          </Button>
        </div>

        {/* Reports Tab */}
        {selectedTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay reportes disponibles</p>
            ) : (
              reports.map(report => (
                <div key={report.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="flex flex-col md:flex-row gap-4">
                    {report.photo && (
                      <img
                        src={report.photo}
                        alt="Report"
                        className="w-full md:w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-lg">{report.type}</h3>
                          <p className="text-sm text-slate-400">Por: {report.username}</p>
                          <p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </div>
                      </div>
                      <p className="text-slate-300 mb-3">{report.description}</p>
                      <p className="text-xs text-slate-400 mb-3">
                        📍 Ubicación: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'pending')}
                          disabled={report.status === 'pending'}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Pendiente
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'reviewed')}
                          disabled={report.status === 'reviewed'}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Revisado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'repaired')}
                          disabled={report.status === 'repaired'}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          Reparado
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteReport(report.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay usuarios registrados</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{user.username}</h3>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rol:</span>
                        <span className={`font-semibold ${user.role === 'admin' ? 'text-red-400' : 'text-blue-400'}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Puntos:</span>
                        <span className="font-semibold text-yellow-400">{user.points}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reportes:</span>
                        <span className="font-semibold text-green-400">{user.reportsCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Rango:</span>
                        <span className="font-semibold text-purple-400">{user.rank}</span>
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
