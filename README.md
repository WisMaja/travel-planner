# TRAVEL PLANER
Aplikacja webowa do komplekoswego planowania wyjazdów 

## Spis treści
- [Jak działa aplikacja](#jak-uruchomić-projekt)
- [Baza danych](#baza-danych)


## Technologie użyte:
- Frontend: 
- Backend: ASP.NET Core Web API + Entity Framework Core
- Repozytorium: GitHub


## Technologie planowane do użycia:
- Baza danych: MS SQL Server
- Hosting: Azure (App Service, SQL Database)


## Struktóra projektu
/travel-planner - Główny folder </br>
|- frontend/ </br>
|- backend/  </br>
|- .gitignore </br>
|- README.md - dokumentacja </br>

## Jak uruchomić projekt

### Frontend
```bash
cd frontend

```

### Backend
```bash
cd backend
dotnet run
```

### Baza Danych
```bash
docker compose up --build
```

## Frontendny przy uzyciu 
Aplikacja posiada frontend napny przy uzyciu React + Vite + TypeScript + Tailwind CSS

### React

```bash
npm install react-router-dom
```

### Vite

### TypeScript

### Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

## Baza danych 
### Struktóra bazy danych
Baza danych została zaprojektowana w sposób modularny. Została zoptymalizowana pod integracje z zewnetrznymi API map takimi jak Google/OSM/Mapbox.

#### Tabele
Tabela | Opis
|:--|:--

