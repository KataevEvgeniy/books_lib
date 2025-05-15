import React from "react";
import { Card, CardContent, CardMedia, Typography, Box, Divider } from "@mui/material";

const FB2TitlePage = ({ book }) => {
    return (
        <Card sx={{ maxWidth: 500, margin: "auto", boxShadow: 3, display: "flex", flexDirection: "column" }}>
            {/* Обложка книги */}
            {book.coverImage && (
                <CardMedia
                    component="img"
                    sx={{ width: "100%", maxHeight: 180, objectFit: "cover" }}
                    image={book.coverImage}
                    alt={book.bookTitle}
                />
            )}

            {/* Контент с прокруткой */}
            <CardContent sx={{ padding: 2, maxHeight: 400, overflowY: "auto" }}>
                {book.bookTitle && (
                    <Typography variant="h6" gutterBottom>
                        {book.bookTitle}
                    </Typography>
                )}

                {book.author && (
                    <Typography variant="body2" color="text.secondary">
                        <strong>Автор:</strong> {book.author}
                    </Typography>
                )}

                {book.genre && (
                    <Typography variant="body2" color="text.secondary">
                        <strong>Жанр:</strong> {book.genre}
                    </Typography>
                )}

                {book.language && (
                    <Typography variant="body2" color="text.secondary">
                        <strong>Язык:</strong> {book.language}
                    </Typography>
                )}

                {book.annotation && book.annotation.length > 0 && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        {book.annotation.map((paragraph, index) => (
                            <Typography key={index} variant="body2" paragraph sx={{ marginBottom: 1 }}>
                                {paragraph}
                            </Typography>
                        ))}
                        <Divider sx={{ my: 1 }} />
                    </>
                )}

                {book.publishInfo && (
                    <>
                        {book.publishInfo.publisher && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>Издатель:</strong> {book.publishInfo.publisher}
                            </Typography>
                        )}
                        {book.publishInfo.city && book.publishInfo.year && (
                            <Typography variant="body2" color="text.secondary">
                                {book.publishInfo.city}, {book.publishInfo.year}
                            </Typography>
                        )}
                        {book.publishInfo.isbn && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>ISBN:</strong> {book.publishInfo.isbn}
                            </Typography>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default FB2TitlePage;
