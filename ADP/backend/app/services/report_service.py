class ReportService:
    @staticmethod
    def build_summary_pdf(file_id: str, metrics: dict) -> str:
        return f"Report payload generated for run token profile: {file_id}"
