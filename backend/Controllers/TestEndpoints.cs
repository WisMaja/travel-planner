using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using backend.Connection;

namespace backend.Controllers
{
    /// <summary>
    /// Endpointy testowe do sprawdzania połączenia z bazą danych
    /// </summary>
    public static class TestEndpoints
    {
        /// <summary>
        /// Rejestruje wszystkie endpointy testowe
        /// </summary>
        public static void MapTestEndpoints(this WebApplication app)
        {

            // Endpoint testowy - sprawdza połączenie z bazą danych przez DbContext
            app.MapGet("/api/test-db", async (ApplicationDbContext db) =>
            {
                try
                {
                    // Próba połączenia z bazą danych
                    var canConnect = await db.Database.CanConnectAsync();

                    if (canConnect)
                    {
                        // Pobranie informacji o połączeniu
                        var connection = db.Database.GetDbConnection();
                        
                        return Results.Ok(new
                        {
                            success = true,
                            message = "Połączenie z bazą danych działa!",
                            database = connection.Database,
                            server = connection.DataSource
                        });
                    }
                    else
                    {
                        return Results.Problem("Nie można połączyć się z bazą danych");
                    }
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Błąd połączenia: {ex.Message}");
                }
            });

            // Endpoint testowy - sprawdza połączenie bezpośrednio przez SqlConnection
            app.MapGet("/api/test-connection", async (IConfiguration config) =>
            {
                try
                {
                    // Pobranie connection string z konfiguracji
                    var connectionString = config.GetConnectionString("DefaultConnection");
                    
                    // Utworzenie i otwarcie połączenia
                    using var connection = new SqlConnection(connectionString);
                    await connection.OpenAsync();
                    
                    return Results.Ok(new 
                    { 
                        success = true, 
                        message = "Połączenie z bazą danych działa!",
                        server = connection.DataSource,
                        database = connection.Database,
                        state = connection.State.ToString()
                    });
                }
                catch (SqlException sqlEx)
                {
                    // Obsługa błędów SQL
                    return Results.Problem($"Błąd SQL: {sqlEx.Message} (Numer błędu: {sqlEx.Number})");
                }
                catch (Exception ex)
                {
                    // Obsługa innych błędów
                    return Results.Problem($"Błąd połączenia: {ex.Message}");
                }
            });
        }
    }
}

