from fpdf import FPDF
from app.workers.celery_app import celery_app

class PDFGenerator(FPDF):
    def header(self):
        self.set_font("Arial", "B", 15)
        self.cell(0, 10, "Skillinex AI Learning Roadmap", ln=True, align="C")
        self.ln(5)

@celery_app.task(name="generate_course_pdf")
def generate_course_pdf(course_data: dict, file_path: str):
    pdf = PDFGenerator()
    pdf.add_page()
    pdf.set_font("Arial", "", 12)
    
    pdf.cell(0, 10, f"Topic: {course_data['title']}", ln=True)
    pdf.multi_cell(0, 10, f"Description: {course_data['description']}")
    
    for section in course_data.get("sections", []):
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"Section: {section['title']}", ln=True)
        pdf.set_font("Arial", "", 10)
        for lecture in section.get("lectures", []):
            pdf.cell(0, 8, f" - {lecture['title']}", ln=True)
            
    pdf.output(file_path)
    return {"status": "PDF Generated", "path": file_path}