from typing import List, Dict, Any
from .prompt import build_mentor_system_prompt


def feed_dialogue_history(
    messages: List[Any], 
    window_size: int = 6
) -> List[Dict[str, str]]:
    """
    Feeds and sanitizes the last N historical dialogue messages from DB models or dicts.
    Enforces alternating role structure and trims excessive context.
    """
    history_feed: List[Dict[str, str]] = []
    
    # Take the most recent window of messages
    recent_messages = messages[-window_size:] if messages else []
    
    for msg in recent_messages:
        role = getattr(msg, "role", None) or (msg.get("role") if isinstance(msg, dict) else None)
        content = getattr(msg, "content", None) or (msg.get("content") if isinstance(msg, dict) else "")
        
        if role in ("user", "assistant") and content.strip():
            history_feed.append({"role": role, "content": content.strip()})
            
    return history_feed


def assemble_context_feed(
    user_name: str,
    tech_stack: Dict[str, Any] | None,
    raw_history: List[Any],
    current_message: str,
    window_size: int = 6
) -> List[Dict[str, str]]:
    """
    Combines system prompt, pruned historical feed, and the current user input 
    into a complete LLM payload.
    """
    system_instruction = build_mentor_system_prompt(user_name, tech_stack)
    dialogue_feed = feed_dialogue_history(raw_history, window_size=window_size)
    user_turn = {"role": "user", "content": current_message.strip()}
    
    return [system_instruction] + dialogue_feed + [user_turn]