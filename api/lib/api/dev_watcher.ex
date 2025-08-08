# defmodule Api.DevWatcher do
#   use GenServer

#   def start_link(_) do
#     GenServer.start_link(__MODULE__, nil, name: __MODULE__)
#   end

#   def init(_) do
#     {:ok, watcher_pid} = FileSystem.start_link(dirs: ["lib"])
#     FileSystem.subscribe(watcher_pid)
#     IO.puts("Auto-compile enabled for lib/")
#     {:ok, watcher_pid}
#   end

#   def handle_info({_pid, {:fs, :file_event}, {path, _events}}, state) do
#     if String.ends_with?(path, ".ex") do
#       IO.puts("File changed: #{path} — recompiling...")
#       compile_file(path)
#     end

#     {:noreply, state}
#   end

#   def handle_info(_, state), do: {:noreply, state}

#   defp compile_file(path) do
#     try do
#       Mix.Task.rerun("compile", [])
#       IO.puts("Reloaded #{path}")
#     rescue
#       e ->
#         IO.puts("Error reloading #{path}: #{Exception.message(e)}")
#     end
#   end
# end
