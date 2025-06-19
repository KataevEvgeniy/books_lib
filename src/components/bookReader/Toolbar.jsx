import {
    Box,
    Button,
    Typography,
    Slider,
    ToggleButtonGroup,
    ToggleButton,
    LinearProgress,
    IconButton
} from "@mui/material";
import SinglePageIcon from "@mui/icons-material/LooksOne";
import TwoPageIcon from "@mui/icons-material/LooksTwo";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = () => {
    const navigate = useNavigate(); // Получаем функцию навигации

    return (
        <Button variant="outlined" onClick={() => navigate("/library")} sx={{ flexShrink: 0 }}>
            Back to Library
        </Button>
    );
};

export const FlowLibraryButton = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 1000,
            }}
        >
            <IconButton
                onClick={() => navigate("/library")}
                sx={{
                    border: '1px solid #aaa',
                    borderRadius: '12px',
                    color: '#666',
                    width: 48,
                    height: 48,
                    backgroundColor: '#fff',
                    boxShadow: 1,
                }}
            >
                <ArrowBackIcon />
            </IconButton>
        </Box>
    );
};


const FontSizeSlider = ({ fontSize, setFontSize }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ flexShrink: 0 }}>
            Font Size: {fontSize}px
        </Typography>
        <Slider
            value={fontSize}
            min={12}
            max={22}
            step={2}
            onChange={(event, newValue) => setFontSize(newValue)}
            valueLabelDisplay="auto"
            sx={{ flexGrow: 1 }}
        />
    </Box>
);

const PageModeToggle = ({ pageMode, setPageMode }) => (
    <ToggleButtonGroup
        value={pageMode}
        exclusive
        onChange={(event, newMode) => setPageMode(newMode)}
        aria-label="page mode"
        sx={{ flexShrink: 0, marginLeft: 2 }}
    >
        <ToggleButton value="single" aria-label="single page mode" sx={{ padding: "4px 8px" }}>
            <SinglePageIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>Single</Typography>
        </ToggleButton>
        <ToggleButton value="double" aria-label="two page mode" sx={{ padding: "4px 8px" }}>
            <TwoPageIcon fontSize="small" />
            <Typography sx={{ ml: 0.5, fontSize: "0.8rem" }}>Double</Typography>
        </ToggleButton>
    </ToggleButtonGroup>
);

const ProgressBar = ({ progress }) => (
    <Box
        sx={{
            height: "25px",
            display: "flex",
            position: "relative",
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
        }}
    >
        <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
                height: 10,
                zIndex: 0,
                borderRadius: 4,
                backgroundColor: "#6c6c6c",
                width: '100%',
                "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                },
            }}
        />

        {/* Percentage text with Skyrim-style font and background */}
        <Typography
            variant="body2"
            sx={{
                position: "absolute",
                zIndex: 1,
                borderRadius: 5,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
                padding: "2px 5px",
            }}
        >
            {`${Math.round(progress)}%`}
        </Typography>
    </Box>
);

const Toolbar = ({ fontSize, setFontSize, pageMode, setPageMode, progress }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
        }}
    >
        <Box
            sx={{

                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                width: "100%"
            }}
        >
            <BackButton />
            <FontSizeSlider fontSize={fontSize} setFontSize={setFontSize} />
            <PageModeToggle pageMode={pageMode} setPageMode={setPageMode} />
        </Box>
        <ProgressBar progress={progress} />
    </Box>
);

export default Toolbar;