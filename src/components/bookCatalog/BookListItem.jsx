import { Box, LinearProgress, Typography, IconButton } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {bookStorage, Fb2Data} from "../Utilities/BookStorage.js";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

function BookListItem({ book, handleDelete }) {
    const [progress, setProgress] = useState(book?.metadata?.currentPage / book?.metadata?.totalPages || 0);
    const navigate = useNavigate();

    const getBackgroundColor = (progress) => {
        const red = progress < 50 ? 235 : Math.round(235 - (progress - 50) * 4.6);
        const green = progress > 50 ? 235 : Math.round(progress * 4.6);
        return `rgb(${red}, ${green}, 0)`;
    };

    const handleOpenBook = (bookId) => {
        bookStorage.updateBookMetadataField(bookId, "lastOpenDate", Date.now());
        navigate("/book/" + bookId);
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",

                marginBottom: "12px",
                cursor: "pointer",
                position: "relative",
                transition: "background-color 0.3s ease",
                "&:hover": {
                    backgroundColor: "#f9f9f9",
                },
            }}
        >
            <Box
                component="img"
                src={book?.metadata?.image || "default-image.jpg"}
                alt={book?.metadata?.title || "Book Image"}
                sx={{
                    width: 80,
                    height: 120,
                    borderStartStartRadius: "8px",
                    borderEndStartRadius: "8px",
                    marginRight: "16px",
                    objectFit: "cover",
                }}
            />
            <Box sx={{ flexGrow: 1 }}>
                <IconButton
                    onClick={() => handleDelete(book?.id)}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "red",
                    }}
                >
                    <DeleteForeverIcon />
                </IconButton>
                <div onClick={() => handleOpenBook(book?.id)}>
                    <Typography variant="h6" component="div" gutterBottom>
                        {book?.metadata?.title || "Untitled Book"}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" gutterBottom>
                        <Typography variant="body2" color="text.secondary">
                            {book?.metadata?.author || "Unknown"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ marginRight: "16px",fontStyle: "italic" }}>
                            {("*." + book?.fileType) || "N/A"}
                        </Typography>
                    </Box>
                    <Box sx={{ marginTop: "8px" }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress * 100}
                            sx={{
                                height: 8,
                                borderRadius: "4px",
                                backgroundColor: "#e0e0e0",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: getBackgroundColor(progress * 100),
                                },
                            }}
                        />
                    </Box>
                </div>
            </Box>
        </Box>
    );
}

export default BookListItem;