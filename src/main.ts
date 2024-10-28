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

class StickerPreview {
    private x: number;
    private y: number;
    private sticker: string;

    constructor(sticker: string, x: number, y: number) {
        this.sticker = sticker;
        this.x = x;
        this.y = y;
    }

    public updatePosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.font = "32px monospace";
        ctx.fillText(this.sticker, this.x - 16, this.y + 16);
    }
}

class StickerLine {
    private x: number;
    private y: number;
    private sticker: string;

    constructor(sticker: string, x: number, y: number) {
        this.sticker = sticker;
        this.x = x;
        this.y = y;
    }

    public display(ctx: CanvasRenderingContext2D): void {
        ctx.font = "32px monospace";
        ctx.fillText(this.sticker, this.x - 16, this.y + 16);
    }
}

//variables for canvas
const lines: Line[] = [];
const stickers: StickerLine[] = [];
const redoStack: Line[] = [];
let currentLine: Line | null = null;
let isDrawing = false;
let currentThickness = 1;
let cursorPreview: CursorPreview | null = null;
// Sticker emojis
const emojiStickers = ["🌟", "🍕", "🎉"];
let currentSticker: string | null = null;
let stickerPreview: StickerPreview | null = null;

//context
const context = canvas.getContext("2d");

//event listener for when click starts
canvas.addEventListener("mousedown", (e) => {
    const x = e.offsetX;
    const y = e.offsetY;

    if (currentSticker) {
        const stickerLine = new StickerLine(currentSticker, x, y);
        stickers.push(stickerLine);
        const event = new Event("drawing-changed");
        canvas.dispatchEvent(event);
    } else {
        redoStack.length = 0;
        isDrawing = true;
        currentLine = new Line(x, y, currentThickness);
        lines.push(currentLine);
    }
});
//event listener for how mouse moves
canvas.addEventListener("mousemove", (e) => {
    const newX = e.offsetX;
    const newY = e.offsetY;

    if (currentSticker) {
        if (!stickerPreview) {
            stickerPreview = new StickerPreview(currentSticker, newX, newY);
        } else {
            stickerPreview.updatePosition(newX, newY);
        }
        const event = new Event("tool-moved");
        canvas.dispatchEvent(event);
    }
    else if (!isDrawing) {
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

    lines.forEach((line) => line.display(context));
    stickers.forEach((sticker) => sticker.display(context));
    if (cursorPreview) {
        cursorPreview.draw(context);
    }
    if (stickerPreview) {
        stickerPreview.draw(context);
    }
});

//listener for cursor moving
canvas.addEventListener("tool-moved", () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((line) => line.display(context));
    stickers.forEach((sticker) => sticker.display(context));

    // Draw cursor or sticker preview
    if (cursorPreview && !currentSticker) {
        cursorPreview.draw(context);
    }
    if (stickerPreview && currentSticker) {
        stickerPreview.draw(context);
    }
});

//creating buttons for thin and thick markers
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
app.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
app.appendChild(thickButton);

//set thickness to thin
thinButton.addEventListener("click", () => {
    currentThickness = 1;
});

//set thickness to thin
thickButton.addEventListener("click", () => {
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
    stickers.length = 0;
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


//creating the create sticker button
const createButton = document.createElement("button");
createButton.textContent = "Create Sticker";
app.appendChild(createButton);

createButton.addEventListener("click", () => {
    const text = prompt("Custom sticker text", "♥");
    emojiStickers.push(text);
    const stickerButton = document.createElement("button");
    stickerButton.textContent = text;
    app.appendChild(stickerButton);

    stickerButton.addEventListener("click", () => {
        currentSticker = text;
        stickerPreview = new StickerPreview(text, canvas.width / 2, canvas.height / 2);
        const event = new Event("tool-moved");
        canvas.dispatchEvent(event);
    });
});

//creating sticker buttons
emojiStickers.forEach((sticker) => {
    const stickerButton = document.createElement("button");
    stickerButton.textContent = sticker;
    app.appendChild(stickerButton);

    stickerButton.addEventListener("click", () => {
        currentSticker = sticker;
        stickerPreview = new StickerPreview(sticker, canvas.width / 2, canvas.height / 2);
        const event = new Event("tool-moved");
        canvas.dispatchEvent(event);
    });
});