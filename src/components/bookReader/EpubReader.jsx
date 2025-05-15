import React, { useRef, useState } from "react";
import { ReactReader } from "react-reader";
import {Box} from "@mui/material";

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
            <div style={{ height: "100vh" }}>
                <ReactReader
                    locationChanged={locationChanged}
                    url={file}
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