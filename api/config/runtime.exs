import Config

if config_env() == :dev do
  Dotenvy.source!(".env")
end

port = System.get_env("PORT", "4000") |> String.to_integer()

config :api,
  port: port
