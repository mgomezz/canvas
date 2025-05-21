import { toSvg } from 'html-to-image';
import React, { useEffect, useRef, useState } from 'react';
import Moveable, { OnDrag } from 'react-moveable';

interface Item {
    id: string;
    top: number;
    left: number;
    color?: string;
    text?: string;
}

const ZOOM_MAX_SCALE = 1.5;
const ZOOM_MIN_SCALE = 0.5;
const ZOOM_STEP = 0.1;
const CONTAINER_SIZE = 400;
const ITEM_SIZE = 50;
const BOUND = CONTAINER_SIZE - ITEM_SIZE;

const initialItems: Item[] = [
    { id: '1', top: 20, left: 20, color: '#e74c3c', text: 'Hello' },
    { id: '2', top: 100, left: 200, color: '#3498db', text: 'World' },
];

const Canvas: React.FC = () => {
    const [isPanning, setIsPanning] = useState(false);

    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    // transform-origin in percent; default to center
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    const downloadSvgRef = useRef<HTMLDivElement>(null);

    const targetRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<Moveable>(null);
    const [items, setItems] = useState<Item[]>(initialItems);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const selectedRef = selectedId
        ? targetRef.current?.querySelector<HTMLDivElement>(`#item-${selectedId}`) ?? null
        : null;

    const onSelect = (id: string) => {
        setSelectedId(id);
        setShowInput(false);
    };

    const onDrag = (e: OnDrag) => {
        const { target, left, top } = e;
        if (target instanceof HTMLElement) {
            target.style.left = `${left}px`;
            target.style.top = `${top}px`;
        }
    };

    const onDragEnd = ({ lastEvent }: { lastEvent: { left: number; top: number } }) => {
        if (!lastEvent || !selectedId) return;
        const newLeft = lastEvent.left;
        const newTop = lastEvent.top;
        setItems(prev => prev.map(it => (it.id === selectedId ? { ...it, left: newLeft, top: newTop } : it)));
    };

    // zoom around container center, so whatever is currently in middle stays in middle
    const zoomCenter = (direction: number) => {
        const prev = scale;
        const next = Math.min(ZOOM_MAX_SCALE, Math.max(ZOOM_MIN_SCALE, scale + direction * ZOOM_STEP));
        if (next === prev) return;

        // always center in percent
        setOrigin({ x: 50, y: 50 });
        setScale(next);
    };

    const handleAddText = () => {
        setShowInput(true);
        setInputValue('');
        setSelectedId(null);
    };

    // optional wheel support
    const onWheel = (e: any) => {
        e.preventDefault();
        const dir = e.deltaY < 0 ? +1 : -1;
        zoomCenter(dir);
    };

    useEffect(() => {
        const c = targetRef.current;
        if (c) {
            c.addEventListener('wheel', onWheel, { passive: false });
            return () => c.removeEventListener('wheel', onWheel);
        }
    }, [scale]);

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.key === 'Enter' && inputValue.trim()) {
            const id = Date.now().toString();
            setItems(prev => [
                ...prev,
                {
                    id,
                    top: 10,
                    left: 10,
                    text: inputValue.trim(),
                    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                },
            ]);
            setShowInput(false);
            setInputValue('');
        }
        if (e.key === 'Escape') {
            setShowInput(false);
            setInputValue('');
        }
    };

    const downloadSvg = () => {
        if (!downloadSvgRef.current) return;

        toSvg(downloadSvgRef.current)
            .then(dataUrl => {
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'snapshot.svg';
                a.click();
            })
            .catch(err => console.error('oops, failed to export as SVG', err));
    };

    return (
        <div className="root">
            <div
                className="drawer-container"
                style={{
                    width: '95vw',
                    height: '95vh',
                    border: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                }}
                onClick={() => setSelectedId(null)}
                ref={targetRef}
            >
                <div
                    ref={downloadSvgRef}
                    style={{
                        width: '50vw',
                        height: '50vh',
                        border: '2px dashed #298B15',
                        transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
                        transformOrigin: `${origin.x}% ${origin.y}%`,
                        transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    }}
                >
                    <div
                        style={{
                            width: '97%',
                            height: '94%',
                            margin: '14px',
                            border: '2px dashed red',
                        }}
                    >
                        {items.map(it => (
                            <div
                                key={it.id}
                                id={`item-${it.id}`}
                                className={`item ${selectedId === it.id ? 'selected' : ''}`}
                                style={{
                                    top: it.top,
                                    left: it.left,
                                    backgroundColor: it.color,
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    onSelect(it.id);
                                }}
                            >
                                {it.text && <span>{it.text}</span>}
                            </div>
                        ))}
                        <div className="target element1">Elemento de referencia</div>
                        {selectedRef && (
                            <Moveable
                                ref={moveableRef}
                                target={selectedRef}
                                draggable={true}
                                rotatable={true}
                                throttleDrag={1}
                                edgeDraggable={false}
                                startDragRotate={0}
                                throttleDragRotate={0}
                                scalable={true}
                                keepRatio={false}
                                throttleScale={0}
                                snappable={true}
                                isDisplaySnapDigit={true}
                                isDisplayInnerSnapDigit={false}
                                snapGap={true}
                                snapDirections={{
                                    top: true,
                                    left: true,
                                    bottom: true,
                                    right: true,
                                    center: true,
                                    middle: true,
                                }}
                                elementSnapDirections={{
                                    top: true,
                                    left: true,
                                    bottom: true,
                                    right: true,
                                    center: true,
                                    middle: true,
                                }}
                                bounds={{ left: 17, top: 17, right: 11, bottom: 11, position: 'css' }}
                                elementGuidelines={['.element1', '.element2', '.element3']}
                                onDrag={onDrag}
                                onDragEnd={onDragEnd}
                                onScale={e => {
                                    e.target.style.transform = e.drag.transform;
                                }}
                                onRotate={e => {
                                    e.target.style.transform = e.drag.transform;
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
            {/* Zoom buttons */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 50,
                    left: '48vw',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'row',
                }}
            >
                <button onClick={() => zoomCenter(-1)}>–</button>
                <button onClick={() => zoomCenter(+1)}>+</button>
                <button onClick={downloadSvg}>Download as SVG</button>
                <div>
                    <button onClick={handleAddText}>Add Text</button>
                    {showInput && (
                        <input
                            type="text"
                            placeholder="Type and press Enter"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ marginLeft: 8 }}
                            autoFocus
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Canvas;

