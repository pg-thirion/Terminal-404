# Terminal 404

A dependency-free browser CTF game with ten fictional cybersecurity missions, a virtual read-only Linux filesystem, simulated shell pipelines, hints, scores and local progress.

## Run

Requires Node.js 20+ for tests and any static web server for play.

```sh
npm test
python3 -m http.server 8080
```

Open http://localhost:8080. No API keys or backend are required. Deploy the repository root to any static host.

## Design

- Ten independent missions covering discovery, log analysis, encoding, virtual forensics and data analysis.
- 23 simulated commands, shell pipelines, quoted arguments, command history and autocomplete.
- Optional hints deduct 25 points each. Progress stays in local browser storage.
- Responsive layout with keyboard and touch input, labelled controls and live terminal output.
- No host shell, filesystem, network calls, third-party dependencies or real targets. The browser receives all puzzle data, including solutions, so this is a practice game rather than a tamper-proof competitive CTF.
- The shell intentionally implements a limited subset of Linux commands. It is not a Linux emulator.

## Testing

`npm test` runs the Node test suite, including intended solution paths for every mission, shell parsing and isolation checks. GitHub Actions runs tests on pushes and pull requests. Browser UI checks are not automated in this initial version.
