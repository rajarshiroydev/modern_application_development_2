from celery import shared_task
from application.models import User, Issued
from datetime import datetime, timedelta
from application.mailer import send_mail
from celery.schedules import crontab
from app import celery_app
from jinja2 import Template
import csv
# -----------------------Daily reminder for login and nearing return date------------------#


@celery_app.task(ignore_result=False)
def daily_reminder():
    users = User.query.all()
    today = datetime.today().date()
    for user in users:
        if user and user.role != "admin":
            # if user.last_login < datetime.today().date():
            reciver_mail = user.email
            send_mail(
                reciver_mail,
                subject="Daily User Reminder",
                message="Hey! Checkout newly released Book on BookHouse.",
            )

            issued = Issued.query.filter_by(user_id=user.id).all()
            for book in issued:
                if book.return_date and book.return_date <= (today + timedelta(days=3)):
                    send_mail(
                        reciver_mail,
                        subject="Book Return Reminder",
                        message=f"Reminder: The book '{book.book_name}' is due on {book.return_date}. Please return it on time to avoid any late fees.",
                    )
    return "Daily reminder done!"


# -----------------------------User export for issue details--------------------------------------#


def get_report(template, issued_list, name):
    with open(template) as fileTemp:
        template = Template(fileTemp.read())
        html_report = template.render(book_info=issued_list, name=name)
        return html_report


@celery_app.task
def user_report():
    users = User.query.all()
    for user in users:
        name = user.name
        mail = user.email

        issued = Issued.query.filter_by(user_id=user.id).all()
        issued_list = []
        for issue in issued:
            book_details = []
            book_details.append(issue.books.name)
            book_details.append(issue.books.section.name)
            book_details.append(issue.books.author)
            book_details.append(issue.date_issued.strftime("%Y-%m-%d"))
            book_details.append(issue.return_date.strftime("%Y-%m-%d"))
            issued_list.append(book_details)

        msg = get_report("templates/user_report.html", issued_list, name)
        send_mail(mail, subject="Monthly Activity Report", message=msg, content="html")
    return "Monthly Report Sent."


@celery_app.task()
def export_data(user_name, user_email, issued_list):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"{user_name}_book_details_{timestamp}.csv"

    # Fields for the CSV file
    book_fields = ["Book", "Section", "Author", "Date Issued", "Date Returned"]

    # Create and write the CSV file
    with open(file_name, "w", newline="", encoding="utf8") as csvf:
        cwriter = csv.writer(csvf)
        cwriter.writerow(book_fields)
        cwriter.writerows(issued_list)

    # Send the CSV file as an attachment
    send_mail(
        receiver=user_email,
        subject="Your Book Details Export",
        message=f"Dear {user_name},\n\nPlease find attached the export of your book details. Thank you!",
        attachment=file_name,
    )
    return "CSV file exported and email sent!"


# -----------------------------User export for issue details--------------------------------------#


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls deadlineReminder.s() daily.
    sender.add_periodic_task(10, daily_reminder.s(), name="DailyReminder")
    sender.add_periodic_task(
        crontab(minute=9, hour=20, day_of_month="*"),
        daily_reminder.s(),
        name="Daily reminder everyday @6PM via mail.",
    )
