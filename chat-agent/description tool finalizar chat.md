Chat finalization tool called at the END of every support session to generate summaries and send to Slack.

## WHEN TO USE

Call this tool when:

1. **Chat resolved** - User confirmed problem is solved (with or without NPS)
2. **Chat escalated** - Issue was escalated to human support
3. **Chat ended** - Session concluded for any reason

**IMPORTANT:** This tool should be called for EVERY chat session, not just successful ones.

## INPUT FORMAT

```json
{
  "mode": "finalize",
  "session": {
    "user_name": "John",
    "fins_plus": true,
    "forum_username": "john_dev",
    "email": "john@email.com"
  },
  "support": {
    "product": "CMS Filter",
    "category": "attributes_v2",
    "problem_summary": "Filter not showing results when selecting category",
    "solution_summary": "Fixed fs-cmsfilter-field attribute on select element",
    "resolved": true,
    "escalated": false,
    "escalation_reason": null
  },
  "feedback": {
    "nps_score": 9,
    "nps_raw": "9"
  },
  "conversation_context": "Brief summary of the full conversation"
}
```

## OUTPUT

Returns structured JSON with:

- **summary**: Complete chat summary with user info, problem, solution
- **feedback**: NPS score and category (Promoter 💚 / Passive 🟡 / Detractor 🔴)
- **slack_message**: Pre-formatted message blocks ready for Slack

## NPS CATEGORIES

| Score | Category | Emoji |
|-------|----------|-------|
| 9-10 | Promoter | 💚 |
| 7-8 | Passive | 🟡 |
| 0-6 | Detractor | 🔴 |
| null | Not collected | ⚪ |

## EXAMPLE OUTPUTS

**Resolved with NPS:**
```
✅ *CHAT SUPPORT COMPLETED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *User:* John
📧 john@email.com | @john_dev
🏷️ *Fins+:* Yes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ *Product:* CMS Filter (Attributes)

❓ *Problem:*
Filter not showing results when selecting category

✅ *Solution:*
Fixed fs-cmsfilter-field attribute on select element

📊 *Status:* Resolved
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ *NPS:* 9/10 — PROMOTER 💚
⏱️ *Duration:* ~15 min
```

**Escalated:**
```
🔴 *CHAT ESCALATED TO SUPPORT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *User:* Maria
📧 maria@email.com | @maria_dev
🏷️ *Fins+:* Yes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ *Product:* CMS Nest (Attributes)

❓ *Problem:*
Nested items not loading beyond 3 levels

🔍 *Attempted:*
• Verified HTML structure ✓
• Checked attributes ✓

⚠️ *Escalation Reason:* Possible bug
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ *Time before escalation:* ~20 min
```

## WORKFLOW INTEGRATION

```
User confirms resolution
        ↓
Show NPS question (optional)
        ↓
User responds (or skips)
        ↓
🔧 CALL: Finalize Chat Tool
        ↓
Tool generates summary JSON
        ↓
Code Node formats for Slack
        ↓
Send to Slack channel
```

Always wait for complete JSON output before sending to Slack.
