using Microsoft.EntityFrameworkCore;
using backend.Connection;
using backend.Controllers;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Dodanie obsługi OpenAPI (dla Swagger)
builder.Services.AddOpenApi();

// Konfiguracja Swagger - dokumentacja API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//DbContext - połaczenie z baza
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Rejestracja serwisów
builder.Services.AddScoped<IPlansService, PlansService>();

// Dodanie kontrolerów
builder.Services.AddControllers();

var app = builder.Build();

app.UseSwagger();

// Konfiguracja Swaggera
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Travel Planner API V1");
    c.RoutePrefix = string.Empty; // Swagger dostępny na głównej stronie "/"
});

// Mapowanie kontrolerów
app.MapControllers();

// Endpointy testowe
app.MapTestEndpoints();

app.Run();