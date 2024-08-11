from celery import shared_task
from models import User
from datetime import datetime
from mailer import send_mail
from celery.schedules import crontab


@shared_task(ignore_rest=False)
def hello():
    return "hello"


@shared_task
def daily_reminder():
    users = User.query.all()
    for user in users:
        if user and user.user_name != "admin":
            if user.last_login < datetime.today().date():
                reciver_mail = user.user_email
                send_mail(
                    reciver_mail,
                    subject="Daily User Reminder",
                    message="Hey! Checkout newly released Book on BookHouse.",
                )
    return "Daily reminder done!"


@shared_task.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Calls deadlineReminder.s() daily.
    sender.add_periodic_task(10, daily_reminder.s(), name="DailyReminder")
    sender.add_periodic_task(
        crontab(minute=0, hour=18, day_of_month="*"),
        daily_reminder.s(),
        name="Daily reminder everyday @6PM via mail.",
    )
