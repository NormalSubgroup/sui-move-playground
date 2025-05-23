# Sui Move Playground



## ✨ Features

- **Beginner-Friendly**: No need to run `sui move new`. Start coding right away with an intuitive interface.
- **GUI Support**: Simplified testing, deployment, and command execution through a graphical interface.
- **Automatic Address Management**: Built-in tools for address validation and management, reducing the need for manual edits to `Move.toml`.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Rust**: Version `>= 1.75.0`. [Install Rust](https://www.rust-lang.org/tools/install)
- **Sui Cli**: Follow the instructions at [MystenLabs/sui](https://docs.sui.io/guides/developer/getting-started/sui-install).

### Running Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/sui-move-playground.git
    cd sui-move-playground
    ```

2. Start the service:
> **💡 First-time Setup Tip**: If this is your first time running the project, we recommend building the API components first to avoid longer startup times:
> ```bash
> cd api
> cargo build
> cd ..
> ```
    ```bash
    ./run.sh
    ```


## 🛠 Development

For developers looking to contribute or customize the playground:

1. Start the API server:
    ```bash
    cargo run
    ```

2. Start the web interface:
    ```bash
    npm install
    npm run dev
    ```


## 🌟 Contributing

We welcome contributions! Feel free to open issues or submit pull requests. For major changes, please open a discussion first to ensure alignment with the project goals.


<div align="center">
  <em>Happy coding with Sui Move Playground!</em>
</div>
