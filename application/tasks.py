from celery import shared_task
from application.models import User, Issued, Feedbacks
from datetime import datetime, timedelta
from application.mailer import send_mail
from celery.schedules import crontab
from app import celery_app
from jinja2 import Template
import csv
import os
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


@celery_app.task(ignore_result=False)
def export_user_data(user_id):
    user = User.query.get(user_id)
    if not user:
        return "User not found."

    issued = Issued.query.filter_by(user_id=user.id).all()
    issued_list = []
    for issue in issued:
        book_details = [
            issue.books.name,
            issue.books.section.name,
            issue.books.author,
            issue.date_issued.strftime("%Y-%m-%d"),
            issue.return_date.strftime("%Y-%m-%d"),
        ]
        issued_list.append(book_details)

    # Export data as CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"{user.username}_book_details_{timestamp}.csv"

    # Fields for the CSV file
    book_fields = ["Book", "Section", "Author", "Date Issued", "Return Date"]

    # Create and write the CSV file
    with open(file_name, "w", newline="", encoding="utf8") as csvf:
        cwriter = csv.writer(csvf)
        cwriter.writerow(book_fields)
        cwriter.writerows(issued_list)

    # Send the CSV file as an attachment
    send_mail(
        receiver=user.email,
        subject="Your Book Details Export",
        message=f"Dear {user.name},\n\nPlease find attached the export of your book details. Thank you!",
        attachment=file_name,
    )

    # Clean up: remove the file after sending
    os.remove(file_name)

    # Send completion notification email
    send_mail(
        receiver=user.email,
        subject="Book Details Export Completed",
        message=f"Dear {user.name},\n\nYour book details export has been completed and sent to your email. Please check your inbox for the file.\n\nThank you for using our service!",
    )

    return f"CSV file exported and emails sent for {user.name}!"


# -----------------------------Montly report for admin--------------------------------------#


@celery_app.task(ignore_result=False)
def monthly_report():
    # Fetch admin user
    admin = User.query.filter_by(role="admin").first()
    if not admin:
        return "No admin found."

    users = User.query.all()
    report_data = []

    for user in users:
        user_report = {
            "name": user.name,
            "email": user.email,
            "issuances": [],
        }

        issuances = Issued.query.filter_by(user_id=user.id).all()
        for issuance in issuances:
            feedback = Feedbacks.query.filter_by(
                book_id=issuance.book_id, user_id=user.id
            ).first()
            book_info = {
                "book_name": issuance.book_name,
                "section_name": issuance.books.section.name,
                "author": issuance.author,
                "date_issued": issuance.date_issued,
                "return_date": issuance.return_date,
                "rating": feedback.rating if feedback else None,
                "feedback": feedback.feedback if feedback else None,
            }
            user_report["issuances"].append(book_info)

        report_data.append(user_report)

    # Generate report for admin
    msg = get_report("templates/admin_monthly_report.html", report_data, admin.name)
    send_mail(
        admin.email,
        subject="Admin Monthly Activity Report",
        message=msg,
        content="html",
    )

    return "Monthly Report Sent to Admin."


# -----------------------------Crontab--------------------------------------#


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls daily_reminder.s() daily.
    sender.add_periodic_task(10, daily_reminder.s(), name="DailyReminder")

    # Daily reminder every day at 8:09 PM.
    sender.add_periodic_task(
        crontab(minute=9, hour=20, day_of_month="*"),
        daily_reminder.s(),
        name="Daily reminder everyday @8:09 PM via mail.",
    )

    # For demonstration: Run the monthly report every minute.
    # sender.add_periodic_task(
    #     crontab(minute="*"),
    #     monthly_report.s(),
    #     name="Monthly Report every minute for demonstration",
    # )

    sender.add_periodic_task(
        10,
        monthly_report.s(),
        name="Monthly Report every minute for demonstration",
    )
