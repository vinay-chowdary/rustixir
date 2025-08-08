import Config
import Dotenvy

if config_env() == :dev do
  # Read .env file directly and set environment variables

  source!(".env")
end

# Get environment variables with defaults
port = env!("PORT") |> String.to_integer()

api_key = env!("API_KEY")

config :api,
  port: port,
  api_key: api_key
