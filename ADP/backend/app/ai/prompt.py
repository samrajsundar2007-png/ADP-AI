def get_analytical_prompt(schema_info: str, user_query: str) -> str:
    return f"""You are the ADP-AI Expert Data Analytics Co-Pilot.
    Dataset Schema Metadata:
    {schema_info}
    
    User Query: {user_query}
    
    Provide context-aware architectural insight on column processing logic or mathematical trends."""
# Centrally managed context instruction frames for custom template adjustments
operation_template = "Contextual analysis layer indexing parameters over schema structures."
