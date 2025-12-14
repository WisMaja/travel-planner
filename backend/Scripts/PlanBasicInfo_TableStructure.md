# Struktura tabeli PlanBasicInfo

## Opis
Tabela przechowuje podstawowe informacje o planie podróży. Relacja 1:1 z tabelą `Plans` (jeden plan ma jedną podstawową informację).

## Schemat tabeli

```
┌─────────────────────┬──────────────────────┬─────────────┬──────────┬─────────────────────────────┐
│ Nazwa kolumny       │ Typ danych           │ Nullable    │ PK/FK    │ Opis                        │
├─────────────────────┼──────────────────────┼─────────────┼──────────┼─────────────────────────────┤
│ PlanId              │ uniqueidentifier     │ NOT NULL    │ PK, FK   │ Klucz główny i obcy do Plans│
│ Description         │ nvarchar(max)        │ NULL        │          │ Opis planu podróży          │
│ Location            │ nvarchar(500)       │ NULL        │          │ Lokalizacja startowa        │
│ Destination         │ nvarchar(500)       │ NULL        │          │ Cel podróży                 │
│ StartDate           │ date                 │ NULL        │          │ Data rozpoczęcia            │
│ EndDate             │ date                 │ NULL        │          │ Data zakończenia            │
│ TripTypeId          │ int                  │ NULL        │ FK       │ Typ podróży (FK do TripType)│
│ CoverImgUrl         │ nvarchar(1000)      │ NULL        │          │ URL zdjęcia okładki         │
│ BudgetAmount        │ decimal(12,2)        │ NULL        │          │ Budżet (max 9999999999.99)  │
│ BudgetCurrency      │ nvarchar(10)         │ NULL        │          │ Waluta (PLN, EUR, USD...)  │
│ Notes               │ nvarchar(max)        │ NULL        │          │ Dodatkowe notatki          │
└─────────────────────┴──────────────────────┴─────────────┴──────────┴─────────────────────────────┘
```

## Relacje

- **FK_PlanBasicInfo_Plan**: `PlanId` → `Plans.PlansId` (CASCADE DELETE, CASCADE UPDATE)
- **FK_PlanBasicInfo_TripType**: `TripTypeId` → `TripType.TripTypeId` (SET NULL ON DELETE, CASCADE UPDATE)

## Przykładowe dane

```sql
INSERT INTO [PlanBasicInfo] 
    ([PlanId], [Description], [Location], [Destination], [StartDate], [EndDate], [TripTypeId], [BudgetAmount], [BudgetCurrency])
VALUES 
    ('12345678-1234-1234-1234-123456789012', 
     'Wspaniała podróż do stolicy Francji', 
     'Warszawa, Polska', 
     'Paryż, Francja', 
     '2024-07-01', 
     '2024-07-10', 
     1, 
     5000.00, 
     'EUR');
```

## SQL CREATE TABLE

```sql
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
    
    CONSTRAINT [PK_PlanBasicInfo] PRIMARY KEY CLUSTERED ([PlanId] ASC),
    
    CONSTRAINT [FK_PlanBasicInfo_Plan] FOREIGN KEY ([PlanId])
        REFERENCES [dbo].[Plans] ([PlansId])
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    CONSTRAINT [FK_PlanBasicInfo_TripType] FOREIGN KEY ([TripTypeId])
        REFERENCES [dbo].[TripType] ([TripTypeId])
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
```

## Mapowanie C# → SQL

| C# Model (PlansBasicInfo) | SQL Column | Typ C# | Typ SQL |
|---------------------------|------------|--------|---------|
| `PlanId` | `PlanId` | `Guid` | `uniqueidentifier` |
| `Description` | `Description` | `string?` | `nvarchar(max)` |
| `Location` | `Location` | `string?` | `nvarchar(500)` |
| `Destination` | `Destination` | `string?` | `nvarchar(500)` |
| `StartDate` | `StartDate` | `DateTime?` | `date` |
| `EndDate` | `EndDate` | `DateTime?` | `date` |
| `TripTypeId` | `TripTypeId` | `int?` | `int` |
| `CoverImgUrl` | `CoverImgUrl` | `string?` | `nvarchar(1000)` |
| `BudgetAmount` | `BudgetAmount` | `decimal?` | `decimal(12,2)` |
| `BudgetCurrency` | `BudgetCurrency` | `string?` | `nvarchar(10)` |
| `Notes` | `Notes` | `string?` | `nvarchar(max)` |

## Uwagi

1. **PlanId** jest jednocześnie kluczem głównym i obcym do tabeli `Plans`
2. Wszystkie pola są **nullable** (NULL), co oznacza że są opcjonalne
3. **BudgetAmount** ma precyzję 12,2 (maksymalnie 9999999999.99)
4. **BudgetCurrency** przechowuje kod waluty (np. "PLN", "EUR", "USD")
5. **StartDate** i **EndDate** są typu `date` (bez czasu)
6. Usunięcie planu z tabeli `Plans` automatycznie usuwa rekord z `PlanBasicInfo` (CASCADE DELETE)
7. Usunięcie typu podróży z `TripType` ustawia `TripTypeId` na NULL (SET NULL)

