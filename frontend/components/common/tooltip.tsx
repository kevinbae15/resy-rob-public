import React, { useState } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/20/solid';

const Tooltip = ({ text }: { text: string }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const tooltipStyles: React.CSSProperties = {
        visibility: showTooltip ? 'visible' : 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        textAlign: 'center',
        borderRadius: '6px',
        padding: '5px 15px',
        position: 'absolute',
        zIndex: 1,
        bottom: '125%',
        fontSize: "12px"
    };

    const tooltipContainerStyles: React.CSSProperties = {
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'middle',
    };

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div style={tooltipContainerStyles} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <QuestionMarkCircleIcon className='h-[18px] w-[18px]' />
            <div style={tooltipStyles}>{text}</div>
        </div>
    );
};

export default Tooltip;
