import secrets
import string

def generate_id(length: int) -> str:
    # Define the alphabet: digits, lowercase and uppercase letters
    alphabet = string.ascii_letters + string.digits
    
    # Use secrets.choice to pick random characters securely
    return ''.join(secrets.choice(alphabet) for _ in range(length))

