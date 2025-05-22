import { toSvg } from 'html-to-image';
import React, { useEffect, useRef, useState } from 'react';
import Moveable, { BoundType, OnDrag, OnScaleEnd } from 'react-moveable';

interface Item {
    id: string;
    top: number;
    left: number;
    width?: number;
    height?: number;
    color?: string;
    text?: string;
}

const ZOOM_MAX_SCALE = 1.5;
const ZOOM_MIN_SCALE = 0.5;
const ZOOM_STEP = 0.1;

const initialItems: Item[] = [
    { id: '1', top: 0, left: 0, color: '#e74c3c', text: 'Hello' },
    { id: '2', top: 100, left: 200, color: '#3498db', text: 'World' },
];

const Canvas: React.FC = () => {
    const downloadSvgRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<Moveable>(null);

    const [items, setItems] = useState<Item[]>(initialItems);
    const [past, setPast] = useState<Item[][]>([]);
    const [future, setFuture] = useState<Item[][]>([]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const [scale, setScale] = useState(1);
    const [origin, setOrigin] = useState({ x: 50, y: 50 });
    // dynamic bounds measured from downloadSvgRef
    const [bounds, setBounds] = useState<BoundType>({
        left: 2,
        top: 2,
        right: -2,
        bottom: -2,
        position: 'css',
    });

    // Helper to push current state into past, clear future, then update items
    const updateItems = (updater: (prev: Item[]) => Item[]) => {
        setPast(p => [...p, items]);
        setFuture([]);
        setItems(prev => updater(prev));
    };

    // Undo & redo handlers
    const handleUndo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(past.slice(0, -1));
        setFuture(f => [items, ...f]);
        setItems(previous);
        setSelectedId(null);
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture(future.slice(1));
        setPast(p => [...p, items]);
        setItems(next);
        setSelectedId(null);
    };

    // Bring to front / send to back
    const handleBringToFront = () => {
        if (!selectedId) return;
        updateItems(prev => {
            const item = prev.find(it => it.id === selectedId);
            const others = prev.filter(it => it.id !== selectedId);
            return item ? [...others, item] : prev;
        });
    };

    const handleSendToBack = () => {
        if (!selectedId) return;
        updateItems(prev => {
            const item = prev.find(it => it.id === selectedId);
            const others = prev.filter(it => it.id !== selectedId);
            return item ? [item, ...others] : prev;
        });
    };

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
        updateItems(prev => prev.map(it => (it.id === selectedId ? { ...it, left: newLeft, top: newTop } : it)));
    };

    const onScaleEnd = (e: OnScaleEnd) => {
        //TODO: implement scaling with redo and undo
    };

    const zoomCenter = (direction: number) => {
        const prevScale = scale;
        const nextScale = Math.min(ZOOM_MAX_SCALE, Math.max(ZOOM_MIN_SCALE, scale + direction * ZOOM_STEP));
        if (nextScale === prevScale) return;
        setOrigin({ x: 50, y: 50 });
        setScale(nextScale);
    };

    const handleAddText = () => {
        setShowInput(true);
        setInputValue('');
        setSelectedId(null);
    };

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
            updateItems(prev => [
                ...prev,
                {
                    id,
                    top: 15,
                    left: 15,
                    // width: 50,
                    // height: 50,
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

    const selectedRef = selectedId
        ? targetRef.current?.querySelector<HTMLDivElement>(`#item-${selectedId}`) ?? null
        : null;

    // Build dynamic elementGuidelines for snapping (all other items)
    const guidelines = items.filter(it => it.id !== selectedId).map(it => `#item-${it.id}`);

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
                    position: 'relative',
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
                        transform: `scale(${scale})`,
                        transformOrigin: `${origin.x}% ${origin.y}%`,
                        transition: 'transform 0.1s ease-out',
                        position: 'relative',
                    }}
                >
                    <div
                        className="snapContainer"
                        style={{
                            width: '97%',
                            height: '94%',
                            margin: '14px',
                            border: '2px dashed red',
                            position: 'relative',
                        }}
                    >
                        {items.map((it, idx) => (
                            <div
                                key={it.id}
                                id={`item-${it.id}`}
                                className={`item ${selectedId === it.id ? 'selected' : ''}`}
                                style={{
                                    top: it.top,
                                    left: it.left,
                                    width: it.width,
                                    height: it.height,
                                    backgroundColor: it.color,
                                    zIndex: idx,
                                }}
                                onClick={e => {
                                    e.stopPropagation();
                                    onSelect(it.id);
                                }}
                            >
                                {it.text && <span>{it.text}</span>}
                            </div>
                        ))}
                        {selectedRef && (
                            <Moveable
                                ref={moveableRef}
                                target={selectedRef}
                                keepRatio={false}
                                draggable
                                scalable
                                rotatable
                                throttleDrag={0}
                                throttleScale={0}
                                throttleDragRotate={0}
                                edgeDraggable={false}
                                snappable
                                snapGap
                                bounds={bounds}
                                elementGuidelines={guidelines}
                                elementSnapDirections={{
                                    top: true,
                                    left: true,
                                    bottom: true,
                                    right: true,
                                    center: true,
                                    middle: true,
                                }}
                                snapDirections={{ top: true, left: true, bottom: true, right: true }}
                                onDrag={onDrag}
                                onDragEnd={onDragEnd}
                                onScale={e => {
                                    e.target.style.transform = e.drag.transform;
                                }}
                                onScaleEnd={onScaleEnd}
                                onRotate={e => {
                                    e.target.style.transform = e.drag.transform;
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 50,
                    left: '37%',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '4px',
                }}
            >
                <button onClick={() => zoomCenter(-1)}>–</button>
                <button onClick={() => zoomCenter(+1)}>+</button>
                <button onClick={downloadSvg}>Download as SVG</button>
                <button onClick={handleUndo} disabled={past.length === 0}>
                    Undo
                </button>
                <button onClick={handleRedo} disabled={future.length === 0}>
                    Redo
                </button>
                <button onClick={handleBringToFront} disabled={!selectedId}>
                    Bring to Front
                </button>
                <button onClick={handleSendToBack} disabled={!selectedId}>
                    Send to Back
                </button>
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

