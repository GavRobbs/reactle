export default function AttemptLine(props){

    const wordArray = [...props.word]

    const characters = [...props.characters].map((c, index) => {

        if(!props.active){
            return <span key={index}>{c.toUpperCase()}</span>
        }

        if(wordArray[index] == c){
            return <span key={index} className="correct">{c.toUpperCase()}</span>
        } else if(wordArray.includes(c)){
            return <span key={index} className="misplaced">{c.toUpperCase()}</span>
        } else{
            return <span key={index} className="incorrect">{c.toUpperCase()}</span>
        }
    });

    return (
    <div className="attempt">
        {characters}
    </div>
    );
}