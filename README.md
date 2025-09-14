# The Imitation Game

This work presents a software implementation that emulates the Imitation Game with three users: an AI Agent, a human user, and a Guesser entrusted with determining whether responses are machine-generated and presented in a manner that displays the Imitation Game in a controlled environment. By logging prompts, answers, and guesser choices, the system is intended to capture the subtleties of interaction and allow for the investigation of error trends, prompting mechanisms, and success rates. As language models improve in fluency and contextual awareness, this implementation not only offers a framework for experimentation but also illustrates current difficulties in differentiating between human and AI communication.

The application was built using React, a popular JavaScript framework [1]. React, while called a framework, is really a set of powerful libraries and hooks that allow for dynamic website functionality. In particular, the useState hook was used to manage component states throughout program execution. Additionally, the useEffect hook was used to dynamically update the chatbox as the guesser and human actor interacted. Externally, we made use of the OpenAI API [2] to fetch our AI responses. This library gave us the ability to 'humanize' the AI through custom prompting. Our application build and bundling was handled by Vite, our version control was handled through Git, and the codebase was hosted through GitHub.

Demo: [Imitation Game Demo]([https://www.youtube.com/watch?v=bgc-3AyNn5U](https://youtu.be/bgc-3AyNn5U))

© 2025 Asghar Kazmi & Denis Musovski. All rights reserved.
