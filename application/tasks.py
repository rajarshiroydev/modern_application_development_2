from celery import shared_task

@shared_task(ignore_rest=False)
def hello():
    return "hello"
