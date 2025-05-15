import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Box } from '@mui/material';
import Peer from 'peerjs';
import { QRCodeSVG } from 'qrcode.react'; // Для отображения QR-кода
import { BrowserMultiFormatReader } from '@zxing/library'; // Импортируем библиотеку для сканирования QR

function BookExchange() {
    const [peer, setPeer] = useState(null);
    const [bookFile, setBookFile] = useState(null);
    const [receivedBook, setReceivedBook] = useState(null);
    const [peerId, setPeerId] = useState('');
    const [connectedPeer, setConnectedPeer] = useState(null);
    const [isScanning, setIsScanning] = useState(false); // Состояние для отслеживания, сканирует ли пользователь QR-код
    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    // Инициализация PeerJS с публичным сервером PeerJS
    useEffect(() => {
        const newPeer = new Peer();

        setPeer(newPeer);

        newPeer.on('open', (id) => {
            setPeerId(id); // Показываем ID текущего пользователя
            console.log('My peer ID is:', id);
        });

        newPeer.on('connection', (conn) => {
            console.log('Connected to peer:', conn.peer);
            setConnectedPeer(conn);
            conn.on('data', (data) => {
                if (data.type === 'book') {
                    handleReceivedBook(data.book);
                }
            });
        });

        return () => {
            newPeer.destroy(); // Очистка peer при размонтировании компонента
            if (videoRef.current) {
                videoRef.current.srcObject?.getTracks().forEach(track => track.stop()); // Останавливаем камеру
            }
        };
    }, []);

    // Обработчик для выбора файла
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBookFile(file);
        }
    };

    // Отправка книги на другой peer
    const sendBook = () => {
        if (connectedPeer && bookFile) {
            const conn = connectedPeer;
            const reader = new FileReader();
            reader.onload = () => {
                conn.send({
                    type: 'book',
                    book: reader.result, // отправляем книгу в виде ArrayBuffer
                });
            };
            reader.readAsArrayBuffer(bookFile); // Преобразуем файл в ArrayBuffer перед отправкой
        }
    };

    // Подключение к другому peer
    const connectToPeer = (id) => {
        const conn = peer.connect(id);
        conn.on('open', () => {
            console.log('Connected to peer:', id);
            setConnectedPeer(conn);
            conn.on('data', (data) => {
                if (data.type === 'book') {
                    handleReceivedBook(data.book);
                }
            });
        });
    };

    // Обработчик получения книги
    const handleReceivedBook = (bookData) => {
        setReceivedBook(new Blob([bookData])); // Преобразуем ArrayBuffer обратно в Blob
        console.log('Received book:', bookData);
    };

    // Обработчик для QR-кода
    const handleScan = (result) => {
        if (result) {
            // Если был отсканирован QR-код, пытаемся подключиться
            console.log('Scanned peer ID:', result.getText());
            connectToPeer(result.getText()); // Подключаемся к пользователю по отсканированному Peer ID
            setIsScanning(false); // Останавливаем сканирование
        }
    };

    const handleError = (err) => {
        console.error('QR Code Scan Error:', err);
    };

    // Запуск сканирования QR-кодов
    const startScanning = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const stream = video.srcObject;
            if (stream) {
                // Стартуем сканирование через камеру
                codeReader.current.decodeFromVideoDevice(null, video, (result, error) => {
                    if (result) {
                        handleScan(result);
                    }
                    if (error) {
                        handleError(error);
                    }
                });
            }
        }
    };

    // Остановить сканирование
    const stopScanning = () => {
        setIsScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop()); // Останавливаем камеру
        }
    };

    return (
        <Box sx={{ padding: '16px' }}>
            <Typography variant="h6" gutterBottom>
                Peer-to-Peer Book Exchange
            </Typography>

            <Typography variant="body1" color="text.secondary" gutterBottom>
                Your Peer ID: {peerId}
            </Typography>

            {/* Отображение QR-кода с Peer ID */}
            {peerId && !isScanning && (
                <Box sx={{ marginBottom: '16px', textAlign: 'center' }}>
                    <Typography variant="body1" color="text.primary" gutterBottom>
                        Scan this QR code to connect:
                    </Typography>
                    <QRCodeSVG value={peerId} size={256} />
                </Box>
            )}

            {/* Кнопка для начала сканирования QR-кода */}
            {isScanning ? (
                <Box sx={{ marginBottom: '16px' }}>
                    <video ref={videoRef} width="100%" height="auto" style={{ border: '1px solid black' }} />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={stopScanning}
                        sx={{ marginTop: '16px' }}
                    >
                        Stop Scanning
                    </Button>
                </Box>
            ) : (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        setIsScanning(true);
                        startScanning();
                    }}
                >
                    Start Scanning QR Code
                </Button>
            )}

            <Box sx={{ marginBottom: '16px' }}>
                <Button
                    variant="contained"
                    component="label"
                    color="primary"
                >
                    Select Book File
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
            </Box>

            <Box sx={{ marginBottom: '16px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={sendBook}
                    disabled={!connectedPeer || !bookFile}
                >
                    Send Book
                </Button>
            </Box>

            {receivedBook && (
                <Box sx={{ marginTop: '16px' }}>
                    <Typography variant="h6" gutterBottom>
                        Received Book:
                    </Typography>
                    <a
                        href={URL.createObjectURL(receivedBook)}
                        download="received_book"
                    >
                        Download the book
                    </a>
                </Box>
            )}
        </Box>
    );
}

export default BookExchange;
