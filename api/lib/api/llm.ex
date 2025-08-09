defmodule Api.LLM do
  @moduledoc """
  Simple client for Mistral AI API to generate shader code from a prompt.
  """

  @mistral_url "https://api.mistral.ai/v1/chat/completions"

  @doc """
  Calls Mistral AI to generate GLSL fragment shader code from the given prompt.

  Returns {:ok, shader_code} or {:error, reason}.
  """
  @spec generate_shader(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  def generate_shader(prompt) when is_binary(prompt) do
    api_key = Application.get_env(:api, :api_key)

    cond do
      is_nil(api_key) or api_key == "" ->
        {:error, "Missing API_KEY"}

      String.trim(prompt) == "" ->
        {:error, "Prompt cannot be empty"}

      true ->
        body = %{
          model: "mistral-large-latest",
          max_tokens: 2048,
          temperature: 0,
          messages: [
            %{
              role: "system",
              content: """
              You are a GLSL shader generator. Generate ONLY valid GLSL fragment shader code, compatible with WebGL1.
              The vertex shader uses these attributes and varyings:
                - attribute vec2 a_position;
                - attribute vec2 a_texCoord;
                - varying vec2 vUv;
              The fragment shader must:
                - declare and use only these uniforms: 'time' (float), 'resolution' (vec2).
                - declare and use only 'varying vec2 vUv'.
                - output final color with gl_FragColor.
                - avoid other varyings or attributes.
                - produce code that compiles and links without errors with the given vertex shader.
              Other compulsory requirements:
                - Ensure all GLSL functions like mix() are used with matching types and dimensions.
                - Never assign a float directly to a vec3 variable.
                - When mixing colors (vec3) with scalars, convert scalars to vec3 by wrapping them in vec3().
                - Output final color using gl_FragColor as vec4 with alpha 1.0.
              Return only the GLSL fragment shader code, no explanations or comments.
              """
            },
            %{
              role: "user",
              content: "Write a complete GLSL fragment shader implementing: #{prompt}"
            }
          ]
        }

        headers = [
          {"content-type", "application/json"},
          {"authorization", "Bearer #{api_key}"}
        ]

        with {:ok, %HTTPoison.Response{status_code: 200, body: resp_body}} <-
               HTTPoison.post(@mistral_url, Jason.encode!(body), headers,
                 recv_timeout: 30_000,
                 timeout: 30_000
               ),
             {:ok, decoded} <- Jason.decode(resp_body),
             {:ok, shader} <- extract_shader_from_mistral_response(decoded) do
          {:ok, shader}
        else
          {:ok, %HTTPoison.Response{status_code: code, body: resp}} ->
            {:error, "Mistral error #{code}: #{resp}"}

          {:error, %HTTPoison.Error{reason: reason}} ->
            {:error, "HTTP error: #{inspect(reason)}"}

          {:error, reason} when is_binary(reason) ->
            {:error, reason}

          _ ->
            {:error, "Unexpected error contacting Mistral"}
        end
    end
  end

  @spec extract_shader_from_mistral_response(map()) :: {:ok, String.t()} | {:error, String.t()}
  defp extract_shader_from_mistral_response(%{"choices" => choices}) when is_list(choices) do
    case choices do
      [%{"message" => %{"content" => content}} | _] ->
        extract_code_block(content)

      _ ->
        {:error, "No content in Mistral response"}
    end
  end

  defp extract_shader_from_mistral_response(_), do: {:error, "Malformed Mistral response"}

  @spec extract_code_block(String.t()) :: {:ok, String.t()} | {:error, String.t()}
  defp extract_code_block(text) do
    # Try to extract fenced code block ```...```
    regex = ~r/```(?:glsl|frag|shader)?\n([\s\S]*?)```/m

    case Regex.run(regex, text) do
      [_, code] ->
        {:ok, String.trim(code)}

      _ ->
        # If no fence, return the raw text but ensure it looks like shader code
        candidate = String.trim(text)

        if String.contains?(candidate, "void main") do
          {:ok, candidate}
        else
          {:error, "No shader code found in response"}
        end
    end
  end
end
