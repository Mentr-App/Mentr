from flask_mail import Mail

mail = Mail()
def init_mail(app):
    mail = Mail(app)
