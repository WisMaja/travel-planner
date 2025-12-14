-- =============================================
-- Skrypt naprawczy dla tabeli PlanBasicInfo
-- Dodaje brakujące kolumny i zmienia typ TripTypeId na uniqueidentifier
-- Wykonaj ten skrypt w SQL Server Management Studio lub przez inne narzędzie do zarządzania bazą danych
-- =============================================

USE TravelPlanerDb;
GO

PRINT 'Rozpoczynam naprawę tabeli PlanBasicInfo...';
GO

-- =============================================
-- KROK 0: Napraw tabelę TripType (zmień TripTypeId z int na uniqueidentifier)
-- =============================================

PRINT 'Sprawdzam i naprawiam tabelę TripType...';
GO

-- Sprawdź czy tabela TripType istnieje
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'TripType' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    -- Sprawdź typ kolumny TripTypeId w tabeli TripType
    DECLARE @TripTypeTableTripTypeIdIsInt BIT = 0;
    
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TripType]') AND name = 'TripTypeId' AND system_type_id = 56)
    BEGIN
        SET @TripTypeTableTripTypeIdIsInt = 1;
        PRINT 'ℹ Tabela TripType istnieje, ale TripTypeId jest typu int - wymaga konwersji na uniqueidentifier';
        
        -- Znajdź wszystkie foreign keys które odwołują się do TripType.TripTypeId
        DECLARE @FKToDrop TABLE (FKName NVARCHAR(128), TableName NVARCHAR(128));
        
        INSERT INTO @FKToDrop
        SELECT fk.name, OBJECT_NAME(fkc.parent_object_id) AS TableName
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        WHERE fkc.referenced_object_id = OBJECT_ID(N'[dbo].[TripType]')
        AND COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) = 'TripTypeId';
        
        -- Usuń wszystkie foreign keys które odwołują się do TripType
        DECLARE @FKNameToDrop NVARCHAR(128);
        DECLARE @TableNameToDrop NVARCHAR(128);
        DECLARE @DropFKSQL NVARCHAR(MAX);
        
        DECLARE fk_cursor CURSOR FOR SELECT FKName, TableName FROM @FKToDrop;
        OPEN fk_cursor;
        FETCH NEXT FROM fk_cursor INTO @FKNameToDrop, @TableNameToDrop;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @DropFKSQL = 'ALTER TABLE [dbo].[' + @TableNameToDrop + '] DROP CONSTRAINT [' + @FKNameToDrop + ']';
            EXEC(@DropFKSQL);
            PRINT '✓ Usunięto foreign key constraint: ' + @FKNameToDrop + ' z tabeli ' + @TableNameToDrop;
            FETCH NEXT FROM fk_cursor INTO @FKNameToDrop, @TableNameToDrop;
        END
        
        CLOSE fk_cursor;
        DEALLOCATE fk_cursor;
        
        -- Sprawdź czy są jakieś wartości w kolumnie TripTypeId
        DECLARE @TripTypeRowCount INT;
        SELECT @TripTypeRowCount = COUNT(*) FROM [dbo].[TripType];
        
        IF @TripTypeRowCount > 0
        BEGIN
            PRINT '⚠ UWAGA: Tabela TripType zawiera ' + CAST(@TripTypeRowCount AS NVARCHAR(10)) + ' rekordów.';
            PRINT '⚠ Wszystkie rekordy zostaną usunięte, ponieważ nie można automatycznie przekonwertować int na Guid.';
            PRINT '⚠ Jeśli potrzebujesz zachować te dane, musisz ręcznie je zmapować.';
            
            -- Usuń wszystkie rekordy z TripType (ponieważ nie można przekonwertować int na Guid)
            DELETE FROM [dbo].[TripType];
            PRINT '✓ Wyczyszczono dane z tabeli TripType';
        END
        
        -- Znajdź i usuń primary key constraint jeśli istnieje
        DECLARE @PKName NVARCHAR(128) = NULL;
        SELECT @PKName = pk.name
        FROM sys.key_constraints pk
        INNER JOIN sys.index_columns ic ON pk.parent_object_id = ic.object_id AND pk.unique_index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE pk.parent_object_id = OBJECT_ID(N'[dbo].[TripType]')
        AND c.name = 'TripTypeId'
        AND pk.type = 'PK';
        
        IF @PKName IS NOT NULL
        BEGIN
            EXEC('ALTER TABLE [dbo].[TripType] DROP CONSTRAINT [' + @PKName + ']');
            PRINT '✓ Usunięto primary key constraint: ' + @PKName;
        END
        
        -- Usuń starą kolumnę TripTypeId (int) i dodaj nową jako uniqueidentifier
        ALTER TABLE [dbo].[TripType]
        DROP COLUMN [TripTypeId];
        
        PRINT '✓ Usunięto starą kolumnę TripTypeId (int) z tabeli TripType';
        
        -- Dodaj nową kolumnę jako uniqueidentifier
        ALTER TABLE [dbo].[TripType]
        ADD [TripTypeId] [uniqueidentifier] NOT NULL DEFAULT NEWID();
        
        -- Usuń DEFAULT (nie chcemy mieć domyślnej wartości)
        ALTER TABLE [dbo].[TripType]
        ALTER COLUMN [TripTypeId] [uniqueidentifier] NOT NULL;
        
        -- Dodaj primary key constraint
        ALTER TABLE [dbo].[TripType]
        ADD CONSTRAINT [PK_TripType] PRIMARY KEY ([TripTypeId]);
        
        PRINT '✓ Dodano nową kolumnę TripTypeId jako uniqueidentifier z primary key w tabeli TripType';
    END
    ELSE IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[TripType]') AND name = 'TripTypeId' AND system_type_id = 36)
    BEGIN
        PRINT 'ℹ Tabela TripType już ma TripTypeId jako uniqueidentifier - nie wymaga zmian';
    END
    ELSE
    BEGIN
        PRINT '⚠ UWAGA: Tabela TripType istnieje, ale nie ma kolumny TripTypeId - zostanie utworzona';
        ALTER TABLE [dbo].[TripType]
        ADD [TripTypeId] [uniqueidentifier] NOT NULL DEFAULT NEWID();
        
        ALTER TABLE [dbo].[TripType]
        ALTER COLUMN [TripTypeId] [uniqueidentifier] NOT NULL;
        
        ALTER TABLE [dbo].[TripType]
        ADD CONSTRAINT [PK_TripType] PRIMARY KEY ([TripTypeId]);
        
        PRINT '✓ Dodano kolumnę TripTypeId jako uniqueidentifier z primary key w tabeli TripType';
    END
