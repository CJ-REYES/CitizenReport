# Sistema Web y Móvil de Reportes Ciudadanos con Gamificación (Candelaria, Campeche)

Este repositorio contiene el código fuente para el **"Desarrollo e Implementación de un Sistema Web y Móvil de Reportes Ciudadanos con Componente de Gamificación para la Gestión Pública"** de la Universidad Tecnológica de Candelaria.

El objetivo del proyecto es modernizar la comunicación entre la ciudadanía y la administración municipal de Candelaria, transformando la denuncia de fallas (baches, fugas, alumbrado) en un proceso transparente, rápido y motivador mediante el uso de **Gamificación** y **Geolocalización**.

## 🚀 Características Principales

* **Transparencia y Trazabilidad:** Provee un canal transparente donde los ciudadanos pueden seguir el estado de su denuncia, restaurando la confianza en el gobierno municipal.
* **Eficiencia Operativa:** Proporciona a las autoridades datos geolocalizados y actualizados en tiempo real para optimizar la priorización de zonas y la asignación de recursos.
* **Gamificación:** Incluye elementos de juego (puntos, rangos, recompensas) para motivar la participación constante y voluntaria de la comunidad en la vigilancia del entorno.
* **Arquitectura Sólida:** Diseñado bajo una arquitectura Cliente-Servidor (RESTful) y evaluado con el método SAAM, priorizando la **Modificabilidad** y **Escalabilidad**.
* **Geolocalización Automática:** Ubicación automática con consentimiento del usuario para reportes precisos.
* **API RESTful Completa:** CRUD completo con validaciones y filtros avanzados.

## 🛠️ Tecnologías del Stack

El proyecto está dividido en dos componentes principales: el Servidor de API y los Clientes (Frontend Web/Móvil).

| Capa | Componente Principal | Tecnología Principal |
| :--- | :--- | :--- |
| **Presentación (Frontend)** | Aplicación Web / Móvil | React |
| **Negocio (Backend)** | API RESTful (Servidor) | .NET 8 Web API |
| **Datos** | ORM | Entity Framework Core 8 |
| **Datos** | Base de Datos | MySQL (Pomelo.EntityFrameworkCore.MySql) |
| **Servicios Externos** | Geolocalización, Notificaciones | Google Maps API, AWS S3, FCM |

## 📋 Configuración del Entorno

Sigue los pasos a continuación para configurar y ejecutar el proyecto localmente.

### 1. Requisitos Previos

Asegúrate de tener instalado lo siguiente:

* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js (LTS)](https://nodejs.org/en/download/) y [npm](https://www.npmjs.com/)
* [MySQL Server](https://www.mysql.com/downloads/) (8.0+)
* Un IDE como [Visual Studio Code](https://code.visualstudio.com/) o [Visual Studio 2022](https://visualstudio.microsoft.com/)

### 2. Configuración del BackEnd (API RESTful)

La API fue desarrollada con **.NET 8 Web API** y sigue el estilo arquitectónico **RESTful**.

1. **Navega a la carpeta del backend:**
    ```bash
    cd BackEnd
    ```

2. **Instalar dependencias de MySQL:**
    ```bash
    dotnet add package Pomelo.EntityFrameworkCore.MySql
    ```

3. **Configurar la Base de Datos:**
    * Crea una base de datos MySQL (ej. `reportes_db`).
    * Actualiza la cadena de conexión en `appsettings.json`:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=reportes_db;User=tu_usuario;Password=tu_contraseña;"
      }
    }
    ```

4. **Ejecutar migraciones:**
    ```bash
    dotnet ef migrations add InitialCreate
    dotnet ef database update
    ```

5. **Ejecuta el Servidor:**
    ```bash
    dotnet run
    ```
    El servidor de la API se iniciará (generalmente en `http://localhost:5000` o un puerto similar).

### 3. Configuración del FrontEnd (React con Vite)

La aplicación web está configurada con **React** y **Vite**.

1. **Navega a la carpeta del frontend:**
    ```bash
    cd ../FrontEnd
    ```

2. **Instala las Dependencias:**
    ```bash
    npm install
    ```

3. **Ejecuta la Aplicación:**
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en tu navegador (generalmente en `http://localhost:5173`).

---

## 🗃️ Modelo de Datos

### Entidad Principal: Reporte

```csharp
public class Reporte
{
    public int Id { get; set; }
    public int CiudadanoId { get; set; }
    public string TipoIncidente { get; set; } = string.Empty;
    public string DescripcionDetallada { get; set; } = string.Empty;
    public double Latitud { get; set; }
    public double Longitud { get; set; }
    public string? UrlFoto { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public DateTime FechaCreacion { get; set; } = DateTime.Now;
}