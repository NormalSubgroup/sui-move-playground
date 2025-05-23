pub mod target {
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum TargetType {
        Sui,
        Starcoin,
        Diem,
    }
}