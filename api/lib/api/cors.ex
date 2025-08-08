defmodule Api.CORS do
  @moduledoc """
  Minimal CORS plug for development to allow browser requests from the client app.
  """

  import Plug.Conn

  @allowed_headers "content-type, authorization"
  @allowed_methods "GET,POST,OPTIONS"

  def init(opts), do: opts

  def call(conn, _opts) do
    conn
    |> put_resp_header("access-control-allow-origin", "*")
    |> put_resp_header("access-control-allow-headers", @allowed_headers)
    |> put_resp_header("access-control-allow-methods", @allowed_methods)
  end
end
