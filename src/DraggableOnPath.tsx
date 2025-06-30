import React, { useEffect, useRef, useState } from 'react';

type Props = {
    pathLimit: string; // SVG path data for limit area without draggable and edit
    pathDraggableAndEditable: string; // SVG path data for draggable and editable area
    initialPos: { x: number; y: number };
    width: number;
    svgViewBox: string; // viewBox for the SVG
};

export const DraggableOnPath: React.FC<Props> = ({
    pathLimit,
    pathDraggableAndEditable,
    initialPos,
    width,
    svgViewBox,
}) => {
    const [pos, setPos] = useState(initialPos);
    const dragging = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const svgPathRef = useRef<SVGPathElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Helper to convert mouse event to SVG coords
    const getSVGPointFromEvent = (e: MouseEvent | React.MouseEvent) => {
        if (!svgRef.current) return null;
        const pt = svgRef.current.createSVGPoint();
        pt.x = (e as MouseEvent).clientX;
        pt.y = (e as MouseEvent).clientY;
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm) return null;
        return pt.matrixTransform(ctm.inverse());
    };

    // Checks if a circle is fully inside the path area
    const isCircleFullyInsidePath = (
        x: number,
        y: number,
        radius: number,
        path2d: Path2D,
        ctx: CanvasRenderingContext2D,
    ) => {
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
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        const point = getSVGPointFromEvent(e);
        if (!point) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const path2d = new window.Path2D(pathDraggableAndEditable);

        //TODO:add here use cases for different shapes
        //to check circles
        if (isCircleFullyInsidePath(point.x, point.y, 20, path2d, ctx)) {
            setPos({ x: point.x, y: point.y });
        }
    };

    const handleMouseUp = () => {
        dragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // Draw the path on canvas (not visible)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, width, 0);
        const path2d = new window.Path2D(pathDraggableAndEditable);
        ctx.save();
        ctx.fillStyle = '#ccc';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fill(path2d);
        ctx.stroke(path2d);
        ctx.restore();
    }, [pathDraggableAndEditable, width, 0]);

    return (
        <div style={{ width, margin: '0 auto' }}>
            {/* Hidden canvas to get svg data*/}
            <canvas ref={canvasRef} width={width} style={{ display: 'none' }} />

            {/* TODO: Add use cases for polygons, rectangles, etc. */}
            <svg ref={svgRef} viewBox={svgViewBox}>
                <path
                    style={{
                        fill: 'none',
                        stroke: '#008b34',
                        strokeLinecap: 'square',
                        strokeMiterlimit: 10,
                        strokeWidth: 2.13,
                    }}
                    d={pathLimit}
                />
                <path
                    ref={svgPathRef}
                    d={pathDraggableAndEditable}
                    style={{
                        fill: 'white',
                        stroke: '#e5222e',
                        strokeLinecap: 'square',
                        strokeMiterlimit: 10,
                        strokeWidth: 2.13,
                    }}
                />

                {/* TODO: replace this circle with a moveable element */}
                <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={20}
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
