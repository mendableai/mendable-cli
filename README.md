# Mendable.ai CLI Tool

This command line tool provides an interface to interact with Mendable.ai API. The tool supports two main commands: `ingest` to ingest data into the system, and `ask` to ask a question to the AI.

## Installation

1. First, clone the repository to your local machine:

```bash
git clone https://github.com/mendable/mendable-cli.git
```

2. Navigate and build the cloned repository:

```bash
cd mendable-cli
npm install
npm run build
```

3. Install the tool globally:

```bash
npm link
```

## Configuration

Create a .env file in the root directory of the project, and add your Mendable API key:

```bash
MENDABLE_API_KEY=your_api_key
```

Replace your_api_key with your actual API key.

## Usage

To ingest data:

```bash
mendable ingest "[URL_TO_INGEST]" "[INGESTION_TYPE]"
```

To ask a question to the AI:

```bash
mendable ask "[QUESTION]"
```

## Examples

To ingest a docs page:

```bash
mendable ingest "https://docs.mendable.ai" "url"
```

To ask a question to the AI:

```bash
mendable ask "How do I ingest data?"
```

Built by [Mendable.ai](https://mendable.ai)
