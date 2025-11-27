using BackEnd.Model; // Asegúrate de que este 'using' apunte a donde está tu modelo User
using System;

namespace BackEnd.Services
{
    // =================================================================
    // INTERFAZ (Contrato)
    // Define las operaciones que el controlador usará.
    // =================================================================
    public interface IMinigameService
    {
        /// <summary>
        /// Calcula la cantidad de monedas a otorgar basada en la puntuación.
        /// Regla: 100 puntos del juego = 1 moneda.
        /// </summary>
        /// <param name="score">La puntuación obtenida en la partida.</param>
        /// <returns>El número de monedas ganadas.</returns>
        int CalcularMonedas(int score);

        /// <summary>
        /// Procesa la recarga diaria de vidas para el usuario.
        /// Regla: Otorga 5 vidas si es un nuevo día y el usuario tiene menos de 5.
        /// </summary>
        /// <param name="user">El objeto User a actualizar.</param>
        void ProcesarVidasDiarias(User user);

        /// <summary>
        /// Intenta consumir una vida del usuario para iniciar una partida.
        /// </summary>
        /// <param name="user">El objeto User a actualizar.</param>
        /// <returns>True si la vida fue consumida (tenía >= 1), False si no tenía vidas.</returns>
        bool ConsumirVida(User user);
    }

    // =================================================================
    // IMPLEMENTACIÓN DEL SERVICIO
    // Contiene la lógica detallada.
    // =================================================================
    public class MinigameService : IMinigameService
    {
        // Regla: 100 puntos = 1 moneda
        public int CalcularMonedas(int score)
        {
            if (score <= 0) return 0;
            // Se usa la división entera para calcular las monedas (ej: 250 / 100 = 2)
            return score / 100;
        }

        // Regla: Recarga diaria de vidas
        public void ProcesarVidasDiarias(User user)
        {
            var hoy = DateTime.UtcNow.Date;
            var ultimaRecarga = user.UltimaRecargaVidas?.Date;

            // 1. Si nunca ha recargado O la última recarga fue un día anterior a hoy.
            if (ultimaRecarga == null || ultimaRecarga < hoy)
            {
                // 2. Si el usuario tiene menos de 5 vidas, se las restauramos.
                if (user.Vidas < 5)
                {
                    user.Vidas = 5;
                }
                
                // 3. Actualizamos la fecha de control para evitar otra recarga hoy.
                user.UltimaRecargaVidas = DateTime.UtcNow;
            }
        }

        // Regla: Consumir una vida para empezar a jugar
        public bool ConsumirVida(User user)
        {
            if (user.Vidas > 0)
            {
                user.Vidas--; // Restamos una vida
                return true;  // Partida autorizada
            }
            return false;     // No hay vidas, partida denegada
        }
    }
}