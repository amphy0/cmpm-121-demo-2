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
canvas.style.cursor = "none";
app.append(canvas);

//line class
class Line {
    private points: { x: number; y: number }[] = [];
    private thickness: number;

    constructor(initialX: number, initialY: number, thickness: number) {
        this.points.push({ x: initialX, y: initialY });
        this.thickness = thickness;
    }

    public drag(x: number, y: number): void {
        this.points.push({ x, y });
    }

    public display(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = this.thickness;

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

//cursor preview class
class CursorPreview {
    private x: number;
    private y: number;
    private thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }

    public updatePosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fill();
        ctx.closePath();

        if (this.thickness == 1) {
            ctx.font = "12px monospace";
        } else {
            ctx.font = "32px monospace";
        }
        ctx.fillStyle = "black";
        ctx.fillText("*", this.x - 8, this.y + 16);
    }



}

//variables for canvas
const lines: Line[] = [];
const redoStack: Line[] = [];
let currentLine: Line | null = null;
let isDrawing = false;
let currentThickness = 1;

//
let cursorPreview: CursorPreview | null = null;

//context
const context = canvas.getContext("2d");

//event listener for when click starts
canvas.addEventListener("mousedown", (e) => {
    redoStack.length = 0;

    const x = e.offsetX;
    const y = e.offsetY;
    isDrawing = true;

    currentLine = new Line(x, y, currentThickness);
    lines.push(currentLine);
});
//event listener for how mouse moves
canvas.addEventListener("mousemove", (e) => {
    const newX = e.offsetX;
    const newY = e.offsetY;

    if (!isDrawing) {
        if (!cursorPreview) {
            cursorPreview = new CursorPreview(newX, newY, currentThickness);
        } else {
            cursorPreview.updatePosition(newX, newY);
        }
        const event = new Event("tool-moved");
        canvas.dispatchEvent(event);
    }

    if (isDrawing && currentLine) {
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
        cursorPreview = null;
    }
});
//listener for drawing changed
canvas.addEventListener("drawing-changed", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach((line) => {
        line.display(context);
    });

    if (cursorPreview) {
        cursorPreview.draw(context);
    }
});

//listener for cursor moving
canvas.addEventListener("tool-moved", () => {
    if (cursorPreview) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        lines.forEach((line) => {
            line.display(context);
        });
        cursorPreview.draw(context);
    }
});

//creating buttons for thin and thick markers
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.className = "tool-button";
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.className = "tool-button";
app.appendChild(thickButton);

//set thickness to thin
thinButton.addEventListener("click", () => {
    currentThickness = 1;
    context.font = "8px monospace";
});

//set thickness to thin
thickButton.addEventListener("click", () => {
    context.font = "32px monospace";
    currentThickness = 5;
});

//creating the clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear Canvas";
app.appendChild(clearButton);

//clear the canvas
clearButton.addEventListener("click", () => {
    lines.length = 0;
    redoStack.length = 0;
    cursorPreview = null;
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