END
ELSE
BEGIN
    PRINT '⚠ UWAGA: Tabela TripType nie istnieje - zostanie utworzona';
    CREATE TABLE [dbo].[TripType] (
        [TripTypeId] [uniqueidentifier] NOT NULL PRIMARY KEY,
        [Name] [nvarchar](255) NULL
    );
    PRINT '✓ Utworzono tabelę TripType z TripTypeId jako uniqueidentifier';
END
GO

-- =============================================
-- KROK 1: Dodaj brakujące kolumny
-- =============================================

-- Dodaj kolumnę Location (lokalizacja startowa)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'Location')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [Location] [nvarchar](500) NULL;
    PRINT '✓ Kolumna Location została dodana';
END
ELSE
BEGIN
    PRINT 'ℹ Kolumna Location już istnieje';
END
GO

-- Dodaj kolumnę Destination (cel podróży)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'Destination')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [Destination] [nvarchar](500) NULL;
    PRINT '✓ Kolumna Destination została dodana';
END
ELSE
BEGIN
    PRINT 'ℹ Kolumna Destination już istnieje';
END
GO

-- Dodaj kolumnę BudgetCurrency (waluta budżetu)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'BudgetCurrency')
BEGIN
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [BudgetCurrency] [nvarchar](10) NULL;
    PRINT '✓ Kolumna BudgetCurrency została dodana';
END
ELSE
BEGIN
    PRINT 'ℹ Kolumna BudgetCurrency już istnieje';
END
GO

-- =============================================
-- KROK 2: Zmień typ TripTypeId z int na uniqueidentifier
-- =============================================

-- Sprawdź czy kolumna TripTypeId istnieje i jaki ma typ
DECLARE @TripTypeIdExists BIT = 0;
DECLARE @TripTypeIdIsInt BIT = 0;
DECLARE @FKName NVARCHAR(128) = NULL;

-- Sprawdź czy kolumna istnieje
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'TripTypeId')
BEGIN
    SET @TripTypeIdExists = 1;
    
    -- Sprawdź czy jest typu int (system_type_id = 56)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'TripTypeId' AND system_type_id = 56)
    BEGIN
        SET @TripTypeIdIsInt = 1;
        PRINT 'ℹ Kolumna TripTypeId istnieje i jest typu int - wymaga konwersji na uniqueidentifier';
    END
    ELSE IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') AND name = 'TripTypeId' AND system_type_id = 36)
    BEGIN
        PRINT 'ℹ Kolumna TripTypeId już ma typ uniqueidentifier - nie wymaga zmian';
    END
