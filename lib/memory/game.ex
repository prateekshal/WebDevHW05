defmodule Memory.Game do
    def new do
        shuffledCards= shuffleCards()
        %{
          cards: shuffledCards,
          score: 0,
          firstCardID: [],
          secondCardID: [],
          guessedCards: [],
          clickedCards: []
        }
    end
      
    def client_view(game) do
        %{
            cards: game.cards,
            score: game.score,
            firstCardID: game.firstCardID,
            secondCardID: game.secondCardID,
            guessedCards: game.guessedCards,
            clickedCards: game.clickedCards
        }
    end

    def shuffleCards() do
        listOfCards = ["A","B","C","D","E","F","G","H","A","B","C","D","E","F","G","H"]
        Enum.shuffle(listOfCards)
    end

    def click(game, val, id) do
        fc = game.firstCardID
        #sc = game.secondCardID
        isEmpty = Enum.empty?(fc)
        if (isEmpty != true) do
           setSecondCardVal(game, val, id)
        else
           setFirstCardVal(game, val, id)
        end
    end

    def setFirstCardVal(game, val, id) do
        fc = game.firstCardID
        |> MapSet.new()
        |> MapSet.put(val)
        |> MapSet.to_list

        game = Map.put(game, :firstCardID, fc)
        
        cc = game.clickedCards
        |> MapSet.new()
        |> MapSet.put(id)
        |> MapSet.to_list

        Map.put(game, :clickedCards, cc)

    end

    def setSecondCardVal(game, val, id) do
        sc = game.secondCardID
        |> MapSet.new()
        |> MapSet.put(val)
        |> MapSet.to_list

        game = Map.put(game, :secondCardID, sc)
        cc = game.clickedCards
        |> MapSet.new()
        |> MapSet.put(id)
        |> MapSet.to_list

        Map.put(game, :clickedCards, cc)
    end

    def compare(game) do
        fcID = game.firstCardID
        scID = game.secondCardID
        if fcID == scID do
            gc = game.guessedCards
            |> MapSet.new()
            |> MapSet.put(fcID)
            |> MapSet.to_list
            game = Map.put(game, :guessedCards, gc)
            sc = game.score
            sc = sc + 100

            game = Map.put(game, :score, sc)
            game = Map.put(game, :firstCardID, [])
            game = Map.put(game, :secondCardID, [])
            Map.put(game, :clickedCards, [])
        else
            sc = game.score
            sc = sc - 10
            game = Map.put(game, :score, sc)
            game = Map.put(game, :firstCardID, [])
            game = Map.put(game, :secondCardID, [])
            Map.put(game, :clickedCards, [])
        end
    end
end