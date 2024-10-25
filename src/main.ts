import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

//creating the app title
document.title = APP_NAME;
const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

//creating the canvas
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

//variables for canvas
const lines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[] | null = null;
let isDrawing = false;
let x = 0;
let y = 0;

//context
const context = canvas.getContext("2d");

//event listener for when click starts
canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;

    currentLine = [];
    lines.push(currentLine);
    currentLine.push({ x, y });
});
//event listener for how mouse moves
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        const newX = e.offsetX;
        const newY = e.offsetY;
        currentLine.push({ x: newX, y: newY });

        const event = new Event("drawing-changed");
        canvas.dispatchEvent(event);
    }
});
//event listener for when click stops
window.addEventListener("mouseup", (e) => {
    if (isDrawing) {
        isDrawing = false;
        currentLine = null;
    }
});
//listener for drawing changed
canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "black";
    context.lineWidth = 1;

    lines.forEach((line) => {
        context.beginPath();
        line.forEach((point, index) => {
            if (index == 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        });
        context.stroke();
        context.closePath();
    });
});

//creating the clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.appendChild(clearButton);

//clear the canvas
clearButton.addEventListener("click", () => {
    lines.length = 0;
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
});
