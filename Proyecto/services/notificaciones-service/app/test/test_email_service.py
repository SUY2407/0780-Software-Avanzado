from unittest.mock import patch, MagicMock

from notificacion.application.services.email_service import EmailService
from notificacion.application.dtos.email_dto import EmailDTO


@patch("notificacion.application.services.email_service.smtplib.SMTP")
def test_email_service_envia_ok(mock_smtp_cls):
    # Arrange
    mock_smtp = MagicMock()
    mock_smtp_cls.return_value.__enter__.return_value = mock_smtp

    service = EmailService(
        smtp_host="smtp.test",
        smtp_port=587,
        smtp_user="user",
        smtp_password="pass",
    )

    dto = EmailDTO(
        from_email="from@test.com",
        to_email="to@test.com",
        subject="Prueba",
        body="<b>Hola</b>",
    )

    # Act
    result = service.send(dto)

    # Assert
    assert result is True
    mock_smtp.starttls.assert_called_once()
    mock_smtp.login.assert_called_once_with("user", "pass")
    mock_smtp.send_message.assert_called_once()


@patch("notificacion.application.services.email_service.smtplib.SMTP")
def test_email_service_maneja_error(mock_smtp_cls):
    # Arrange
    mock_smtp = MagicMock()
    # Forzamos que send_message lance una excepción
    mock_smtp.send_message.side_effect = Exception("SMTP error")
    mock_smtp_cls.return_value.__enter__.return_value = mock_smtp

    service = EmailService(
        smtp_host="smtp.test",
        smtp_port=587,
        smtp_user="user",
        smtp_password="pass",
    )

    dto = EmailDTO(
        from_email="from@test.com",
        to_email="to@test.com",
        subject="Prueba",
        body="Hola",
    )

    # Act
    result = service.send(dto)

    # Assert
    assert result is False
    mock_smtp.starttls.assert_called_once()
    mock_smtp.login.assert_called_once_with("user", "pass")
    mock_smtp.send_message.assert_called_once()
