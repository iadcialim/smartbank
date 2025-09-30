"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const auth_service_1 = require("../../services/auth-service");
const handler = async (event, _context, _callback) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }
        const request = JSON.parse(event.body);
        if (!request.email) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email is required' })
            };
        }
        const authService = new auth_service_1.AuthService();
        await authService.resetPassword(request);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Password reset email sent' })
        };
    }
    catch (error) {
        console.error('Password reset error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Password reset failed' })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=password-reset.js.map