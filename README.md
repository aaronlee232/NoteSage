<!-- <p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/6wj0hh6.jpg" alt="Project logo"></a>
</p> -->

<h3 align="center">NoteSage</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-WIP-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Markdown notes viewer with document powered AI assistant.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](./TODO.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

NoteSage offers a specialized solution for viewing and querying personal documents with more accuracy and relevance than feeding the same content into chatGPT.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Installing

A step by step series of examples that tell you how to get a development env running.

First, clone the repository using:

```
git clone git@github.com:aaronlee232/NoteSage.git
```

Navigate to the root directory of the project and install project dependencies using:

```
npm i
```

Run the app locally using

```
npm run dev
```

Once the command finishes, you should be able to access NoteSage on http://localhost:3000/

## 🎈 Usage <a name="usage"></a>

To interact with the chat directly, navigate to http://localhost:3000/debug-chat, and enter queries in the input field.

After submitting the query, you should see your message appear above the input box. Additional information on what context and conversation messages the AI used to construct its response will be displayed below the input field.

The conversation itself should appear as:

```
user: Can you explain what the function101 does in feature202?
```

The AI response might take a while to appear, but eventually it will show up as:

```
assistant: Yes, I would be glad to explain...
```

Feel free to continue chatting with your personal document AI for as long as you like!

## 🚀 Deployment <a name = "deployment"></a>

There are no instructions to deploy this on a live system as of yet.

## ⛏️ Built Using <a name = "built_using"></a>

- [Supabase](https://supabase.com/) - Database
- [Next.js](https://nextjs.org/) - Meta Framework

## 🚧 Limitations

As of July, NoteSage can only process Markdown Files. Support for additional file types including word and pdf are planned.

## ✨ Things I learned

### Database Design

I had very little experience with SQL coming into this project, so I had to pick up several new concepts regarding how to design and query a Postgres database optimally.

as an example, I learned that one-to-many and many-to-many relations cannot be direcly represented in a SQL database, so a junction table should be used to associate multiple related records with each other.

### Postgres Functions

This project was the first time I made use of Postgres functions to perform complex queries.

The PGVector extension on supabase offered its own dot product operator that could be used to calculate a similarity score between vectors in supabase's RPC Functions, but it required me to write my logic for fitlering/sorting queries in a Postgres function for it to be used effectively for sorting/filtering.

I usually perform calculation logic on the results of a basic SQL query, so loading most of the logic directly into the Postgress function was a very enlightening experience.

<details><summary>More Context...</summary>
Being able to restrict the scope of what the LLM could use as a resource to respond to a query was a blessing and a curse.
<br/>
<br/>
On one hand, it enabled me to restrict the LLM from straying from the contents of the documents and hallucinating answers, but on the other hand it was difficult to balance the restrictiveness of the prompt in a way that it could still reference conversation details without hallucinating.

</details>

## ✍️ Authors <a name = "authors"></a>

- [@aaronlee232](https://github.com/aaronlee232)

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- [@gregnr](https://github.com/supabase/supabase/commits?author=gregnr) - Supabase's Cippy tutorial was very helpful in understanding the implementation behind an AI assistant who could answer based on a set of provided documents

- [Vivek](https://towardsdatascience.com/when-should-you-fine-tune-llms-2dddc09a404a)'s article on whether or not to fine-tune a model is what led me to the idea of using embeddings for providing context
