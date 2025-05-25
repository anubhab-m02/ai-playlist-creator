import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

const Alert = ({ type, children }) => {
    const baseClasses = "p-4 rounded-md text-sm flex items-center shadow-lg mb-4"; // Added mb-4 for spacing
    let typeClasses = "";
    let IconComponent;

    if (type === "error") {
        typeClasses = "bg-red-800/80 text-red-200 border border-red-700";
        IconComponent = XCircle;
    } else if (type === "success") {
        typeClasses = "bg-green-800/80 text-green-200 border border-green-700";
        IconComponent = CheckCircle;
    } else { // Default or info
        typeClasses = "bg-blue-800/80 text-blue-200 border border-blue-700";
        IconComponent = CheckCircle; // Or an Info icon
    }


    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <IconComponent size={20} className="mr-3 flex-shrink-0" />
            <span>{children}</span>
        </div>
    );
};

export default Alert;
