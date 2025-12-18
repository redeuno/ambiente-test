Strategic analysis tool called TWICE during workflow for iterative refinement.

## WHEN TO USE

**FIRST CALL (ANALYZE MODE)** - Before executing any searches:
Call with mode: "analyze" to get strategic planning, category validation, search strategy, preliminary confidence, and expectations.

**SECOND CALL (VALIDATE MODE)** - After executing all searches:
Call with mode: "validate" to compare expectations vs reality, adjust confidence, decide on Perplexity, generate quality checklist, and refine strategy.

## INPUT FORMAT

**For ANALYZE mode:**
```json
{
  "mode": "analyze",
  "message": "user's complete forum post",
  "category": "provided category from forum",
  "html": "complete|partial|missing",
  "html_content": "HTML if available",
  "image_analysis": "screenshot description if available"
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

Returns complete structured JSON analysis with:
- ANALYZE: context, category validation, problem type, search strategy, preliminary confidence
- VALIDATE: search validation, confidence adjustment, quality checklist (5-7 items), solution refinement, escalation assessment

Always wait for complete JSON output before proceeding.