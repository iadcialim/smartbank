"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const dual_read_service_1 = require("../../services/dual-read-service");
const migration_config_1 = require("../../utils/migration-config");
const handler = async (_event) => {
    try {
        const configManager = migration_config_1.MigrationConfigManager.getInstance();
        const dualReadConfig = configManager.getDualReadConfig();
        const dualReadService = new dual_read_service_1.DualReadService(dualReadConfig);
        // Perform health check on both data sources
        const healthCheck = await dualReadService.healthCheck();
        const migrationStatus = configManager.getMigrationStatus();
        const response = {
            migration: migrationStatus,
            dataSources: healthCheck,
            recommendations: generateRecommendations(healthCheck, migrationStatus)
        };
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(response)
        };
    }
    catch (error) {
        console.error('Health check failed:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};
exports.handler = handler;
function generateRecommendations(healthCheck, migrationStatus) {
    const recommendations = [];
    // Check data source availability
    if (!healthCheck.supabase.available && migrationStatus.primarySource === 'supabase') {
        recommendations.push('Primary source (Supabase) is unavailable. Consider enabling fallback or switching to DynamoDB.');
    }
    if (!healthCheck.dynamodb.available && migrationStatus.primarySource === 'dynamodb') {
        recommendations.push('Primary source (DynamoDB) is unavailable. Consider switching back to Supabase.');
    }
    // Check response times
    if (healthCheck.supabase.responseTime > 1000) {
        recommendations.push('Supabase response time is high (>1s). Monitor performance.');
    }
    if (healthCheck.dynamodb.responseTime > 1000) {
        recommendations.push('DynamoDB response time is high (>1s). Check configuration.');
    }
    // Phase-specific recommendations
    if (migrationStatus.phase === 'pre-migration' && healthCheck.dynamodb.available) {
        recommendations.push('DynamoDB is available. Consider moving to dual-read phase.');
    }
    if (migrationStatus.phase === 'dual-read' && !migrationStatus.comparisonMode) {
        recommendations.push('Enable comparison mode to validate data consistency.');
    }
    if (migrationStatus.phase === 'dual-write' && healthCheck.supabase.available && healthCheck.dynamodb.available) {
        recommendations.push('Both sources are healthy. Consider moving to post-migration phase.');
    }
    return recommendations;
}
//# sourceMappingURL=health-check.js.map