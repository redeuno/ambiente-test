Strategic analysis tool called up to THREE times during workflow for iterative refinement in **REAL-TIME CHAT** mode.

## WHEN TO USE

**FIRST CALL (COLLECT MODE)** - For every new user message:
Call with mode: "collect" to assess conversation state, evaluate what information has been gathered, determine if more context is needed, and decide whether to ask a question or proceed to analysis.

**SECOND CALL (ANALYZE MODE)** - When sufficient context is available:
Call with mode: "analyze" to get strategic planning, category validation, search strategy, preliminary confidence, and expectations.

**THIRD CALL (VALIDATE MODE)** - After executing all searches:
Call with mode: "validate" to compare expectations vs reality, adjust confidence, decide on Perplexity, generate quality checklist, and refine strategy.

## INPUT FORMAT

**For COLLECT mode (NEW - Chat Assessment):**
```json
{
  "mode": "collect",
  "current_message": "user's latest message",
  "collected_data": {
    "user_name": "if provided or [NOT PROVIDED]",
    "fins_plus_subscriber": "yes|no|[NOT ASKED]",
    "forum_account": "yes|no|[NOT ASKED]",
    "forum_username": "if provided or [NOT PROVIDED]",
    "user_email": "if provided or [NOT PROVIDED]",
    "category": "if identified or [NOT IDENTIFIED]",
    "website_url": "if provided (valid URL) or [NOT PROVIDED]",
    "html_available": true|false,
    "images_available": true|false,
    "problem_description": "summary of problem or [UNCLEAR]"
  },
  "conversation_turn": 1
}
```

**For ANALYZE mode:**
```json
{
  "mode": "analyze",
  "message": "compiled problem description from conversation",
  "category": "identified category",
  "html": "complete|partial|missing",
  "html_content": "HTML if available",
  "image_analysis": "screenshot description if available",
  "conversation_context": "summary of chat so far"
}
```

**For VALIDATE mode:**
```json
{
  "mode": "validate",
  "analysis_id": "reference to analyze call",
  "search_results": {
    "support_knowledge": {
      "status": "found_complete|found_partial|not_found",
      "summary": "what was found",
      "relevance": "high|medium|low",
      "completeness": "answers_all|covers_main|leaves_gaps"
    },
    "faq_vector": {
      "status": "found_verified|found_community|not_found",
      "human_verified": true|false,
      "summary": "what was found",
      "relevance": "exact_match|similar|different_context"
    },
    "html_analysis": {
      "performed": true|false,
      "findings": "key findings if analyzed"
    }
  }
}
```

## OUTPUT

