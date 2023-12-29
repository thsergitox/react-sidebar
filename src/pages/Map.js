import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, Circle } from 'react-leaflet';
import { SocketContext } from '../externalSocket/SocketContext';
import L from 'leaflet';
import customIconUrl from '../assets/bus.svg';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
  iconUrl: customIconUrl,
  iconSize: [31, 37],
  iconAnchor: [15, 37],
  popupAnchor: [0, -37]
});

const MyMap = ({ item }) => {
  const { route } = item;
  const [positions, setPositions] = useState({}); 
  const [paths, setPaths] = useState([])
  const socket = useContext(SocketContext);

  useEffect(() => {

    if (socket) {
      socket.emit('sendingRoutes', route);

      socket.on('gettingInfo', (data) => {
        if (data) {
          setPaths(data)
        }
      })

      socket.on('gettingPositions', (data) => {
        if (data) {
          setPositions(data);
        }
      });

      socket.on('updatingPositions', (data) => {
        if (data) {
          setPositions(prevPositions => ({
            ...prevPositions,
            [data.routeid]: data.position
          }));
        }
      });
    }

    // Cleanup function
    return () => {
      setPaths([])
      setPositions({})
    };
  }, [socket, route]);

  // Centro inicial del mapa
  const center = [-12.046578, -77.043001];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '90vh', zIndex: 5 }} zoomControl={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; Made By Sergitox and Luisitox'
      />
      <ZoomControl position="topright" />
 
      {Object.entries(positions)
        .filter(([index, _]) => route.includes(index))
        .map(([index, pos]) => (
          <Marker key={index} position={pos} icon={customIcon} >
            <Popup>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px'}} >
                Ruta: {index}
              </div>
              
            </Popup>
          </Marker>
        ))
      }

      {paths.map((route, index) => (
        <>
        <Polyline key={`outward-${index}`} positions={route.outwardPath} color={route.color}>
          <Popup>
          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px'}} >
              Ruta: {route.routeid}<br />
              Camino ida.
            </div>
          </Popup>
        </Polyline>
        <Polyline key={`return-${index}`} positions={route.returnPath} color={route.color}>
          <Popup>
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px'}} >
              Ruta: {route.routeid}<br />
              Camino vuelta.
            </div>
          </Popup>
        </Polyline>

        {route.outwardStops[1].map((pos, index) => {
          return (
            <Circle key={`outward-stops-${index}-${pos}`} radius={20} center={pos} color={route.color}>
              <Popup>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px'}} >
                Paradero: {route.outwardStops[0][index]}
              </div>
              </Popup>
            </Circle>
          )
        })}

        {route.returnStops[1].map((pos, index) => {
          return (
            <Circle key={`return-stops-${index}-${pos}`} radius={20} center={pos} color={route.color}>
              <Popup>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '5px'}} >
                Paradero: {route.returnStops[0][index]}
              </div>
              </Popup>
            </Circle>
          )
        })}
        
      </>
      ))}
    </MapContainer>
  );
};

export default MyMap;
