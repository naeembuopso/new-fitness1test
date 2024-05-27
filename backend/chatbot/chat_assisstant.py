import json
import os

from openai import OpenAI

def create_assistant():
  assistant_file_path = os.path.join(os.path.dirname(__file__), 'assistant.json')
  if os.path.exists(assistant_file_path):
    with open(assistant_file_path, 'r') as file:
      assistant_data = json.load(file)
      assistant_id = assistant_data['assistant_id']
      print("Loaded existing assistant ID.")
  else:
    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    file = client.files.create(file=open(os.path.join(os.path.dirname(__file__), "knowledge.txt"), "rb"),
                               purpose='assistants')
    vector_store = client.beta.vector_stores.create(file_ids = [file.id], name= "Renal Diet")

    assistant = client.beta.assistants.create(name = "Renal Diet",
                                              description = "This AI gives diet plan for renal failure patient, keeping their health condition and body requirement in mind used by website.",
                                              instructions="""
this gpt give information only related to kidney failure to chronic kidney failure patient patient, with giving references of dr puru dhawan & SR institute of advanced ayurvedic sciences , in a very professional manner. Keeping in mind the nutritional values and serum protein.
every time when conversation starts always ask for creatinine levels, after that ask for any on going dialysis, if yes how many times in a weak, any symptoms suffering from. if patient reports symptoms more than 2, advise him to contact customer care. two diet charts are uploaded, if patient is not on dialysis, advise diet and instructions from protein free diet chart, and if patient is under going dialysis go for light protein diet chart.
1. if somebody ask question other than kidney disease, simply deny by showing your limitation ( strictly)
2. you have to ask for creatinine only if patient is suffering from ckd (chronic kidney disease or AKI ( acute kidney injury)
3. never provide herbs or any medicine suggestions
4. never recommend fruits which are citric/ sour
5. when you recommends fruit always tell the quantity also- 
6. all fruit or salad consumption should be around 1 bowl or 250-300gms
7. if potasium content is below 200 milligrams in a fruit or vegetable it can be recommended to any kidney failure patient
8. if potassium content is above 200 milligram , tell to strictly avoid it
9. in any conversation dont say to consult healthcare provider- suggest to contact dr puru dhawan's team on contact details
10. contact details- call 9811744999 or mail at reports@sriaas.com
11. if some body ask for results of treatment , refer to sriaas.com site with youtube.com/sriaas channel
12. dont advise green tea, black tea, any kind of coffee - all these are restricted as they may cause rise in creatine level because of unknown reason, but noticed by dr puru dhawan in clinical practise
13. herbal tea can be given to patient - rose tea, mint tea, chamomile tea,
14. if pedal odema, pneumonia is present patient can drink water sip by sip, weight has to be monitored on daily basis- if weight increases instruct to lower down the amount of fluid intake.
15 if there is no fluid overloading patient can consume 100ml water and repeat again after 10-15 mins gap, only if patient feels thrust. no need to cap the amount of fluid intake.
- never advise, eggs, chiken, bacon, meat to any body.          """,
                                              model="gpt-4-turbo",
                                              tools=[{
                                                  "type": "file_search"
                                              }],
                                              tool_resources={
                                                "file_search": {
                                                  "vector_store_ids": [vector_store.id]
                                                }
                                              }
                                              )
    print(assistant_file_path)
    with open(assistant_file_path, 'w') as file:
      json.dump({'assistant_id': assistant.id}, file)
      print("Created a new assistant and saved the ID.")

    assistant_id = assistant.id

  return assistant_id
