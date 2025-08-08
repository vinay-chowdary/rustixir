defmodule Api.Router do
  use Plug.Router

  plug(:match)

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason
  )

  plug(Api.CORS)

  plug(:dispatch)

  get "/" do
    send_resp(conn, 200, "Hello dev!")
  end

  options "/shader" do
    send_resp(conn, 204, "")
  end

  post "/shader" do
    %{"prompt" => prompt} = conn.body_params

    case Api.LLM.generate_shader(prompt) do
      {:ok, shader_code} ->
        send_resp(conn, 200, Jason.encode!(%{shader: shader_code}))

      {:error, reason} ->
        send_resp(conn, 502, Jason.encode!(%{error: reason}))
    end
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
