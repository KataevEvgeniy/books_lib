import React, {useEffect, useState} from "react";
import { Box, Grid2 as Grid, Button, Modal, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PageNavigation from "./PageNavigation.jsx";
import FB2Parser from "./FB2Parser.jsx";
import FB2TitlePage from "./FB2TitlePage.jsx";

const FB2Reader = ({ file, fontSize, pageMode, height, width, onChangePage, lastPageNum = 0, onLoadPages, book }) => {
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(lastPageNum);
    const [showDetails, setShowDetails] = useState(false);
    const [bookDescription, setBookDescription] = useState({});

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        if (onChangePage) {
            onChangePage(newPage + 1, pages.length);
        }
    };

    useEffect(() => {
        console.log(pageMode);
    },[pageMode]);

    const onLoadDescription = (description) => {
        setBookDescription(description);
    };

    return (
        <div>
            {/* Кнопка "Подробнее" */}
            <Button variant="contained" onClick={() => setShowDetails(true)} sx={{ marginBottom: 2 }}>
                Подробнее
            </Button>

            {/* Навигация по страницам */}
            <PageNavigation currentPage={currentPage} totalPages={pages.length} onPageChange={handlePageChange} pageMode={pageMode} textContentWidth={width} />

            {/* Режим двойной страницы */}
            {pageMode === "double" && (
                <>
                <Grid container spacing={2}>
                    <Grid item size={6} >
                        {pages[currentPage] &&
                            pages[currentPage].map((html, index) => (
                                <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
                            ))}
                    </Grid>
                    <Grid item size={6} >
                        {pages[currentPage + 1] &&
                            pages[currentPage + 1].map((html, index) => (
                                <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
                            ))}
                    </Grid>
                </Grid>
                </>
            )}

            {/* Режим одиночной страницы */}
            {pageMode === "single" && (
                <Grid container spacing={2}>
                    <Grid item size={12} style={{ scrollbarWidth: "none" }}>
                        {pages[currentPage] &&
                            pages[currentPage].map((html, index) => (
                                <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
                            ))}
                    </Grid>
                </Grid>
            )}

            {/* Парсер FB2 */}
            <FB2Parser width={width} currentPage={currentPage} pageMode={pageMode} fontSize={fontSize} height={height} onLoadDescription={onLoadDescription} setPages={setPages} onLoadPages={onLoadPages} file={file} />

            {/* Модальное окно с описанием книги */}
            <Modal open={showDetails} onClose={() => setShowDetails(false)} aria-labelledby="book-details-modal">
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <IconButton
                        onClick={() => setShowDetails(false)}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <FB2TitlePage book={bookDescription} />
                </Box>
            </Modal>
        </div>
    );
};

export default FB2Reader;
