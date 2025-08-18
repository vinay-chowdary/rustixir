defmodule Api.LLM do
  @moduledoc """
  Simple client for Anthropic Messages API to generate shader code from a prompt.
  """

  @anthropic_url "https://api.anthropic.com/v1/messages"

  @doc """
  Calls Anthropic to generate GLSL fragment shader code from the given prompt.

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
          model: "claude-3-haiku-20240307",
          max_tokens: 2048,
          temperature: 0,
          system: """
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
          """,
          messages: [
            %{
              role: "user",
              content: "Write a complete GLSL fragment shader implementing: #{prompt}"
            }
          ]
        }

        headers = [
          {"content-type", "application/json"},
          {"x-api-key", api_key},
          {"anthropic-version", "2023-06-01"}
        ]

        with {:ok, %HTTPoison.Response{status_code: 200, body: resp_body}} <-
               HTTPoison.post(@anthropic_url, Jason.encode!(body), headers,
                 recv_timeout: 30_000,
                 timeout: 30_000
               ),
             {:ok, decoded} <- Jason.decode(resp_body),
             {:ok, shader} <- extract_shader_from_anthropic_response(decoded) do
          {:ok, shader}
        else
          {:ok, %HTTPoison.Response{status_code: code, body: resp}} ->
            {:error, "Anthropic error #{code}: #{resp}"}

          {:error, %HTTPoison.Error{reason: reason}} ->
            {:error, "HTTP error: #{inspect(reason)}"}

          {:error, reason} when is_binary(reason) ->
            {:error, reason}

          _ ->
            {:error, "Unexpected error contacting Anthropic"}
        end
    end
  end

  @spec extract_shader_from_anthropic_response(map()) :: {:ok, String.t()} | {:error, String.t()}
  defp extract_shader_from_anthropic_response(%{"content" => content}) when is_list(content) do
    case content do
      [%{"type" => "text", "text" => text} | _] ->
        extract_code_block(text)

      _ ->
        {:error, "No text content in Anthropic response"}
    end
  end

  defp extract_shader_from_anthropic_response(_), do: {:error, "Malformed Anthropic response"}

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
