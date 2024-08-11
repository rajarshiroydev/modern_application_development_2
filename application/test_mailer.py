from mailer import send_mail

# Test email parameters
receiver = "test@bookhouse.com"
subject = "Test Email"
message = "This is a test email."

# Call the send_mail function
result = send_mail(receiver, subject, message)
print(result)
