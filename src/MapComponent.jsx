import React, { useEffect, useState, useCallback } from "react";
import Map, { Marker } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const cityCoordinates = {
    Vadodara: { latitude: 22.3072, longitude: 73.1812, zoom: 12 },
    Ahmedabad: { latitude: 23.0225, longitude: 72.5714, zoom: 12 },
    Gandhinagar: { latitude: 23.2156, longitude: 72.6369, zoom: 12 },
    Manjalpur: { latitude: 22.275193, longitude: 73.187928, zoom: 14},
    // Manjalpur: { latitude: 22.275193, longitude: 73.187928, zoom: 14},
    Sayajigunj: { latitude: 22.315459, longitude: 73.187636, zoom: 14},
    Gorwa: { latitude: 22.335230, longitude: 73.148300, zoom: 14}, // 22.3297524,73.1502951
    Alkapuri: { latitude: 22.314216, longitude: 73.174050, zoom: 14}, // 22.314216, 73.174050
    Atladara: { latitude: 22.265726, longitude: 73.1318508, zoom: 14}, // 22.265726,73.1318508
    Bhaily: { latitude: 22.290925975422383, longitude: 73.12585050015718, zoom: 14 }, // 22.265479, 73.130581
    Danteshwar: { latitude: 22.2737318, longitude: 73.2067962, zoom: 14}, // 22.2737318,73.2067962
    Wadi: { latitude: 22.297558936288368, longitude: 73.21545437077634, zoom: 14},
    Gotri: { latitude: 22.315610, longitude: 73.137580, zoom: 14}, // 22.315610, 73.137580
    Harni: { latitude: 22.338310664555564, longitude: 73.21931791794714, zoom: 14},
    Makarpura: { latitude: 22.240962426965453, longitude: 73.1891979353926, zoom: 14},
    Mandvi: { latitude: 22.299377631143045, longitude: 73.21139071117011, zoom: 14}
};

const MapComponent = ({ filteredRequests, markerIcon, city }) => {
    const [viewPort, setViewPort] = useState(cityCoordinates[city] || cityCoordinates["Manjalpur"]);

    useEffect(() => {
        // Only update viewport if city changes, preventing unwanted state updates
        setViewPort(cityCoordinates[city] || cityCoordinates["Manjalpur"]);
    }, [city]);

    const handleMove = useCallback((evt) => {
        setViewPort((prev) => ({ ...prev, ...evt.viewState }));
    }, []);

    console.log(viewPort);

    return (
        <Map
            {...viewPort} // Spread state values directly instead of using `viewState`
            onMove={handleMove}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            mapLib={import("maplibre-gl")}
        >
            {filteredRequests.map((request) => (
                <Marker key={request._id} latitude={request.latitude} longitude={request.longitude}>
                    <img src={markerIcon} alt="marker" style={{ width: 30, height: 40 }} />
                </Marker>
            ))}
        </Map>
    );
};

export default MapComponent;



