import {ArrowBackIos, ArrowForwardIos} from "@mui/icons-material";
import { motion } from "framer-motion";

const PageNavigation = ({ currentPage, totalPages, onPageChange, textContentWidth, pageMode }) => {

    function calculateSideWidth() {
        return (window.innerWidth - textContentWidth) / 2;
    }

    return (
        <>
            {currentPage > 0 && (
                <motion.div
                    style={{ ...styles.arrow, ...styles.arrowLeft, width: calculateSideWidth() }}
                    onClick={() => onPageChange(currentPage - (pageMode === "single" ? 1 : 2))}
                    whileHover={{ opacity: 0.6 }}
                    whileTap={{ scale: 0.95 }}>
                    <ArrowBackIos sx={styles.icon} />
                </motion.div>
            )}

            {currentPage < totalPages - 1 && (
                <motion.div
                    style={{ ...styles.arrow, ...styles.arrowRight, width: calculateSideWidth() }}
                    onClick={() => onPageChange(currentPage + (pageMode === "single" ? 1 : 2))}
                    whileHover={{ opacity: 0.6 }}
                    whileTap={{ scale: 0.95 }}>
                    <ArrowForwardIos sx={styles.icon} />
                </motion.div>
            )}
        </>
    );
}

const styles = {
    arrow: {
        position: "absolute",
        top: 0,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
        opacity: 0.2,
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        userSelect: "none"
    },
    arrowLeft: {
        left: 0,
        borderRadius: "0 12px 12px 0",
    },
    arrowRight: {
        right: 0,
        borderRadius: "12px 0 0 12px",
    },
    icon: {
        fontSize: "2rem",
        color: "rgba(0,0,0,0.8)",
    },
};


export default PageNavigation;