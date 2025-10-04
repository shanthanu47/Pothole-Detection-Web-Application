import React, { useState, useEffect, useRef } from "react";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, setDoc } from "firebase/firestore/lite";
import { initializeApp } from "firebase/app";
import { collection, getDocs } from "firebase/firestore/lite";

import { LinearProgress, Fab } from "@mui/material";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibW9udW1lbnRhbDYxMCIsImEiOiJjbGc5b3c5Y2YxOXZkM2lwZGdxdGkwYjE1In0.es7m2CVAb9qXYMzARi8bdw";

const firebaseConfig = {
  apiKey: "AIzaSyCvoqSFPRgsFJLWbbdQCyL-zKWA-OoBD4g",
  authDomain: "pothole-detection-webapp.firebaseapp.com",
  projectId: "pothole-detection-webapp",
  storageBucket: "pothole-detection-webapp.appspot.com",
  messagingSenderId: "439055327183",
  appId: "1:439055327183:web:f81596865f6e5cd5ac3cba",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [location, setLocation] = useState({
    latitude: 19.04828,
    longitude: 72.91167,
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [72.91167, 19.04828],
      zoom: 10,
    });
    // const marker1 = new mapboxgl.Marker()
    //     .setLngLat([12.554729, 55.70651])
    //     .addTo(map);
    // Add geolocate control to the map.
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
      })
    );

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    handleGetLocation();
    mapRef.current = map;

    // Clean up on unmount
    return () => map.remove();
  }, []);

  async function handleGetLocation() {
    setIsFindingLocation(true);
    await navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      console.log(location)

      mapRef.current.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        essential: true,
        zoom: 15,
      });

      // Move the marker to the user's location
      if (markerRef.current) {
        console.log(location)
        markerRef.current.setLngLat([
          position.coords.longitude,
          position.coords.latitude,
        ]);
      } else {
        // Add a marker at the user's location
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([position.coords.longitude, position.coords.latitude])
          .setDraggable(true)
          .addTo(mapRef.current)
          
          .on("dragend", () => {
            const markerLngLat = markerRef.current.getLngLat();
            console.log("Marker dragged to:", markerLngLat);
            setLocation({
              longitude: markerLngLat.lng,
              latitude: markerLngLat.lat
            })
            console.log(location)
            // You can use the markerLngLat to update the location state or perform any other actions
          });
      }
      setIsFindingLocation(false);
    });
  }

  

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const fileName = selectedFile["name"];
    const storage = getStorage();
    const storageRef = ref(storage, fileName);
    const dataRef = doc(db, "input_images", fileName);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setIsUploading(true);

        // Calculate the progress percentage
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error Code = " + error.code + " - " + error.message);
      },
      async () => {
        console.log("Uploaded a blob or file!");
        setIsUploading(false);

        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Download URL:", downloadURL);
        console.log(location.latitude,location.longitude)

        // Update the document with the download URL
        setDoc(dataRef, {
          name: fileName,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
          },

          imageLocation: downloadURL,
        });
      }
    );
  };

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "input_images"));
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        // Process the data here
        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
        const classes = ["Clear", "Cloudy", "Rain", "Sunrise", "Tornado"];
        let marker1 = new mapboxgl.Marker({ color: colors[classes.indexOf(doc.data().class)] })
          .setLngLat([
            doc.data().location.longitude,
            doc.data().location.latitude,
          ])
          .addTo(mapRef.current)
          
        marker1.getElement().addEventListener("click", () => {
          // window.open(doc.data().imageLocation);
          window.alert(doc.data().class)
          console.log("Marker clicked:", doc.data().class);
        }
        );
      });
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div>
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}>
        {isUploading && (
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            style={{ width: "100vw", height: "7px" }}
          />
        )}
        {isFindingLocation && (
          <LinearProgress
            variant="indeterminate"
            style={{ width: "100vw", height: "7px" }}
          />
        )}
        {/* <img
          src="logo.png"
          alt="Pothole Reporter"
          style={{ width: "250px", padding: "10px" }}
        /> */}
        <input
          // accept="image/*"
          style={{ display: "none" }}
          id="contained-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
          <label htmlFor="contained-button-file">
            <Fab
              variant="extended"
              color="primary"
              component="span"
              style={{ backgroundColor: "#FCFAC2", color: "#060504" }}
            >
              <img
                src="photo_camera.svg"
                alt="camera"
                style={{ width: "30px" }}
              />
              Upload Image
            </Fab>
          </label>
        </div>
      </div>
      <div ref={mapContainerRef} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
};

export default App;
