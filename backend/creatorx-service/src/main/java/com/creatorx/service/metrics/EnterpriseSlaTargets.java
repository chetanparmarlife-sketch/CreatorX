package com.creatorx.service.metrics;

/**
 * Enterprise workflow SLA targets used for dashboard smoothness monitoring.
 */
public final class EnterpriseSlaTargets {
    public static final long DASHBOARD_SUMMARY_P95_MS = 500;
    public static final long ACTION_QUEUE_P95_MS = 800;
    public static final long MUTATION_ACK_P95_MS = 700;
    public static final long FIRST_DASHBOARD_MEANINGFUL_PAINT_MS = 2_500;
    public static final long TOP_INTERACTION_INP_MS = 200;

    private EnterpriseSlaTargets() {
    }

    public static long targetMsForOperation(String operation) {
        if (operation == null) {
            return MUTATION_ACK_P95_MS;
        }
        if (operation.endsWith("workspace-summary")) {
            return DASHBOARD_SUMMARY_P95_MS;
        }
        if (operation.endsWith("action-queue")) {
            return ACTION_QUEUE_P95_MS;
        }
        return MUTATION_ACK_P95_MS;
    }
}
