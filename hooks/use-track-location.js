import { useContext, useState } from "react";
import { ACTION_TYPES, StoreContext } from "../store/store-context";

const UseTrackLocation = () => {
  const [locationErrorMessage, setLocationErrorMessage] = useState("");
  //const [latLong, setLatLong] = useState("");
  const [isFindingLocation, setIsFindingLocation] = useState(false);

  const { dispatch } = useContext(StoreContext);

  const success = (position) => {
    const { latitude, longitude } = position.coords;
    // setLatLong(`${latitude},${longitude}`);
    dispatch({
      type: ACTION_TYPES.SET_LAT_LONG,
      payload: {
        latLong: `${latitude},${longitude}`,
      },
    });
    setLocationErrorMessage("");
    setIsFindingLocation(false);
  };

  const error = () => {
    setIsFindingLocation(false);
    setLocationErrorMessage("Unable to retrieve your location");
  };

  const handleTrackLocation = () => {
    setIsFindingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
      setIsFindingLocation(true);
    } else {
      setLocationErrorMessage("Geolocation is not supported by this browser.");
    }
  };

  return {
    locationErrorMessage,
    // latLong,
    handleTrackLocation,
    isFindingLocation,
  };
};

export default UseTrackLocation;
