
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Swagger + endpoint explorer
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var app = builder.Build();

// Swagger w DEV (UI na /swagger)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.MapGet("/api/info", () => new { message = "ok", time = DateTime.UtcNow });


app.Run();

