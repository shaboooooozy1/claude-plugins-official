# Schedules and Data Exports

Use when the user provides CSV, spreadsheet, or AMS/CRM export files
(vehicle lists, SOVs, payroll, drivers, locations, claims, holders).

## Classify the file

Infer type from column names. Prefer the user's label when provided.

| Type | Typical columns |
|---|---|
| Statement of values | location, building, occupancy, construction, year, sq ft, TIV, COPE |
| Vehicles | VIN, year, make, model, GVW, cost new, radius, garaging ZIP, use |
| Drivers | name, DOB or age, license, state, hire date, MVR date |
| Payroll / WC | class code, description, state, payroll, officers |
| Locations | address, occupancy, protection class if stated |
| Claims / loss runs | DOL, claimant, status, paid, reserve, description |
| Certificate holders | holder, address, job, requested wording |

If columns mix types, split into separate schedules rather than one table.

## Normalization rules

- Keep source column names in a mapping table; do not silently rename facts.
- Treat currency and numeric fields as `stated` only when present in the file.
- Flag blank required fields per type (VIN for auto, TIV for property,
  class + payroll for WC, date of loss for claims).
- Flag duplicates (VIN, location ID, claim number) and values that cannot
  be right (negative TIV, VIN length other than 17 when a VIN is present).
- Do not geocode, rate, or assign class codes that are not in the file.

## Data-quality report

Always include:

1. Row count in vs row count usable
2. Required-field miss rate by column
3. Duplicate keys
4. Fields that look like notes stuffed into value columns
5. Next broker action (`submission`, `endorsement`, `renewal`, `audit`)

## Loss-run CSV specifics

- Record valuation date if a column or filename contains one.
- Separate open vs closed; do not net recoveries unless a column does.
- Large-loss threshold: use the user's agency threshold, or list claims
  at or above $25,000 as a working hypothesis labeled `unverified` as a
  cutoff, not as a fact about the account.

## Privacy

Minimize reproduction of DOB, SSN, driver's license, and FEIN in drafts.
Prefer masked values in client-facing artifacts.
