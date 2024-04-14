# Client 13/04/2024 1.5.8

Features:

- GIF added to OctoFarm Import Printers dialog showing how the JSON can be retrieved from OctoFarm

Changes:

- yaml import dialog: convert to setup script
- OctoFarm Import dialog has been completely redesigned
- OctoFarm import validation added (client side only)
  - Only known properties will be imported, preventing import errors
  - A PrintersDB.json structure is accepted, directly from OctoFarm
- Dialog has been renamed from **Batch Import** to **Import OctoFarm Printers**

Fixes:

- yaml import: clear import file field when closing dialog
- yaml import: also clear import file field when an error has occurred during import
- yaml import: show an error message to provide context about why import has failed
- OctoFarm import: Only known properties will be imported, preventing import errors
