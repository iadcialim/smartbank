"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
// Auth routes
exports.app.post('/api/auth/register', (_req, _res) => {
    throw new Error('Registration handler not implemented yet');
});
exports.app.post('/api/auth/verify-email', (_req, _res) => {
    throw new Error('Email verification handler not implemented yet');
});
exports.app.post('/api/auth/login', (_req, _res) => {
    throw new Error('Login handler not implemented yet');
});
exports.app.get('/api/auth/profile', (_req, _res) => {
    throw new Error('Profile handler not implemented yet');
});
exports.app.post('/api/auth/refresh', (_req, _res) => {
    throw new Error('Refresh token handler not implemented yet');
});
exports.app.post('/api/auth/logout', (_req, _res) => {
    throw new Error('Logout handler not implemented yet');
});
exports.app.post('/api/auth/password-reset/request', (_req, _res) => {
    throw new Error('Password reset request handler not implemented yet');
});
exports.app.post('/api/auth/password-reset/verify', (_req, _res) => {
    throw new Error('Password reset verify handler not implemented yet');
});
exports.app.post('/api/auth/password-reset/confirm', (_req, _res) => {
    throw new Error('Password reset confirm handler not implemented yet');
});
exports.app.post('/api/auth/change-password', (_req, _res) => {
    throw new Error('Change password handler not implemented yet');
});
//# sourceMappingURL=app.js.map