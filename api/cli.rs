use clap::{Parser, Subcommand};
use std::path::PathBuf;
use move_compiler::shared::NumericalAddress;

#[derive(Parser)]
#[clap(version, author, about, long_about = None)]
pub struct CliOptions {
    #[clap(subcommand)]
    pub commands: Commands,

    #[clap(short = 'v')]
    pub verbose: bool,
}

#[derive(Subcommand)]
pub enum Commands {
    #[clap(name = "build")]
    Build {
        #[clap(long = "dependency_dirs")]
        dependency_dirs: Option<String>,

        #[clap(long = "address_maps")]
        address_maps: Option<String>,
    },
    #[clap(name = "disassemble")]
    Disassemble(DisassembleArgs),
}

#[derive(Parser)]
pub struct DisassembleArgs {
    /// The path to the bytecode file to disassemble
    // #[clap(short = 'b', long = "file_path")]
    // pub file_path: String,
}

impl CliOptions {
    pub fn parse_deps(deps: String) -> Vec<PathBuf> {
        deps.split(',')
            .map(|s| PathBuf::from(s.trim()))
            .collect()
    }

    pub fn parse_addresses(addresses: String) -> Vec<(String, NumericalAddress)> {
        addresses
            .split(',')
            .filter_map(|s| {
                let parts: Vec<&str> = s.split('=').collect();
                if parts.len() == 2 {
                    let name = parts[0].trim().to_string();
                    if let Ok(addr) = NumericalAddress::parse_str(parts[1].trim()) {
                        Some((name, addr))
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .collect()
    }
}