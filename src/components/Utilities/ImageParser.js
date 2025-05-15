import {createNoise2D} from "simplex-noise";

function parseImageFb2(file) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(file, "application/xml");
        let binary = xmlDoc.querySelector("binary");
        const type = binary.getAttribute("content-type");
        const data = binary.textContent.replace(/\s+/g, "");
        let binaryData = {type: type, data: data};
        return `data:${binaryData.type};base64,${binaryData.data}`;
    } catch (error) {
        console.log(error);
        return null;
    }
}

function parseMetaDataFb2(file, dataFields) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(file, "application/xml");

        // Create an object to store the extracted data
        const extractedData = {};

        // Loop through each field requested in the dataFields array
        dataFields.forEach(field => {
            switch (field) {
                case "image": {
                    try{
                        let binaryElement = xmlDoc.querySelector("binary");
                        const type = binaryElement.getAttribute("content-type");
                        const data = binaryElement.textContent.replace(/\s+/g, "");
                        extractedData[field] = `data:${type};base64,${data}`;

                    } catch (error) {
                        console.log(error);
                        extractedData.binary = null;
                    }
                    break;
                }

                case "title": {
                    let bookTitleElement = xmlDoc.querySelector("book-title");
                    if (bookTitleElement) {
                        extractedData[field] = bookTitleElement.textContent.replace(/\s+/g, ' ').trim();
                    }
                    break;
                }

                case "author":{
                    let authorElement = xmlDoc.querySelector("author");
                    if (authorElement) {
                        extractedData[field] = authorElement.textContent.replace(/\s+/g, ' ').trim();
                    }
                    break;
                }

                default:
                    break;
            }
        });
        console.log(extractedData);
        return extractedData;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const generateSimplexNoise = (canvas, ctx) => {
    const noise2D = createNoise2D(); // Create a noise function
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    // Array of color objects with a base color (RGB) and a dark shade (RGB)
    const colorOptions = [
        {color: "rgb(255, 182, 182)", darkShade: "rgb(153, 77, 77)"},    // Light Red / Pastel Red
        {color: "rgb(255, 255, 153)", darkShade: "rgb(128, 128, 0)"},      // Light Yellow / Pastel Yellow
        {color: "rgb(182, 255, 182)", darkShade: "rgb(77, 128, 77)"},      // Light Green / Pastel Green
        {color: "rgb(182, 255, 255)", darkShade: "rgb(77, 128, 128)"},     // Light Cyan / Pastel Cyan
        {color: "rgb(182, 182, 255)", darkShade: "rgb(77, 77, 128)"},      // Light Blue / Pastel Blue
        {color: "rgb(255, 182, 255)", darkShade: "rgb(128, 77, 128)"}      // Light Magenta / Pastel Magenta
    ];

    // Function to randomly pick a color option from the array
    const getRandomColorOption = () => {
        const randomIndex = Math.floor(Math.random() * colorOptions.length);
        return colorOptions[randomIndex];
    };

    // Function to convert an RGB string to an array of [r, g, b] values
    const rgbStringToArray = (rgbString) => {
        const values = rgbString.match(/\d+/g);
        return values ? values.map(Number) : [0, 0, 0];
    };

    const {color, darkShade} = getRandomColorOption();

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            // Adjust the divisor to control the scale of the noise (lower divisor = larger noise)
            const value = (noise2D(x / 100, y / 100) + 1) * 128; // Larger noise
            const threshold = 128; // Threshold for binarization (128 for roughly 50% black/white)
            const isWhite = value > threshold; // Binary decision: true = white, false = black

            const index = (y * canvas.width + x) * 4;

            // Randomly choose a color option


            // If the noise value is above the threshold, it's white (255); otherwise, black (0)
            const chosenColor = rgbStringToArray(isWhite ? color : darkShade);

            data[index] = chosenColor[0];       // R
            data[index + 1] = chosenColor[1];   // G
            data[index + 2] = chosenColor[2];   // B
            data[index + 3] = 255;              // Alpha
        }
    }
    ctx.putImageData(imageData, 0, 0);
};

function generateTextImage(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 200;
    canvas.height = 400;

    generateSimplexNoise(canvas, ctx);

    const words = text.split(" ");
    const longestWord = words.reduce((a, b) => (a.length > b.length ? a : b), "");
    const fontSize = Math.min(40, Math.floor(canvas.width / longestWord.length * 1.5));

    ctx.fillStyle = "#000000";
    ctx.font = `${fontSize}px Montserrat, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    const shadowLayers = [
        {color: "#ffffff", blur: 90},
        {color: "#ffffff", blur: 80},
        {color: "#ffffff", blur: 70},
        {color: "#ffffff", blur: 60},
        {color: "#ffffff", blur: 50},
        {color: "#ffffff", blur: 40},
        {color: "#ffffff", blur: 30},
        {color: "#ffffff", blur: 20},
        {color: "#ffffff", blur: 10}
    ];


    shadowLayers.forEach((layer, index) => {
        ctx.shadowColor = layer.color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = layer.blur;

        let y = (canvas.height - (words.length * fontSize)) / 2 + fontSize / 2;
        words.forEach((word) => {
            ctx.fillText(word, canvas.width / 2, y); // Draw the text with the second shadow
            y += fontSize;
        });
    });

    return canvas.toDataURL("image/png");
}


export {parseMetaDataFb2, generateTextImage};