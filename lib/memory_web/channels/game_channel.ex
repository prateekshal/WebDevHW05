defmodule MemoryWeb.GamesChannel do
    use MemoryWeb, :channel

    alias Memory.Game
    alias Memory.BackupAgent

    def join("games:" <> name, payload, socket) do
        if authorized?(payload) do
            game = BackupAgent.get(name) || Game.new()
            BackupAgent.put(name, game)
            socket = socket
            |> assign(:game, game)
            |> assign(:name, name)
            {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
        else
            {:error, %{reason: "unauthorized"}}
        end
    end

    def handle_in("click", %{"val" => val, "id" => id}, socket) do
        name = socket.assigns[:name]
        game = Game.click(socket.assigns[:game], val, id)
        socket = assign(socket, :game, game)
        BackupAgent.put(name, game)
        {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
    end

    def handle_in("compare", _payload, socket) do
        name = socket.assigns[:name]
        game = Game.compare(socket.assigns[:game])
        socket = assign(socket, :game, game)
        BackupAgent.put(name, game)
        {:reply, {:ok, %{ "game" => Game.client_view(game)}}, socket}
    end

    def handle_in("restart", payload, socket) do
        if authorized?(payload) do
            name = socket.assigns[:name]
            game = Game.new()
            BackupAgent.put(name, game)
            socket = socket
            |> assign(:game, game)
            |> assign(:name, name)
            {:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
        else
            {:error, %{reason: "unauthorized"}}
        end
    end

    defp authorized?(_payload) do
        true
    end
end