// src/pages/InfoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle,
  ArrowRight,
  BarChart3,
  Globe,
  Eye,
  Map,
  Trophy,
  UserCircle,
  Target,
  Lightbulb,
  Wrench,
  Database,
  Code,
  Smartphone,
  Zap,
  Heart,
  BarChart,
  GitBranch,
  Building,
  Users as UsersIcon,
  Download,
  Github,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';
import { loginAsGuest, storeGuestData } from '../services/authService';

const InfoPage = ({ onLogin, isAuthenticated }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('problema');
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleContinueAsGuest = async () => {
    setIsLoadingGuest(true);
    try {
      // 1. Obtener token de invitado del backend
      const guestData = await loginAsGuest();
      
      // 2. Guardar datos del invitado en localStorage
      storeGuestData(guestData);
      
      // 3. Mostrar mensaje de éxito
      toast({
        title: "¡Modo invitado activado!",
        description: "Puedes explorar la aplicación con funcionalidades limitadas",
      });

      // 4. Llamar a la función onLogin para actualizar estado global
      if (onLogin) {
        onLogin(guestData);
      }
      
      // 5. Redirigir al dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Error en login de invitado:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo activar el modo invitado",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGuest(false);
    }
  };

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Barra de Navegación */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CiudadApp</h1>
                <p className="text-xs text-muted-foreground">Plataforma de Impacto Ciudadano</p>
              </div>
            </div>

            {/* Navegación Interna */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => scrollToSection('problema')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'problema'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Problema
              </button>
              <button
                onClick={() => scrollToSection('solucion')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'solucion'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Target className="w-4 h-4 inline mr-2" />
                Solución
              </button>
              <button
                onClick={() => scrollToSection('caracteristicas')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'caracteristicas'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Características
              </button>
              <button
                onClick={() => scrollToSection('tecnologia')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'tecnologia'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Tecnología
              </button>
              <button
                onClick={() => scrollToSection('equipo')}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === 'equipo'
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <UsersIcon className="w-4 h-4 inline mr-2" />
                Equipo
              </button>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleContinueAsGuest}
                disabled={isLoadingGuest}
                className="border-primary text-primary hover:bg-primary/10"
              >
                {isLoadingGuest ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Continuar como Invitado
                  </>
                )}
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-primary hover:bg-primary/90 shadow-lg"
              >
                Iniciar Sesión
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Proyecto de la Universidad Tecnológica de Candelaria</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Sistema de Reportes Ciudadanos con <span className="text-primary">Gamificación</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Una plataforma web y móvil innovadora para la gestión colaborativa de problemas urbanos en el municipio de Candelaria, Campeche.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <UserCircle className="w-5 h-5 mr-2" />
                Comenzar Ahora
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleContinueAsGuest}
                disabled={isLoadingGuest}
                className="px-8 border-primary text-primary hover:bg-primary/10"
              >
                {isLoadingGuest ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    Explorar como Invitado
                  </>
                )}
              </Button>
              <a 
                href="https://github.com/CJ-REYES/CitizenReport.git" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-8"
                >
                  <Github className="w-5 h-5 mr-2" />
                  Ver Repositorio
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">+5,000</p>
                <p className="text-sm text-muted-foreground">Ciudadanos activos</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">+25,000</p>
                <p className="text-sm text-muted-foreground">Reportes solucionados</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">98%</p>
                <p className="text-sm text-muted-foreground">Satisfacción</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-3xl font-bold text-primary">4</p>
                <p className="text-sm text-muted-foreground">Módulos completos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección del Problema */}
      <section id="problema" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Problemática Identificada</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">La situación actual en Candelaria</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Problemas Urbanos Comunes</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Baches en las calles que afectan la movilidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Fugas de agua y fallas en servicios públicos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Fallas en el alumbrado público</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Acumulación de basura en espacios públicos</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Daños en espacios comunes</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 shadow-lg"
            >
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Limitaciones del Sistema Actual</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Falta de sistema organizado y centralizado</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Reportes no atendidos oportunamente</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Pérdida de información en el proceso</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Duplicidad de reportes</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-muted-foreground">Falta de seguimiento y transparencia</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección de la Solución */}
      <section id="solucion" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 mb-4">
              <Target className="w-5 h-5" />
              <span className="font-medium">Nuestra Solución</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Plataforma Integral CiudadApp</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una herramienta tecnológica que transforma la participación ciudadana y optimiza la gestión municipal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Geolocalización Precisa</h3>
              <p className="text-sm text-muted-foreground">
                Reporte de incidentes con ubicación exacta mediante Google Maps API
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Gamificación</h3>
              <p className="text-sm text-muted-foreground">
                Sistema de puntos, rangos y recompensas que incentiva la participación
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Analítica Avanzada</h3>
              <p className="text-sm text-muted-foreground">
                Dashboard con estadísticas y seguimiento en tiempo real de todos los reportes
              </p>
            </motion.div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-4">Beneficios Clave</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Para Ciudadanos</h4>
                    <p className="text-sm text-muted-foreground">
                      Reporte rápido, seguimiento transparente y recompensas por participación
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Para Autoridades</h4>
                    <p className="text-sm text-muted-foreground">
                      Control actualizado de zonas críticas y priorización eficiente de acciones
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Para la Comunidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Cultura de colaboración y responsabilidad social
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground">Para el Municipio</h4>
                    <p className="text-sm text-muted-foreground">
                      Municipio más organizado, participativo y eficiente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Características */}
      <section id="caracteristicas" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
              <Zap className="w-5 h-5" />
              <span className="font-medium">Características Principales</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Funcionalidades Completas</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Módulo de Reportes</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Creación de reportes con foto y descripción</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Geolocalización automática</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Validación colaborativa</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>Seguimiento de estados en tiempo real</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Sistema de Gamificación</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Puntos por reportes y validaciones</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Sistema de niveles y rangos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Minijuegos integrados</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>Tabla de líderes global</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Map className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Mapa Interactivo</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span>Visualización de reportes cercanos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span>Filtros por tipo y estado</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      <span>Navegación integrada</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Panel de Administración</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Gestión de reportes y usuarios</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Estadísticas y métricas detalladas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Asignación a departamentos</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sección de Tecnología */}
      <section id="tecnologia" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
              <Code className="w-5 h-5" />
              <span className="font-medium">Stack Tecnológico</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Arquitectura Moderna y Escalable</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Code className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Frontend</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>React 18 + Vite</li>
                <li>Tailwind CSS</li>
                <li>Framer Motion</li>
                <li>React Router</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Backend</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>.NET 8 API REST</li>
                <li>Entity Framework Core</li>
                <li>JWT Authentication</li>
                <li>MySQL Database</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Servicios</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>OpenStreetMap API</li>
                <li>GitHub Actions</li>
                <li>Almacenamiento local</li>
                <li>JWT Token System</li>
              </ul>
            </div>
          </div>

          {/* Integraciones Específicas */}
          <div className="mt-12 bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Integraciones Específicas</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Map className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">OpenStreetMap</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema de mapas open-source para geolocalización precisa de reportes.
                      Alternativa libre y gratuita a Google Maps.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Autenticación JWT</h4>
                    <p className="text-sm text-muted-foreground">
                      Sistema seguro de autenticación basado en tokens JWT con refresh tokens.
                      Sin dependencia de servicios externos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-semibold text-foreground mb-3">Arquitectura de 3 Capas</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Code className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Frontend</p>
                  <p className="text-xs text-muted-foreground">React + Vite</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Backend API</p>
                  <p className="text-xs text-muted-foreground">.NET 8 REST</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Base de Datos</p>
                  <p className="text-xs text-muted-foreground">MySQL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metodología */}
          <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Metodología de Desarrollo</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Scrum Ágil</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Desarrollo iterativo en sprints de 2-4 semanas con ceremonias regulares: 
                  Daily Stand-up, Sprint Planning, Review y Retrospective.
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Backlog priorizado de producto</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Sprints de desarrollo incremental</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Revisión continua y adaptación</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Ventajas Técnicas</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Separación clara entre presentación, lógica y datos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Facilidad de mantenimiento y escalabilidad</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Desarrollo independiente de frontend y backend</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>API RESTful para fácil integración futura</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del Equipo */}
      <section id="equipo" className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <UsersIcon className="w-5 h-5" />
              <span className="font-medium">Equipo de Desarrollo</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Universidad Tecnológica de Candelaria</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proyecto desarrollado por estudiantes de la UTC bajo la guía del Ing. Fidel Arias Zavala
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carlos */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center h-full"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary mb-4">
                <img 
                  src="https://github.com/CJ-REYES.png" 
                  alt="Carlos José Suchite Reyes"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<UserCircle className="w-12 h-12 text-primary mx-auto" />';
                  }}
                />
              </div>
              <div className="text-center flex-1">
                <h3 className="font-bold text-foreground mb-1 text-lg">Carlos José Suchite Reyes</h3>
                <p className="text-sm text-primary font-medium mb-2">Developer FullStack</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Arquitectura completa, integración API, gamificación
                </p>
              </div>
              <a 
                href="mailto:cjosereyes@gmail.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-2 truncate max-w-full"
                title="cjosereyes@gmail.com"
              >
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">cjosereyes@gmail.com</span>
              </a>
            </motion.div>

            {/* Marcos */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center h-full"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center flex-1">
                <h3 className="font-bold text-foreground mb-1 text-lg">Marcos Antonio López Garcia</h3>
                <p className="text-sm text-primary font-medium mb-2">Developer BackEnd</p>
                <p className="text-xs text-muted-foreground mb-3">
                  API REST, base de datos, autenticación JWT
                </p>
              </div>
              <a 
                href="mailto:Chazmarcos6@gmail.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-2 truncate max-w-full"
                title="Chazmarcos6@gmail.com"
              >
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Chazmarcos6@gmail.com</span>
              </a>
            </motion.div>

            {/* Amairany */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center h-full"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center flex-1">
                <h3 className="font-bold text-foreground mb-1 text-lg">Amairany Gomes Ocaña</h3>
                <p className="text-sm text-primary font-medium mb-2">Developer FrontEnd</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Interfaces de usuario, experiencia UX, diseño responsive
                </p>
              </div>
              <a 
                href="mailto:amairanydelrosariocana14@gmail.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-2 truncate max-w-full"
                title="amairanydelrosariocana14@gmail.com"
              >
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">amairanydelrosariocana14@gmail.com</span>
              </a>
            </motion.div>

            {/* Jonathan */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-xl p-6 flex flex-col items-center h-full"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="w-12 h-12 text-primary" />
              </div>
              <div className="text-center flex-1">
                <h3 className="font-bold text-foreground mb-1 text-lg">Jonathan Burgos Sarrasino</h3>
                <p className="text-sm text-primary font-medium mb-2">Developer Junior</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Testing, documentación, soporte en desarrollo
                </p>
              </div>
              <a 
                href="mailto:Jonathanburgossarracino@gmail.com"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 mt-2 truncate max-w-full"
                title="Jonathanburgossarracino@gmail.com"
              >
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">Jonathanburgossarracino@gmail.com</span>
              </a>
            </motion.div>
          </div>

          {/* Documentación y Links */}
          <div className="mt-12 bg-card border border-border rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">Documentación Completa</h3>
            <p className="text-muted-foreground mb-6">
              Todo el proyecto está documentado en detalle, incluyendo casos de uso, 
              arquitectura del sistema, planificación y matriz de riesgos.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://github.com/CJ-REYES/CitizenReport.git" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-primary hover:bg-primary/90">
                  <Github className="w-4 h-4 mr-2" />
                  Repositorio GitHub
                </Button>
              </a>
              <a 
                href="https://github.com/CJ-REYES" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <UserCircle className="w-4 h-4 mr-2" />
                  Perfil de GitHub (Carlos)
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-border rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para transformar la participación ciudadana?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a la comunidad que está mejorando Candelaria, reporte por reporte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 bg-primary hover:bg-primary/90 shadow-lg"
              >
                <UserCircle className="w-5 h-5 mr-2" />
                Crear Cuenta Gratis
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleContinueAsGuest}
                disabled={isLoadingGuest}
                className="px-8 border-primary text-primary hover:bg-primary/10"
              >
                {isLoadingGuest ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    Cargando...
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 mr-2" />
                    Explorar como Invitado
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              Proyecto académico • Código abierto • Impacto social real
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">CiudadApp</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema Web y Móvil de Reportes Ciudadanos con Gamificación
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/CJ-REYES/CitizenReport.git" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Documentación
              </a>
              <a 
                href="#" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Universidad Tecnológica de Candelaria • 
              Proyecto CiudadApp • Versión 0.1 • Fecha: 28/11/2025
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Materias: Arquitecturas de Software • Metodologías para el Desarrollo de Proyectos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfoPage;