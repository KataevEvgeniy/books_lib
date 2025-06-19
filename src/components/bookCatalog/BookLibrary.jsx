import React, { useState, useEffect } from "react";
import {List, Container, Box, Button, IconButton, Toolbar, AppBar} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Добавляем навигацию
import { bookStorage, Fb2Data } from "../Utilities/BookStorage.js";
import BookListItem from "./BookListItem.jsx";
import { parseMetaDataFb2, generateTextImage } from "../Utilities/ImageParser.js";
import AddIcon from '@mui/icons-material/Add';
import SyncIcon from '@mui/icons-material/Sync';

const BookLibrary = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate(); // Используем для перехода на /sync

    useEffect(() => {
        const loadBooks = async () => {
            const storedBooks = await bookStorage.getBooks();
            storedBooks.sort((a, b) => new Date(b.metadata.lastOpenDate) - new Date(a.metadata.lastOpenDate));
            setBooks(storedBooks);
        };
        loadBooks();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            const fileExtension = file.name.split(".").pop().toLowerCase();

            reader.onload = async (e) => {
                try {
                    const fileContent = e.target.result;
                    let bookData = parseMetaDataFb2(fileContent, ["image", "title", "author"]);

                    if (!bookData?.title) bookData.title = file.name;
                    if (!bookData?.image) bookData.image = generateTextImage(bookData.title);
                    if (!bookData?.author) bookData.author = "";

                    const newBook = {
                        fileType: fileExtension,
                        metadata: new Fb2Data(bookData.title, bookData.author, 0, null, bookData.image),
                        file: fileContent
                    };

                    await bookStorage.saveBook(newBook);
                    setBooks((prevBooks) => [...prevBooks, newBook]);
                } catch (error) {
                    console.error("Ошибка при обработке файла:", error);
                }
            };

            reader.onerror = (e) => console.error("Ошибка чтения файла:", e.target.error);

            if (fileExtension === "fb2") {
                reader.readAsText(file);
            } else if (fileExtension === "epub" || fileExtension === "pdf") {
                reader.readAsArrayBuffer(file);
            } else {
                console.error("Неподдерживаемый формат файла");
            }
        }
    };

    const handleDeleteBook = async (bookId) => {
        await bookStorage.deleteBook(bookId);
        setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    };

    const iconButtonStyle = {
        border: '1px solid #aaa',
        borderRadius: '12px',
        color: '#666',
        mt: '10px',
        width: 48,
        height: 48,
        mr: 1, // отступ между кнопками
    };

    return (
        <Container>
            {/* Верхняя панель с иконками, выровненными по правому краю */}
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
                <IconButton
                    component="label"
                    sx={iconButtonStyle}
                >
                    <AddIcon />
                    <input type="file" hidden onChange={handleFileUpload} />
                </IconButton>
                <IconButton
                    onClick={() => navigate("/sync")}
                    sx={{ ...iconButtonStyle, mr: 0 }}
                >
                    <SyncIcon />
                </IconButton>
            </Box>

            {/* Список книг */}
            <List>
                {books.map((book, index) => (
                    <BookListItem key={index} book={book} handleDelete={handleDeleteBook} />
                ))}
            </List>
        </Container>
    );
};

export default BookLibrary;
