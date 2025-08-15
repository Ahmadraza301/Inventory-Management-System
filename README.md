## Inventory Management System (Tkinter) – Windows EXE Guide

This project is a Tkinter-based Inventory Management System. It includes a dashboard and modules for employees, suppliers, categories, products, sales, and billing. A portable Windows executable is provided and can also be rebuilt locally with PyInstaller.

### Screenshots
1. **Dashboard**  
   ![Dashboard](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Dashboard_images.png?raw=true)

2. **Employee Module**  
   ![Employee](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Employee_Image.png?raw=true)

3. **Supplier Module**  
   ![Supplier](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Product_suupplier_image.png?raw=true)

4. **Product Category**  
   ![Product Category](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Product_category.png?raw=true)

5. **Product Module**  
   ![Product](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Product_details.png?raw=true)

6. **Sales / Billing Page**  
   ![Sales](https://github.com/Ahmadraza301/Inventory-Management-System/blob/main/images/Bill_pages.png?raw=true)

---

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
