import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import threading
import time
from firebase_admin import storage
import cv2
from ultralytics import YOLO
prediction_model = YOLO('functions/best.pt')

# Use a service account.
cred = credentials.Certificate('functions/serviceAccount.json')

app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'pothole-detection-webapp.appspot.com'
})

db = firestore.client()


# Create a callback on_snapshot function to capture changes
def on_snapshot(doc_snapshot, changes, read_time):
    doc = doc_snapshot[0]
    print(f"Received document snapshot: {doc.id}")
    print(f"Document data: {doc.to_dict()}")
    data_name = doc.to_dict().get("name")
    print(f"Data name: {data_name}")
    bucket = storage.bucket()
    blob = bucket.blob(data_name)
    blob.download_to_filename(data_name)
    
    image = cv2.imread(data_name)
    print(f"Image downloaded to {data_name}")
    resized_img = cv2.resize(image, (128, 128))
    results = prediction_model(image)
    class_ids = results[0].probs.top1
    classes = results[0].names

    print(f'Class IDs: {class_ids}')
    class_name = classes[results[0].probs.top1]
    # Update the Firestore document with the class name
    doc_ref = db.collection("input_images").document(doc.id)

    doc_ref.update({"class": class_name})
    print("Class names updated in Firestore")


    # Upload the resized image to Cloud Storage
    resized_image_name = "resized_" + data_name
    cv2.imwrite(resized_image_name, resized_img)
    resized_blob = bucket.blob(resized_image_name)
    resized_blob.upload_from_filename(resized_image_name)

    print(f"Resized image uploaded to {resized_image_name}")

doc_ref = db.collection("input_images")

# Watch the document
doc_watch = doc_ref.on_snapshot(on_snapshot)

# Keep the main thread running
while True:
    time.sleep(4)