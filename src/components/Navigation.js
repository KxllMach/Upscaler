import React from 'react';
import { Button } from './Button'; // Assuming Button is also in its own file

export const Navigation = ({ onGetStartedClick }) => (
    <nav className="flex w-full max-w-screen-xl mx-auto justify-between items-center px-4 sm:px-8 md:px-16 py-6">
        <div className="font-bold text-2xl text-white italic" style={{ fontFamily: "'General Sans', sans-serif" }}>SafeScale</div>
        <div className="hidden md:flex items-center gap-9">
            <a href="#features" className="text-[#9D9D9D] font-medium hover:text-white">Features</a>
            <a href="#how-it-works" className="text-[#9D9D9D] font-medium hover:text-white">How it Works</a>
            <a href="https://www.buymeacoffee.com/Kxll" target="_blank" rel="noopener noreferrer" className="text-[#9D9D9D] font-medium hover:text-white">Buy Me a Coffee</a>
        </div>
        <Button onClick={onGetStartedClick} className="bg-[#7B33F7] hover:bg-purple-700 text-white font-bold text-lg px-6 py-3 rounded-xl">Get Started</Button>
    </nav>
);
