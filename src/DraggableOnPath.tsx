import React, { useRef, useEffect, useState } from 'react';

export default function DraggableOnPath() {
    const [pos, setPos] = useState({ x: 200, y: 200 });
    const svgPathRef = useRef<SVGPathElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragging = useRef(false);

    // Draw the path on the canvas for hit testing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const path = svgPathRef.current;
        if (!path) return;
        const d = path.getAttribute('d');
        if (!d) return;
        const path2d = new window.Path2D(d);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = path.getAttribute('stroke') || 'black';
        ctx.lineWidth = Number(path.getAttribute('stroke-width')) || 1;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke(path2d);
    }, []);

    function isOnStroke(x: number, y: number) {
        const canvas = canvasRef.current;
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        const path = svgPathRef.current;
        if (!path) return false;
        const d = path.getAttribute('d');
        if (!d) return false;
        const path2d = new window.Path2D(d);
        ctx.lineWidth = Number(path.getAttribute('stroke-width')) || 1;
        return ctx.isPointInStroke(path2d, x, y);
    }

    function handleMouseMove(e: { clientX: number; clientY: number }) {
        if (!dragging.current) return;
        if (!svgPathRef.current || !svgPathRef.current.ownerSVGElement) return;
        const svg = svgPathRef.current.ownerSVGElement;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const { x, y } = pt.matrixTransform(ctm.inverse());
        if (isOnStroke(x, y)) {
            setPos({ x, y });
        }
    }

    function startDrag() {
        dragging.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopDrag);
    }

    function stopDrag() {
        dragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopDrag);
    }

    return (
        <div style={{ position: 'relative' }}>
            {/* Hidden canvas for hit testing */}
            <canvas ref={canvasRef} width={400} height={400} style={{ display: 'none' }} />
            <svg width={400} height={400} style={{ border: '1px solid gray' }}>
                <path
                    ref={svgPathRef}
                    d="M50,200 Q200,50 350,200 Q200,350 50,200 Z"
                    stroke="blue"
                    strokeWidth={10}
                    fill="none"
                />
                {/* Draggable element */}
                <circle cx={pos.x} cy={pos.y} r={8} fill="red" style={{ cursor: 'pointer' }} onMouseDown={startDrag} />
            </svg>
        </div>
    );
}
