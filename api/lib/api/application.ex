defmodule Api.Application do
  use Application

  @impl true
  def start(_type, _args) do
    port = Application.get_env(:api, :port)

    children = [
      {Plug.Cowboy, scheme: :http, plug: Api.Router, options: [port: port]}
    ]

    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
