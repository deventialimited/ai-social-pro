// rotation hook

import { useState } from 'react';

export const useRotation = (angle) => {
    const [rotation, setRotation] = useState(0);

    const rotate = (angle) => {
        setRotation((prevRotation) => (prevRotation + angle) % 360);
    };  

    return { rotation, rotate };
};  



