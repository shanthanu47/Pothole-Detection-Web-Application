# Copyright 2023 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START all]
# [START import]
# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn, options

options.set_global_options(max_instances=5)

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, firestore, storage
import google.cloud.firestore
import cv2
from ultralytics import YOLO
prediction_model = YOLO('best.pt')

# classes = ['line']
app = initialize_app()

# [END import]


# [START makeUppercase]
@firestore_fn.on_document_created(document="input_images/{pushId}", memory=options.MemoryOption.GB_2 )
def getfirestorefile(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """Listens for new documents to be added to /messages. If the document has
    an "original" field, creates an "uppercase" field containg the contents of
    "original" in upper case."""

    # Get the value of "original" if it exists.
    if event.data is None:
        return
    try:
        data_name = event.data.get("name")
    except KeyError:
        # No "original" field, so do nothing.
        return

    # Get a reference to the Firebase Storage bucket
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
    event.data.reference.update({"class": class_name})

    print("Class names updated in Firestore")


    # Upload the resized image to Cloud Storage
    resized_image_name = "resized_" + data_name
    cv2.imwrite(resized_image_name, resized_img)
    resized_blob = bucket.blob(resized_image_name)
    resized_blob.upload_from_filename(resized_image_name)

    print(f"Resized image uploaded to {resized_image_name}")