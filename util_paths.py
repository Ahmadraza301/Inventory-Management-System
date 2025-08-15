import os
import sys
import shutil


def get_app_dir() -> str:
	"""Return directory where the app should read/write its data.
	When frozen, it's the directory of the executable; otherwise, the repo dir.
	"""
	if getattr(sys, "frozen", False) and hasattr(sys, "executable"):
		return os.path.dirname(sys.executable)
	return os.path.dirname(os.path.abspath(__file__))


def get_resource_path(relative_path: str) -> str:
	"""Resolve path to a bundled resource (e.g., images) when frozen with PyInstaller.
	Falls back to the app directory during development.
	"""
	if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
		base_path = sys._MEIPASS  # type: ignore[attr-defined]
	else:
		base_path = get_app_dir()
	return os.path.join(base_path, relative_path)


def get_bill_dir() -> str:
	"""Ensure and return a writable bill directory next to the app."""
	path = os.path.join(get_app_dir(), "bill")
	os.makedirs(path, exist_ok=True)
	return path


def ensure_database_exists() -> str:
	"""Ensure ims.db exists next to the app; create it if missing.
	Returns absolute path to the database file.
	"""
	app_dir = get_app_dir()
	db_path = os.path.join(app_dir, "ims.db")
	if not os.path.exists(db_path):
		# If a packaged ims.db exists (bundled as data), copy it beside the exe
		packaged_db = get_resource_path("ims.db")
		if os.path.exists(packaged_db):
			shutil.copy2(packaged_db, db_path)
		else:
			# Create DB in app_dir by temporarily switching CWD so create_db writes to the correct place
			cwd = os.getcwd()
			try:
				os.chdir(app_dir)
				from create_db import create_db  # lazy import to avoid side effects at module import time
				create_db()
			finally:
				os.chdir(cwd)
	return db_path


