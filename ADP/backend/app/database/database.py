# Lightweight metadata registry acting as your data lifecycle manager
class FileRegistry:
    def __init__(self):
        self._db = {}

    def save_file_meta(self, file_id: str, meta: dict):
        self._db[file_id] = meta

    def get_file_meta(self, file_id: str) -> dict:
        return self._db.get(file_id, {})

file_registry_db = FileRegistry()
