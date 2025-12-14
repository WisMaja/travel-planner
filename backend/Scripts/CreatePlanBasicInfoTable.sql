-- =============================================
-- Skrypt tworzący tabelę PlanBasicInfo
-- Tabela przechowuje podstawowe informacje o planie podróży
-- Relacja 1:1 z tabelą Plans (PlanId jest kluczem głównym i obcym)
-- =============================================

USE TravelPlanerDb;
GO

-- Usuń tabelę jeśli istnieje (UWAGA: usuwa dane!)
-- IF OBJECT_ID('dbo.PlanBasicInfo', 'U') IS NOT NULL
--     DROP TABLE [dbo].[PlanBasicInfo];
-- GO

-- Utwórz tabelę PlanBasicInfo
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PlanBasicInfo](
        [PlanId] [uniqueidentifier] NOT NULL,
        [Description] [nvarchar](max) NULL,
        [Location] [nvarchar](500) NULL,
        [Destination] [nvarchar](500) NULL,
        [StartDate] [date] NULL,
        [EndDate] [date] NULL,
        [TripTypeId] [int] NULL,
        [CoverImgUrl] [nvarchar](1000) NULL,
        [BudgetAmount] [decimal](12, 2) NULL,
        [BudgetCurrency] [nvarchar](10) NULL,
        [Notes] [nvarchar](max) NULL,
        
        -- Klucz główny
        CONSTRAINT [PK_PlanBasicInfo] PRIMARY KEY CLUSTERED ([PlanId] ASC),
        
        -- Klucz obcy do tabeli Plans
        CONSTRAINT [FK_PlanBasicInfo_Plan] FOREIGN KEY ([PlanId])
            REFERENCES [dbo].[Plans] ([PlansId])
            ON DELETE CASCADE
            ON UPDATE CASCADE,
        
        -- Klucz obcy do tabeli TripType (opcjonalny)
        CONSTRAINT [FK_PlanBasicInfo_TripType] FOREIGN KEY ([TripTypeId])
            REFERENCES [dbo].[TripType] ([TripTypeId])
            ON DELETE SET NULL
            ON UPDATE CASCADE
    );
    
    PRINT 'Tabela PlanBasicInfo została utworzona pomyślnie';
END
ELSE
BEGIN
    PRINT 'Tabela PlanBasicInfo już istnieje';
END
GO

-- =============================================
-- Opis kolumn:
-- =============================================
-- PlanId          - Klucz główny i obcy do Plans (uniqueidentifier, NOT NULL)
-- Description      - Opis planu podróży (nvarchar(max), NULL)
-- Location         - Lokalizacja startowa (np. "Warszawa, Polska") (nvarchar(500), NULL)
-- Destination      - Cel podróży (np. "Paryż, Francja") (nvarchar(500), NULL)
-- StartDate        - Data rozpoczęcia podróży (date, NULL)
-- EndDate          - Data zakończenia podróży (date, NULL)
-- TripTypeId       - Identyfikator typu podróży (klucz obcy do TripType) (int, NULL)
-- CoverImgUrl      - URL do zdjęcia okładkowego planu (nvarchar(1000), NULL)
-- BudgetAmount     - Budżet planu (decimal(12,2), NULL) - maksymalnie 9999999999.99
-- BudgetCurrency   - Waluta budżetu (np. "PLN", "EUR", "USD") (nvarchar(10), NULL)
-- Notes            - Dodatkowe notatki (nvarchar(max), NULL)
-- =============================================

-- Sprawdź strukturę tabeli
SELECT 
    c.COLUMN_NAME AS 'Kolumna',
    c.DATA_TYPE AS 'Typ danych',
    c.CHARACTER_MAXIMUM_LENGTH AS 'Długość',
    c.NUMERIC_PRECISION AS 'Precyzja',
    c.NUMERIC_SCALE AS 'Skala',
    c.IS_NULLABLE AS 'Nullable',
    CASE 
        WHEN pk.COLUMN_NAME IS NOT NULL THEN 'TAK'
        ELSE 'NIE'
    END AS 'Klucz główny'
FROM 
    INFORMATION_SCHEMA.COLUMNS c
    LEFT JOIN (
        SELECT ku.TABLE_CATALOG, ku.TABLE_SCHEMA, ku.TABLE_NAME, ku.COLUMN_NAME
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
            ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
            AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    ) pk ON c.TABLE_CATALOG = pk.TABLE_CATALOG
        AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
        AND c.TABLE_NAME = pk.TABLE_NAME
        AND c.COLUMN_NAME = pk.COLUMN_NAME
WHERE 
    c.TABLE_NAME = 'PlanBasicInfo'
ORDER BY 
    c.ORDINAL_POSITION;
GO

