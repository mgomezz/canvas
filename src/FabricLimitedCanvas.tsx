import React, { useRef, useEffect } from 'react';
import * as fabric from 'fabric';

const FabricLimitedCanvas: React.FC = () => {
    const canvasEl = useRef<HTMLCanvasElement>(null);
    const canvasRef = useRef<fabric.Canvas>();
    // these define the inner “allowed” square
    const canvasSize = 500;
    const squareSize = 400;
    const offset = (canvasSize - squareSize) / 2;

    useEffect(() => {
        if (!canvasEl.current) return;

        const canvas = new fabric.Canvas(canvasEl.current, {
            width: canvasSize,
            height: canvasSize,
            backgroundColor: '#fafafa',
        });
        canvasRef.current = canvas;

        // draw the non‐selectable square border
        const border = new fabric.Rect({
            left: offset,
            top: offset,
            width: squareSize,
            height: squareSize,
            fill: 'transparent',
            stroke: '#333',
            strokeWidth: 2,
            selectable: false,
            evented: false,
        });
        canvas.add(border);

        // helper to clamp an object inside the square
        function keepInBounds(obj: fabric.Object) {
            const w = obj.getScaledWidth();
            const h = obj.getScaledHeight();
            obj.set({
                left: Math.min(Math.max(obj.left ?? 0, offset), offset + squareSize - w),
                top: Math.min(Math.max(obj.top ?? 0, offset), offset + squareSize - h),
            });
        }

        // clamp on move/scale/rotate
        canvas.on('object:moving', (e: any) => keepInBounds(e.target as fabric.Object));
        canvas.on('object:scaling', (e: any) => keepInBounds(e.target as fabric.Object));
        canvas.on('object:rotating', (e: any) => keepInBounds(e.target as fabric.Object));

        return () => {
            canvas.dispose();
        };
    }, []);

    // add a rectangle centered in the square
    const addRect = () => {
        const canvas = canvasRef.current!;
        const rect = new fabric.Rect({
            width: 80,
            height: 60,
            fill: 'rgba(0,150,255,0.5)',
            left: offset + (squareSize - 80) / 2,
            top: offset + (squareSize - 60) / 2,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
    };

    // add a circle centered in the square
    const addCircle = () => {
        const canvas = canvasRef.current!;
        const radius = 40;
        const circle = new fabric.Circle({
            radius,
            fill: 'rgba(255,100,0,0.5)',
            left: offset + (squareSize - radius * 2) / 2,
            top: offset + (squareSize - radius * 2) / 2,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
    };

    // add simple text in the center
    const addText = () => {
        const canvas = canvasRef.current!;
        const text = new fabric.Textbox('Hello', {
            width: 100,
            fontSize: 24,
            left: offset + (squareSize - 100) / 2,
            top: offset + (squareSize - 24) / 2,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    return (
        <div>
            <div style={{ marginBottom: 8 }}>
                <button onClick={addRect}>Add Rectangle</button>
                <button onClick={addCircle}>Add Circle</button>
                <button onClick={addText}>Add Text</button>
            </div>
            <canvas ref={canvasEl} />
        </div>
    );
};

export default FabricLimitedCanvas;
