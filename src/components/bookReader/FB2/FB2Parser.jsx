import React, {useEffect, useRef, useState} from "react";
import {Typography} from "@mui/material";
import styles from "../../../App.module.css";

const FB2Parser = ({width, height, file, fontSize,pageMode, setPages, onLoadPages,onLoadDescription, currentPage}) => {

    const containerRef = useRef();
    const testContainerRef = useRef();
    const [parsedContent, setParsedContent] = useState();
    const [fontSizeStyle, setFontSizeStyle] = useState("f"+fontSize);

    const parseDescription = (descNode, binaryImages) => {
        let description = {};

        const titleInfo = descNode.querySelector('title-info');
        if (titleInfo) {
            description.bookTitle = titleInfo.querySelector('book-title')?.textContent || "Untitled Book";
            description.genre = titleInfo.querySelector('genre')?.textContent || "Unknown Genre";
            description.language = titleInfo.querySelector('lang')?.textContent || "Unknown Language";

            const author = titleInfo.querySelector('author');
            if (author) {
                const firstName = author.querySelector('first-name')?.textContent || "";
                const middleName = author.querySelector('middle-name')?.textContent || "";
                const lastName = author.querySelector('last-name')?.textContent || "";
                description.author = `${firstName} ${middleName} ${lastName}`.trim();
            }

            const annotation = titleInfo.querySelector('annotation');
            if (annotation) {
                description.annotation = Array.from(annotation.querySelectorAll('p')).map(p => p.textContent.trim());
            }

            //description.coverImage = titleInfo.querySelector('coverpage image')?.getAttribute('l:href') || null;
            const href = titleInfo.querySelector('coverpage image')?.getAttribute('l:href')?.replace("#", "");
            description.coverImage = `data:${binaryImages[href]?.type};base64,${binaryImages[href]?.data}`;
        }

        const documentInfo = descNode.querySelector('document-info');
        if (documentInfo) {
            description.documentInfo = {
                nickname: documentInfo.querySelector('author nickname')?.textContent || "Unknown",
                programUsed: documentInfo.querySelector('program-used')?.textContent || "Unknown",
                date: documentInfo.querySelector('date')?.textContent || "Unknown Date",
                version: documentInfo.querySelector('version')?.textContent || "Unknown Version",
                id: documentInfo.querySelector('id')?.textContent || "Unknown ID",
            };
        }

        const publishInfo = descNode.querySelector('publish-info');
        if (publishInfo) {
            description.publishInfo = {
                publisher: publishInfo.querySelector('publisher')?.textContent || "Unknown Publisher",
                city: publishInfo.querySelector('city')?.textContent || "Unknown City",
                year: publishInfo.querySelector('year')?.textContent || "Unknown Year",
                isbn: publishInfo.querySelector('isbn')?.textContent || "Unknown ISBN",
            };
        }
        console.log(description)
        return description;
    }

    const parseFileToParsedContent = async (file, fontSize) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(file, "application/xml");

        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            console.log("Ошибка парсинга ",parseError)
        }

        let binaryData = {};
        Array.from(xmlDoc.querySelectorAll("binary")).forEach((binary) => {
            const id = binary.getAttribute("id");
            const type = binary.getAttribute("content-type");
            const data = binary.textContent.replace(/\s+/g, "");
            binaryData[id] = {type: type, data: data};
        });

        let notes = {};
        xmlDoc.querySelector('body[name="notes"]')?.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE && node.getAttribute("id")) {
                notes[node.getAttribute("id")] = <i>{node.textContent}</i>;
            }
        })

        const descNode = xmlDoc.querySelector('description');
        let description = parseDescription(descNode,binaryData);

        onLoadDescription(description);

        const defineElement = (node) => {
            const children = Array.from(node.childNodes).map(processNode);

            const renderers = {
                "genre": () => {},
                "first-name": () => {},
                "middle-name": () => {},
                "last-name": () => {},
                "author": () => {},
                "annotation": () => {},
                "date": () => {},
                "coverpage": () => {},
                "lang": () => {},
                "title-info": () => {},
                "nickname": () => {},
                "program-used": () => {},
                "src-ocr": () => {},
                "id": () => {},
                "version": () => {},
                "document-info": () => {},
                "publisher": () => {},
                "city": () => {},
                "year": () => {},
                "isbn": () => {},
                "publish-info": () => {},
                "description": () => {},
                "book-title": () => {},
                "epigraph": () => <div className="epigraph">{children}</div>,
                "p": () => <div className={`justify-text ${styles["f"+fontSize]}`}>{children}</div>,
                "title": () => <Typography variant={"h3"}>{children}</Typography>,
                "subtitle": () => <Typography variant={"h4"}>{children}</Typography>,
                "strong": () => <strong> {children} </strong>,
                "a": () => {
                    const href = node.getAttribute("l:href")?.replace("#", "");
                    if (node.getAttribute("type") === "note") {
                        return (
                            <>
                                <a href={href}>{children}</a> ({notes[href]})
                            </>
                        );
                    }
                    return <a href={node.getAttribute("l:href")}>{children}</a>;
                },
                "section": () => <section>{children}</section>,
                "cite": () => <cite>{children}</cite>,
                "sup": () => <sup>{children}</sup>,
                "sub": () => <sub>{children}</sub>,
                "emphasis": () => <em>{children}</em>,
                "empty-line": () => <div style={{height: "16px"}}/>,
                "body": () => <div className="container">{children}</div>,
                "binary": () => {
                },
                "image": () => {
                    const href = node.getAttribute("l:href")?.replace("#", "");
                    if (href && binaryData[href]) {
                        const src = `data:${binaryData[href].type};base64,${binaryData[href].data}`;
                        return <div style={{display:"flex",justifyContent:"center"}}> <img style={{maxHeight: "80%",maxWidth:"80%"}} src={src} alt=""/></div>;
                    }
                    return null;
                },
            };

            if (renderers[node.nodeName]) {
                return renderers[node.nodeName]();
            }

            console.log(`Неизвестный элемент: <${node.nodeName}>`);
            if (node.attributes.length > 0) {
                //Array.from(node.attributes).forEach(attr => console.log(` - ${attr.name}="${attr.value}"`));
            }

            return <div className="container">{children}</div>;
        };

        const processNode = (node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                //console.log(`Обрабатываем элемент: <${node.nodeName}>`);


                let element = defineElement(node);


                return element;
            } else if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
                //console.log(`Обнаружен текст: ${node.nodeValue.trim()}`);
                if (node.parentNode.nodeName === "binary") {
                    return ""
                } else {
                    return node.nodeValue.trim();
                }
            } else {
                return null;
            }
        };

        // Обработка корневого элемента и обновление состояния
        const result = processNode(xmlDoc.documentElement);
        setParsedContent(result);
        console.log("XML успешно обработан!");

    };

    useEffect(() => {
        console.log("------------------------------------------------");
        console.log("ширина " + width + " высота " + height + " fontSize " + fontSize + " pageMode " + pageMode);

        parseFileToParsedContent(file, fontSize);
    }, [file, width, height, fontSize, pageMode]);

    function splitElementByHeight(outerHTML, remainingHeight) {
        const testElement = testContainerRef.current;

        if (!testElement) {
            console.error('testContainerRef is not set to any element.');
            return [outerHTML, '', 0]; // Возвращаем пустые части и высоту 0, если контейнер не найден
        }

        function getElementHeight(childHtml) {
            testElement.firstElementChild.innerHTML = childHtml;

            return testElement.offsetHeight;
        }

        function splitTextIntoTwoParts(text) {

            const length = text.length;
            const midpoint = Math.ceil(length / 2); // Находим середину текста, округляя вверх

            const firstPart = text.slice(0, midpoint); // Первая часть текста
            const secondPart = text.slice(midpoint); // Вторая часть текста

            return [firstPart, secondPart];
        }

        function splitTextDichotomy(textContent, getElementHeight, remainingHeight, currentHeight) {
            let text = textContent;

            let firstPart = '';
            let secondPart = '';

            let isGood = false;

            for (let i = 0; i < 10 || !isGood; i++) {

                const [firstPartTemp, secondPartTemp] = splitTextIntoTwoParts(text);

                let fph = getElementHeight(firstPart + firstPartTemp);
                //console.log(`fph ${fph} == ${firstPart.length} + ${firstPartTemp.length}`)

                if (fph <= remainingHeight - currentHeight) {
                    firstPart += firstPartTemp;
                    text = secondPartTemp
                    isGood = true;
                } else {
                    secondPart = secondPartTemp + secondPart;
                    text = firstPartTemp;
                    isGood = false;
                }
                if (text.length < 5) {
                    break;
                }
            }
            secondPart = text + secondPart;

            return [firstPart, secondPart];
        }


        testElement.innerHTML = outerHTML;

        // Разделяем элемент, если его высота больше оставшейся


        let currentHeight = 0;

        const element = testElement.firstElementChild;

        // Создаем новые контейнеры для первой и второй части
        const firstPartContainer = element.cloneNode(false);
        const secondPartContainer = element.cloneNode(false);
        let lastPartIsFind = false;


        //testElement.innerHTML = element
        // Перебираем все дочерние элементы и добавляем их по частям

        let children = Array.from(element.childNodes);


        // console.log(children, firstPartContainer, secondPartContainer)
        //console.log(`Остаток = ${remainingHeight}px`);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            let childHeight = getElementHeight(child.nodeType === Node.TEXT_NODE ? child.textContent : child.outerHTML);

            if (lastPartIsFind) {
                //console.log(` - Высота ${childHeight}px`)
                secondPartContainer.appendChild(child);
                continue;
            }

            if (childHeight + currentHeight < remainingHeight) {
                //console.log(` - Высота ${childHeight}px`)
                currentHeight += childHeight;
                firstPartContainer.appendChild(child);
                continue;
            }

            // console.log(` ->>> Высота ${childHeight}px`)
            if (child.nodeType === Node.TEXT_NODE) {
                const textContent = child.textContent;
                const [firstPartText, secondPartText] = splitTextDichotomy(textContent, getElementHeight, remainingHeight, currentHeight);
                firstPartContainer.appendChild(document.createTextNode(firstPartText));
                secondPartContainer.appendChild(document.createTextNode(secondPartText));
                //console.log(firstPartText)
                //console.log(secondPartText)
            } else {
                const [firstPartHtml, secondPartHtml] = splitElementByHeight(child.outerHTML, remainingHeight - currentHeight);
                firstPartContainer.appendChild(firstPartHtml);
                secondPartContainer.appendChild(secondPartHtml);
            }
            lastPartIsFind = true;

        }

        // Вычисляем высоту второго контейнера
        const secondPartHeight = getElementHeight(secondPartContainer.outerHTML);
        //console.log("Высота второго контейнера:", secondPartHeight);

        // Возвращаем первый контейнер, второй контейнер и высоту второго
        return [firstPartContainer, secondPartContainer, secondPartHeight];
    }

    useEffect(() => {
        const container = containerRef.current;

        if (container) {
            // Устанавливаем шрифт для контейнера
            //container.style.fontSize = `${fontSize}px`;

            const maxHeight = height; // Высота одной страницы
            let sumHeight = 0;
            const calculatedPages = [];
            let currentPageElements = [];
            let pageTail = null;
            let pageTailHeight = 0;

            let megaSum = 0;


            //console.log("Starting to process the elements");

            function getElementHeightFromOuterHTML(outerHTML) {
                const testElement = testContainerRef.current;

                if (!testElement) {
                    //console.error('testContainerRef is not set to any element.');
                    return 0;
                }

                // Применяем внешний HTML в контейнер
                testElement.innerHTML = outerHTML;

                // Измеряем высоту элемента
                const innerHeight = testElement.firstElementChild.offsetHeight;

                return innerHeight;
            }

            // Рекурсивная функция для обработки элементов
            const processElement = (element) => {
                if (!element) return;

                if (pageTail) {
                    currentPageElements.push(pageTail.outerHTML);
                    sumHeight = pageTailHeight;
                    pageTail = null;
                }

                const elementHeight = element.offsetHeight;

                if (element.nodeName === "SECTION" ) {
                    if (currentPageElements.length > 0) {
                        calculatedPages.push(currentPageElements);
                        currentPageElements = [];
                        sumHeight = 0;
                    }
                    Array.from(element.children).forEach((child) => processElement(child));
                } else if ( element.className === "container" || element.className === "description"){
                    Array.from(element.children).forEach((child) => processElement(child));
                } else if (element.className === "justify-text" && sumHeight + elementHeight > maxHeight) {
                    //console.log(`стр:${calculatedPages.length+1}  текущ:${elementHeight} сумма:${sumHeight+elementHeight} >  макс:${maxHeight}`);
                    let parts = splitElementByHeight(element.outerHTML, maxHeight - sumHeight);
                    pageTailHeight = parts[2];
                    pageTail = parts[1];
                    currentPageElements.push(parts[0].outerHTML);
                    calculatedPages.push(currentPageElements);
                    currentPageElements = [];
                    megaSum += sumHeight;
                    sumHeight = 0;
                } else {


                    if (sumHeight + elementHeight > maxHeight) {
                        calculatedPages.push(currentPageElements);
                        currentPageElements = [];
                        currentPageElements.push(element.outerHTML);
                        sumHeight = elementHeight
                        //console.log(`стр:${calculatedPages.length+1}  текущ:${elementHeight} сумма:${sumHeight} >  макс:${maxHeight}`);
                        //console.log(element)
                    } else {
                        //console.log(`стр:${calculatedPages.length+1}  текущ:${elementHeight} сумма:${sumHeight+elementHeight} >  макс:${maxHeight}`);
                        //console.log(element)
                        sumHeight += elementHeight;
                        currentPageElements.push(element.outerHTML);
                    }


                    //Array.from(element.children).forEach((child) => processElement(child));
                }
            };

            // Запуск обработки всех корневых элементов
            Array.from(container.children).forEach((child) => processElement(child));


            //console.log(megaSum);
            // Добавить последнюю страницу, если есть элементы
            if (currentPageElements.length > 0) {
                //console.log("Adding last page.");
                calculatedPages.push(currentPageElements);
            }

            console.log(`Total pages calculated: ${calculatedPages.length}`);
            setPages(calculatedPages);
            //console.log(pages)
            console.log(height)
            onLoadPages(currentPage ,calculatedPages.length);
        }


    }, [parsedContent]);

    return (
        <>
            {/* Контейнер для измерений (скрытый) */}
            <div style={{display: "flex"}}>
                <div
                    ref={containerRef}
                    style={{
                        width: width / (pageMode === "single" ? 1 : 2),
                        fontSize: `${fontSize}px`,
                        visibility: "hidden"
                    }}
                    className="container"
                >
                    {parsedContent}
                </div>

            </div>
            <div
                ref={testContainerRef}
                style={{
                    width: width, /* ширина страницы */
                }}

            />
        </>
    )
};

export default FB2Parser;