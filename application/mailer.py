from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import smtplib

SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = "team@bookhouse.com"
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "")


def send_mail(receiver, subject, message, content="text", attachment=None):
    msg = MIMEMultipart()
    msg["From"] = SENDER_ADDRESS
    msg["To"] = receiver
    msg["Subject"] = subject

    # Attach the message body
    if content == "html":
        msg.attach(MIMEText(message, "html"))
    else:
        msg.attach(MIMEText(message, "plain"))

    # Handle the attachment
    if attachment:
        with open(attachment, "rb") as attachment_file:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment_file.read())

        encoders.encode_base64(part)
        part.add_header(
            "Content-Disposition",
            f'attachment; filename="{os.path.basename(attachment)}"',
        )

        # Explicitly set the MIME type for CSV
        if attachment.lower().endswith(".csv"):
            part.add_header("Content-Type", "text/csv; charset=utf-8")

        msg.attach(part)

    # Send the email
    server = smtplib.SMTP(host=SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
    server.login(SENDER_ADDRESS, SENDER_PASSWORD)
    server.send_message(msg)
    server.quit()

    return "Mail Sent."
