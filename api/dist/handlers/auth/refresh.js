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
        if (!request.refreshToken) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Refresh token is required' })
            };
        }
        const authService = new auth_service_1.AuthService();
        const tokens = await authService.refreshToken(request.refreshToken);
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tokens)
        };
    }
    catch (error) {
        console.error('Token refresh error:', error);
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Token refresh failed' })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=refresh.js.map