import { useState, useEffect, useRef } from 'react'
import { checkWord, compareWord, getRandomWord } from './utils/utils';
import Confetti from "react-confetti";
import AttemptLine from './components/AttemptLine'
import './App.css'
import SolutionLine from './components/SolutionLine';
import BooSound from './assets/boo.mp3';
import YaySound from './assets/yay.wav';
import NopeSound from "./assets/nope.wav";
import InvalidSound from "./assets/invalid.mp3";
import clsx from 'clsx';
import RightLetterImg from "./assets/rightletter.png";
import WrongLetterImg from "./assets/wrongletter.png";
import WrongPosImg from "./assets/wrongpos.png";

function App() {

  //State variables here
  const [currentWord, setCurrentWord] = useState(getRandomWord());
  const [currentGuesses, setCurrentGuesses] = useState({
    cursorPosition: 0,
    guessData : [
    "     ", "     ", "     ", "     ", "     ", "     ",
    ],
    awaitingEnter : false,
    currentLine : 0,
    letters: [..."abcdefghijklmonpqrstuvwxyz"].map((l) => {
      return {letter : l, status: 0};
    })
  });
  const [instructionDialogActive, setInstructionDialogActive] = useState(true);

  const statusButtonRef = useRef(null);
  const booSoundRef = useRef(null);
  const yaySoundRef = useRef(null);
  const nopeSoundRef = useRef(null);
  const invalidSoundRef = useRef(null);

  //Derived variables here
  const gameWon = currentGuesses.guessData.includes(currentWord) && currentGuesses.awaitingEnter == false;
  const gameLost = !currentGuesses.guessData.includes(currentWord) && currentGuesses.cursorPosition >= 30 && currentGuesses.awaitingEnter == false;
  const gameOver = gameWon || gameLost;

  function addCharacter(event){

    if(gameWon || gameLost){
      return;
    }

    if(event.key == "Enter"){
      setCurrentGuesses((prev) => {
        if(prev.awaitingEnter){

          let isAWord = checkWord(prev.guessData[prev.currentLine]);

          if(isAWord == false){

            //If its not a word in the dictionary, we reject it
            let cleared = prev.guessData.map((guess, index) => {

              if(prev.currentLine != index){
                return guess;
              } else{
                return "     ";
              }
              
    
            })

            invalidSoundRef.current.play().catch((err) => {
              console.log("Playback error");
            });

            return {...prev, awaitingEnter: false, currentLine: prev.currentLine, cursorPosition: prev.currentLine * 5, guessData: cleared};

          } else{
            //If it is a word, we need to change the color hints appropriately
            let newletters = structuredClone(prev.letters);
            let testArray = compareWord(prev.guessData[prev.currentLine], currentWord);
            let threeCount = 0;

            /* This is a bit of a kludge, but here goes. The letters state is actually stored as an array of key-value pairs, in which each pair consists of a {letter: letter, status: status}. We first clone the array of pairs pair. We then iterate over testArray, which consists of an array of {[letter] : [status]}. On each iteration, we see if the current pair's letter is in the character in the key-value pair for that iteration of testArray.

            If it is, we compare the status values. I deliberately ordered the status values from higher to lower with higher being more correct, and the ternary operation replaces higher values with lower values. The logic behind this is that in a
            previous guess, you may have guessed the right letter, but put it in the wrong place, but in a subsequent guess, you may get the right letter in the right place. This logic also handles people making guesses with words with repeated letters, where one instance of the letter is correct, but the other is wrong.
            
            */

            for(let i = 0; i < newletters.length; ++i){

              for(let j = 0; j < testArray.length; ++j){

                let letter = newletters[i].letter;

                if(newletters[i].letter in testArray[j]){

                  let testStatus = testArray[j][letter];

                  if(testStatus == 3){
                    threeCount += 1;
                  }

                  newletters[i].status = testStatus > newletters[i].status ? testStatus : newletters[i].status;
                }

              }

            }

            
            if(threeCount < 5){
              nopeSoundRef.current.play().catch(err => {
                console.log("Playback error");
              });
            }

            return {...prev, 
              awaitingEnter: false, 
              currentLine: prev.currentLine + 1,
              letters: newletters};
          }


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
            ...prev,
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

  function synthetic_input(letter){

    //I use these to fake key events from the keyboard
    if(letter == "Enter"){
      addCharacter({key:"Enter"});
    }
    else if(letter == "Backspace"){
      addCharacter({key:"Backspace"});
    }
    else{
      addCharacter({key:letter});
    }
  }

  useEffect(() => {
    //The dependencies on these allow us to block input when the player has won or lost the game
    document.addEventListener("keyup", addCharacter);

    return () => {document.removeEventListener("keyup", addCharacter)};
  }, [gameWon, gameLost])

  useEffect(() => {

    const yaysnd = new Audio(YaySound);
    yaysnd.load();
    yaySoundRef.current = yaysnd;

    const boosnd = new Audio(BooSound);
    boosnd.load();
    booSoundRef.current = boosnd;

    const nopesnd = new Audio(NopeSound);
    nopesnd.load();
    nopeSoundRef.current = nopesnd;

    const invalidsnd = new Audio(InvalidSound);
    invalidsnd.load();
    invalidSoundRef.current = invalidsnd;


  }, [])

  useEffect(() => {

    //This plays the audio on win or lose

    if(gameWon){

      yaySoundRef.current.play();
      statusButtonRef.current.scrollIntoView({behaviour: "smooth"});

    } else if(gameLost){

      booSoundRef.current.play();
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
      currentLine : 0,
      letters: [..."abcdefghijklmonpqrstuvwxyz"].map((l) => {
        return {letter : l, status: 0};
      })

    });
  }

  return (
    <>
      <header>
        <h1>Reactle</h1>
      </header>
      <main>

        <section id="attempts">
          {renderGuesses()}
          <SolutionLine gameLost={gameLost} word={currentWord}/>
        </section>

        <div id="keyboardcontainer">
          <div id="keyboard">
          <button className="letterbutton" onClick={()=>synthetic_input("Backspace")}>⌫</button>
            {
                currentGuesses.letters.map((l, index) => {
                  return <button key={index} 
                  className={clsx({"letterbutton" : true, "right": l.status == 3, "almost":l.status == 2, "wrong":l.status == 1})}
                  onClick={()=>synthetic_input(l.letter)}>{l.letter}</button>
                })
            }
            <button className='letterbutton' onClick={()=>synthetic_input("Enter")}>⏎</button>
          </div>
        </div>

        {
          instructionDialogActive &&
          <div className="dialog-overlay">
            <div className="dialog">
              <h1 className="dialog-header-instruction">Reactle</h1>
              <p className="dialog-info italic">Imagine if Wordle actively hated you.</p>
              <h2 className="dialog-header-subheading">How To Play</h2>
              <p className="dialog-info">Guess the word in 6 tries. Type in letters and press enter to submit your guess and use backspace to correct mistakes.</p>
              <p className="dialog-info">Use the hints from previous guesses to guide you.</p>
              <div className="dialog-explainer-list">
                <div className="dialog-explainer">
                <img src={RightLetterImg} />
                The letter is in the word and the position is correct.
                </div>
                <div className="dialog-explainer">
                <img src={WrongPosImg} />
                The letter is in the word and but the position is incorrect.
                </div>
                <div className="dialog-explainer">
                <img src={WrongLetterImg} />
                The letter is not in the word at all.
                </div>                
              </div>
              <button className="winbutton" onClick={() => setInstructionDialogActive(false)}>START</button>
            </div>
          </div>
        }

        { gameOver && 
        <div className="dialog-overlay">
          <div className="dialog">
            {gameWon && 
            <>
              <h1 className="dialog-header">You won!</h1>
              <button className="winbutton" ref={statusButtonRef} onClick={replay}>Play again?</button>
            </>
            }
            {gameLost && 
            <>
              <h1 className="dialog-header">You lost!</h1>
              <p className="dialog-info">The word is {currentWord.toUpperCase()}.</p>
              <button className="losebutton" ref={statusButtonRef} onClick={replay}>Play again?</button>
            </>
            }
          </div>
        </div>
        }

      {gameWon && <Confetti />}


      </main>
    </>
  )
}

export default App