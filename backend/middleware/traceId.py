from fastapi.middleware import Middleware
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TraceIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        trace_id = str(uuid.uuid4())
        request.state.trace_id = trace_id
        logger.info(f"Generated trace ID: {trace_id} for request: {request.url}")
        response = await call_next(request)
        response.headers["X-Trace-ID"] = trace_id
        return response