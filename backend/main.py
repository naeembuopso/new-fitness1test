import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, FastAPI, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from openai import OpenAI
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from model.response.chat import MessageResponse
from model.request.chat import ChatRequest
from model.response.login import LoginResponse
from model.request.login import LoginRequest
from custom_exception import *
from fastapi.middleware.cors import CORSMiddleware
from model.request.create_user import UserCreateRequest
from model.models import User, UserInDB, TokenData, Token
from middleware.traceId import TraceIDMiddleware
from util.db import add_messages_to_db, get_db, create_db_and_tables, UserDB
from util.id_gen import generate_id
from chatbot.chat import ChatAssistant
# Set up CORS
origins = [
    "http://localhost",
    "http://localhost:8000"
]

SECRET_KEY = "a_very_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(on_startup=[create_db_and_tables])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from these origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers (Authorization, Content-Type, etc.)
)
# Configure logging
app.add_middleware(TraceIDMiddleware)

chat_assisstant = ChatAssistant()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Utility function to verify a plain password against a hashed password
def verify_password(plain_password, hashed_password):
    logger.info("Verifying password.")
    if pwd_context.verify(plain_password, hashed_password):
        logger.info("Password verification successful.")
        return True
    else:
        logger.warning("Password verification failed.")
        return False
    
def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(db: AsyncSession, username: str) -> Optional[UserInDB]:
    result = await db.execute(text("SELECT * FROM users WHERE username = :username"), {"username": username})
    user_dict = result.fetchone()
    if user_dict:
        return UserInDB(**user_dict._asdict())

async def authenticate_user(db: AsyncSession, username: str, password: str) -> Optional[UserInDB]:
    user = await get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def validate_and_renew_token(token: str, db: AsyncSession):
    try:
        # Decode the token payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise InvalidCredentialsException()

        # Fetch user from the database
        user = await get_user(db, username=username)
        if user is None or user.disabled:
            raise InvalidCredentialsException()

        # Check if token should be renewed based on expiry time
        expire_time = datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
        current_time = datetime.now(timezone.utc)
        remaining_time = expire_time - current_time

        # If the remaining time is less than a threshold, renew token
        renew_threshold = timedelta(minutes=5)
        if remaining_time < renew_threshold:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            new_token = create_access_token(
                data={"username": user.username}, expires_delta=access_token_expires
            )
            return {"access_token": new_token, "token_type": "bearer"}

        return {"access_token": token, "token_type": "bearer", "username": username}

    except JWTError:
        raise InvalidCredentialsException()

@app.post("/register", response_model=User)
async def register_user(user: UserCreateRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    # Check if username or email already exists
    result = await db.execute(text("SELECT * FROM users WHERE username = :username OR email = :email"), 
                              {"username": user.username, "email": user.email})
    existing_user = result.fetchone()
    if existing_user:
        raise UserAlreadyExistsException()
    
    # Hash the user's password
    hashed_password = get_password_hash(user.password)

    # Create an instance of the UserDB model
    new_user = UserDB(username=user.username, email=user.email, hashed_password=hashed_password)

    # Add the new user to the session and commit
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/login", response_model=LoginResponse)
async def login_for_access_token(
    login_request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    user = await authenticate_user(db, login_request.username, login_request.password)
    if not user:
        raise IncorrectPasswordException()
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": user.username}, expires_delta=access_token_expires
    )
    return LoginResponse(status = "success",
                         access_token = access_token,
                         token_type = "bearer",
                         expires_in = ACCESS_TOKEN_EXPIRE_MINUTES*60)

@app.get("/generate_conversation_id")
async def get_conversation_id(authorization: Annotated[str, Header()], db: Annotated[AsyncSession, Depends(get_db)]):
    if not authorization:
        raise AuthorizationHeaderMissingException()
    try:
        response = await validate_and_renew_token(authorization.split(" ")[1], db)
                
        # Generate a random conversation ID
        thread = await chat_assisstant.start_conversation()
        print(thread)
        conversation_id = generate_id(32)
        initial_message = "Hi! I am Dr. Puru Dhawan trained AI"
        
        # Prepare the list of messages to add
        messages = [
            (conversation_id, response['username'], initial_message)
        ]
        
        # Store the user message and AI response together
        await add_messages_to_db(db, messages)

        return {"conversation_id": conversation_id,
                "thread_id": thread.get("id"),
                "message": initial_message,
                "access_token": response["access_token"],
                }

    except (IndexError, JWTError):
        raise InvalidCredentialsException()
    

@app.post("/chat_response")
async def get_chat_response(chat_request: ChatRequest,authorization: Annotated[str, Header()], db: Annotated[AsyncSession, Depends(get_db)]):
    if not authorization:
        raise AuthorizationHeaderMissingException()
    try:
        response = await validate_and_renew_token(authorization.split(" ")[1], db)
        msg_response = await chat_assisstant.chat(chat_request)
        
        # Prepare the list of messages to add
        messages = [
            (chat_request.conversation_id, response['username'], chat_request.message),
            (chat_request.conversation_id, "assistant", msg_response["response"])
        ]
        
        # Store the user message and AI response together
        await add_messages_to_db(db, messages)

        res = MessageResponse(
                            conversation_id=chat_request.conversation_id,
                            thread_id=chat_request.thread_id,
                            reply=msg_response["response"],
                            access_token=response["access_token"]
                            )
        return res

    except (IndexError, JWTError):
        raise InvalidCredentialsException()
