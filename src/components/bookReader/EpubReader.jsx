import React, { useRef, useState } from "react";
import {ReactReader, ReactReaderStyle} from "react-reader";
import {FlowLibraryButton} from "./Toolbar.jsx"
import {Box} from "@mui/material";

const darkReaderTheme = {
    ...ReactReaderStyle,
    tocButton: {
        background: "none",
        border: "none",
        width: 32,
        height: 32,
        position: "absolute",
        top: 10,
        right: 10,
        borderRadius: 2,
        outline: "none",
        cursor: "pointer"
    },
    readerArea: {
        position: "relative",
        zIndex: 1,
        height: "100%",
        width: "100%",
        backgroundColor: "#FAF3E0",
        transition: "all .3s ease"
    },
    containerExpanded: {
        transform: "translateX(-256px)"
    },
    tocArea: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
        width: 256,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#f2f2f2",
        padding: "10px 0"
    },
}

const EpubReader = ({ file }) => {
    const [page, setPage] = useState(""); // Текущая страница в главе
    const renditionRef = useRef(null); // Ссылка на rendition
    const tocRef = useRef(null); // Ссылка на оглавление

    const locationChanged = (epubcifi) => {
        if (renditionRef.current && tocRef.current) {
            const { displayed, href } = renditionRef.current.location.start;
            const chapter = tocRef.current.find((item) => item.href === href);
            setPage(
                `Page ${displayed.page} of ${displayed.total} in chapter ${
                    chapter ? chapter.label : "n/a"
                }`
            );
        }
    };

    return (
        <Box sx={{width:"100%"}}>
            <FlowLibraryButton/>
            <div style={{ height: "100vh" }}>
                <ReactReader
                    locationChanged={locationChanged}
                    url={file}
                    readerStyles={darkReaderTheme}
                    getRendition={(rendition) => (renditionRef.current = rendition)}
                    tocChanged={(toc) => (tocRef.current = toc)}
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    right: "1rem",
                    left: "1rem",
                    textAlign: "center",
                    zIndex: 1,
                }}
            >
                {page}
            </div>
        </Box>
    );
};

export default EpubReader;