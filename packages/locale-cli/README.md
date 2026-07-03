# Locale CLI

A command-line tool for adding locale keys with LLM-powered translations to the Polkadot Staking Dashboard.

## Features

- Translates text to all supported languages (English, Spanish, Chinese) using OpenAI
- Automatically adds translations to the appropriate locale JSON files
- Provides context about Polkadot, staking, and the dashboard for accurate translations
- Runs `pnpm order` and `pnpm validate` to ensure consistency
- Supports nested keys and optional descriptions for better context

## Installation

From the root of the polkadot-cloud-apps repository:

```bash
pnpm install
```

## Configuration

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=your_api_key_here
```

Alternatively, create a `.env` file in the **workspace root** (the root of the `polkadot-cloud-apps` repository):

```
OPENAI_API_KEY=your_api_key_here
```

Or pass the API key directly via the `--api-key` option.

## Usage

### Add Locale Key

Add a new locale key with LLM-powered translations to all supported languages:

```bash
pnpm add-locale --key <key> --text <text> [options]
```

#### Options

- `-k, --key <key>` (required): Locale key to add (e.g., "myKey" or "nested.key")
- `-t, --text <text>` (required): English text to translate
- `-f, --file <file>` (optional): Locale file to add the key to (default: "app")
  - Available files: app, help, modals, pages, tips
- `-d, --description <description>` (optional): Additional context for the LLM
- `--api-key <apiKey>` (optional): OpenAI API key (overrides env var)

#### Examples

Add a simple key to the default app.json file:

```bash
pnpm add-locale --key "bondMore" --text "Bond More"
```

Add a nested key with description:

```bash
pnpm add-locale --key "validators.highCommission" --text "High Commission" --description "Refers to validators charging high commission rates"
```

Add a key to a specific file:

```bash
pnpm add-locale --key "title" --text "Help Center" --file "help"
```

Add a key with placeholder variables:

```bash
pnpm add-locale --key "bondAmount" --text "Bond {{amount}} {{unit}}" --description "Shows the amount and unit to bond"
```

### Remove Locale Key

Remove a locale key from all supported languages:

```bash
pnpm remove-locale --key <key> [options]
```

#### Options

- `-k, --key <key>` (required): Locale key to remove (e.g., "myKey" or "nested.key")
- `-f, --file <file>` (optional): Locale file to remove the key from (default: "app")
  - Available files: app, help, modals, pages, tips

#### Examples

Remove a key from the default app.json file:

```bash
pnpm remove-locale --key "bondMore"
```

Remove a nested key:

```bash
pnpm remove-locale --key "validators.highCommission"
```

Remove a key from a specific file:

```bash
pnpm remove-locale --key "title" --file "help"
```

## How It Works

1. The CLI accepts a key, text, and optional parameters
2. It provides comprehensive context about Polkadot and the staking dashboard to OpenAI:
   - Explanation of Polkadot's blockchain platform
   - Details about the Nominated Proof-of-Stake (NPoS) consensus
   - Description of the staking dashboard's features
   - Key staking concepts (validators, nominators, nomination pools, etc.)
3. OpenAI translates the text to Spanish and Chinese using GPT-4o-mini
4. The translations are added to the appropriate locale JSON files
5. Protection against prototype pollution ensures security
6. `pnpm order` alphabetically sorts the keys in all locale files
7. `pnpm validate` checks that all locale files have consistent keys

## LLM Context

The CLI provides the following context to the LLM for accurate translations:

- **Polkadot Platform**: Blockchain platform enabling multiple specialized blockchains to interoperate
- **Consensus Mechanism**: Nominated Proof-of-Stake (NPoS)
- **Dashboard Purpose**: Web application for staking DOT tokens, joining pools, and monitoring rewards
- **Key Concepts**: Validators, nominators, nomination pools, commission, bonding, eras
- **Translation Requirements**: Technical accuracy for blockchain terms while maintaining accessibility

This context ensures translations are both technically accurate and user-friendly.

## Security

The package includes comprehensive protection against prototype pollution attacks:

- Validates all keys against dangerous property names (`__proto__`, `constructor`, `prototype`)
- Uses `Object.defineProperty` for safer property assignment
- Includes additional validation before property traversal
- Tested to successfully reject prototype pollution attempts

## Supported Languages

- English (en)
- Spanish (es)
- Chinese Simplified (zh)

## Usage Examples

To see usage examples and all available options:

```bash
node packages/locale-cli/help.js
```

To view help for the CLI command:

```bash
pnpm add-locale --help
```

To verify prototype pollution protection:

```bash
# This should fail with an error about invalid keys
pnpm add-locale --key "__proto__.test" --text "Test"
```

## Development

The package structure:

```
locale-cli/
├── bin/
│   └── add-locale.js         # CLI entry point
├── src/
│   ├── commands/
│   │   ├── addLocale.ts      # Add locale command implementation
│   │   └── removeLocale.ts   # Remove locale command implementation
│   ├── cli.ts                # Main CLI entry point
│   ├── constants.ts          # Locale and file constants
│   ├── index.ts              # Core translation and removal logic
│   └── types.ts              # Type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## License

GPL-3.0-only
