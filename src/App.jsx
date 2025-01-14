import { useState, useEffect, useRef } from 'react'
import { checkWord, getRandomWord } from './utils/utils';
import Confetti from "react-confetti";
import AttemptLine from './components/AttemptLine'
import './App.css'
import SolutionLine from './components/SolutionLine';
import BooSound from './assets/boo.mp3';
import YaySound from './assets/yay.wav';


function App() {

  //State variables here
  const [currentWord, setCurrentWord] = useState(getRandomWord());
  const [currentGuesses, setCurrentGuesses] = useState({
    cursorPosition: 0,
    guessData : [
    "     ", "     ", "     ", "     ", "     ", "     ",
    ],
    awaitingEnter : false,
    currentLine : 0
  });

  const statusButtonRef = useRef(null); 

  //Derived variables here
  const gameWon = currentGuesses.guessData.includes(currentWord) && currentGuesses.awaitingEnter == false;
  const gameLost = !currentGuesses.guessData.includes(currentWord) && currentGuesses.cursorPosition >= 30 && currentGuesses.awaitingEnter == false;

  function addCharacter(event){

    if(gameWon || gameLost){
      return;
    }

    if(event.key == "Enter"){
      setCurrentGuesses((prev) => {
        if(prev.awaitingEnter){

          if(checkWord(prev.guessData[prev.currentLine]) == false){

            //If its not an english word, we reject it

            let cleared = prev.guessData.map((guess, index) => {

              if(prev.currentLine != index){
                return guess;
              } else{
                return "     ";
              }
              
    
            })

            return {...prev, awaitingEnter: false, currentLine: prev.currentLine, cursorPosition: prev.currentLine * 5, guessData: cleared};

          }

          return {...prev, awaitingEnter: false, currentLine: prev.currentLine + 1};
        } else{
          return prev;
        }
      })
      return;
    }

    if(event.key == "Backspace"){
      setCurrentGuesses((prev) => {

          let current_row = Math.floor(prev.cursorPosition / 5);
          let last_row = Math.floor((prev.cursorPosition - 1) /5);
          let col = prev.cursorPosition % 5;

          if((last_row != current_row) && !prev.awaitingEnter){
            //Nothing to do here because we're already on the newline
            return prev;
          }

          let ngd;

          if((last_row != current_row) && prev.awaitingEnter){
            //The line is full but we haven't selected enter yet,
            //so that means only the last character needs to go
            ngd =  prev.guessData.map((guess, index) => {

              if(last_row != index){
                return guess;
              }
    
              let ga = [...guess];
              ga[4] = ' ';
  
              return ga.join('');
            })
          } else{

            ngd = prev.guessData.map((guess, index) => {

              if(current_row != index){
                return guess;
              }
    
              let ga = [...guess];
              ga[col - 1] = " ";
  
              return ga.join('');              
    
            })
          }
  
          let newpos = prev.cursorPosition - 1
  
          return {
            cursorPosition : newpos,
            guessData: ngd,
            awaitingEnter: false,
            currentLine: prev.currentLine
          }
        }
      )
      return;
    }

    if(/^[a-zA-Z]$/.test(event.key)){

      setCurrentGuesses((prev) => {

        if(prev.awaitingEnter){
          return prev;
        }

        let row = Math.floor(prev.cursorPosition / 5);
        let col = prev.cursorPosition % 5;

        let ngd = prev.guessData.map((guess, index) => {

          if(row != index){
            return guess;
          }

          let ga = [...guess];
          ga[col] = event.key.toLowerCase();
          return ga.join('');

        })

        let newpos = prev.cursorPosition + 1

        return {
          ...prev,
          cursorPosition : newpos,
          guessData: ngd,
          awaitingEnter: (newpos % 5) === 0
        }
      })

    }

  }

  useEffect(() => {
    //The dependencies on these allow us to block input when the player has won or lost the game
    document.addEventListener("keyup", addCharacter);

    return () => {document.removeEventListener("keyup", addCharacter)};
  }, [gameWon, gameLost])

  useEffect(() => {

    //This plays the audio on win or lose

    if(gameWon){

      const audio = new Audio(YaySound);
      audio.play();
      statusButtonRef.current.scrollIntoView({behaviour: "smooth"});

    } else if(gameLost){

      const audio = new Audio(BooSound);
      audio.play();
      statusButtonRef.current.scrollIntoView({behaviour: "smooth"});

    }
    
  }, [gameWon, gameLost])


  function renderGuesses(){
    
    return currentGuesses.guessData.map((g, index) => {

      return <AttemptLine key={index} characters={g} word={currentWord} active={currentGuesses.currentLine > index} />

    })
  }

  function replay(){
    setCurrentWord(getRandomWord());
    setCurrentGuesses({
      cursorPosition: 0,
      guessData : [
      "     ", "     ", "     ", "     ", "     ", "     ",
      ],
      awaitingEnter : false,
      currentLine : 0
    });
  }

  return (
    <>
      <header>
        <h1>Reactle</h1>
      </header>
      <main>
        <section id="description">
          <p>Try to figure out the word in 6 guesses! Use your keyboard to input the letters and press ENTER when you're done. You can use backspace if you make a mistake.</p>
        </section>

        <section id="attempts">
          {renderGuesses()}
          <SolutionLine gameLost={gameLost} word={currentWord}/>
        </section>

        <section id="replay">
          {gameWon && <button className="winbutton" ref={statusButtonRef} onClick={replay}>You won! Play again?</button>}
          {gameLost && <button className="losebutton" ref={statusButtonRef} onClick={replay}>You lost! Play again?</button>}
        </section>

      {gameWon && <Confetti />}


      </main>
      <footer></footer>
    </>
  )
}

export default App
