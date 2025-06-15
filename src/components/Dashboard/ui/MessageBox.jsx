

// // Inline SVG icons for actions (replacing react-icons/fi)
// const IconEdit = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
// );
// const IconTrash = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
// );
// const IconPlus = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
// );
// const IconSave = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
// );
// const IconX = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
// );
// const IconAlertCircle = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-alert-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
// );
// const IconCheckCircle = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.1"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
// );



// export const MessageBox = ({ type, message, onClose }) => {
//     if (!message) return null;

//     const baseClasses = "p-4 mb-4 rounded-md flex items-center shadow-sm";
//     let typeClasses = "";
//     let IconComponent = null;

//     switch (type) {
//         case 'success':
//             typeClasses = "bg-green-100 border-l-4 border-green-500 text-green-700";
//             IconComponent = IconCheckCircle;
//             break;
//         case 'error':
//             typeClasses = "bg-red-100 border-l-4 border-red-500 text-red-700";
//             IconComponent = IconAlertCircle;
//             break;
//         default:
//             typeClasses = "bg-blue-100 border-l-4 border-blue-500 text-blue-700";
//             IconComponent = IconAlertCircle; // Default icon
//             break;
//     }

//     return (
//         <div className={`${baseClasses} ${typeClasses}`} role="alert">
//             {IconComponent && <IconComponent className="mr-3 text-lg" />}
//             <div className="flex-grow">
//                 <p className="font-medium">{message}</p>
//             </div>
//             {onClose && (
//                 <button onClick={onClose} className="ml-4 text-current hover:opacity-75">
//                     <IconX size={18} />
//                 </button>
//             )}
//         </div>
//     );
// };
