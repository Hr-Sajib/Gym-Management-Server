// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// const handlePrismaClientError = (err) => {
//     var _a, _b;
//     let message = 'Database error';
//     let statusCode = 500;
//     const errorSources = [];
//     switch (err.code) {
//         case 'P2002':
//             message = 'Duplicate entry';
//             statusCode = 409;
//             errorSources.push({
//                 path: ((_b = (_a = err.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'unknown',
//                 message: 'Value already exists',
//             });
//             break;
//         case 'P2025':
//             message = 'Record not found';
//             statusCode = 404;
//             errorSources.push({
//                 path: 'id',
//                 message: err.message,
//             });
//             break;
//         default:
//             errorSources.push({
//                 path: '',
//                 message: err.message,
//             });
//             break;
//     }
//     return {
//         statusCode,
//         message,
//         errorSources,
//     };
// };
// exports.default = handlePrismaClientError;
