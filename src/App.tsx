import React from 'react';
import Canvas from './Canvas';

const App: React.FC = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Canvas />
        </div>
    );
};

export default App;

