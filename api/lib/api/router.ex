defmodule Api.Router do
  use Plug.Router

  plug(:match)

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason
  )

  plug(:dispatch)

  get "/" do
    send_resp(conn, 200, "Hello dev!")
  end

  post "/shader" do
    %{"prompt" => prompt} = conn.body_params

    # Fake LLM shader generation (replace with API call later)
    shader_code = """
    precision mediump float;
    void main() {
      gl_FragColor = vec4(#{String.length(prompt) / 10}, 0.5, 0.8, 1.0);
    }
    """

    send_resp(conn, 200, Jason.encode!(%{shader: shader_code}))
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
