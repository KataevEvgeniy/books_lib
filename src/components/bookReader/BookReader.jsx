import React, {useEffect, useRef, useState, useCallback} from "react";
import EpubReader from "./EpubReader.jsx";
import FB2Reader from "./FB2/FB2Reader.jsx";
import PdfReader from "./PdfReader.jsx";
import {Box} from "@mui/material";

import {bookStorage} from "../Utilities/BookStorage.js";
import Toolbar from "./Toolbar.jsx";

// Хук для отслеживания размеров контейнера
const useContainerSize = (ref) => {
    const [size, setSize] = useState({width: 0, height: 0});

    useEffect(() => {
        const updateSize = () => {
            if (ref.current) {
                setSize({
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight,
                });
            }
        };

        const observer = new ResizeObserver(updateSize);
        if (ref.current) observer.observe(ref.current);

        window.addEventListener("resize", updateSize);
        updateSize(); // Первоначальное обновление

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateSize);
        };
    }, [ref]);

    return size;
};

const BookReader = ({book}) => {
    const [fontSize, setFontSize] = useState(16);
    const [pageMode, setPageMode] = useState("single");

    if (book.fileType === "epub") {
        return <EpubReader file={book.file}/>;
    }

    if (book.fileType === "pdf") {
        return <PdfReader file={book.file}/>;
    }

    if (book.fileType === "fb2") {
        const bookContainer = useRef(null);
        const containerSize = useContainerSize(bookContainer);
        const [progress, setProgress] = useState(0);

        const onChangePage = useCallback((currentPage, totalPages) => {
            setProgress((currentPage / totalPages) * 100);
            bookStorage.updateBookMetadataField(book.id, "currentPage", currentPage);
        }, [book.id]);

        const onLoadPages = useCallback((currentPage, totalPages) => {
            bookStorage.updateBookMetadataField(book.id, "totalPages", totalPages);
            setProgress((currentPage / totalPages) * 100);
        }, [book.id]);

        return (
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: {
                        xs: "90%", // для маленьких экранов (например, мобильных)
                        sm: "80%", // для планшетов
                        md: "70%", // для ноутбуков
                        lg: "60%", // для больших экранов
                        xl: "50%", // для ультрашироких экранов
                    },
                    margin: "0 auto", // центрирование контейнера по горизонтали
                }}
            >
                <Box sx={{display: "flex", flexDirection: "column", height: "100vh", width: "90%"}}>
                    <Toolbar
                        pageMode={pageMode}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        setPageMode={setPageMode}
                        progress={progress}
                    />
                    <Box ref={bookContainer} sx={{height: "90%"}}>
                        {containerSize.width > 0 && containerSize.height > 0 && (
                            <FB2Reader
                                file={book.file}
                                pageMode={pageMode}
                                fontSize={fontSize}
                                onChangePage={onChangePage}
                                onLoadPages={onLoadPages}
                                height={containerSize.height}
                                width={containerSize.width}
                                lastPageNum={book.metadata.currentPage}
                            />
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    return <div>Unsupported format</div>;
};

export default BookReader;
