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
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(200, Jason.encode!(%{shader: shader_code}))

      {:error, reason} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(502, Jason.encode!(%{error: reason}))
    end
  end

  # Catch-all preflight to avoid 404s on OPTIONS
  options _ do
    send_resp(conn, 204, "")
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
