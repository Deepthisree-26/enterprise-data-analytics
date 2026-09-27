from io import BytesIO
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from datetime import datetime, timezone

def generate_pdf(report_title: str, records: list[dict]) -> bytes:
    """Generate a simple PDF report.

    Parameters
    ----------
    report_title: str
        Title of the report.
    records: list[dict]
        List of data records (each dict will be rendered as a row).

    Returns
    -------
    bytes
        PDF data as a byte string.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=LETTER)
    width, height = LETTER
    c.setTitle(report_title)
    # Header
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 50, report_title)
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 70, f"Generated: {datetime.now(timezone.utc).isoformat()} UTC")
    # Table header
    y = height - 100
    if records:
        headers = list(records[0].keys())
        for col, header in enumerate(headers):
            c.drawString(40 + col * 100, y, str(header))
        y -= 15
        # Table rows
        for row in records:
            for col, header in enumerate(headers):
                c.drawString(40 + col * 100, y, str(row.get(header, "")))
            y -= 12
            if y < 40:
                c.showPage()
                y = height - 40
    else:
        c.drawString(40, y, "No data available.")
    c.showPage()
    c.save()
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
