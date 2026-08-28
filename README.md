The project is working very very fine

First cd into backend
then use these commands in terminal to start backend

```bash
source .venv/bin/activate
uvicorn app.main:app --reload\
```

cd into frontend
then use these commands in terminal to start backend

```bash
npm run dev
```

Keep in mind, only I can run this project on my Machine because I use my own API key for running Gemini model 
For you to run this project, you have to add your own Gemini API key and add it to .env file