/**
 * Format Chat Summary for Slack
 *
 * This Code Node receives the output from the Finalize Chat tool
 * and formats it for sending to the Slack channel.
 *
 * Input: JSON from Finalize Chat tool
 * Output: Formatted Slack message blocks
 */

// Get the raw input from the previous node
const rawInput = $input.first().json;

// Parse if it's a string (in case it comes as stringified JSON)
let summaryData;
try {
  summaryData = typeof rawInput.query === 'string'
    ? JSON.parse(rawInput.query)
    : rawInput.query || rawInput;
} catch (e) {
  // If parsing fails, use the raw input
  summaryData = rawInput;
}

// Extract data with fallbacks
const status = summaryData.status || 'unknown';
const summary = summaryData.summary || {};
const slackMessage = summaryData.slack_message || {};

// User info
const user = summary.user || {};
const userName = user.name || 'Unknown User';
const userEmail = user.email || '';
const forumUsername = user.forum_username || '';
const finsPlus = user.fins_plus ? 'Yes' : 'No';

// Support info
const support = summary.support || {};
const product = support.product || 'Unknown Product';
const category = support.category || '';
const problem = support.problem || 'No problem description';
const solution = support.solution || support.attempted_solutions?.join(', ') || '';
const resolved = support.resolved || false;
const escalationReason = support.escalation_reason || '';

// Feedback info
const feedback = summary.feedback || {};
const npsScore = feedback.nps_score;
const npsCategory = feedback.nps_category || 'not_collected';
const npsEmoji = feedback.nps_emoji || '⚪';
const npsCollected = feedback.nps_collected || false;

// Metadata
const metadata = summary.metadata || {};
const duration = metadata.duration_estimate || '~N/A';

// Build the Slack message
let header, statusEmoji, statusText;

if (status === 'escalated') {
  header = '🔴 *CHAT ESCALATED TO SUPPORT*';
  statusEmoji = '🔴';
  statusText = 'Escalated';
} else {
  header = '✅ *CHAT SUPPORT COMPLETED*';
  statusEmoji = '✅';
  statusText = 'Resolved';
}

// Format user line
let userLine = `👤 *User:* ${userName}`;
let emailLine = userEmail;
if (forumUsername) {
  emailLine += emailLine ? ` | @${forumUsername}` : `@${forumUsername}`;
}

// Format NPS line
let npsLine;
if (npsCollected && npsScore !== null) {
  const categoryUpper = npsCategory.toUpperCase();
  npsLine = `⭐ *NPS:* ${npsScore}/10 — ${categoryUpper} ${npsEmoji}`;
} else {
  npsLine = `⭐ *NPS:* Not collected ⚪`;
}

// Build the message blocks array
const blocks = [
  header,
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  userLine,
  emailLine ? `📧 ${emailLine}` : null,
  `🏷️ *Fins+:* ${finsPlus}`,
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  `🛠️ *Product:* ${product}${category ? ` (${category})` : ''}`,
  '',
  '❓ *Problem:*',
  problem,
].filter(Boolean); // Remove null entries

// Add solution or escalation info
if (status === 'escalated') {
  if (support.attempted_solutions && support.attempted_solutions.length > 0) {
    blocks.push('');
    blocks.push('🔍 *Attempted:*');
    support.attempted_solutions.forEach(attempt => {
      blocks.push(`• ${attempt} ✓`);
    });
  }
  if (escalationReason) {
    blocks.push('');
    blocks.push(`⚠️ *Escalation Reason:* ${escalationReason}`);
  }
} else {
  if (solution) {
    blocks.push('');
    blocks.push('✅ *Solution:*');
    blocks.push(solution);
  }
  blocks.push('');
  blocks.push(`📊 *Status:* ${statusText}`);
}

// Add footer
blocks.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
blocks.push(npsLine);
blocks.push(`⏱️ *Duration:* ${duration}`);

// Join blocks into final message
const slackText = blocks.join('\n');

// Return formatted output for Slack
return {
  json: {
    // For Slack HTTP Request node
    text: slackText,

    // Individual fields for flexibility
    header: header,
    status: status,
    user_name: userName,
    user_email: userEmail,
    forum_username: forumUsername,
    fins_plus: finsPlus,
    product: product,
    problem: problem,
    solution: solution,
    resolved: resolved,
    escalated: status === 'escalated',
    escalation_reason: escalationReason,
    nps_score: npsScore,
    nps_category: npsCategory,
    nps_emoji: npsEmoji,
    duration: duration,

    // Raw blocks array if needed
    blocks: blocks
  }
};
