## Inventory Management System (Tkinter) – Windows EXE Guide

This project is a Tkinter-based Inventory Management System. It includes a dashboard and modules for employees, suppliers, categories, products, sales, and billing. A portable Windows executable is provided and can also be rebuilt locally with PyInstaller.

### Quick Start (Run the app)
- Double-click: `dist/ready.exe`
- No Python required. The exe is single-file and GUI-only (no console window).
- On first run, the app ensures `ims.db` (database) exists beside the exe and creates a writable `bill` folder next to the exe. For best results, place `ready.exe` in a user-writable folder like Desktop or Documents.

### Resource handling (important)
- Images are bundled and loaded at runtime via a helper (`util_paths.py`).
- `ims.db` is either bundled and copied next to the exe, or created if absent.
- Bills are saved in a `bill` directory beside the exe.

### Build the EXE from source
Requirements (for building):
- Windows 10/11
- Python with the Windows launcher (`py`) and pip

1) Open PowerShell in the project root (`C:\Inventory-Management-System`).
2) Install/upgrade dependencies:
```powershell
py -m pip install --upgrade pip
py -m pip install pyinstaller pillow
```
3) Build a single-file, GUI-only exe named `ready.exe` (bundles images and database):
```powershell
py -m PyInstaller --onefile --noconsole --name ready --add-data "images;images" --add-data "ims.db;." dashboard.py
```
4) Optional: Use a custom icon if you add `icon.ico` to the project root:
```powershell
py -m PyInstaller --onefile --noconsole --icon icon.ico --name ready --add-data "images;images" --add-data "ims.db;." dashboard.py
```
5) Output location:
- The exe will be created at `dist/ready.exe`.

Notes:
- If `pyinstaller` is not recognized as a command, use the module form shown above: `py -m PyInstaller ...`.
- Tkinter and SQLite are built into Python. Pillow (`pillow`) is required for image handling.

### Run in development (without building)
1) Install Pillow (if not already installed):
```powershell
py -m pip install pillow
```
2) Launch the app:
```powershell
py dashboard.py
```

### Clean builds
If you need a fresh build, remove previous artifacts:
```powershell
Remove-Item -Recurse -Force build, dist, *.spec
```
Then re-run the build command (see above).

### Troubleshooting
- PyInstaller command not found:
  - Use `py -m PyInstaller ...` instead of `pyinstaller ...` so you don’t depend on PATH.

- Missing images at runtime:
  - Ensure the `--add-data "images;images"` argument is present in the build command.
  - The app resolves resources via `util_paths.get_resource_path()`.

- Database errors or read-only issues:
  - The app writes `ims.db` and bills next to the exe. Run the exe from a user-writable folder (not inside `Program Files`).

- Build warnings or packaging issues:
  - Check: `build/ready/warn-ready.txt` (for `ready.exe`) or `build/dashboard/warn-dashboard.txt` (for `dashboard.exe`).
  - Share the contents if you need help resolving them.

- Antivirus flags the exe:
  - One-file packers can trigger false positives. Whitelist the exe if needed.

- Need a console for debugging:
  - Omit `--noconsole` (or use `--console`) during build to see logs in a console window.

### Project structure (key items)
- `dashboard.py`: Main entry point
- `util_paths.py`: Resolves resource paths and ensures `ims.db` and `bill` folder exist
- `images/`: UI images bundled into the exe
- `ims.db`: SQLite database (bundled and/or created next to the exe)
- `bill/`: Generated bills (created at runtime)
- `dist/ready.exe`: Built single-file executable

### Rebuilding with a different name or icon
- Change the `--name` argument to set the exe name
- Provide `--icon icon.ico` to embed a custom icon

### Support
If you encounter an error dialog or the app fails to start:
- Provide the text of the popup or paste the contents of `build/ready/warn-ready.txt` when asking for help.


