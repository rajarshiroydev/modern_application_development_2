from celery import shared_task
from application.models import User
from datetime import datetime
from application.mailer import send_mail
from celery.schedules import crontab
from app import celery_app


@shared_task(ignore_rest=False)
def hello():
    return "hello"


@celery_app.task(ignore_result=False)
def daily_reminder():
    users = User.query.all()
    for user in users:
        if user and user.role != "admin":
            # if user.last_login < datetime.today().date():
            reciver_mail = user.email
            send_mail(
                reciver_mail,
                subject="Daily User Reminder",
                message="Hey! Checkout newly released Book on BookHouse.",
            )
    return "Daily reminder done!"


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls deadlineReminder.s() daily.
    sender.add_periodic_task(10, daily_reminder.s(), name="DailyReminder")
    sender.add_periodic_task(
        crontab(minute=9, hour=20, day_of_month="*"),
        daily_reminder.s(),
        name="Daily reminder everyday @6PM via mail.",
    )
