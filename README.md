# Tic-Tac-Toe-ML
 Just Tic Tac Toe but u train ur opponent AI and defeat it!

<img width="1364" height="320" alt="Tic Tac Toe" src="https://i.ibb.co/PvCSkdvQ/image-6.png" />

# Try it now!
Click on the link attached to play the game and test your skills.     
It is recommended to train the opponent AI till atleast generation 50     
Best possible result is a draw
[Tic Tac Toe ML](https://grainlet.github.io/Tic-Tac-Toe-ML/)

# How it works?
During each training generation, a population of neural networks competes across simulated Tic Tac Toe matches. Each network receives 9 board inputs representing its own marks, the opponents marks and empty spaces, then outputs scores for the possible moves. Networks are rewarded for winning and drawing while losses receive lower scores. Each generation, the highest performing networks are saved, crossed over and mutated to create the next population. Over successful generations, the AI evolves its move selection, and the best performing network is saved for players to fight against.

# Credits
The neuroevolution guide attached in the guide page of the PlayerTwo website helped me

# AI Transparency
No AI was used
