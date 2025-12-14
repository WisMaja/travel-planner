using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
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
builder.Services.AddScoped<IPlansBasicInfoService, PlansBasicInfoService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Konfiguracja autoryzacji JWT
var jwtSecretKey = "e5be8f13-627b-4632-805f-37a86ce0d76d";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

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

// Użycie autoryzacji (musi być przed MapControllers)
app.UseAuthentication();
app.UseAuthorization();

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