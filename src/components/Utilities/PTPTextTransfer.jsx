import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";

const PeerJSComponent = () => {
    const [peerId, setPeerId] = useState("");
    const [message, setMessage] = useState("");
    const [receivedMessage, setReceivedMessage] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const peerRef = useRef(null);
    const connRef = useRef(null);

    // Инициализация PeerJS
    useEffect(() => {
        const peer = new Peer();

        peer.on("open", (id) => {
            setPeerId(id);
            console.log("My Peer ID is:", id);
        });

        peer.on("connection", (conn) => {
            connRef.current = conn;
            setIsConnected(true);
            console.log("Connected to peer:", conn.peer);

            // Принимаем сообщения от другого пользователя
            conn.on("data", (data) => {
                console.log("Received data:", data);
                setReceivedMessage(JSON.stringify(data, null, 2)); // Форматируем JSON
            });
        });

        peerRef.current = peer;

        return () => {
            peerRef.current && peerRef.current.destroy(); // Очистка при размонтировании компонента
        };
    }, []);

    // Установление соединения с другим пировым ID
    const connectToPeer = (peerId) => {
        const conn = peerRef.current.connect(peerId);
        connRef.current = conn;

        conn.on("open", () => {
            setIsConnected(true);
            console.log("Connected to peer:", peerId);
        });
    };

    // Отправка JSON-данных
    const sendMessage = () => {
        const dataToSend = {
            message,
            timestamp: new Date().toISOString(),
        };
        console.log("Sending message:", dataToSend);

        if (connRef.current) {
            connRef.current.send(dataToSend);
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>PeerJS Example - P2P Data Transfer</h1>

            <div>
                <h3>My Peer ID: {peerId}</h3>
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Enter peer ID to connect"
                    onChange={(e) => connectToPeer(e.target.value)}
                />
                <button onClick={() => connectToPeer(peerId)}>Connect to Peer</button>
            </div>

            {isConnected && (
                <div>
                    <h4>Send JSON Data</h4>
                    <input
                        type="text"
                        placeholder="Enter message to send"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}

            <div>
                <h4>Received Message:</h4>
                <pre>{receivedMessage}</pre>
            </div>
        </div>
    );
};

export default PeerJSComponent;
