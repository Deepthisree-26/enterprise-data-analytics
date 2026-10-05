from io import BytesIO
from reportlab.lib.pagesizes import LETTER, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime, timezone
from typing import List, Dict, Any

def generate_pdf(report_title: str, records: list[dict], summary_kpis: dict = None) -> bytes:
    """Generate a clean, professional PDF audit report with tables and KPI summary."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(LETTER),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=14,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontSize=8,
        textColor=colors.HexColor("#334155"),
    )
    header_style = ParagraphStyle(
        "HeaderDark",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        fontName="Helvetica-Bold",
        textColor=colors.white,
    )

    story = []

    # Title & Header
    story.append(Paragraph(report_title, title_style))
    gen_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    story.append(Paragraph(f"Enterprise Analytics Platform • Generated on {gen_time} • Official Board Briefing", subtitle_style))
    story.append(Spacer(1, 10))

    # Summary KPIs row if provided
    if summary_kpis:
        kpi_data = [
            [Paragraph(f"<b>{k}</b>", body_style) for k in summary_kpis.keys()],
            [Paragraph(str(v), title_style) for v in summary_kpis.values()],
        ]
        kpi_table = Table(kpi_data, colWidths=[120] * len(summary_kpis))
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 15))

    # Records Table
    if records:
        # Take at most top 8-10 columns so it fits nicely
        all_keys = list(records[0].keys())[:10]
        table_rows = []

        # Headers
        table_rows.append([Paragraph(k.replace('_', ' ').title(), header_style) for k in all_keys])

        # Rows (limit to first 100 rows for PDF layout stability)
        for r in records[:100]:
            row_cells = []
            for k in all_keys:
                val = str(r.get(k, ""))
                if len(val) > 28:
                    val = val[:25] + "..."
                row_cells.append(Paragraph(val, body_style))
            table_rows.append(row_cells)

        col_width = (720) / len(all_keys)
        rec_table = Table(table_rows, colWidths=[col_width] * len(all_keys))
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(rec_table)
    else:
        story.append(Paragraph("No records found for this department dataset.", body_style))

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
