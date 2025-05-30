"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data, PaymentGatewayPageURL) => {
    const responsePayload = {
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data,
    };
    res.status(data.statusCode).json(responsePayload);
};
exports.default = sendResponse;
