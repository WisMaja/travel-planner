-- Skrypt SQL do dodania brakujących pól do tabeli PlanBasicInfo
-- Wykonaj ten skrypt w SQL Server Management Studio lub przez inne narzędzie do zarządzania bazą danych

USE TravelPlanerDb;
GO

-- Dodaj kolumnę Location (lokalizacja startowa)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'Location')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [Location] [nvarchar](500) NULL;
    PRINT 'Kolumna Location została dodana';
END
ELSE
BEGIN
    PRINT 'Kolumna Location już istnieje';
END
GO

-- Dodaj kolumnę Destination (cel podróży)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'Destination')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [Destination] [nvarchar](500) NULL;
    PRINT 'Kolumna Destination została dodana';
END
ELSE
BEGIN
    PRINT 'Kolumna Destination już istnieje';
END
GO

-- Dodaj kolumnę BudgetCurrency (waluta budżetu)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'BudgetCurrency')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [BudgetCurrency] [nvarchar](10) NULL;
    PRINT 'Kolumna BudgetCurrency została dodana';
END
ELSE
BEGIN
    PRINT 'Kolumna BudgetCurrency już istnieje';
END
GO

PRINT 'Skrypt zakończony pomyślnie';
GO

