import React, { useState, useEffect, useRef } from "react";
import {BrowserRouter as Router, Routes, Route, Navigate, useParams} from "react-router-dom";
import BookLibrary from "./components/bookCatalog/BookLibrary.jsx";
import BookReader from "./components/bookReader/BookReader.jsx";
import {bookStorage} from "./components/Utilities/BookStorage.js";
import BookSyncPage from "./components/bookCatalog/BookSyncPage.jsx";


const App = () => {
    const [selectedBook, setSelectedBook] = useState(null);

    return (

        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/library" />} />
                <Route path="/library" element={<BookLibrary />} />
                <Route path="/book/:id" element={<BookReaderWrapper />} />
                <Route path="/sync" element={<BookSyncPage />} />
            </Routes>
        </Router>
    );
};

const BookReaderWrapper = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            const foundBook = await bookStorage.getBookById(id);
            setBook(foundBook);
            setLoading(false);
        };

        fetchBook();
    }, [id]);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return book ? <BookReader book={book} /> : <div>Книга не найдена</div>;
};


export default App;
