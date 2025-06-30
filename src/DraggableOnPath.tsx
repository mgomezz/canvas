import React, { useRef, useState, useEffect } from 'react';

type Props = {
    pathD: string; // SVG path data for the area
    initialPos: { x: number; y: number };
    radius: number;
    width: number;
};

export const DraggableOnPath: React.FC<Props> = ({ pathD, initialPos, radius, width }) => {
    const [pos, setPos] = useState(initialPos);
    const dragging = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const svgPathRef = useRef<SVGPathElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to convert mouse event to SVG coords
    function getSVGPointFromEvent(e: MouseEvent | React.MouseEvent) {
        if (!svgRef.current) return null;
        const pt = svgRef.current.createSVGPoint();
        pt.x = (e as MouseEvent).clientX;
        pt.y = (e as MouseEvent).clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm) return null;
        return pt.matrixTransform(ctm.inverse());
    }

    // Checks if a circle is fully inside the path area
    function isCircleFullyInsidePath(
        x: number,
        y: number,
        radius: number,
        path2d: Path2D,
        ctx: CanvasRenderingContext2D,
    ) {
        const steps = 12; // test 12 points around circle
        for (let i = 0; i < steps; i++) {
            const angle = (2 * Math.PI * i) / steps;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            if (!ctx.isPointInPath(path2d, px, py)) {
                return false;
            }
        }
        return true;
    }

    function handleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        dragging.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e: MouseEvent) {
        if (!dragging.current) return;
        const point = getSVGPointFromEvent(e);
        if (!point) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const path2d = new window.Path2D(pathD);
        if (isCircleFullyInsidePath(point.x, point.y, radius, path2d, ctx)) {
            setPos({ x: point.x, y: point.y });
        }
    }

    function handleMouseUp() {
        dragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }

    // Draw the path on canvas for hit testing (not visible)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, 0);
        const path2d = new window.Path2D(pathD);
        ctx.save();
        ctx.fillStyle = '#ccc';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fill(path2d);
        ctx.stroke(path2d);
        ctx.restore();
    }, [pathD, width, 0]);

    return (
        <div style={{ position: 'relative', width }}>
            {/* Hidden canvas for hit testing */}
            <canvas ref={canvasRef} width={width} style={{ display: 'none' }} />
            <svg ref={svgRef} viewBox="0 0 1512.41 3927.08">
                <path ref={svgPathRef} d={pathD} fill="#eee" stroke="#444" strokeWidth={2} />
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill="#3498db"
                    stroke="#2c3e50"
                    strokeWidth={2}
                    onMouseDown={handleMouseDown}
                    style={{ cursor: 'pointer' }}
                />
            </svg>
        </div>
    );
};
