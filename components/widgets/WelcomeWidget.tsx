import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WidgetWrapper from './WidgetWrapper';

const WelcomeWidget: React.FC = () => {
    const { currentUser } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const name = currentUser?.displayName?.split(' ')[0] || 'there';

    return (
        <WidgetWrapper title="Welcome" className="bg-black dark:bg-white text-white dark:text-black">
             <div className="flex flex-col justify-between h-full text-center">
                <div>
                    <p className="text-3xl sm:text-4xl font-bold tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm opacity-70">{time.toLocaleDateString(undefined, dateOptions)}</p>
                </div>
                <p className="text-lg">Hello, {name}.</p>
            </div>
        </WidgetWrapper>
    );
};

export default WelcomeWidget;