END
ELSE
BEGIN
    PRINT 'ℹ Kolumna TripTypeId nie istnieje - zostanie utworzona jako uniqueidentifier';
END

-- Jeśli TripTypeId jest int, zmień na uniqueidentifier
IF @TripTypeIdExists = 1 AND @TripTypeIdIsInt = 1
BEGIN
    PRINT 'Rozpoczynam konwersję TripTypeId z int na uniqueidentifier...';
    
    -- Znajdź i usuń foreign key constraint jeśli istnieje
    SELECT @FKName = fk.name 
    FROM sys.foreign_keys fk
    INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
    WHERE fkc.parent_object_id = OBJECT_ID(N'[dbo].[PlanBasicInfo]') 
    AND c.name = 'TripTypeId';
    
    IF @FKName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE [dbo].[PlanBasicInfo] DROP CONSTRAINT [' + @FKName + ']');
        PRINT '✓ Usunięto foreign key constraint: ' + @FKName;
    END
    
    -- Sprawdź czy są jakieś wartości w kolumnie (jeśli tak, trzeba je wyczyścić lub przekonwertować)
    DECLARE @RowCount INT;
    SELECT @RowCount = COUNT(*) FROM [dbo].[PlanBasicInfo] WHERE [TripTypeId] IS NOT NULL;
    
    IF @RowCount > 0
    BEGIN
        PRINT '⚠ UWAGA: Znaleziono ' + CAST(@RowCount AS NVARCHAR(10)) + ' rekordów z wartością TripTypeId typu int.';
        PRINT '⚠ Wartości zostaną utracone, ponieważ nie można automatycznie przekonwertować int na Guid.';
        PRINT '⚠ Jeśli potrzebujesz zachować te wartości, musisz ręcznie je zmapować.';
    END
    
    -- Usuń starą kolumnę int (SQL Server nie pozwala bezpośrednio zmienić typu z int na uniqueidentifier)
    ALTER TABLE [dbo].[PlanBasicInfo]
    DROP COLUMN [TripTypeId];
    
    PRINT '✓ Usunięto starą kolumnę TripTypeId (int)';
    
    -- Dodaj nową kolumnę jako uniqueidentifier
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [TripTypeId] [uniqueidentifier] NULL;
    
    PRINT '✓ Dodano nową kolumnę TripTypeId jako uniqueidentifier';
    
    -- Dodaj ponownie foreign key constraint
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD CONSTRAINT [FK_PlanBasicInfo_TripType] FOREIGN KEY ([TripTypeId])
        REFERENCES [dbo].[TripType] ([TripTypeId])
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    
    PRINT '✓ Dodano ponownie foreign key constraint dla TripTypeId';
END
ELSE IF @TripTypeIdExists = 0
BEGIN
    -- Jeśli kolumna nie istnieje, dodaj ją jako uniqueidentifier
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD [TripTypeId] [uniqueidentifier] NULL;
    
    ALTER TABLE [dbo].[PlanBasicInfo]
    ADD CONSTRAINT [FK_PlanBasicInfo_TripType] FOREIGN KEY ([TripTypeId])
        REFERENCES [dbo].[TripType] ([TripTypeId])
        ON DELETE SET NULL
        ON UPDATE CASCADE;
    
    PRINT '✓ Dodano kolumnę TripTypeId jako uniqueidentifier z foreign key constraint';
END
GO

-- =============================================
-- KROK 3: Sprawdź strukturę tabeli
-- =============================================

PRINT '';
PRINT '=============================================';
PRINT 'Aktualna struktura tabeli PlanBasicInfo:';
PRINT '=============================================';

SELECT 
    c.COLUMN_NAME AS 'Kolumna',
    CASE 
        WHEN c.DATA_TYPE = 'uniqueidentifier' THEN 'uniqueidentifier (Guid)'
        WHEN c.DATA_TYPE = 'nvarchar' THEN 'nvarchar(' + CAST(c.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR) + ')'
        WHEN c.DATA_TYPE = 'decimal' THEN 'decimal(' + CAST(c.NUMERIC_PRECISION AS NVARCHAR) + ',' + CAST(c.NUMERIC_SCALE AS NVARCHAR) + ')'
        WHEN c.DATA_TYPE = 'date' THEN 'date'
        ELSE c.DATA_TYPE
    END AS 'Typ danych',
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

PRINT '';
PRINT '=============================================';
PRINT 'Skrypt naprawczy zakończony pomyślnie!';
PRINT '=============================================';
GO
