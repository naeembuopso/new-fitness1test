from typing import List, Tuple
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Boolean, Column, Integer, String
import os

# Database URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://pyservice:paras1239@127.0.0.1:5432/sriaaschat_db")

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)

class Message(Base):
    __tablename__ = "messages"
    message_id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, index=True)
    username = Column(String, index=True)
    content = Column(String)

# Create tables
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def add_messages_to_db(db: AsyncSession, messages: List[Tuple[int, int, str]]):
    """
    Add multiple messages to the database.

    Parameters:
    - db: AsyncSession - the database session.
    - messages: List[Tuple[int, int, str]] - A list of messages to add, where each message is a tuple of (conversation_id, user_id, content).

    Returns:
    - List[Message] - the list of created Message objects.
    """
    created_messages = []
    for (conversation_id, username, content) in messages:
        new_message = Message(conversation_id=conversation_id, username=username, content=content)
        db.add(new_message)
        created_messages.append(new_message)

    await db.commit()  # Commit once after adding all messages

    # Refresh each new message object
    for message in created_messages:
        await db.refresh(message)

    return created_messages
