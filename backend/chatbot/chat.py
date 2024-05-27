import os
import logging
from time import sleep
from openai import AsyncOpenAI
from .chat_assisstant import create_assistant

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
os.environ['OPENAI_API_KEY'] = ""

class ChatAssistant:
    def __init__(self):
        self.api_key = os.environ['OPENAI_API_KEY']
        self.client = AsyncOpenAI(api_key=self.api_key)
        self.assistant_id = create_assistant()
    
    async def start_conversation(self):
        logger.debug("Starting a new conversation...")
        thread = await self.client.beta.threads.create()
        print(thread)
        logger.debug(f"New thread created with ID: {thread.id}")
        return {"id": thread.id}

    async def chat(self, data):
        thread_id = data.thread_id
        user_input = data.message

        if not thread_id:
            logger.error("Missing thread_id")
            return {"error": "Missing thread_id"}, 400

        logger.debug(f"Received message: {user_input} for thread ID: {thread_id}")

        # Add the user's message to the thread
        await self.client.beta.threads.messages.create(thread_id=thread_id, role="user", content=user_input)

        print(thread_id)
        print(self.assistant_id)
        # Run the Assistant
        run = await self.client.beta.threads.runs.create(thread_id=thread_id, assistant_id=self.assistant_id)
        print(run)
        # Check if the Run requires action (function call)
        while True:
            run_status = await self.client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            print(f"Run status: {run_status.status}")
            if run_status.status == 'completed':
                break
            sleep(2)  # Wait for a second before checking again

        # Retrieve and return the latest message from the assistant
        messages = await self.client.beta.threads.messages.list(thread_id=thread_id)
        response = messages.data[0].content[0].text.value

        logger.debug(f"Assistant response: {response}")
        return {"response": response}
    async def get_run_status(self, thread_id):
        runs = await self.client.beta.threads.runs.list(thread_id=thread_id)
        print(runs)

# chat = ChatAssistant()
# chat.get_run_status("thread_NMWW4XsN6urTRNaURh2YqMSj")