### COLLECT mode returns:
- Conversation assessment (turn number, message type, user intent)
- User identification status (name, fins+ status, forum account, username, email)
- Collected data status (what we have vs don't have)
- Completeness check (user identification complete? technical context ready?)
- Next action (ask_user_name | ask_fins_forum_status | ask_forum_details | proceed_to_analyze | etc.)
- Conversation guidance (tone, what to acknowledge, use name)

**Key decision: `next_action.action`**
- `ask_user_name`: First priority - need user's name for personalization
- `ask_fins_forum_status`: Need to know if Fins+ subscriber and if on forum
- `ask_forum_details`: If on forum, need username and email
- `ask_product`: User info complete, need to know which product
- `ask_problem`: Need more details about the issue
- `proceed_to_analyze`: ALL user info + sufficient technical context
- `request_url`: Need staging URL for diagnosis
- `request_screenshot`: Need visual context
- `ask_if_resolved`: After solution provided, check if it worked
- `show_nps`: User confirmed resolution, show NPS question
- `thank_and_close`: After NPS collected, thank user
- `finalize_chat`: Trigger Finalize Chat tool to send summary to Slack

### COLLECT mode also returns (for NPS flow):
- **Resolution detection** (`conversation_phase`, `resolution_signals`, `nps_timing`)
- Sentiment tracking (`satisfied|neutral|frustrated|confused`)
- NPS readiness assessment (`ready_for_nps: true|false`)

### ANALYZE mode returns:
- Context analysis with conversation summary
- Category validation with evidence
- Problem type and complexity
- Search strategy with specific terms
- Preliminary confidence with factors
- Response planning

### ANALYZE mode also returns:
- **Voice & Tone guidance** (ALWAYS `must_call: true` - tool must be called before ANY response)
- Perplexity pre-assessment (will confirm in VALIDATE)

### VALIDATE mode returns:
- Search validation (expectations vs reality)
- Confidence adjustment (final score)
- **Perplexity decision** (`should_call: true|false` with `search_terms` if needed)
- **Voice & Tone reminder** (`must_call_tool: true` with focus and key aspects)
- Quality checklist (5-7 items, MANDATORY)
- Solution refinement
- Escalation assessment
- Response refinement
- Final next steps

## CHAT WORKFLOW

```
User sends message
       ↓
┌──────────────────┐
│  COLLECT MODE    │ ← Always called first
└────────┬─────────┘
         │
         ▼
   User identification complete?
   (name, fins+, forum, username, email)
         │
    NO ──┼── YES
         │    │
         ▼    ▼
   Ask for user info   Subscription check OK?
   Wait for reply      (Attributes = Fins+ required)
   Loop back                 │
                        NO ──┼── YES
                             │    │
                             ▼    ▼
                       Show CTA   Sufficient technical context?
                       END        (product, problem)
                                       │
                                  NO ──┼── YES
                                       │    │
                                       ▼    ▼
                                 Ask question   ┌──────────────────┐
                                 Wait for reply │  ANALYZE MODE    │
                                 Loop back      └────────┬─────────┘
                                                         │
                                                         ▼
                                              🔧 Support Knowledge
                                              🔧 FAQ Vector
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │  VALIDATE MODE   │
                                                └────────┬─────────┘
                                                         │
                                                         ▼
                                      ┌─────────────────────────────┐
                                      │ perplexity_decision.should_call? │
                                      └────────┬────────────────────┘
                                               │
                                          YES ─┼─ NO
                                               │   │
                                               ▼   │
                                      🔧 Perplexity │
                                               │   │
                                               ▼   ▼
                                      🔧 Voice and Tone Doc ← ALWAYS
                                               │
                                               ▼
                                         Craft response
                                               │
                                               ▼
                                      Low confidence? (≤6)
                                               │
                                          YES ─┼─ NO
                                               │   │
                                               ▼   │
                                      🔧 Escalate │
                                               │   │
                                               ▼   ▼
                                         Send response
                                               │
                                               ▼
                                ┌──────────────────────────┐
                                │  RESOLUTION & NPS FLOW   │
                                └────────┬─────────────────┘
                                         │
                                         ▼
                        resolution_detection.conversation_phase
                              = "solution_provided"?
                                         │
                                    YES ─┼─ NO (continue)
                                         │
                                         ▼
                             Ask: "Did this solve it?"
                                         │
                                         ▼
                              User confirms YES?
                                         │
                                    YES ─┼─ NO (loop back)
                                         │
                                         ▼
                                Show NPS question
                                         │
                                         ▼
                              User provides score?
                                         │
                                    YES ─┼─ SKIP
                                         │    │
                                         ▼    ▼
                              🔧 Finalize Chat Tool
                                         │
                                         ▼
                                    END SESSION
```

## EXAMPLE COLLECT OUTPUTS

**User: "hi" - ALWAYS ask for name first**
```json
{
  "mode": "collect",
  "completeness_check": {
    "user_identification_complete": false,
    "missing_user_info": ["user_name", "fins_plus_status", "forum_account"],
    "technical_context_ready": false,
    "missing_technical": ["category", "problem_description"]
  },
  "next_action": {
    "action": "ask_user_name",
    "question_to_ask": "Hey there! 👋 I'm Finn AI, happy to help! Before we dive in, what's your name so I can personalize our chat? 🙂"
  }
}
```

**User: "I'm John" - Got name, now ask about Fins+/forum**
```json
{
  "mode": "collect",
  "collected_data": {
    "user_identification": {
      "user_name": { "status": "provided", "value": "John" },
      "fins_plus_subscriber": { "status": "not_asked" },
      "forum_account": { "status": "not_asked" }
    }
  },
  "completeness_check": {
    "user_identification_complete": false,
    "missing_user_info": ["fins_plus_status", "forum_account"]
  },
  "next_action": {
    "action": "ask_fins_forum_status",
    "question_to_ask": "Nice to meet you, John! Quick question - are you a Fins+ subscriber? And do you have an account on our forum (forum.finsweet.com)?"
  }
}
```

**User: "Yes I'm Fins+ and on the forum" - Need forum details**
```json
{
  "mode": "collect",
  "collected_data": {
    "user_identification": {
      "user_name": { "status": "provided", "value": "John" },
      "fins_plus_subscriber": { "status": "yes", "value": true },
      "forum_account": { "status": "yes", "value": true },
      "forum_username": { "status": "not_provided" },
      "user_email": { "status": "not_provided" }
    }
  },
  "completeness_check": {
    "user_identification_complete": false,
    "missing_user_info": ["forum_username", "email"]
  },
  "next_action": {
    "action": "ask_forum_details",
    "question_to_ask": "Perfect! What's your forum username and the email associated with your account? This helps us keep track of your support history."
  }
}
```

**User identification complete, ready for technical questions:**
```json
{
  "mode": "collect",
  "collected_data": {
    "user_identification": {
      "user_name": { "status": "provided", "value": "John" },
      "fins_plus_subscriber": { "status": "yes", "value": true },
      "forum_account": { "status": "yes", "value": true },
      "forum_username": { "status": "provided", "value": "john_dev" },
      "user_email": { "status": "provided", "value": "john@example.com" },
      "identification_complete": true
    }
  },
  "completeness_check": {
    "user_identification_complete": true,
    "technical_context_ready": false,
    "missing_technical": ["category", "problem_description"]
  },
  "next_action": {
    "action": "ask_product",
    "question_to_ask": "Thanks John! Now, what Finsweet product are you working with today?"
  }
}
```

**All info complete, ready for ANALYZE:**
```json
{
  "mode": "collect",
  "collected_data": {
    "user_identification": {
      "user_name": { "status": "provided", "value": "John" },
      "fins_plus_subscriber": { "status": "yes", "value": true },
      "forum_account": { "status": "yes", "value": true },
      "forum_username": { "status": "provided", "value": "john_dev" },
      "user_email": { "status": "provided", "value": "john@example.com" },
      "identification_complete": true
    },
    "category": { "status": "identified", "value": "attributes_v2" },
    "problem": { "status": "clear", "summary": "CMS filter showing wrong items when clicking category buttons" }
  },
  "completeness_check": {
    "user_identification_complete": true,
    "technical_context_ready": true,
    "can_proceed_to_analyze": true
  },
  "next_action": {
    "action": "proceed_to_analyze",
    "reasoning": "User identification complete (John, Fins+, forum: john_dev). Have product (attributes) and clear problem description."
  }
}
```

Always wait for complete JSON output before proceeding.
