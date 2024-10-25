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

class Line {
    private points: { x: number; y: number }[] = [];

    constructor(initialX: number, initialY: number) {
        this.points.push({ x: initialX, y: initialY });
    }

    public drag(x: number, y: number): void {
        this.points.push({ x, y });
    }

    public display(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;

        this.points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
        ctx.closePath();
    }
}

//variables for canvas
const lines: Line[] = [];
const redoStack: Line[] = [];
let currentLine: Line | null = null;
let isDrawing = false;

//context
const context = canvas.getContext("2d");

//event listener for when click starts
canvas.addEventListener("mousedown", (e) => {
    redoStack.length = 0;

    const x = e.offsetX;
    const y = e.offsetY;
    isDrawing = true;

    currentLine = new Line(x, y);
    lines.push(currentLine);
});
//event listener for how mouse moves
canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentLine) {
        const newX = e.offsetX;
        const newY = e.offsetY;
        currentLine.drag(newX, newY);

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
        line.display(context);
    });
});

//creating the clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.appendChild(clearButton);

//clear the canvas
clearButton.addEventListener("click", () => {
    lines.length = 0;
    redoStack.length = 0;
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
});

//creating the undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
app.appendChild(undoButton);

//undo the last action
undoButton.addEventListener("click", () => {
    if (lines.length > 0) {
        const previousLine = lines.pop();
        if (previousLine) {
            redoStack.push(previousLine);
        }
    }
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
});

//creating the redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
app.appendChild(redoButton);

//redo the last action
redoButton.addEventListener("click", () => {
    if (redoStack.length > 0) {
        const previousLine = redoStack.pop();
        if (previousLine) {
            lines.push(previousLine);
        }
    }
    const event = new Event("drawing-changed");
    canvas.dispatchEvent(event);
});