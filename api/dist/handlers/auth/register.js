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
        if (!request.email || !request.password || !request.firstName || !request.lastName) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Email, password, firstName, and lastName are required' })
            };
        }
        const authService = new auth_service_1.AuthService();
        const result = await authService.register(request);
        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        };
    }
    catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=register.js.map