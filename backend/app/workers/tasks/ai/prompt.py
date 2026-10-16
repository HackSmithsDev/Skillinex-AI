from typing import Dict, Any, List


def format_user_tech_stack(tech_stack: Dict[str, Any] | None) -> str:
    """Formats tech_stack dict (e.g. {'Docker & Kubernetes': 'Intermediate'}) into prompt text."""
    if not tech_stack:
        return "General Software Engineering"
    return ", ".join([f"{tech} ({lvl})" for tech, lvl in tech_stack.items()])


def build_mentor_system_prompt(user_name: str, tech_stack: Dict[str, Any] | None) -> Dict[str, str]:
    """Constructs the system prompt with user context and platform tone."""
    stack_summary = format_user_tech_stack(tech_stack)
    
    content = (
        f"You are the Skillinex Neural Mentor. You are providing direct technical mentorship "
        f"to developer {user_name}.\n"
        f"User Tech Stack & Proficiency: {stack_summary}.\n\n"
        f"Operational Directives:\n"
        f"1. Be concise, tactical, and authoritative. Avoid generic conversational filler.\n"
        f"2. Provide production-grade code snippets and architecture patterns tailored to the user's level.\n"
        f"3. Format technical output strictly in clean Markdown with appropriate syntax-highlighted code blocks.\n"
        f"4. Proactively highlight edge cases, pitfalls, performance bottlenecks, and best practices."
    )
    return {"role": "system", "content": content}


def build_title_prompt(first_message: str) -> List[Dict[str, str]]:
    """Generates prompt to summarize first query into a 3-5 word tactical session title."""
    return [
        {
            "role": "system",
            "content": (
                "Generate a concise 3-5 word technical title for a session that begins with this user query. "
                "Output ONLY the plain title without quotes, markdown, or punctuation."
            )
        },
        {"role": "user", "content": first_message}
    ]