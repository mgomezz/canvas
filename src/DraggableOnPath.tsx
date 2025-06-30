/**
 * DraggableOnPath Component with Zoom Support
 * 
 * Features:
 * - Drag a circle that's constrained to stay within a defined SVG path area
 * - Mouse wheel zoom centered on the middle of the SVG (zoom range: 0.5x to 4x)
 * - Double-click to reset zoom to 1x and center the view
 * - Smooth zooming using SVG viewBox manipulation
 */
import React, { useEffect, useRef, useState } from 'react';

type Props = {
    pathD: string; // SVG path data for the area
    initialPos: { x: number; y: number };
    width: number;
    svgViewBox: string; // Optional viewBox for the SVG
};

export const DraggableOnPath: React.FC<Props> = ({ pathD, initialPos, width, svgViewBox }) => {
    // Zoom configuration
    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 4.0;
    const ZOOM_STEP = 0.1;

    // Component state
    const [pos, setPos] = useState(initialPos);
    const [zoom, setZoom] = useState(1.0);
    const dragging = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const svgPathRef = useRef<SVGPathElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Parse the initial viewBox to get dimensions
    const parseViewBox = (viewBoxStr: string) => {
        const parts = viewBoxStr.trim().split(/\s+/);
        return {
            x: parseFloat(parts[0]),
            y: parseFloat(parts[1]),
            width: parseFloat(parts[2]),
            height: parseFloat(parts[3])
        };
    };

    const originalViewBox = parseViewBox(svgViewBox);

    // Calculate zoomed viewBox centered on the middle of the original viewBox
    const getZoomedViewBox = (zoomLevel: number) => {
        const newWidth = originalViewBox.width / zoomLevel;
        const newHeight = originalViewBox.height / zoomLevel;
        const centerX = originalViewBox.x + originalViewBox.width / 2;
        const centerY = originalViewBox.y + originalViewBox.height / 2;
        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;
        return `${newX} ${newY} ${newWidth} ${newHeight}`;
    };

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

    // Checks if a rectangle is fully inside the path area
    function isRectFullyInsidePath(
        x: number, // top-left x of the div (in SVG coordinates)
        y: number, // top-left y of the div (in SVG coordinates)
        width: number, // width of the div
        height: number, // height of the div
        path2d: Path2D,
        ctx: CanvasRenderingContext2D,
    ) {
        // Test all corners of the rectangle
        const points = [
            [x, y], // top-left
            [x + width, y], // top-right
            [x, y + height], // bottom-left
            [x + width, y + height], // bottom-right
        ];
        for (const [px, py] of points) {
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

        //TODO:add here use cases for different shapes
        //to check circles
        if (isCircleFullyInsidePath(point.x, point.y, 20, path2d, ctx)) {
            setPos({ x: point.x, y: point.y });
        }
    }

    function handleMouseUp() {
        dragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }

    // Handle mouse wheel for zooming
    function handleWheel(e: WheelEvent) {
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1; // Scroll up = zoom in, scroll down = zoom out
        const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + direction * ZOOM_STEP));
        if (newZoom !== zoom) {
            setZoom(newZoom);
        }
    }

    // Handle double-click to reset zoom
    function handleDoubleClick(e: React.MouseEvent) {
        e.preventDefault();
        setZoom(1.0);
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

    // Set up wheel event listener for zooming
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        svg.addEventListener('wheel', handleWheel, { passive: false });
        return () => svg.removeEventListener('wheel', handleWheel);
    }, [zoom]); // Include zoom in dependencies to update handler when zoom changes

    return (
        <div style={{ position: 'relative', width }}>
            {/* Hidden canvas for hit testing */}
            <canvas ref={canvasRef} width={width} style={{ display: 'none' }} />
            <svg 
                ref={svgRef} 
                viewBox={getZoomedViewBox(zoom)}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: 'default' }}
            >
                <path
                    style={{
                        fill: 'none',
                        stroke: '#008b34',
                        strokeLinecap: 'square',
                        strokeMiterlimit: 10,
                        strokeWidth: 2.13,
                    }}
                    d="M1511.29,555.5l-134.93,333.05L206.39,3926.32l-118.18-.13s-3.35-19.65-7.81-56.18c-3.53-29.02-9.79-69.79-15.11-121.24C30.58,3413.32,6.53,2652.84.91,1894.14c-1.49-201.71,8.2-391.84,15.58-574.21,10.12-250.11,24.65-485.6,80.01-716.31C235.41,24.81,646.97-36.28,858.17,15.32c178.37,43.58,347.4,123.13,510.99,379.8,48.74,76.47,142.12,160.38,142.12,160.38h.01Z"
                />
                <path
                    ref={svgPathRef}
                    d={pathD}
                    style={{
                        fill: 'white',
                        stroke: '#e5222e',
                        strokeLinecap: 'square',
                        strokeMiterlimit: 10,
                        strokeWidth: 2.13,
                    }}
                />
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
