import words from './words.json'

export function getRandomWord(){

    return words[Math.floor(Math.random() * words.length)];

}

export function checkWord(test){

    return words.includes(test);

}