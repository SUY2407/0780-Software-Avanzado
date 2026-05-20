import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ...application.dtos.email_dto import EmailDTO  # Ajusta la ruta según tu estructura

class EmailService:
    def __init__(self, smtp_host: str, smtp_port: int, smtp_user: str, smtp_password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_user = smtp_user
        self.smtp_password = smtp_password

    def send(self, email_dto: EmailDTO) -> bool:
        """Envía el correo usando EmailDTO. Retorna True si se envió exitosamente."""
        try:
            msg = MIMEMultipart()
            msg['From'] = email_dto.from_email
            msg['To'] = email_dto.to_email
            msg['Subject'] = email_dto.subject
            
            msg.attach(MIMEText(email_dto.body, 'html'))
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"Correo enviado exitosamente a {email_dto.to_email}")
            return True
            
        except Exception as e:
            print(f"Error enviando correo: {str(e)}")
            return False