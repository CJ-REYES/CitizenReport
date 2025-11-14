#  Sistema Web y Móvil de Reportes Ciudadanos con Gamificación (Candelaria, Campeche)

Este repositorio contiene el código fuente para el **"Desarrollo e Implementación de un Sistema Web y Móvil de Reportes Ciudadanos con Componente de Gamificación para la Gestión Pública"** de la Universidad Tecnológica de Candelaria.

[cite_start]El objetivo del proyecto es modernizar la comunicación entre la ciudadanía y la administración municipal de Candelaria, transformando la denuncia de fallas (baches, fugas, alumbrado) en un proceso transparente, rápido y motivador mediante el uso de **Gamificación** y **Geolocalización**[cite: 1, 10, 11].

##  Características Principales

* [cite_start]**Transparencia y Trazabilidad:** Provee un canal transparente donde los ciudadanos pueden seguir el estado de su denuncia, restaurando la confianza en el gobierno municipal[cite: 29].
* [cite_start]**Eficiencia Operativa:** Proporciona a las autoridades datos geolocalizados y actualizados en tiempo real para optimizar la priorización de zonas y la asignación de recursos[cite: 24, 25].
* [cite_start]**Gamificación:** Incluye elementos de juego (puntos, rangos, recompensas) para motivar la participación constante y voluntaria de la comunidad en la vigilancia del entorno[cite: 12, 27, 37].
* [cite_start]**Arquitectura Sólida:** Diseñado bajo una arquitectura Cliente-Servidor (RESTful) y evaluado con el método SAAM, priorizando la **Modificabilidad** y **Escalabilidad**[cite: 13, 33, 35].

##  Tecnologías del Stack

El proyecto está dividido en dos componentes principales: el Servidor de API y los Clientes (Frontend Web/Móvil).

| Capa | Componente Principal | Tecnología Principal |
| :--- | :--- | :--- |
| **Presentación (Frontend)** | Aplicación Web / Móvil | React |
| **Negocio (Backend)** | API RESTful (Servidor) | .NET 8 Web API |
| **Datos** | Almacén de estado | MySQL |
| **Servicios Externos** | Geolocalización, Notificaciones | Google Maps API, AWS S3, FCM |

##  Configuración del Entorno

Sigue los pasos a continuación para configurar y ejecutar el proyecto localmente.

### 1. Requisitos Previos

Asegúrate de tener instalado lo siguiente:

* [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js (LTS)](https://nodejs.org/en/download/) y [npm](https://www.npmjs.com/)
* [MySQL Server](https://www.mysql.com/downloads/)
* Un IDE como [Visual Studio Code](https://code.visualstudio.com/) o [Visual Studio 2022](https://visualstudio.microsoft.com/)

### 2. Configuración del BackEnd (API RESTful)

[cite_start]La API fue desarrollada con **.NET 8 Web API** y sigue el estilo arquitectónico **RESTful**[cite: 33, 38].

1.  Navega a la carpeta del backend:
    ```bash
    cd BackEnd
    ```
2.  **Configura la Base de Datos:**
    * Crea una base de datos MySQL (ej. `reportes_db`).
    * Abre el archivo de configuración (`appsettings.json` o similar) y actualiza la cadena de conexión de MySQL.
    * Ejecuta las migraciones de Entity Framework Core si aplican (ej. `dotnet ef database update`).
3.  **Ejecuta el Servidor:**
    ```bash
    dotnet run
    ```
    El servidor de la API se iniciará (generalmente en `http://localhost:5000` o un puerto similar).

### 3. Configuración del FrontEnd (React con Vite)

La aplicación web está configurada con **React** y **Vite**.

1.  Navega a la carpeta del frontend:
    ```bash
    cd ../FrontEnd
    ```
2.  **Instala las Dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecuta la Aplicación:**
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en tu navegador (generalmente en `http://localhost:5173`).

---

## 🔑 Notas de Desarrollo

* [cite_start]**Versionamiento de API:** La API implementa **Versionamiento** (ej., `/v2/reportes`) para mitigar el riesgo de `Dependencia de Interfaz` resaltado por el análisis SAAM, asegurando la sostenibilidad a largo plazo[cite: 36].
