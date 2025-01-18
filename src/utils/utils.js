import words from './words.json'

export function getRandomWord(){

    return words[Math.floor(Math.random() * words.length)];

}

export function compareWord(test, word){

    //Compare the word to test to the winning word character by character and return an array of object values
    //that denote if the character is not in the word at all (1), the character is in the word but in the wrong place (2) or
    //the character is in the word AND in the right place (3)

    return [...test].map((letter, i) => {

        if(word[i] == letter){
            return {[letter]: 3};
        } else if(word.includes(letter)){
            return {[letter]:2};
        } else{
            return {[letter]:1};
        }

    });

}

export function checkWord(test){
    return words.includes(test);
}