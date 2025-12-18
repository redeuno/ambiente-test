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
    "username": "if provided or [NOT PROVIDED]",
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
- Collected data status (what we have vs don't have)
- Completeness check (minimum met? missing critical info?)
- Next action (ask_question | proceed_to_analyze | request_url)
- Conversation guidance (tone, what to acknowledge)

**Key decision: `next_action.action`**
- `ask_question`: Need more info, includes suggested question
- `proceed_to_analyze`: Have enough context, continue to ANALYZE
- `request_url`: Need staging URL for diagnosis
- `request_screenshot`: Need visual context

### ANALYZE mode returns:
- Context analysis with conversation summary
- Category validation with evidence
- Problem type and complexity
- Search strategy with specific terms
- Preliminary confidence with factors
- Response planning

### VALIDATE mode returns:
- Search validation (expectations vs reality)
- Confidence adjustment (final score)
- Perplexity decision
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
   Sufficient context?
         │
    NO ──┼── YES
         │    │
         ▼    ▼
   Ask question   ┌──────────────────┐
   Wait for reply │  ANALYZE MODE    │
   Loop back      └────────┬─────────┘
                           │
                           ▼
                    Execute searches
                           │
                           ▼
                  ┌──────────────────┐
                  │  VALIDATE MODE   │
                  └────────┬─────────┘
                           │
                           ▼
                    Craft response
```

## EXAMPLE COLLECT OUTPUTS

**User: "hi"**
```json
{
  "mode": "collect",
  "completeness_check": {
    "minimum_met": false,
    "missing_critical": ["category", "problem_description"]
  },
  "next_action": {
    "action": "ask_question",
    "question_to_ask": "Hey there! 👋 What Finsweet product are you working with today?"
  }
}
```

**User: "my CMS filter isn't working"**
```json
{
  "mode": "collect",
  "collected_data": {
    "category": {
      "status": "identified",
      "value": "attributes_v2",
      "indicators": ["CMS filter mentioned"]
    },
    "problem": {
      "status": "vague",
      "summary": "CMS filter not working - needs more detail"
    }
  },
  "completeness_check": {
    "minimum_met": false,
    "missing_critical": ["problem_description"]
  },
  "next_action": {
    "action": "ask_question",
    "question_to_ask": "Got it, you're working with CMS Filter! Could you tell me what's happening? Is it not filtering at all, or is something specific not working as expected?"
  }
}
```

**User: "my CMS filter shows wrong items when I click on category buttons"**
```json
{
  "mode": "collect",
  "collected_data": {
    "category": {
      "status": "identified",
      "value": "attributes_v2",
      "confidence": "high"
    },
    "problem": {
      "status": "clear",
      "summary": "CMS filter showing wrong items when clicking category buttons"
    }
  },
  "completeness_check": {
    "minimum_met": true,
    "can_proceed_to_analyze": true
  },
  "next_action": {
    "action": "proceed_to_analyze",
    "reasoning": "Have clear product (attributes/CMS filter) and problem description"
  }
}
```

Always wait for complete JSON output before proceeding.
