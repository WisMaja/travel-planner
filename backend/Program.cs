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
builder.Services.AddScoped<ITokenService, TokenService>();

// Konfiguracja CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Port domyślny Angular dev server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Dodanie kontrolerów
builder.Services.AddControllers();

var app = builder.Build();

// Użycie CORS (musi być przed MapControllers)
app.UseCors("AllowAngularApp");

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