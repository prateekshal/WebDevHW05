import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import $ from 'jquery';

export default function game_init(root) {
  ReactDOM.render(<Starter />, root);
}
class Starter extends React.Component {
  constructor(props) {
    super(props);
    let creCards = this.createCards();
    this.state = { 
      cards: creCards,
      firstCard: "Click",
      firstCardID: null,
      secondCard: "",
      secondCardID: null,
      listOfCards: ["A","B","C","D","E","F","G","H"],
      score: 0
    };
    this.createCards = this.createCards.bind(this);
    this.checkCards = this.checkCards.bind(this);
    this.disableAll = this.disableAll.bind(this);
    this.enableAll = this.enableAll.bind(this);
    this.createCards = this.createCards.bind(this);
    this.shuffleCard = this.shuffleCard.bind(this);
    this.restart = this.restart.bind(this);
  }

  /*
  This function is used to create a grid of 4*4 16 buttons with values ranging from A to H.
  Each button is created as a column and added to an array.
  Then 4 rows are created and the array containing the columns is sliced by 4 each time and added to the row to get the 4*4 grid.

  */
  createCards(){
    let values = ["A","B","C","D","E","F","G","H"];
    let cards = [];
    for(let i=0; i< 16; i++){
        cards.push(<div className="column" key ={i}><button id={i} value={values[i%8]} onClick={this.evaluate.bind(this)}>Click</button></div>);
    }
    cards = this.shuffleCard(cards);
    let cardsView = [];
    let j = 0;
    for(let i=0; i< 4; i++){
      cardsView.push(<div className="row" key={i}>{cards.slice(j, (j+4))}</div>);
      j = j+4;
    }
    return cardsView;
  }

  //Attribution: Durtenfeld Shuffle algorithm.
  /*
  This is the function that takes the cards created in createCards function and shuffles them. Returns a new array.
  */
  shuffleCard(cards){
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
    return cards;
  }

  /*
  This function is used to disable all buttons except the restart button.
  */
  disableAll(){
    $('button').each(function(){
      if(this.innerHTML != "Restart Game!"){
        this.disabled = true;
      }
    });
  }

  /*
  This function is used to enable all buttons that have their inner HTML set to Click.
  */
  enableAll(){
    $('button').each(function(){
      if(this.innerHTML === "Click"){
        this.disabled = false;
      }
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
    let input = $(ev.target);
    let id = ev.target.id;
    let val = input.val();
    if(this.state.firstCardID === null){
      let state1 = _.extend(this.state, {firstCard : val, firstCardID: id});
      this.setState(state1);
      document.getElementById(id).disabled = true;
      document.getElementById(id).innerHTML = val;
    }
    else{
      this.disableAll();
      let state2 = _.extend(this.state, {secondCard : val, secondCardID: id});
      this.setState(state2);
      document.getElementById(id).innerHTML = val;
      setTimeout(() => {
        this.checkCards(val);
      }, 1000);
    }
  }

  /*
  This function is used to restart the game at any given point. It reloads the page so that state object can be set to initial state.
  */
  restart(){
    window.location.reload(false);
  }

  /*
  This function is used to validate if the two cards clicked match.
  It checks if the card values are equal. It adds the points to the score and pops the value from the state object. It also enables all the buttons
  and disables the two matched buttons so that user doesn'y click on them again. State object is updated so that user can select a new card again.
  If the cards do not match, then the innerHTML of the two cards are set to click and all the buttons are enabled again. 10 points is deducted an dthe state object
  is updated so that user can select a new card again.
  */
  checkCards(val){
    let firstCardId = this.state.firstCardID;
    let secondCardId = this.state.secondCardID;
    let score = this.state.score;
    if(this.state.firstCard === this.state.secondCard){

      let cards = this.state.listOfCards;
      score += 100;
      cards.pop(val);
      this.enableAll();

      document.getElementById(firstCardId).disabled = true;
      document.getElementById(secondCardId).disabled = true;

      let state1 = _.extend(this.state, {firstCard: "Click", firstCardID:null, secondCard: "", secondCardID:null, listOfCards: cards, score: score});
      this.setState(state1);
    }
    else{

      document.getElementById(firstCardId).innerHTML = "Click";
      document.getElementById(secondCardId).innerHTML = "Click";
      this.enableAll();
      score -= 10;
      let state1 = _.extend(this.state, {firstCard: "Click",firstCardID: null, secondCard: "", secondCardID: null, score:score});
      this.setState(state1);
    }
  }

  /*
  This is the render function to display the different components required for this game.
  */
  render() {
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
          {this.state.cards}
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

function HeaderComponent(){
	return(
		<div className="row">
		   <div className="column column-50 column-offset-25">
		      <p><strong>Memory Game- Flip the cards</strong></p>
		   </div>
		</div>
	);
}

/*
This is the presentational component for displaying the rules of the game.

function RulesComponent(){
  return(
		<div className="row">
		   <div className="column">
		      <ul>
		         <li>You start with 16 cards with 8 identical pairs. Click on any card and the value of that card is revealed.</li>
             <li>Try to match the card with its twin. If the cards match, you gain 100 points, else you lose 10 points and the cards get flipped back.</li>
             <li>You win once all the cards are revealed and matched.</li>
             <li>You can restart the game at any point in time by clicking on Restart Game button at the bottom.</li>
             <li><small><em>HINT: Try to memorise the cards as you flip</em></small></li>
		      </ul>
		   </div>
		</div>
  );
}

/*
This is the presentational component for displaying the score of the current game.

function DisplayScoreComponent(params){
  let root = params.root;
  let displayVal = "Cards to go: " + root.state.listOfCards.length;
  if(root.state.listOfCards.length === 0){
    displayVal = "You Win!";
  }
  return(
    <p><strong>{displayVal}</strong></p>
  );
}
*/

