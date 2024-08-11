# from celery import Celery

# CELERY_BROKER_URL = "redis://127.0.0.1:6379/1"
# CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/2"


# def make_celery(app):
#     celery = Celery(app.import_name)
#     celery.conf.update(app.config)

#     class ContextTask(celery.Task):
#         def __call__(self, *args, **kwargs):
#             with app.app_context():
#                 return self.run(*args, **kwargs)

#     celery.Task = ContextTask
#     return celery
