from google.cloud import storage
from werkzeug.utils import secure_filename
import datetime

class image_handler():
    
    def __init__(self):
        self.storage_client = storage.Client()
        buckets = list(self.storage_client.list_buckets())
        print("Successfully Found: ", end="")
        print(buckets)
        self.bucket = self.storage_client.bucket("mentr-images")
    
    def delete(self, name):
        blob = self.bucket.blob(name)
        if not blob.exists():
            return False
        blob.delete()
        return True
    
    def exists(self, name):
        blob = self.bucket.blob(name)
        return blob.exists()
    
    def create(self, filename, file):
            blob = self.bucket.blob(filename)
            blob.upload_from_string(
            file.read(),
                content_type=file.content_type
            )

    def get(self, filename):
            blob = self.bucket.blob(filename)
            if not blob.exists():
                return None
            expiration = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
            url = blob.generate_signed_url(
                version="v4",
                method="GET",
                expiration=expiration
            )
            return url
