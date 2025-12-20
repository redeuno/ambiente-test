/**
 * Parse Escalation JSON for Slack - IMMEDIATE ALERT
 *
 * STATUS: ACTIVE (for immediate escalation alerts)
 *
 * This node formats the IMMEDIATE escalation alert.
 * For COMPLETE chat summaries (both resolved and escalated),
 * use format-chat-summary.js instead.
 *
 * WORKFLOW:
 * - Escalated chats: This node (🚨 alert) + format-chat-summary.js (🔴 summary)
 * - Resolved chats: Only format-chat-summary.js (✅ summary)
 *
 * Add this Code node BEFORE the Slack node in Escalate to Support flow.
 */

const rawQuery = $input.first().json.query;

// Parse the JSON string
let escalationData;
try {
  escalationData = typeof rawQuery === 'string' ? JSON.parse(rawQuery) : rawQuery;
} catch (e) {
  // If parsing fails, create a basic structure
  escalationData = {
    summary: rawQuery || 'Escalation received',
    product: 'Unknown',
    contextCollected: 'Unable to parse context',
    missingInfo: 'Unknown',
    reason: 'Parse error - manual review needed',
    priority: 'medium'
  };
}

// Return parsed data for Slack
return {
  json: {
    summary: escalationData.summary || '',
    product: escalationData.product || 'Unknown',
    contextCollected: escalationData.contextCollected || '',
    missingInfo: escalationData.missingInfo || 'None',
    reason: escalationData.reason || '',
    priority: escalationData.priority || 'medium',
    // Pre-formatted for Slack Block Kit
    priorityEmoji: escalationData.priority === 'high' ? '🔴' :
                   escalationData.priority === 'medium' ? '🟡' : '🟢'
  }
};
