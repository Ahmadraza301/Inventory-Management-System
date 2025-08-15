# Inventory Management System (Tkinter)

A desktop application for inventory management with employee, supplier, product, and sales modules.

## Screenshots

### Dashboard
![Dashboard Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Dashboard_images.png)

### Employee Management  
![Employee Management Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Employee_Image.png)

### Supplier Management  
![Supplier Management Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Product_suupplier_image.png)

### Product Categories  
![Product Categories Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Product_category.png)

### Product Management  
![Product Management Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Product_details.png)

### Sales & Billing  
![Sales & Billing Screenshot](https://github.com/Ahmadraza301/Inventory-Management-System/raw/main/images/Bill_pages.png)

## Installation

### Quick Start (Using Pre-built Executable)

1. Download the latest release from the [Releases page](https://github.com/Ahmadraza301/Inventory-Management-System/releases)
2. Double-click `ready.exe` in the `dist` folder
3. The application will automatically:
   - Create `ims.db` database file if missing
   - Create a `bills` folder for invoices

## Building from Source

```bash
# Clone repository
git clone https://github.com/Ahmadraza301/Inventory-Management-System.git
cd Inventory-Management-System

# Install dependencies
pip install -r requirements.txt

# Build executable
pyinstaller --onefile --windowed dashboard.py
