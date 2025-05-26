import React from 'react';
import { XCircle, CheckCircle, AlertTriangle } from 'lucide-react'; // Added AlertTriangle for default

const Alert = ({ type, children }) => {
    const baseClasses = "p-4 rounded-md text-sm flex items-center shadow-lg mb-4";
    let typeClasses = "";
    let IconComponent;

    if (!children) return null; // Don't render if no children message

    switch (type) {
        case "error":
            typeClasses = "bg-red-800/80 text-red-200 border border-red-700";
            IconComponent = XCircle;
            break;
        case "success":
            typeClasses = "bg-green-800/80 text-green-200 border border-green-700";
            IconComponent = CheckCircle;
            break;
        default: // For info or other types
            typeClasses = "bg-blue-800/80 text-blue-200 border border-blue-700";
            IconComponent = AlertTriangle; // Using AlertTriangle for default/info
            break;
    }

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {IconComponent && <IconComponent size={20} className="mr-3 flex-shrink-0" />}
            <span>{typeof children === 'string' ? children : JSON.stringify(children)}</span>
        </div>
    );
};

export default Alert;
