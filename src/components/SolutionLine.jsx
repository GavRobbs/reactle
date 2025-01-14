export default function SolutionLine(props){

    const solution = [...props.word].map((c, index) => {
        return <span key={index} className="correct">{c.toUpperCase()}</span>
    });
             
    return (
        props.gameLost && <div className="attempt">{solution}</div>);

}