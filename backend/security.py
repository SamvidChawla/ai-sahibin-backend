# security.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialize the global limiter here
limiter = Limiter(key_func=get_remote_address)