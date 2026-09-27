from io import BytesIO
from openpyxl import Workbook
from datetime import datetime, timezone

def generate_excel(report_title: str, records: list[dict]) -> bytes:
    """Generate an Excel (xlsx) report.

    Parameters
    ----------
    report_title: str
        Title of the report (used for the sheet name).
    records: list[dict]
        List of data records; each dict becomes a row.

    Returns
    -------
    bytes
        Excel file as a byte string.
    """
    wb = Workbook()
    ws = wb.active
    ws.title = report_title[:31]  # Excel sheet name max 31 chars
    # Header row
    if records:
        headers = list(records[0].keys())
        ws.append(headers)
        for rec in records:
            ws.append([rec.get(h, "") for h in headers])
    else:
        ws.append(["No data available."])
    # Add generation timestamp as a note
    ws.append([])
    ws.append([f"Generated: {datetime.now(timezone.utc).isoformat()} UTC"])
    buffer = BytesIO()
    wb.save(buffer)
    excel_data = buffer.getvalue()
    buffer.close()
    return excel_data
