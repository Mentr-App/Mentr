from google.cloud import storage
from werkzeug.utils import secure_filename
from datetime import datetime

class image_handler():
    
    def __init__(self):
        self.storage_client = storage.Client()
        buckets = list(self.storage_client.list_buckets())
        print("Successfully Found: ", end="")
        print(buckets)
        self.bucket = self.storage_client.bucket("mentr_images")
    
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
        blob = self.bucket(filename)
        blob.upload_from_string(
            file.read(),
            content_type=file.content_type
        )
    
    
