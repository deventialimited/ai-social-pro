import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));