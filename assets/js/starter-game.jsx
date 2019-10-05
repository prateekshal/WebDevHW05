import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';

export default function game_init(root, channel) {
  ReactDOM.render(<Starter channel={channel} />, root);
}
class Starter extends React.Component {
  constructor(props) {
    super(props);
    this.channel = props.channel;
    this.state = { 
      cards: [],
      score: 0,
      firstCardID: [],
      secondCardID: [],
      guessedCards: [],
      clickedCards: []
    };

    this.channel
    .join()
    .receive("ok", this.got_view.bind(this))
    .receive("error", resp => { console.log("Unable to join", resp); });

    this.createCards = this.createCards.bind(this);
    this.renderCards = this.renderCards.bind(this);
    this.disableAll = this.disableAll.bind(this);
    this.enableAll = this.enableAll.bind(this);
    this.restart = this.restart.bind(this);

  }

  got_view(view) {
    //console.log("new view", view);
    //this.disableAll();
    this.setState(view.game);
    if(this.state.firstCardID.length === 1 && this.state.secondCardID.length === 1){
      this.disableAll();
      setTimeout(() => {
        this.channel.push("compare")
      .receive("ok", this.got_view.bind(this));
      this.enableAll();
      }, 1000);
      
    }
    //this.enableAll();
  }

  /*
  This function is used to create a grid of 4*4 16 buttons with values ranging from A to H.
  Each button is created as a column and added to an array.
  Then 4 rows are created and the array containing the columns is sliced by 4 each time and added to the row to get the 4*4 grid.

  */
  createCards(){
    let values = this.state.cards;
    let guessedCards = this.state.guessedCards;
    guessedCards = guessedCards.flat();
    let clickedCards = this.state.clickedCards;
    clickedCards = clickedCards.flat();
    let cards = [];
    clickedCards = clickedCards.map(Number);
    for(let i=0; i< 16; i++){
      if(clickedCards.includes(i)){
        cards.push(<div className="column" key ={i}><button id={i} value={values[i]} disabled={true}>{values[i]}</button></div>);
      }
      else if(guessedCards.includes(values[i])){
        cards.push(<div className="column" key ={i}><button id={i} value={values[i]} disabled={true}>{values[i]}</button></div>);
      }
      else{
        cards.push(<div className="column" key ={i}><button id={i} value={values[i]} onClick={this.evaluate.bind(this)} disabled={false}>Click</button></div>);
      }
    }
    return cards;
  }

  renderCards(){
    let cards = this.createCards();
    let cardsView = [];
    let j = 0;
    for(let i=0; i< 4; i++){
      cardsView.push(<div className="row" key={i}>{cards.slice(j, (j+4))}</div>);
      j = j+4;
    }
    return cardsView;
  }

  /*
  This function is used to disable all buttons except the restart button.
  */
  disableAll(){
    $('button').each(function(){
      if(this.innerHTML != "Restart Game!" ){
        this.disabled = true;
      }
    });
  }

  /*
  This function is used to enable all buttons that have their inner HTML set to Click.
  */
  enableAll(){
    let guessedCards = this.state.guessedCards;
    guessedCards = guessedCards.flat();
    let clickedCards = this.state.clickedCards;
    clickedCards = clickedCards.flat();
    $('button').each(function(){
        this.disabled = false;
    });
  }

  /*
  This function is called on click on the buttons in the grid.
  It checks if the button clicked is the first card that is flipped.
  If it is, it flips the card to display the value and disable it so that user does not click on it again. Also, updates the state object.
  If it is the second card that is clicked, then it disables all the buttons so that no button is clicked at this point.
  It sets the state object, displays the value of the card and calls checkCards function after a delay of 1ms.
  */
  evaluate(ev){
    //ev.target.innerHTML = ev.target.value;
    //ev.target.disabled = true;
    this.channel.push("click", { val: ev.target.value, id: ev.target.id})
    .receive("ok", this.got_view.bind(this));
  }

  /*
  This function is used to restart the game at any given point. It reloads the page so that state object can be set to initial state.
  */
  restart(){
    this.channel.push("restart")
    .receive("ok", this.got_view.bind(this));
  }

  /*
  This is the render function to display the different components required for this game.
  */
  render() {
    let cards = this.renderCards();
    let score = "Your score so far: " + this.state.score;
    return(
      <div className="container">
        <HeaderComponent />
        <RulesComponent />
        <div className="row">
          <DisplayScoreComponent root={this} />
        </div>
        <div className="row">
          <p>{score}</p>
        </div>
          {cards}
        <div className="row">
          <div className="column column-25 column-offset-25">
            <button className="button button-outline" onClick={this.restart}>Restart Game!</button>
          </div>
        </div>
      </div>
    );
  }
}

/*
This is the presentational component for displaying the header of the game.
*/

function HeaderComponent(){
	return(
		<div className="row">
		   <div className="column column-offset-25">
		      <p><strong>Memory Game- Flip the cards</strong></p>
		   </div>
		</div>
	);
}

/*
This is the presentational component for displaying the rules of the game.
*/

function RulesComponent(){
  return(
		<div className="row">
		   <div className="column">
		      <ul>
		         <li>You start with 16 cards with 8 identical pairs. Click on any card and the value of that card is revealed.</li>
             <li>Try to match the card with its twin. If the cards match, you gain 100 points, else you lose 10 points and the cards get flipped back.</li>
             <li>You win once all the cards are revealed and matched. You can restart the game at any point in time by clicking on Restart Game button at the bottom.</li>
             <li><small><em>HINT: Try to memorise the cards as you flip</em></small></li>
		      </ul>
		   </div>
		</div>
  );
}

/*
This is the presentational component for displaying the score of the current game.
*/

function DisplayScoreComponent(params){
  let root = params.root;
  let displayVal = "Cards to go: " + (8 - root.state.guessedCards.length);
  if(root.state.guessedCards.length === 8){
    displayVal = "You Win!";
  }
  return(
    <p><strong>{displayVal}</strong></p>
  );
}


