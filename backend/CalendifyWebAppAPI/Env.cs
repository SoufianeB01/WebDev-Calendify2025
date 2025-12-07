using System.IO;

namespace CalendifyWebAppAPI
{
    public static class Env
    {
        public static void Load(string path)
        {
            try
            {
                if (!File.Exists(path)) return;
                foreach (var raw in File.ReadAllLines(path))
                {
                    var line = raw.Trim();
                    if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;
                    var idx = line.IndexOf('=');
                    if (idx <= 0) continue;
                    var key = line[..idx].Trim();
                    var value = line[(idx + 1)..].Trim();
                    Environment.SetEnvironmentVariable(key, value);
                }
            }
            catch { /* ignore */ }
        }
    }
}
