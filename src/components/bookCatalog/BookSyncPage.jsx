import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Container,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { bookStorage } from "../Utilities/BookStorage.js";

const BookSyncPage = () => {
    const [localBooks, setLocalBooks] = useState([]);
    const [serverBooks, setServerBooks] = useState([]);
    const [syncStatus, setSyncStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const storedBooks = await bookStorage.getBooks();
                const response = await axios.get("http://localhost:8080/books");

                setLocalBooks(storedBooks);
                setServerBooks(response.data);

                const status = {};
                storedBooks.forEach(book => {
                    const existsOnServer = response.data.some(
                        serverBook => serverBook.title === book.metadata.title && serverBook.author === book.metadata.author
                    );
                    status[`${book.metadata.title}-${book.metadata.author}`] = existsOnServer ? "✅" : "⚠️ Нет на сервере";
                });

                response.data.forEach(book => {
                    const existsOnClient = storedBooks.some(
                        localBook => localBook.metadata.title === book.title && localBook.metadata.author === book.author
                    );
                    if (!existsOnClient) status[`${book.title}-${book.author}`] = "⚠️ Нет на клиенте";
                });

                setSyncStatus(status);
            } catch (error) {
                console.error("Ошибка загрузки книг:", error);
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);

    const syncBookToServer = async (book) => {
        try {
            let storedBook = await bookStorage.getBookById(book.id);
            let file = storedBook.file;

            // Проверяем, является ли файл ArrayBuffer
            if (file instanceof ArrayBuffer) {
                // Конвертируем ArrayBuffer в Base64
                file = arrayBufferToBase64(file);
            }

            await axios.post("http://localhost:8080/books/", {
                file: file, // Теперь всегда строка (Base64 или текст)
                fileType: book.fileType,
                author: book.metadata.author,
                title: book.metadata.title,
                image: book.metadata.image,
                countPages: book.metadata.totalPages
            });

            setSyncStatus(prev => ({
                ...prev,
                [`${book.metadata.title}-${book.metadata.author}`]: "✅"
            }));
        } catch (error) {
            console.error("Ошибка синхронизации:", error);
        }
    };

// Функция конвертации ArrayBuffer → Base64
    const arrayBufferToBase64 = (buffer) => {
        let binary = "";
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary); // Кодируем в Base64
    };


    const downloadBookFromServer = async (book) => {
        try {
            const response = await axios.get(`http://localhost:8080/books/${book.book_id}`);
            console.log(response.data);

            let file = response.data.file;

            // Проверяем, если файл в Base64 – декодируем в ArrayBuffer
            if (isBase64(file)) {
                file = base64ToArrayBuffer(file);
            }

            const newBook = {
                fileType: response.data.fileType,
                metadata: {
                    title: response.data.title,
                    author: response.data.author,
                    image: response.data.image,
                    totalPages: response.data.countPages
                },
                file: file // Теперь это либо ArrayBuffer, либо текст
            };

            await bookStorage.saveBook(newBook);
            setLocalBooks(prev => [...prev, newBook]);

            setSyncStatus(prev => ({
                ...prev,
                [`${book.title}-${book.author}`]: "✅"
            }));
        } catch (error) {
            console.error("Ошибка загрузки книги:", error);
        }
    };

// Функция проверки: является ли строка Base64
    const isBase64 = (str) => {
        return /^([A-Za-z0-9+/=]+)$/.test(str) && str.length % 4 === 0;
    };

// Функция декодирования Base64 → ArrayBuffer
    const base64ToArrayBuffer = (base64) => {
        let binaryString = atob(base64);
        let len = binaryString.length;
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Синхронизация книг
            </Typography>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={3}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Локальные книги (клиент) */}
                    <Grid item xs={6}>
                        <Paper elevation={3} style={{ padding: "16px" }}>
                            <Typography variant="h6">Книги на клиенте</Typography>
                            <Divider />
                            <List>
                                {localBooks.map((book) => {
                                    const bookKey = `${book.metadata.title}-${book.metadata.author}`;
                                    return (
                                        <ListItem key={bookKey} secondaryAction={
                                            syncStatus[bookKey] === "⚠️ Нет на сервере" && (
                                                <Button onClick={() => syncBookToServer(book)} variant="outlined" size="small">
                                                    🔄 Загрузить на сервер
                                                </Button>
                                            )
                                        }>
                                            <ListItemText
                                                primary={`${book.metadata.title} (${book.metadata.author || "Без автора"})`}
                                                secondary={`Статус: ${syncStatus[bookKey] || "❓"}`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Grid>

                    {/* Книги на сервере */}
                    <Grid item xs={6}>
                        <Paper elevation={3} style={{ padding: "16px" }}>
                            <Typography variant="h6">Книги на сервере</Typography>
                            <Divider />
                            <List>
                                {serverBooks.map((book) => {
                                    const bookKey = `${book.title}-${book.author}`;
                                    return (
                                        <ListItem key={bookKey} secondaryAction={
                                            syncStatus[bookKey] === "⚠️ Нет на клиенте" && (
                                                <Button onClick={() => downloadBookFromServer(book)} variant="outlined" size="small">
                                                    ⬇️ Скачать на клиент
                                                </Button>
                                            )
                                        }>
                                            <ListItemText
                                                primary={`${book.title} (${book.author || "Без автора"})`}
                                                secondary={`Статус: ${syncStatus[bookKey] || "❓"}`}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Box mt={3} display="flex" justifyContent="space-between">
                <Button onClick={() => navigate("/")} variant="outlined">
                    Назад в библиотеку
                </Button>
            </Box>
        </Container>
    );
};

export default BookSyncPage;
